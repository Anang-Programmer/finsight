'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, getMonthRange, calcPercentage, getMonthName } from '@/lib/utils';
import type { Budget, Category } from '@/lib/types';
import { Plus, X, Loader2, Edit3, Trash2, AlertCircle, Package } from 'lucide-react';
import Icon from '@/components/ui/Icon';

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [saving, setSaving] = useState(false);
  const [currentMonth] = useState(new Date());

  const [formData, setFormData] = useState({
    category_id: '',
    amount_limit: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { start, end } = getMonthRange(currentMonth);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch expense categories
    const { data: cats } = await supabase
      .from('categories')
      .select('*')
      .or(`user_id.is.null,user_id.eq.${user.id}`)
      .eq('type', 'expense')
      .order('name');

    setCategories((cats || []) as Category[]);

    // Fetch budgets
    const { data: bData } = await supabase
      .from('budgets')
      .select('*, category:categories(*)')
      .eq('user_id', user.id)
      .gte('period_start', start)
      .lte('period_end', end);

    // Fetch transactions for calculating spent amount
    const { data: txs } = await supabase
      .from('transactions')
      .select('category_id, amount')
      .eq('user_id', user.id)
      .eq('type', 'expense')
      .gte('transaction_date', start)
      .lte('transaction_date', end);

    const spentMap = new Map<string, number>();
    (txs || []).forEach((t) => {
      const catId = t.category_id;
      if (catId) {
        spentMap.set(catId, (spentMap.get(catId) || 0) + Number(t.amount));
      }
    });

    const enrichedBudgets = (bData || []).map((b) => ({
      ...b,
      spent: spentMap.get(b.category_id) || 0,
    }));

    setBudgets(enrichedBudgets as Budget[]);
    setLoading(false);
  }, [currentMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;
    const { start, end } = getMonthRange(currentMonth);

    const payload = {
      user_id: user.id,
      category_id: formData.category_id,
      amount_limit: Number(formData.amount_limit),
      period_start: start,
      period_end: end,
    };

    // Check if budget for this category already exists in this period
    if (!editingBudget) {
      const existing = budgets.find((b) => b.category_id === formData.category_id);
      if (existing) {
        alert('Anggaran untuk kategori ini sudah ada bulan ini. Silakan edit anggaran yang ada.');
        setSaving(false);
        return;
      }
    }

    if (editingBudget) {
      await supabase
        .from('budgets')
        .update({ amount_limit: payload.amount_limit })
        .eq('id', editingBudget.id);
    } else {
      await supabase.from('budgets').insert(payload);
    }

    setSaving(false);
    setShowModal(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus anggaran ini?')) return;
    const supabase = createClient();
    await supabase.from('budgets').delete().eq('id', id);
    fetchData();
  };

  const openAdd = () => {
    setEditingBudget(null);
    setFormData({ category_id: '', amount_limit: '' });
    setShowModal(true);
  };

  const openEdit = (b: Budget) => {
    setEditingBudget(b);
    setFormData({
      category_id: b.category_id || '',
      amount_limit: String(b.amount_limit),
    });
    setShowModal(true);
  };

  const totalLimit = budgets.reduce((sum, b) => sum + Number(b.amount_limit), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
  const totalPct = calcPercentage(totalSpent, totalLimit);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="skeleton" style={{ height: '140px', borderRadius: 'var(--radius-lg)' }} />
        <div className="grid-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: '160px', borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 className="text-heading-md">Anggaran</h2>
          <p style={{ color: 'var(--stone)', fontSize: '14px' }}>
            {getMonthName(currentMonth.getMonth())} {currentMonth.getFullYear()}
          </p>
        </div>
        <button className="btn btn-brand" onClick={openAdd}>
          <Plus size={18} />
          Buat Anggaran
        </button>
      </div>

      {budgets.length > 0 && (
        <div className="card card-featured">
          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', opacity: 0.8 }}>Total Anggaran Bulan Ini</span>
            <div style={{ fontSize: '32px', fontWeight: '600', letterSpacing: '-0.5px' }}>
              {formatCurrency(totalLimit)}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
              <span>Terpakai: {formatCurrency(totalSpent)}</span>
              <span>Sisa: {formatCurrency(Math.max(0, totalLimit - totalSpent))}</span>
            </div>
            <div className="progress-track progress-track-lg" style={{ background: 'rgba(255, 255, 255, 0.2)' }}>
              <div
                className="progress-fill"
                style={{
                  width: `${Math.min(totalPct, 100)}%`,
                  background: totalPct > 100 ? 'var(--accent-danger)' : 'var(--on-primary)',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {budgets.length > 0 ? (
        <div className="grid-2">
          {budgets.map((b) => {
            const spent = b.spent || 0;
            const limit = Number(b.amount_limit);
            const pct = calcPercentage(spent, limit);
            const isWarning = pct >= 80 && pct < 100;
            const isDanger = pct >= 100;
            const statusColor = isDanger
              ? 'var(--accent-danger)'
              : isWarning
              ? 'var(--accent-warning)'
              : 'var(--accent-teal)';

            return (
              <div key={b.id} className="card">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: 'var(--radius-md)',
                        background: `${b.category?.color || 'var(--primary)'}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                      }}
                    >
                      {b.category?.icon ? (
                        <Icon name={b.category.icon} color={b.category.color || 'var(--primary)'} size={20} />
                      ) : (
                        <Package size={20} color="var(--primary)" />
                      )}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: '500' }}>
                        {b.category?.name || 'Tanpa Kategori'}
                      </h4>
                      <div style={{ fontSize: '13px', color: 'var(--stone)' }}>
                        Batas: {formatCurrency(limit)}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      className="btn-ghost btn-icon-sm"
                      onClick={() => openEdit(b)}
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      className="btn-ghost btn-icon-sm"
                      onClick={() => handleDelete(b.id)}
                      style={{ color: 'var(--accent-danger)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '20px', fontWeight: '600', color: statusColor }}>
                      {formatCurrency(spent)}
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: statusColor, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {isDanger && <AlertCircle size={14} />}
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
                  {isDanger && (
                    <p style={{ fontSize: '12px', color: 'var(--accent-danger)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Anggaran melebihi batas {formatCurrency(spent - limit)}
                    </p>
                  )}
                  {isWarning && (
                    <p style={{ fontSize: '12px', color: 'var(--accent-warning)', marginTop: '8px' }}>
                      Hampir mencapai batas anggaran!
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state card">
          <div className="empty-state-icon">
            <Plus size={28} style={{ color: 'var(--stone)' }} />
          </div>
          <h3 className="empty-state-title">Belum ada anggaran</h3>
          <p className="empty-state-desc">
            Buat anggaran untuk memantau pengeluaran agar tidak boros.
          </p>
          <button className="btn btn-brand" onClick={openAdd}>
            <Plus size={18} />
            Buat Anggaran
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-heading-sm">
                {editingBudget ? 'Edit Anggaran' : 'Buat Anggaran Baru'}
              </h3>
              <button
                className="btn-ghost btn-icon-sm"
                onClick={() => setShowModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="label">Kategori</label>
                  <select
                    className="input select"
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    required
                    disabled={!!editingBudget} // Don't allow changing category when editing
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {!!editingBudget && (
                    <p style={{ fontSize: '12px', color: 'var(--stone)', marginTop: '4px' }}>
                      Kategori tidak dapat diubah setelah anggaran dibuat.
                    </p>
                  )}
                </div>

                <div>
                  <label className="label">Batas Anggaran (Rp) per Bulan</label>
                  <input
                    className="input"
                    type="number"
                    placeholder="Contoh: 1500000"
                    value={formData.amount_limit}
                    onChange={(e) => setFormData({ ...formData, amount_limit: e.target.value })}
                    required
                    min="1"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-soft"
                  onClick={() => setShowModal(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-brand"
                  disabled={saving}
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
