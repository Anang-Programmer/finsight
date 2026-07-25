import Link from 'next/link';
import { ArrowRight, CheckCircle2, Shield, Sparkles, PieChart, Activity } from 'lucide-react';
import Icon from '@/components/ui/Icon';

export default function HomePage() {
  return (
    <div style={{ background: 'var(--canvas)', minHeight: '100vh' }}>
      {/* Hero Section */}
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: 'absolute',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(73, 79, 223, 0.15) 0%, transparent 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        />

        {/* Logo */}
        <div
          className="animate-fade-in-up"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '48px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              background: 'var(--primary)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: '700',
              color: 'var(--on-primary)',
            }}
          >
            F
          </div>
          <span style={{ fontSize: '24px', fontWeight: '600', letterSpacing: '-0.4px' }}>
            Finsight
          </span>
        </div>

        {/* Headline */}
        <h1
          className="text-display-xl animate-fade-in-up"
          style={{
            maxWidth: '800px',
            marginBottom: '24px',
          }}
        >
          Kelola Keuanganmu
          <br />
          dengan{' '}
          <span style={{ color: 'var(--primary-bright)' }}>Cerdas</span>
        </h1>

        {/* Subtitle */}
        <p
          className="text-body-lg animate-fade-in-up"
          style={{
            color: 'var(--on-dark-mute)',
            maxWidth: '560px',
            marginBottom: '40px',
          }}
        >
          Platform literasi finansial berbasis AI. Catat transaksi, susun anggaran,
          dan dapatkan insight keuangan personal dari AI — bukan saran generik.
        </p>

        {/* CTA Buttons */}
        <div
          className="animate-fade-in-up"
          style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <Link href="/signup" className="btn btn-primary btn-lg">
            Mulai Gratis
          </Link>
          <Link href="/login" className="btn btn-outline btn-lg">
            Masuk
          </Link>
        </div>

        {/* Feature pills */}
        <div
          className="animate-fade-in-up"
          style={{
            display: 'flex',
            gap: '12px',
            marginTop: '48px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {['📊 Dashboard Cerdas', '🤖 AI Insights', '💰 Catat Transaksi', '🎯 Target Tabungan'].map(
            (feature) => (
              <span
                key={feature}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--surface-elevated)',
                  color: 'var(--on-dark-mute)',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                {feature}
              </span>
            )
          )}
        </div>
      </div>

      {/* Features Section */}
      <div
        style={{
          padding: '88px 24px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <h2
          className="text-display-lg"
          style={{ textAlign: 'center', marginBottom: '64px' }}
        >
          Satu Platform,{' '}
          <span style={{ color: 'var(--primary-bright)' }}>Semua Kebutuhan</span>
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
          }}
        >
          {[
            {
              icon: 'layout-dashboard',
              title: 'Dashboard Real-time',
              desc: 'Lihat ringkasan keuangan lengkap — saldo, pengeluaran per kategori, dan progres tabunganmu dalam satu pandangan.',
            },
            {
              icon: 'bot',
              title: 'AI Personal Insights',
              desc: 'Dapatkan analisis keuangan personal dari AI berdasarkan data transaksimu sendiri, bukan saran generik.',
            },
            {
              icon: 'lightbulb',
              title: 'Anggaran Cerdas',
              desc: 'Susun anggaran per kategori dan pantau progresnya secara real-time. Peringatan otomatis saat mendekati batas.',
            },
            {
              icon: 'target',
              title: 'Target Tabungan',
              desc: 'Tetapkan target tabungan dengan tenggat waktu dan lacak progresmu menuju tujuan finansial.',
            },
            {
              icon: 'message-square',
              title: 'Asisten AI Chat',
              desc: 'Tanya jawab dengan AI seputar kondisi keuanganmu. "Berapa sisa anggaran makan bulan ini?"',
            },
            {
              icon: 'lock',
              title: 'Data Aman & Privat',
              desc: 'Data keuanganmu dilindungi dengan Row Level Security. Hanya kamu yang bisa mengakses datamu.',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="card card-hover"
              style={{ cursor: 'default' }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(73, 79, 223, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <Icon name={feature.icon} color="var(--primary-bright)" size={24} />
              </div>
              <h3
                style={{
                  fontSize: '20px',
                  fontWeight: '500',
                  marginBottom: '8px',
                  letterSpacing: '-0.2px',
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  fontSize: '15px',
                  color: 'var(--on-dark-mute)',
                  lineHeight: '1.6',
                }}
              >
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          padding: '40px 24px',
          borderTop: '1px solid var(--divider-soft)',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: '13px', color: 'var(--stone)' }}>
          © 2026 Finsight. Platform literasi finansial berbasis AI.
        </p>
        <p
          style={{
            fontSize: '12px',
            color: 'var(--ash)',
            marginTop: '8px',
            maxWidth: '500px',
            margin: '8px auto 0',
          }}
        >
          Finsight membantu pencatatan dan pemahaman kondisi keuangan pribadi,
          bukan pengganti konsultan keuangan profesional.
        </p>
      </footer>
    </div>
  );
}
