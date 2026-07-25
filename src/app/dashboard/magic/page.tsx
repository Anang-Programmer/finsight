'use client';

import { useState } from 'react';
import { Sparkles, Send, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import Icon from '@/components/ui/Icon';

export default function MagicPage() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // 1. Get user session
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Sesi tidak valid, silakan login ulang.');
      }

      // 2. Call AI API
      const res = await fetch('/api/ai/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ text: input }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Gagal memproses teks.');
      }

      const data = await res.json();
      setResult(data.transaction);
      setInput('');
      
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div 
          style={{ 
            width: '64px', 
            height: '64px', 
            background: 'var(--primary)', 
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            color: 'var(--on-primary)',
            boxShadow: '0 0 40px rgba(73, 79, 223, 0.4)'
          }}
        >
          <Sparkles size={32} />
        </div>
        <h1 className="text-display-sm" style={{ marginBottom: '16px' }}>
          AI Text-to-Transaction
        </h1>
        <p style={{ color: 'var(--stone)', fontSize: '16px', maxWidth: '500px', margin: '0 auto' }}>
          Ketik pengeluaran atau pemasukanmu dengan gaya bahasa sehari-hari. Finsight AI akan mengkategorikan dan mencatatnya secara otomatis.
        </p>
      </div>

      <div className="card" style={{ padding: '32px', marginBottom: '32px' }}>
        <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
          <textarea
            className="input"
            placeholder="Contoh: &#34;Hari ini makan siang di McD habis 55 ribu&#34; atau &#34;Baru aja gajian 10 juta&#34;"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            style={{ 
              height: '120px', 
              padding: '20px', 
              fontSize: '16px', 
              resize: 'none',
              paddingRight: '64px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)'
            }}
          />
          <button
            type="submit"
            className="btn btn-brand btn-icon"
            disabled={!input.trim() || isLoading}
            style={{
              position: 'absolute',
              bottom: '20px',
              right: '20px',
              borderRadius: 'var(--radius-md)',
            }}
          >
            {isLoading ? <Loader2 className="spin" size={18} /> : <Send size={18} />}
          </button>
        </form>

        {error && (
          <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(226, 59, 74, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--accent-danger)', fontSize: '14px' }}>
            {error}
          </div>
        )}
      </div>

      {result && (
        <div className="card animate-fade-in-up" style={{ padding: '24px', background: 'var(--surface-elevated)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <CheckCircle2 size={24} color="var(--accent-teal)" />
            <h3 style={{ fontSize: '18px', fontWeight: '500', color: 'var(--accent-teal)' }}>
              Transaksi Berhasil Dicatat!
            </h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="card-soft" style={{ padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '13px', color: 'var(--stone)', marginBottom: '8px' }}>Nominal</div>
              <div style={{ fontSize: '24px', fontWeight: '600', color: result.type === 'income' ? 'var(--accent-teal)' : 'var(--on-dark)' }}>
                {result.type === 'income' ? '+' : '-'}{formatCurrency(result.amount)}
              </div>
            </div>
            
            <div className="card-soft" style={{ padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '13px', color: 'var(--stone)', marginBottom: '8px' }}>Kategori</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '500' }}>
                <Icon name={result.category?.icon || 'help-circle'} size={18} color={result.category?.color || 'var(--stone)'} />
                {result.category?.name || 'Lainnya'}
              </div>
            </div>

            <div className="card-soft" style={{ padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '13px', color: 'var(--stone)', marginBottom: '8px' }}>Deskripsi</div>
              <div style={{ fontSize: '16px', fontWeight: '500' }}>
                {result.description}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              className="btn-ghost" 
              onClick={() => router.push('/dashboard/transactions')}
              style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              Lihat di Transaksi <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
