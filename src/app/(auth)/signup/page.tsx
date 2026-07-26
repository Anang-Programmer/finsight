'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, UserPlus, Loader2, AlertCircle } from 'lucide-react';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          setError('Email sudah terdaftar. Silakan masuk atau gunakan email lain.');
        } else {
          setError(authError.message);
        }
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const checkCapsLock = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLockOn(e.getModifierState('CapsLock'));
  };

  return (
    <div className="auth-card finsight-login">
      <Link href="/" className="auth-logo finsight-logo" style={{ textDecoration: 'none' }}>
        <Image src="/logo.png" alt="Finsight" width={32} height={32} />
        <span className="finsight-wordmark">Finsight</span>
      </Link>

      {/* Same signature mark as the login page, kept identical for continuity between the two auth screens */}
      <svg className="finsight-spark" viewBox="0 0 132 28" fill="none" aria-hidden="true">
        <path
          d="M2 20 L28 16 L46 22 L66 8 L88 12 L108 4 L130 6"
          stroke="var(--finsight-accent, #BFA054)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <h1 className="auth-title finsight-title">Buat Akun Baru</h1>
      <p className="auth-subtitle">Mulai perjalanan finansialmu bersama Finsight</p>

      <form className="auth-form" onSubmit={handleSignup}>
        {error && (
          <div className="finsight-alert" role="alert">
            <AlertCircle size={16} className="finsight-alert-icon" />
            <span>{error}</span>
          </div>
        )}

        <div className="finsight-field" style={{ animationDelay: '60ms' }}>
          <label className="label" htmlFor="fullName">
            Nama Lengkap
          </label>
          <input
            id="fullName"
            type="text"
            className="input"
            placeholder="Masukkan nama lengkap"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            autoComplete="name"
          />
        </div>

        <div className="finsight-field" style={{ animationDelay: '120ms' }}>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="input"
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="finsight-field" style={{ animationDelay: '180ms' }}>
          <label className="label" htmlFor="password">
            Password
          </label>
          <div className="finsight-password-wrap">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="input"
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={checkCapsLock}
              onKeyUp={checkCapsLock}
              required
              minLength={6}
              autoComplete="new-password"
              style={{ paddingRight: '48px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="finsight-toggle"
              aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {capsLockOn && <span className="finsight-hint">Caps Lock aktif</span>}
        </div>

        <button
          type="submit"
          className="btn btn-brand finsight-submit"
          disabled={loading}
          style={{ width: '100%', marginTop: '8px', animationDelay: '240ms' }}
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : <UserPlus size={20} />}
          {loading ? 'Mendaftar...' : 'Daftar'}
        </button>
      </form>

      <p className="finsight-footer">
        Sudah punya akun?{' '}
        <Link href="/login" className="auth-link">
          Masuk
        </Link>
      </p>

      <style jsx>{`
        .finsight-login {
          position: relative;
          background-image: repeating-linear-gradient(
            to bottom,
            transparent 0,
            transparent 27px,
            rgba(255, 255, 255, 0.025) 27px,
            rgba(255, 255, 255, 0.025) 28px
          );
          animation: finsight-rise 0.5s ease both;
        }

        .finsight-logo {
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }

        .finsight-wordmark {
          font-size: 20px;
          font-weight: 600;
          letter-spacing: -0.01em;
          color: var(--on-dark);
        }

        .finsight-spark {
          display: block;
          width: 132px;
          height: 28px;
          margin: 6px 0 18px;
          overflow: visible;
        }

        .finsight-spark path {
          stroke-dasharray: 220;
          stroke-dashoffset: 220;
          animation: finsight-draw 1.1s 0.25s cubic-bezier(0.65, 0, 0.35, 1) forwards;
          opacity: 0.85;
        }

        .finsight-title {
          font-family: 'Iowan Old Style', 'Palatino Linotype', Georgia, serif;
          letter-spacing: -0.015em;
        }

        .finsight-field {
          animation: finsight-rise 0.45s ease both;
        }

        .finsight-password-wrap {
          position: relative;
        }

        .finsight-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--stone);
          cursor: pointer;
          padding: 4px;
          display: flex;
          transition: color 0.15s ease;
        }

        .finsight-toggle:hover {
          color: var(--on-dark);
        }

        .finsight-hint {
          display: block;
          margin-top: 6px;
          font-size: 12.5px;
          color: var(--accent-danger, #c1553c);
        }

        .finsight-alert {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 12px 16px;
          border-radius: var(--radius-md);
          background: var(--accent-danger-soft);
          border-left: 2px solid var(--accent-danger);
          color: var(--accent-danger);
          font-size: 14px;
          animation: finsight-rise 0.3s ease both;
        }

        .finsight-alert-icon {
          flex-shrink: 0;
          margin-top: 1px;
        }

        .finsight-submit {
          animation: finsight-rise 0.45s ease both;
          transition: transform 0.12s ease;
        }

        .finsight-submit:active:not(:disabled) {
          transform: scale(0.98);
        }

        .finsight-footer {
          text-align: center;
          font-size: 14px;
          color: var(--stone);
          margin-top: 24px;
        }

        @keyframes finsight-rise {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes finsight-draw {
          to {
            stroke-dashoffset: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .finsight-login,
          .finsight-field,
          .finsight-submit,
          .finsight-alert {
            animation: none;
          }
          .finsight-spark path {
            animation: none;
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
}