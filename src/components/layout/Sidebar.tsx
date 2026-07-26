'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  Target,
  MessageSquareText,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const navItems = [
  {
    label: 'Menu Utama',
    items: [
      { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/dashboard/transactions', icon: ArrowLeftRight, label: 'Transaksi' },
      { href: '/dashboard/budgets', icon: PiggyBank, label: 'Anggaran' },
      { href: '/dashboard/savings', icon: Target, label: 'Target Tabungan' },
    ],
  },
  {
    label: 'AI',
    items: [
      { href: '/dashboard/assistant', icon: MessageSquareText, label: 'Finsight AI' },
      { href: '/dashboard/timemachine', icon: Sparkles, label: 'Mesin Waktu' },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

export default function Sidebar({ isOpen, onClose, userName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn('sidebar-overlay', isOpen && 'sidebar-overlay-visible')}
        onClick={onClose}
      />

      <aside className={cn('sidebar', isOpen ? 'sidebar-open' : 'sidebar-closed')}>
        {/* Logo */}
        <div className="sidebar-logo" style={{ padding: '24px 20px' }}>
          <Image 
            src="/logo.png" 
            alt="Finsight" 
            width={36} 
            height={36} 
            style={{ 
              objectFit: 'contain',
              mixBlendMode: 'screen' 
            }} 
          />
          <span className="sidebar-logo-text" style={{ fontSize: '22px' }}>Finsight</span>
          <button
            className="btn-ghost btn-icon-sm"
            onClick={onClose}
            style={{ marginLeft: 'auto', display: 'none' }}
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((section) => (
            <div key={section.label}>
              <div className="sidebar-section-label">{section.label}</div>
              {section.items.map((item) => {
                const isActive =
                  item.href === '/dashboard'
                    ? pathname === '/dashboard'
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'sidebar-link',
                      isActive && 'sidebar-link-active'
                    )}
                    onClick={() => {
                      if (window.innerWidth < 769) onClose();
                    }}
                  >
                    <item.icon size={20} className="sidebar-link-icon" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          {userName && (
            <div
              style={{
                padding: '10px 12px',
                fontSize: '14px',
                color: 'var(--stone)',
                marginBottom: '4px',
              }}
            >
              👋 {userName}
            </div>
          )}
          <Link href="/dashboard/settings" className="sidebar-link">
            <Settings size={20} className="sidebar-link-icon" />
            Pengaturan
          </Link>
          <button
            className="sidebar-link"
            onClick={handleLogout}
            disabled={isLoggingOut}
            style={{ opacity: isLoggingOut ? 0.5 : 1 }}
          >
            <LogOut size={20} className="sidebar-link-icon" />
            {isLoggingOut ? 'Keluar...' : 'Keluar'}
          </button>
        </div>
      </aside>
    </>
  );
}
