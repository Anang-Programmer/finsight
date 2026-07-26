import { NextRequest } from 'next/server';
import { chatCompletionStream } from '@/lib/ai/groq';
import { CHAT_SYSTEM_PROMPT, buildChatContextPrompt } from '@/lib/ai/prompts';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: 'Messages array is required' }, { status: 400 });
    }

    // Gather user financial context
    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    // Fetch current month transactions
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*, category:categories(name)')
      .eq('user_id', user.id)
      .gte('transaction_date', monthStart)
      .lte('transaction_date', monthEnd)
      .order('transaction_date', { ascending: false })
      .limit(20);

    const totalIncome = transactions
      ?.filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    const totalExpense = transactions
      ?.filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    // Recent 5 transactions
    const recentTransactions = (transactions || []).slice(0, 5).map((t) => ({
      description: t.description,
      amount: Number(t.amount),
      type: t.type,
      category: t.category?.name || 'Lainnya',
      date: t.transaction_date,
    }));

    // Fetch budgets
    const { data: budgets } = await supabase
      .from('budgets')
      .select('*, category:categories(name)')
      .eq('user_id', user.id)
      .lte('period_start', monthEnd)
      .gte('period_end', monthStart);

    const budgetData = (budgets || []).map((b) => ({
      category: b.category?.name || 'Tanpa Kategori',
      limit: Number(b.amount_limit),
      spent: 0, // Will be calculated from transactions
    }));

    // Calculate budget spending
    const categorySpending = new Map<string, number>();
    transactions
      ?.filter((t) => t.type === 'expense')
      .forEach((t) => {
        const catName = t.category?.name || 'Lainnya';
        categorySpending.set(catName, (categorySpending.get(catName) || 0) + Number(t.amount));
      });

    budgetData.forEach((b) => {
      b.spent = categorySpending.get(b.category) || 0;
    });

    // Fetch savings goals
    const { data: savingsGoals } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', user.id);

    const savingsData = (savingsGoals || []).map((g) => ({
      title: g.title,
      target: Number(g.target_amount),
      current: Number(g.current_amount),
    }));

    // Build context
    const context = buildChatContextPrompt({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      recentTransactions,
      budgets: budgetData,
      savingsGoals: savingsData,
    });

    // Stream response with full conversation history
    const stream = await chatCompletionStream([
      { role: 'system', content: CHAT_SYSTEM_PROMPT + '\n\n' + context },
      ...messages.map((m: any) => ({ role: m.role, content: m.content })),
    ]);

    // Create readable stream
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('AI chat error:', error);
    return Response.json(
      { error: 'Gagal memproses pesan. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}
