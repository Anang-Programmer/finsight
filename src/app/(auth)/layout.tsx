export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-container">
      <div className="auth-left">
        {children}
      </div>
      <div className="auth-right">
        {/* Modern Graphic Abstract Element */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '480px', aspectRatio: '1', zIndex: 1 }}>
          <div style={{
            position: 'absolute', top: '10%', left: '10%', width: '320px', height: '320px',
            background: 'var(--primary-bright)', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.15
          }} />
          <div style={{
            position: 'absolute', bottom: '10%', right: '10%', width: '360px', height: '360px',
            background: 'var(--accent-teal)', borderRadius: '50%', filter: 'blur(120px)', opacity: 0.1
          }} />
          
          {/* Glassmorphism Card */}
          <div style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            width: '100%',
            background: 'rgba(255, 255, 255, 0.02)', 
            border: '1px solid rgba(255, 255, 255, 0.06)', 
            borderRadius: 'var(--radius-xl)', 
            padding: '48px', 
            backdropFilter: 'blur(32px)',
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.2)'
          }}>
            <h2 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--on-dark)', marginBottom: '16px', letterSpacing: '-0.5px' }}>
              Kendalikan Masa Depan Finansial Anda.
            </h2>
            <p style={{ color: 'var(--stone)', fontSize: '18px', lineHeight: 1.6 }}>
              Finsight menggabungkan kecerdasan buatan dengan desain kelas dunia untuk memberikan asisten keuangan pribadi yang tak tertandingi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
