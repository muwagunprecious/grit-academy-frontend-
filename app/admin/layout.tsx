'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Sparkles,
  UploadCloud,
  Users,
  LogOut,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  Bell,
  Flag,
} from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';

const NAV = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Upload & Subject Studio', path: '/admin/upload', icon: UploadCloud },
  { label: 'Flagged Questions', path: '/admin/flagged', icon: Flag },
  { label: 'Tests', path: '/admin/tests', icon: FileText },
  { label: 'AI Generator', path: '/admin/ai', icon: Sparkles },
  { label: 'Students', path: '/admin/students', icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, checkAuth, isLoading } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkAuth().then((currentUser) => {
      if (!currentUser) router.replace('/login');
      else if (currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPER_ADMIN')
        router.replace('/dashboard');
      else setChecking(false);
    });
  }, [router, checkAuth]);

  if (checking || isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--slate-50)', fontFamily: 'var(--font)' }}>
        <div style={{ width: 36, height: 36, border: '3px solid #E2E8F0', borderTopColor: 'var(--blue-600)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <p style={{ marginTop: 14, fontSize: 13, color: 'var(--slate-500)', fontWeight: 500 }}>Verifying admin access…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const isActive = (path: string) =>
    pathname === path || (path !== '/admin' && pathname.startsWith(path));
  const currentPage = NAV.find((n) => isActive(n.path))?.label || 'Admin';
  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--slate-50)', fontFamily: 'var(--font)' }}>

      {/* ── Fixed Left Sidebar ───────────────────────────────────── */}
      <aside style={{
        width: 256,
        flexShrink: 0,
        background: '#0F172A',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, bottom: 0, left: 0,
        zIndex: 40,
      }} className="admin-sidebar">

        {/* Brand Header */}
        <div style={{ padding: '24px 20px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'var(--blue-600)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 16, color: 'white',
              boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
            }}>G</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>Grit Academy</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.35)', marginTop: 1, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Admin Studio</div>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
          <div style={{ padding: '0 10px 6px', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Menu
          </div>
          {NAV.map(({ label, path, icon: Icon }) => {
            const active = isActive(path);
            return (
              <Link key={path} href={path} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 14px', borderRadius: 12,
                fontSize: 13, fontWeight: active ? 700 : 500,
                color: active ? 'white' : 'rgba(255,255,255,0.5)',
                background: active ? 'rgba(37,99,235,0.18)' : 'transparent',
                border: active ? '1px solid rgba(37,99,235,0.3)' : '1px solid transparent',
                textDecoration: 'none',
                transition: 'all 0.15s',
              }}>
                <Icon style={{ width: 18, height: 18, color: active ? 'white' : 'rgba(255,255,255,0.4)' }} />
                <span>{label}</span>
                {active && <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: 'var(--blue-600)' }} />}
              </Link>
            );
          })}
        </nav>

        {/* User Card */}
        <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', marginBottom: 6 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--blue-600)', color: 'white', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.firstName} {user?.lastName}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'capitalize', marginTop: 1 }}>
                {user?.role?.toLowerCase().replace('_', ' ')}
              </div>
            </div>
          </div>
          <button onClick={() => logout()} style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '9px 12px', borderRadius: 10, fontSize: 12, fontWeight: 600,
            color: 'rgba(255,255,255,0.45)', background: 'none', border: 'none', cursor: 'pointer',
            transition: 'all 0.15s',
          }}>
            <LogOut style={{ width: 14, height: 14 }} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Area ─────────────────────────────────────── */}
      <div style={{ flex: 1, marginLeft: 256, display: 'flex', flexDirection: 'column', minWidth: 0 }} className="admin-main">

        {/* Top Header */}
        <header style={{
          height: 64, position: 'sticky', top: 0, zIndex: 30,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 32px',
          background: 'rgba(248,250,252,0.92)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--slate-200)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{ padding: 6, background: 'white', border: '1px solid var(--slate-200)', borderRadius: 8, cursor: 'pointer' }}
              className="lg:hidden"
            >
              {mobileOpen ? <X style={{ width: 18, height: 18 }} /> : <Menu style={{ width: 18, height: 18 }} />}
            </button>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Admin Panel</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--slate-900)', marginTop: 1, letterSpacing: '-0.01em' }}>{currentPage}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/" style={{
              height: 38, padding: '0 16px', display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 12, fontWeight: 700, color: 'var(--slate-700)',
              background: 'white', border: '1.5px solid var(--slate-200)',
              borderRadius: 10, textDecoration: 'none', transition: 'all 0.15s',
            }}>
              Live Site <ExternalLink style={{ width: 13, height: 13 }} />
            </Link>
          </div>
        </header>

        {/* Main Body */}
        <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 1024px) {
          .admin-sidebar { transform: translateX(${mobileOpen ? '0' : '-100%'}); transition: transform 0.3s; }
          .admin-main { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  );
}
