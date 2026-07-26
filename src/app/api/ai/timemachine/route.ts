import { NextRequest } from 'next/server';
import { chatCompletionStream } from '@/lib/ai/groq';
import { TIME_MACHINE_SYSTEM_PROMPT, buildTimeMachineContextPrompt } from '@/lib/ai/prompts';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Calculate time metrics
    const now = new Date();
    const daysPassed = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    // Fetch transactions
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*, category:categories(name)')
      .eq('user_id', user.id)
      .gte('transaction_date', monthStart)
      .lte('transaction_date', monthEnd);

    const totalIncome = transactions
      ?.filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    const expenses = transactions?.filter((t) => t.type === 'expense') || [];
    const totalExpense = expenses.reduce((sum, t) => sum + Number(t.amount), 0);

    // Calculate metrics (bulatkan untuk menghindari desimal yang membingungkan AI)
    const burnRatePerDay = daysPassed > 0 ? Math.round(totalExpense / daysPassed) : 0;
    const predictedEndBalance = Math.round(totalIncome - (burnRatePerDay * daysInMonth));

    // Category breakdown
    const categoryTotals = new Map<string, number>();
    expenses.forEach((t) => {
      const cat = t.category?.name || 'Lainnya';
      categoryTotals.set(cat, (categoryTotals.get(cat) || 0) + Number(t.amount));
    });
    
    const topCategories = Array.from(categoryTotals.entries())
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);

    // Build Context
    const context = buildTimeMachineContextPrompt({
      totalIncome,
      totalExpense,
      burnRatePerDay,
      daysPassed,
      topCategories,
      predictedEndBalance
    });

    const stream = await chatCompletionStream([
      { role: 'system', content: TIME_MACHINE_SYSTEM_PROMPT + '\n\n' + context },
      { role: 'user', content: 'Jelajahi masa depan dan ceritakan nasibku secara brutal di tahun 2031 berdasarkan dataku bulan ini!' }
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
    console.error('Time Machine Error:', error);
    return Response.json(
      { error: 'Gagal memproses mesin waktu.' },
      { status: 500 }
    );
  }
}
