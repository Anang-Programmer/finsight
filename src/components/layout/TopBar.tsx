'use client';

import { useState } from 'react';
import { Menu, Plus, LogOut } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

import React from 'react';

const pageTitles: Record<string, React.ReactNode> = {
  '/dashboard': 'Dashboard',
  '/dashboard/transactions': 'Transaksi',
  '/dashboard/budgets': 'Anggaran',
  '/dashboard/savings': 'Target Tabungan',
  '/dashboard/assistant': (
    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
      <span>Finsight AI</span>
      <span style={{ color: 'var(--primary-bright)', fontSize: '12px', fontWeight: '500' }}>
        Online • Berbasis data keuanganmu
      </span>
    </div>
  ),
  '/dashboard/settings': 'Pengaturan',
};

interface TopBarProps {
  onMenuClick: () => void;
  onAddTransaction?: () => void;
  userName?: string;
}

export default function TopBar({ onMenuClick, onAddTransaction, userName }: TopBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const title = pageTitles[pathname] || 'Finsight';

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          className="btn-ghost btn-icon"
          onClick={onMenuClick}
          id="mobile-menu-btn"
        >
          <Menu size={22} />
        </button>
        <h1 className="topbar-title">{title}</h1>
      </div>

      <div className="topbar-actions">
        {onAddTransaction && (
          <button
            className="btn btn-brand btn-sm"
            onClick={onAddTransaction}
          >
            <Plus size={16} />
            <span className="hide-mobile">Tambah Transaksi</span>
          </button>
        )}
        {userName && (
          <span style={{ fontSize: '14px', fontWeight: '500', marginRight: '8px', color: 'var(--stone)' }} className="hide-mobile">
            Hi, {userName}
          </span>
        )}
        <button
          className="btn-ghost btn-icon-sm"
          onClick={handleLogout}
          disabled={isLoggingOut}
          aria-label="Keluar"
          style={{ opacity: isLoggingOut ? 0.5 : 1, color: 'var(--accent-danger)' }}
        >
          <LogOut size={18} />
        </button>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .hide-mobile {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
