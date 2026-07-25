import { NextRequest } from 'next/server';
import { chatCompletion } from '@/lib/ai/groq';
import { INSIGHT_SYSTEM_PROMPT, buildInsightPrompt } from '@/lib/ai/prompts';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { period } = await request.json();
    const currentPeriod = period || new Date().toISOString().slice(0, 7);
    const [year, month] = currentPeriod.split('-').map(Number);

    // Start and end of current period
    const periodStart = `${year}-${String(month).padStart(2, '0')}-01`;
    const periodEnd = new Date(year, month, 0).toISOString().split('T')[0];

    // Previous period
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const prevStart = `${prevYear}-${String(prevMonth).padStart(2, '0')}-01`;
    const prevEnd = new Date(prevYear, prevMonth, 0).toISOString().split('T')[0];

    // Fetch current period transactions
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*, category:categories(name, icon, color)')
      .eq('user_id', user.id)
      .gte('transaction_date', periodStart)
      .lte('transaction_date', periodEnd);

    // Fetch previous period total expense
    const { data: prevTransactions } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', user.id)
      .eq('type', 'expense')
      .gte('transaction_date', prevStart)
      .lte('transaction_date', prevEnd);

    const previousPeriodExpense = prevTransactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    // Calculate totals
    const totalIncome = transactions
      ?.filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    const totalExpense = transactions
      ?.filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    // Category breakdown
    const categoryMap = new Map<string, number>();
    transactions
      ?.filter((t) => t.type === 'expense')
      .forEach((t) => {
        const catName = t.category?.name || 'Lainnya';
        categoryMap.set(catName, (categoryMap.get(catName) || 0) + Number(t.amount));
      });

    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([name, total]) => ({
        name,
        total,
        percentage: totalExpense > 0 ? Math.round((total / totalExpense) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);

    // Fetch budgets
    const { data: budgets } = await supabase
      .from('budgets')
      .select('*, category:categories(name)')
      .eq('user_id', user.id)
      .lte('period_start', periodEnd)
      .gte('period_end', periodStart);

    const budgetData = (budgets || []).map((b) => {
      const catName = b.category?.name || 'Tanpa Kategori';
      const spent = categoryMap.get(catName) || 0;
      return {
        category: catName,
        limit: Number(b.amount_limit),
        spent,
        percentage: Math.round((spent / Number(b.amount_limit)) * 100),
      };
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
      percentage: Math.round((Number(g.current_amount) / Number(g.target_amount)) * 100),
    }));

    // Build prompt and get AI response
    const promptData = {
      period: currentPeriod,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      categoryBreakdown,
      budgets: budgetData,
      savingsGoals: savingsData,
      previousPeriodExpense: previousPeriodExpense > 0 ? previousPeriodExpense : undefined,
    };

    const response = await chatCompletion([
      { role: 'system', content: INSIGHT_SYSTEM_PROMPT },
      { role: 'user', content: buildInsightPrompt(promptData) },
    ], { temperature: 0.6, maxTokens: 1024 });

    const content = response.choices?.[0]?.message?.content || '';

    // Parse JSON response
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        // Cache the insight
        await supabase.from('ai_insights').upsert({
          user_id: user.id,
          period: currentPeriod,
          content: parsed,
          created_at: new Date().toISOString(),
        }, { onConflict: 'user_id,period' }).select();

        return Response.json(parsed);
      }
    } catch {
      // Parse failed
    }

    return Response.json({
      summary: content,
      highlights: [],
      tips: [],
      health_score: 5,
    });
  } catch (error) {
    console.error('AI insight error:', error);
    return Response.json(
      { error: 'Gagal memproses insight. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}
