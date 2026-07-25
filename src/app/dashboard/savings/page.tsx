'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, calcPercentage, formatDateShort } from '@/lib/utils';
import type { SavingsGoal, SavingsDeposit } from '@/lib/types';
import { Plus, X, Loader2, Edit3, Trash2, TrendingUp, Target } from 'lucide-react';
import Icon from '@/components/ui/Icon';

export default function SavingsPage() {
  const [goals, setGoals] = useState<(SavingsGoal & { deposits?: SavingsDeposit[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    target_amount: '',
    target_date: '',
    icon: 'target',
    color: '#494fdf',
  });

  const [depositForm, setDepositForm] = useState({
    amount: '',
    note: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    // Fetch goals and their deposits
    const { data: goalsData } = await supabase
      .from('savings_goals')
      .select('*, deposits:savings_deposits(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setGoals((goalsData || []) as any[]);
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
      title: formData.title,
      target_amount: Number(formData.target_amount),
      target_date: formData.target_date || null,
      icon: formData.icon,
      color: formData.color,
    };

    if (editingGoal) {
      await supabase
        .from('savings_goals')
        .update(payload)
        .eq('id', editingGoal.id);
    } else {
      await supabase.from('savings_goals').insert(payload);
    }

    setSaving(false);
    setShowModal(false);
    fetchData();
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGoalId) return;

    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    await supabase.from('savings_deposits').insert({
      user_id: user.id,
      goal_id: activeGoalId,
      amount: Number(depositForm.amount),
      note: depositForm.note,
    });

    setSaving(false);
    setShowDepositModal(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus target tabungan ini? Riwayat setoran juga akan terhapus.')) return;
    const supabase = createClient();
    await supabase.from('savings_goals').delete().eq('id', id);
    fetchData();
  };

  const openAdd = () => {
    setEditingGoal(null);
    setFormData({ title: '', target_amount: '', target_date: '', icon: 'target', color: '#494fdf' });
    setShowModal(true);
  };

  const openEdit = (g: SavingsGoal) => {
    setEditingGoal(g);
    setFormData({
      title: g.title,
      target_amount: String(g.target_amount),
      target_date: g.target_date || '',
      icon: g.icon,
      color: g.color,
    });
    setShowModal(true);
  };

  const openDeposit = (goalId: string) => {
    setActiveGoalId(goalId);
    setDepositForm({ amount: '', note: '' });
    setShowDepositModal(true);
  };

  const ICONS = [
    { id: 'target', label: 'Umum' },
    { id: 'car', label: 'Kendaraan' },
    { id: 'home', label: 'Rumah' },
    { id: 'laptop', label: 'Gadget' },
    { id: 'gem', label: 'Perhiasan' },
    { id: 'plane', label: 'Liburan' },
    { id: 'gamepad-2', label: 'Hobi' },
    { id: 'graduation-cap', label: 'Pendidikan' },
    { id: 'heart-pulse', label: 'Kesehatan' },
    { id: 'baby', label: 'Anak' }
  ];
  const COLORS = ['#494fdf', '#e61e49', '#00a87e', '#007bc2', '#ec7e00', '#936d62'];

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="skeleton" style={{ height: '48px', borderRadius: 'var(--radius-md)' }} />
        <div className="grid-2">
          {[1, 2].map((i) => (
            <div key={i} className="skeleton" style={{ height: '240px', borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 className="text-heading-md">Target Tabungan</h2>
          <p style={{ color: 'var(--stone)', fontSize: '14px' }}>
            Pantau progres tabunganmu
          </p>
        </div>
        <button className="btn btn-brand" onClick={openAdd}>
          <Plus size={18} />
          Buat Target
        </button>
      </div>

      {goals.length > 0 ? (
        <div className="grid-2">
          {goals.map((g) => {
            const pct = calcPercentage(g.current_amount, g.target_amount);
            const deposits = g.deposits || [];

            return (
              <div key={g.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: 'var(--radius-md)',
                        background: `${g.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                      }}
                    >
                      <Icon name={g.icon} color={g.color} size={24} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '18px', fontWeight: '600' }}>{g.title}</h4>
                      {g.target_date && (
                        <div style={{ fontSize: '13px', color: 'var(--stone)' }}>
                          Target: {formatDateShort(g.target_date)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button className="btn-ghost btn-icon-sm" onClick={() => openEdit(g)}>
                      <Edit3 size={14} />
                    </button>
                    <button className="btn-ghost btn-icon-sm" onClick={() => handleDelete(g.id)} style={{ color: 'var(--accent-danger)' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontSize: '13px', color: 'var(--stone)', marginBottom: '2px' }}>Terkumpul</div>
                      <div style={{ fontSize: '24px', fontWeight: '600', color: g.color }}>
                        {formatCurrency(g.current_amount)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '13px', color: 'var(--stone)', marginBottom: '2px' }}>Dari</div>
                      <div style={{ fontSize: '16px', fontWeight: '500' }}>
                        {formatCurrency(g.target_amount)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="progress-track progress-track-lg">
                    <div
                      className="progress-fill"
                      style={{ width: `${Math.min(pct, 100)}%`, background: g.color }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '13px', fontWeight: '500' }}>
                    <span style={{ color: g.color }}>{pct}% Selesai</span>
                    <span style={{ color: 'var(--stone)' }}>
                      Kurang {formatCurrency(Math.max(0, g.target_amount - g.current_amount))}
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--divider-soft)' }}>
                  <button
                    className="btn btn-outline"
                    style={{ width: '100%', borderColor: g.color, color: g.color }}
                    onClick={() => openDeposit(g.id)}
                    disabled={pct >= 100}
                  >
                    <Plus size={16} />
                    {pct >= 100 ? 'Target Tercapai 🎉' : 'Tambah Setoran'}
                  </button>

                  {deposits.length > 0 && (
                    <div style={{ marginTop: '16px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--stone)', marginBottom: '8px', textTransform: 'uppercase' }}>
                        Setoran Terakhir
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {deposits.slice(0, 2).map((d) => (
                          <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-teal)' }} />
                              <span style={{ color: 'var(--stone)' }}>{formatDateShort(d.created_at)}</span>
                            </div>
                            <span style={{ fontWeight: '500', color: 'var(--accent-teal)' }}>+{formatCurrency(d.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state card">
          <div className="empty-state-icon">
            <TrendingUp size={28} style={{ color: 'var(--stone)' }} />
          </div>
          <h3 className="empty-state-title">Belum ada target tabungan</h3>
          <p className="empty-state-desc">
            Buat target untuk dana darurat, liburan, atau gadget impianmu.
          </p>
          <button className="btn btn-brand" onClick={openAdd}>
            <Plus size={18} />
            Buat Target Baru
          </button>
        </div>
      )}

      {/* Add/Edit Goal Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-heading-sm">
                {editingGoal ? 'Edit Target' : 'Buat Target Baru'}
              </h3>
              <button className="btn-ghost btn-icon-sm" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="label">Nama Target</label>
                  <input
                    className="input"
                    type="text"
                    placeholder="Misal: Dana Darurat, iPhone 16"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="label">Jumlah Target (Rp)</label>
                  <input
                    className="input"
                    type="number"
                    placeholder="Contoh: 10000000"
                    value={formData.target_amount}
                    onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                    required
                    min="1"
                  />
                </div>

                <div>
                  <label className="label">Tenggat Waktu (Opsional)</label>
                  <input
                    className="input"
                    type="date"
                    value={formData.target_date}
                    onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label">Ikon</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {ICONS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        style={{
                          padding: '8px 16px',
                          borderRadius: 'var(--radius-full)',
                          border: `1px solid ${formData.icon === item.id ? 'var(--primary)' : 'var(--hairline-dark)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: formData.icon === item.id ? 'rgba(73, 79, 223, 0.1)' : 'transparent',
                          color: formData.icon === item.id ? 'var(--primary)' : 'var(--on-dark-mute)',
                          transition: 'all var(--transition-fast)',
                          fontSize: '14px',
                          fontWeight: formData.icon === item.id ? '500' : '400',
                          cursor: 'pointer'
                        }}
                        onClick={() => setFormData({ ...formData, icon: item.id })}
                      >
                        <Icon name={item.id} color="currentColor" size={16} />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label">Warna</label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: color,
                          border: formData.color === color ? '2px solid var(--on-dark)' : 'none',
                          cursor: 'pointer',
                          boxShadow: formData.color === color ? `0 0 0 2px ${color}` : 'none',
                        }}
                        onClick={() => setFormData({ ...formData, color })}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-soft" onClick={() => setShowModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-brand" disabled={saving}>
                  {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="modal-backdrop" onClick={() => setShowDepositModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-heading-sm">Tambah Setoran</h3>
              <button className="btn-ghost btn-icon-sm" onClick={() => setShowDepositModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleDepositSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="label">Nominal (Rp)</label>
                  <input
                    className="input"
                    type="number"
                    placeholder="0"
                    value={depositForm.amount}
                    onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })}
                    required
                    min="1"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="label">Catatan (Opsional)</label>
                  <input
                    className="input"
                    type="text"
                    placeholder="Misal: Bonus akhir tahun"
                    value={depositForm.note}
                    onChange={(e) => setDepositForm({ ...depositForm, note: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-soft" onClick={() => setShowDepositModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-brand" disabled={saving}>
                  {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                  Setor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
