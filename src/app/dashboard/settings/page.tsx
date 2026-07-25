'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User, Mail, Shield, Loader2, Save } from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();

        setFormData({
          fullName: profile?.full_name || user.user_metadata?.full_name || '',
          email: user.email || '',
        });
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: formData.fullName })
        .eq('id', user.id);

      if (error) {
        setMessage({ type: 'error', text: 'Gagal menyimpan profil. Silakan coba lagi.' });
      } else {
        setMessage({ type: 'success', text: 'Profil berhasil diperbarui.' });
      }
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="skeleton" style={{ height: '400px', borderRadius: 'var(--radius-lg)', maxWidth: '600px' }} />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px' }}>
      <div>
        <h2 className="text-heading-md">Pengaturan</h2>
        <p style={{ color: 'var(--stone)', fontSize: '14px' }}>
          Kelola profil dan preferensi akun Anda
        </p>
      </div>

      <div className="card">
        <h3 className="text-heading-sm" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={20} className="text-primary" />
          Profil Pengguna
        </h3>

        {message && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: message.type === 'success' ? 'var(--accent-teal-soft)' : 'var(--accent-danger-soft)',
              color: message.type === 'success' ? 'var(--accent-teal)' : 'var(--accent-danger)',
              fontSize: '14px',
              marginBottom: '20px',
            }}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label className="label">Nama Lengkap</label>
            <div style={{ position: 'relative' }}>
              <User
                size={18}
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--stone)',
                }}
              />
              <input
                className="input"
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                style={{ paddingLeft: '44px' }}
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Email</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--stone)',
                }}
              />
              <input
                className="input"
                type="email"
                value={formData.email}
                disabled
                style={{ paddingLeft: '44px', opacity: 0.7, cursor: 'not-allowed' }}
              />
            </div>
            <p style={{ fontSize: '12px', color: 'var(--stone)', marginTop: '6px' }}>
              Email tidak dapat diubah saat ini.
            </p>
          </div>

          <button
            type="submit"
            className="btn btn-brand"
            disabled={saving}
            style={{ alignSelf: 'flex-start', marginTop: '8px' }}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </form>
      </div>

      <div className="card" style={{ border: '1px solid rgba(226, 59, 74, 0.2)' }}>
        <h3 className="text-heading-sm" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-danger)' }}>
          <Shield size={20} />
          Zona Bahaya
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--stone)', marginBottom: '20px' }}>
          Tindakan ini akan menghapus akun Anda secara permanen beserta semua data keuangan (transaksi, anggaran, target tabungan). Tindakan ini tidak dapat dibatalkan.
        </p>
        <button
          className="btn btn-danger btn-sm"
          onClick={() => alert('Fitur ini dinonaktifkan dalam mode Demo.')}
        >
          Hapus Akun Permanen
        </button>
      </div>
    </div>
  );
}
