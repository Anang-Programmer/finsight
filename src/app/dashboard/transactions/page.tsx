'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDateShort, cn } from '@/lib/utils';
import type { Transaction, Category } from '@/lib/types';
import {
  Plus,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Loader2,
  Trash2,
  Edit3,
  Sparkles,
  Filter,
  Package,
  DollarSign,
} from 'lucide-react';
import Icon from '@/components/ui/Icon';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [saving, setSaving] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category_id: '',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0],
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    const [{ data: txs }, { data: cats }] = await Promise.all([
      supabase
        .from('transactions')
        .select('*, category:categories(id, name, icon, color, type)')
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(100),
      supabase
        .from('categories')
        .select('*')
        .order('name'),
    ]);

    setTransactions((txs || []) as Transaction[]);
    setCategories((cats || []) as Category[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const payload = {
      user_id: user.id,
      amount: Number(formData.amount),
      type: formData.type,
      category_id: formData.category_id || null,
      description: formData.description,
      transaction_date: formData.transaction_date,
    };

    if (editingTransaction) {
      await supabase
        .from('transactions')
        .update(payload)
        .eq('id', editingTransaction.id);
    } else {
      await supabase.from('transactions').insert(payload);
    }

    setSaving(false);
    setShowModal(false);
    setEditingTransaction(null);
    resetForm();
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus transaksi ini?')) return;
    const supabase = createClient();
    await supabase.from('transactions').delete().eq('id', id);
    fetchData();
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      type: 'expense',
      category_id: '',
      description: '',
      transaction_date: new Date().toISOString().split('T')[0],
    });
    setAiSuggestion(null);
  };

  const openEdit = (t: Transaction) => {
    setEditingTransaction(t);
    setFormData({
      amount: String(t.amount),
      type: t.type,
      category_id: t.category_id || '',
      description: t.description,
      transaction_date: t.transaction_date,
    });
    setShowModal(true);
  };

  const openAdd = () => {
    setEditingTransaction(null);
    resetForm();
    setShowModal(true);
  };

  // AI auto-categorize
  const handleDescriptionBlur = async () => {
    if (!formData.description || formData.description.length < 3) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: formData.description }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.category_name) {
          setAiSuggestion(data.category_name);
          // Auto-select the suggested category
          const matchedCat = categories.find(
            (c) => c.name === data.category_name && c.type === formData.type
          );
          if (matchedCat && !formData.category_id) {
            setFormData((prev) => ({ ...prev, category_id: matchedCat.id }));
          }
        }
      }
    } catch {
      // Silently fail
    } finally {
      setAiLoading(false);
    }
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((t) => {
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesSearch =
      !searchQuery ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Filter categories by type
  const filteredCategories = categories.filter((c) => c.type === formData.type);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="skeleton" style={{ height: '48px', borderRadius: 'var(--radius-md)' }} />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="skeleton" style={{ height: '72px', borderRadius: 'var(--radius-md)' }} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 className="text-heading-md">Transaksi</h2>
          <p style={{ color: 'var(--stone)', fontSize: '14px' }}>
            {filteredTransactions.length} transaksi
          </p>
        </div>
        <button className="btn btn-brand" onClick={openAdd}>
          <Plus size={18} />
          Tambah Transaksi
        </button>
      </div>

      {/* Search & Filters */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--stone)',
            }}
          />
          <input
            className="input input-sm"
            placeholder="Cari transaksi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
        </div>

        <div className="tabs">
          {(['all', 'income', 'expense'] as const).map((type) => (
            <button
              key={type}
              className={cn('tab', filterType === type && 'tab-active')}
              onClick={() => setFilterType(type)}
            >
              {type === 'all' ? 'Semua' : type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      <div className="card" style={{ padding: 0 }}>
        {filteredTransactions.length > 0 ? (
          <div style={{ padding: '8px 24px' }}>
            {filteredTransactions.map((t) => (
              <div
                key={t.id}
                className="transaction-item"
                style={{ cursor: 'pointer' }}
              >
                <div
                  className="transaction-icon"
                  style={{
                    background:
                      t.type === 'income'
                        ? 'var(--accent-teal-soft)'
                        : `${t.category?.color || 'var(--accent-pink)'}20`,
                  }}
                >
                  {t.category?.icon ? (
                    <Icon name={t.category.icon} color={t.category.color || (t.type === 'income' ? 'var(--accent-teal)' : 'var(--accent-pink)')} size={18} />
                  ) : (
                    t.type === 'income' ? <DollarSign size={18} color="var(--accent-teal)" /> : <Package size={18} color="var(--accent-pink)" />
                  )}
                </div>
                <div className="transaction-info">
                  <div className="transaction-desc">
                    {t.description || (t.type === 'income' ? 'Pemasukan' : 'Pengeluaran')}
                  </div>
                  <div className="transaction-meta">
                    <span>{t.category?.name || 'Lainnya'}</span>
                    <span>•</span>
                    <span>{formatDateShort(t.transaction_date)}</span>
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
                <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
                  <button
                    className="btn-ghost btn-icon-sm"
                    onClick={(e) => { e.stopPropagation(); openEdit(t); }}
                    aria-label="Edit"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    className="btn-ghost btn-icon-sm"
                    onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }}
                    style={{ color: 'var(--accent-danger)' }}
                    aria-label="Hapus"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Filter size={28} style={{ color: 'var(--stone)' }} />
            </div>
            <h3 className="empty-state-title">
              {searchQuery ? 'Tidak ditemukan' : 'Belum ada transaksi'}
            </h3>
            <p className="empty-state-desc">
              {searchQuery
                ? 'Coba ubah kata kunci pencarian atau filter.'
                : 'Mulai catat transaksi pertamamu untuk memantau keuangan.'}
            </p>
            {!searchQuery && (
              <button className="btn btn-brand" onClick={openAdd}>
                <Plus size={18} />
                Tambah Transaksi
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-heading-sm">
                {editingTransaction ? 'Edit Transaksi' : 'Tambah Transaksi'}
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
                {/* Type Selector */}
                <div className="tabs" style={{ width: '100%' }}>
                  <button
                    type="button"
                    className={cn('tab', formData.type === 'expense' && 'tab-active')}
                    style={{ flex: 1 }}
                    onClick={() => setFormData({ ...formData, type: 'expense', category_id: '' })}
                  >
                    Pengeluaran
                  </button>
                  <button
                    type="button"
                    className={cn('tab', formData.type === 'income' && 'tab-active')}
                    style={{ flex: 1 }}
                    onClick={() => setFormData({ ...formData, type: 'income', category_id: '' })}
                  >
                    Pemasukan
                  </button>
                </div>

                {/* Amount */}
                <div>
                  <label className="label">Nominal (Rp)</label>
                  <input
                    className="input"
                    type="number"
                    placeholder="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    min="1"
                    step="1"
                    autoFocus
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="label">Deskripsi</label>
                  <input
                    className="input"
                    type="text"
                    placeholder="Misal: Makan siang di kantin"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    onBlur={handleDescriptionBlur}
                  />
                  {aiLoading && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '12px', color: 'var(--primary-bright)' }}>
                      <Loader2 size={12} className="animate-spin" />
                      AI sedang menebak kategori...
                    </div>
                  )}
                  {aiSuggestion && !aiLoading && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '12px', color: 'var(--primary-bright)' }}>
                      <Sparkles size={12} />
                      AI menyarankan: <strong>{aiSuggestion}</strong>
                    </div>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="label">Kategori</label>
                  <select
                    className="input select"
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  >
                    <option value="">Pilih kategori</option>
                    {filteredCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="label">Tanggal</label>
                  <input
                    className="input"
                    type="date"
                    value={formData.transaction_date}
                    onChange={(e) =>
                      setFormData({ ...formData, transaction_date: e.target.value })
                    }
                    required
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
                  {saving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : null}
                  {saving
                    ? 'Menyimpan...'
                    : editingTransaction
                    ? 'Simpan Perubahan'
                    : 'Tambah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
