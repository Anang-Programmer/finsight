'use client';

import { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, getMonthRange, getMonthName, calcPercentage } from '@/lib/utils';
import type { Transaction, CategoryBreakdown } from '@/lib/types';
import DonutChart from '@/components/charts/DonutChart';
import Icon from '@/components/ui/Icon';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Loader2,
  RefreshCw,
  Package,
  DollarSign,
} from 'lucide-react';
import DownloadStatementButton from '@/components/pdf/DownloadStatementButton';


export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([]);
  const [budgetProgress, setBudgetProgress] = useState<
    { category: string; limit: number; spent: number; color: string }[]
  >([]);
  const [savingsProgress, setSavingsProgress] = useState<
    { title: string; target: number; current: number; icon: string; color: string }[]
  >([]);
  const [insight, setInsight] = useState<{
    summary: string;
    highlights: string[];
    health_score: number;
  } | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [healthScore, setHealthScore] = useState(0);
  const [userProfile, setUserProfile] = useState<{ name: string; email: string } | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { start, end } = getMonthRange();

    try {
      // Fetch user profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
        setUserProfile({
          name: profile?.full_name || 'Pengguna Finsight',
          email: user.email || '',
        });
      }

      // Fetch transactions for current month
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*, category:categories(name, icon, color)')
        .gte('transaction_date', start)
        .lte('transaction_date', end)
        .order('transaction_date', { ascending: false });

      const txs = transactions || [];

      const income = txs
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const expense = txs
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      setTotalIncome(income);
      setTotalExpense(expense);
      setRecentTransactions(txs.slice(0, 5) as Transaction[]);

      // Category breakdown for expenses
      const catMap = new Map<string, { total: number; icon: string; color: string }>();
      txs
        .filter((t) => t.type === 'expense')
        .forEach((t) => {
          const name = t.category?.name || 'Lainnya';
          const icon = t.category?.icon || 'package';
          const color = t.category?.color || '#505a63';
          const existing = catMap.get(name) || { total: 0, icon, color };
          existing.total += Number(t.amount);
          catMap.set(name, existing);
        });

      const breakdown: CategoryBreakdown[] = Array.from(catMap.entries())
        .map(([name, data]) => ({
          category_name: name,
          category_icon: data.icon,
          category_color: data.color,
          total: data.total,
          percentage: expense > 0 ? Math.round((data.total / expense) * 100) : 0,
        }))
        .sort((a, b) => b.total - a.total);

      setCategoryBreakdown(breakdown);

      // Fetch budgets
      const { data: budgets } = await supabase
        .from('budgets')
        .select('*, category:categories(name, color)')
        .lte('period_start', end)
        .gte('period_end', start);

      const budgetData = (budgets || []).map((b) => {
        const catName = b.category?.name || 'Tanpa Kategori';
        const spent = catMap.get(catName)?.total || 0;
        return {
          category: catName,
          limit: Number(b.amount_limit),
          spent,
          color: b.category?.color || '#505a63',
        };
      });
      setBudgetProgress(budgetData);

      // Fetch savings goals
      const { data: goals } = await supabase
        .from('savings_goals')
        .select('*')
        .order('created_at', { ascending: false });

      setSavingsProgress(
        (goals || []).map((g) => ({
          title: g.title,
          target: Number(g.target_amount),
          current: Number(g.current_amount),
          icon: g.icon,
          color: g.color,
        }))
      );
      // Calculate Health Score
      let score = 50; // Base score
      
      // Income/Expense factor
      if (income > 0) {
        const savingsRatio = (income - expense) / income;
        if (savingsRatio >= 0.2) score += 30;
        else if (savingsRatio > 0) score += 15;
        else if (savingsRatio < 0) score -= 20;
      } else if (expense > 0) {
        score -= 30; // Spending with no income
      }

      // Budget factor
      if (budgetData.length > 0) {
        const overBudgetCount = budgetData.filter(b => b.spent > b.limit).length;
        if (overBudgetCount === 0) score += 10;
        else score -= (overBudgetCount * 10);
      }

      // Savings factor
      if (goals && goals.length > 0) {
        score += 10;
      }

      setHealthScore(Math.max(0, Math.min(100, score)));

    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const fetchInsight = async () => {
    setInsightLoading(true);
    try {
      const res = await fetch('/api/ai/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period: new Date().toISOString().slice(0, 7) }),
      });
      if (res.ok) {
        const data = await res.json();
        setInsight(data);
      }
    } catch (error) {
      console.error('Insight error:', error);
    } finally {
      setInsightLoading(false);
    }
  };

  const now = new Date();
  const balance = totalIncome - totalExpense;

  if (loading) {
    return (
      <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Skeleton summary cards */}
        <div className="summary-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: '120px', borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="skeleton" style={{ height: '300px', borderRadius: 'var(--radius-lg)' }} />
          <div className="skeleton" style={{ height: '300px', borderRadius: 'var(--radius-lg)' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header and Health Score */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div>
          <h2 className="text-heading-md" style={{ marginBottom: '4px' }}>
            {getMonthName(now.getMonth())} {now.getFullYear()}
          </h2>
          <p style={{ color: 'var(--stone)', fontSize: '14px' }}>
            Ringkasan keuanganmu bulan ini
          </p>
        </div>
        
        {/* Actions & Health Score */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Download Report Button */}
          {userProfile && !loading && (
            <DownloadStatementButton 
              monthName={getMonthName(now.getMonth())} 
              year={now.getFullYear()}
              data={{
                user: userProfile,
                period: `${getMonthName(now.getMonth())} ${now.getFullYear()}`,
                summary: {
                  income: totalIncome,
                  expense: totalExpense,
                  balance: balance
                },
                budgets: budgetProgress.map(b => ({
                  category: b.category,
                  limit: b.limit,
                  spent: b.spent
                })),
                savings: savingsProgress.map(s => ({
                  title: s.title,
                  target: s.target,
                  current: s.current
                })),
                transactions: recentTransactions.map(t => ({
                  date: new Date(t.transaction_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
                  category: t.category?.name || 'Lainnya',
                  description: t.description || (t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'),
                  amount: Number(t.amount),
                  type: t.type
                })),
                insight: insight || undefined
              }} 
            />
          )}

          {/* Health Score Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--surface-elevated)', padding: '12px 24px', borderRadius: 'var(--radius-full)', border: '1px solid var(--hairline-dark)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '11px', color: 'var(--stone)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', marginBottom: '2px' }}>Kesehatan Finansial</span>
              <span style={{ fontSize: '15px', fontWeight: '600', color: healthScore >= 80 ? 'var(--accent-teal)' : healthScore >= 50 ? 'var(--accent-warning)' : 'var(--accent-danger)' }}>
                {healthScore >= 80 ? 'Sangat Sehat' : healthScore >= 50 ? 'Cukup Sehat' : 'Kritis'}
              </span>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--surface-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '700', color: healthScore >= 80 ? 'var(--accent-teal)' : healthScore >= 50 ? 'var(--accent-warning)' : 'var(--accent-danger)', border: `2px solid ${healthScore >= 80 ? 'var(--accent-teal)' : healthScore >= 50 ? 'var(--accent-warning)' : 'var(--accent-danger)'}` }}>
              {healthScore}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="summary-card-label">Saldo Bulan Ini</span>
            <div
              className="summary-card-icon"
              style={{ background: 'rgba(73, 79, 223, 0.12)' }}
            >
              <Wallet size={20} style={{ color: 'var(--primary-bright)' }} />
            </div>
          </div>
          <span
            className="summary-card-value"
            style={{ color: balance >= 0 ? 'var(--on-dark)' : 'var(--accent-danger)' }}
          >
            {formatCurrency(balance)}
          </span>
        </div>

        <div className="summary-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="summary-card-label">Pemasukan</span>
            <div
              className="summary-card-icon"
              style={{ background: 'var(--accent-teal-soft)' }}
            >
              <TrendingUp size={20} style={{ color: 'var(--accent-teal)' }} />
            </div>
          </div>
          <span className="summary-card-value" style={{ color: 'var(--accent-teal)' }}>
            {formatCurrency(totalIncome)}
          </span>
        </div>

        <div className="summary-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="summary-card-label">Pengeluaran</span>
            <div
              className="summary-card-icon"
              style={{ background: 'var(--accent-pink-soft)' }}
            >
              <TrendingDown size={20} style={{ color: 'var(--accent-pink)' }} />
            </div>
          </div>
          <span className="summary-card-value" style={{ color: 'var(--accent-pink)' }}>
            {formatCurrency(totalExpense)}
          </span>
        </div>

        <div className="summary-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="summary-card-label">Target Tabungan</span>
            <div
              className="summary-card-icon"
              style={{ background: 'rgba(73, 79, 223, 0.12)' }}
            >
              <PiggyBank size={20} style={{ color: 'var(--primary-bright)' }} />
            </div>
          </div>
          <span className="summary-card-value">
            {savingsProgress.length}
          </span>
          <span style={{ fontSize: '13px', color: 'var(--stone)' }}>
            target aktif
          </span>
        </div>
      </div>

      {/* Charts + Budget Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Expense Breakdown */}
        <div className="card">
          <h3 className="text-heading-sm" style={{ marginBottom: '20px' }}>
            Pengeluaran per Kategori
          </h3>
          <DonutChart data={categoryBreakdown} />
        </div>

        {/* Budget Progress */}
        <div className="card">
          <h3 className="text-heading-sm" style={{ marginBottom: '20px' }}>
            Progres Anggaran
          </h3>
          {budgetProgress.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {budgetProgress.map((b, i) => {
                const pct = calcPercentage(b.spent, b.limit);
                const statusColor =
                  pct >= 100
                    ? 'var(--accent-danger)'
                    : pct >= 70
                    ? 'var(--accent-warning)'
                    : 'var(--accent-teal)';
                return (
                  <div key={i}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '6px',
                      }}
                    >
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>
                        {b.category}
                      </span>
                      <span style={{ fontSize: '13px', color: statusColor }}>
                        {pct}%
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${Math.min(pct, 100)}%`,
                          background: statusColor,
                        }}
                      />
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: '4px',
                        fontSize: '12px',
                        color: 'var(--stone)',
                      }}
                    >
                      <span>{formatCurrency(b.spent)}</span>
                      <span>{formatCurrency(b.limit)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '32px' }}>
              <p style={{ color: 'var(--stone)', fontSize: '14px' }}>
                Belum ada anggaran. Buat anggaran untuk memantau pengeluaranmu.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* AI Insight Panel */}
      <div className="card" style={{ border: '1px solid rgba(73, 79, 223, 0.2)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={20} style={{ color: 'var(--primary-bright)' }} />
            <h3 className="text-heading-sm">AI Insight</h3>
            <span className="badge badge-brand">AI</span>
          </div>
          <button
            className="btn btn-soft btn-sm"
            onClick={fetchInsight}
            disabled={insightLoading}
          >
            {insightLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <RefreshCw size={14} />
            )}
            {insightLoading ? 'Menganalisis...' : 'Dapatkan Insight'}
          </button>
        </div>

        {insight ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '15px', lineHeight: '1.6' }}>
              <ReactMarkdown
                components={{
                  p: ({ node, ...props }) => <p style={{ marginBottom: '8px' }} {...props} />,
                  strong: ({ node, ...props }) => <strong style={{ fontWeight: '600', color: 'var(--on-dark)' }} {...props} />,
                  ul: ({ node, ...props }) => <ul style={{ paddingLeft: '16px', marginBottom: '8px', listStyleType: 'disc' }} {...props} />,
                  li: ({ node, ...props }) => <li style={{ marginBottom: '4px' }} {...props} />
                }}
              >
                {insight.summary}
              </ReactMarkdown>
            </div>
            {insight.highlights && insight.highlights.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {insight.highlights.map((h, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      fontSize: '14px',
                      color: 'var(--on-dark-mute)',
                    }}
                  >
                    <span style={{ color: 'var(--primary-bright)', flexShrink: 0 }}>•</span>
                    {h}
                  </div>
                ))}
              </div>
            )}
            <div className="disclaimer" style={{ marginTop: '4px' }}>
              <Sparkles size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>
                Insight ini dihasilkan AI berdasarkan data transaksimu. Bukan nasihat keuangan profesional.
              </span>
            </div>
          </div>
        ) : (
          <p style={{ color: 'var(--stone)', fontSize: '14px' }}>
            Klik &quot;Dapatkan Insight&quot; untuk mendapatkan analisis keuangan personal dari AI.
          </p>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}
        >
          <h3 className="text-heading-sm">Transaksi Terbaru</h3>
          <a
            href="/dashboard/transactions"
            style={{
              color: 'var(--primary-bright)',
              fontSize: '14px',
              fontWeight: '500',
              textDecoration: 'none',
            }}
          >
            Lihat Semua
          </a>
        </div>

        {recentTransactions.length > 0 ? (
          <div>
            {recentTransactions.map((t) => (
              <div key={t.id} className="transaction-item">
                <div
                  className="transaction-icon"
                  style={{
                    background: t.type === 'income' ? 'var(--accent-teal-soft)' : 'var(--accent-pink-soft)',
                  }}
                >
                  {t.category?.icon ? (
                    <Icon name={t.category.icon} color={t.category.color || (t.type === 'income' ? 'var(--accent-teal)' : 'var(--accent-pink)')} size={20} />
                  ) : (
                    t.type === 'income' ? <DollarSign size={20} color="var(--accent-teal)" /> : <Package size={20} color="var(--accent-pink)" />
                  )}
                </div>
                <div className="transaction-info">
                  <div className="transaction-desc">
                    {t.description || (t.type === 'income' ? 'Pemasukan' : 'Pengeluaran')}
                  </div>
                  <div className="transaction-meta">
                    <span>{t.category?.name || 'Lainnya'}</span>
                    <span>•</span>
                    <span>{new Date(t.transaction_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                  </div>
                </div>
                <div
                  className={`transaction-amount ${
                    t.type === 'income'
                      ? 'transaction-amount-income'
                      : 'transaction-amount-expense'
                  }`}
                >
                  {t.type === 'income' ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ArrowUpRight size={14} />
                      +{formatCurrency(t.amount)}
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ArrowDownRight size={14} />
                      -{formatCurrency(t.amount)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state" style={{ padding: '32px' }}>
            <p style={{ color: 'var(--stone)', fontSize: '14px' }}>
              Belum ada transaksi bulan ini. Mulai catat transaksi pertamamu!
            </p>
          </div>
        )}
      </div>

      {/* Savings Goals */}
      {savingsProgress.length > 0 && (
        <div className="card">
          <h3 className="text-heading-sm" style={{ marginBottom: '16px' }}>
            Target Tabungan
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
            {savingsProgress.map((g, i) => {
              const pct = calcPercentage(g.current, g.target);
              return (
                <div
                  key={i}
                  className="card-soft"
                  style={{ padding: '16px', borderRadius: 'var(--radius-md)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', background: `${g.color}15` }}>
                      <Icon name={g.icon} color={g.color} size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '500' }}>{g.title}</div>
                      <div style={{ fontSize: '13px', color: 'var(--stone)' }}>
                        {formatCurrency(g.current)} / {formatCurrency(g.target)}
                      </div>
                    </div>
                    <span
                      style={{
                        marginLeft: 'auto',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: g.color,
                      }}
                    >
                      {pct}%
                    </span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${pct}%`, background: g.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
