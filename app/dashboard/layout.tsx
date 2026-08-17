'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '../../stores/auth.store';
import api from '../../lib/api';

const NAV_ITEMS = [
  { label: 'Overview',       href: '/dashboard',           icon: '◈' },
  { label: 'Practice Tests', href: '/dashboard/tests',     icon: '📄' },
  { label: 'Analytics',      href: '/dashboard/analytics', icon: '📊' },
  { label: 'Bookmarks',      href: '/dashboard/bookmarks', icon: '🔖' },
  { label: 'Attempts',       href: '/dashboard/attempts',  icon: '⏱' },
  { label: 'Profile',        href: '/dashboard/profile',   icon: '◎' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted,     setMounted]     = useState(false);
  const [scrolled,    setScrolled]    = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  // Close sidebar when route changes
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  const handleLogout  = async () => { await logout(); router.push('/'); };
  const currentPage   = NAV_ITEMS.find((n) => isActive(n.href))?.label || 'Dashboard';
  const initials      = `${user?.firstName?.[0] || 'S'}${user?.lastName?.[0] || ''}`;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--slate-50)', fontFamily: 'var(--font)' }}>

      {/* ── Backdrop (mobile) ──────────────────────────────── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 39,
            background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)',
          }}
        />
      )}

      {/* ── Sidebar ────────────────────────────────────────── */}
      <aside className={`dash-sidebar${sidebarOpen ? ' open' : ''}`} style={{
        width: 248, flexShrink: 0,
        background: 'white',
        borderRight: '1px solid var(--slate-200)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, bottom: 0, left: 0,
        zIndex: 40, transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
      }}>
        {/* Logo */}
        <div style={{ padding: '22px 20px 16px', borderBottom: '1px solid var(--slate-100)' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'var(--blue-600)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 15, color: 'white',
              boxShadow: '0 4px 10px rgba(37,99,235,0.25)',
            }}>G</div>
            <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--slate-900)', letterSpacing: '-0.02em' }}>Grit Academy</span>
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: 11,
                  padding: '10px 13px', borderRadius: 10,
                  fontSize: 13, fontWeight: active ? 700 : 500,
                  color: active ? 'var(--blue-600)' : 'var(--slate-500)',
                  background: active ? 'var(--blue-50)' : 'transparent',
                  border: `1px solid ${active ? 'var(--blue-100)' : 'transparent'}`,
                  textDecoration: 'none', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'var(--slate-50)'; (e.currentTarget as HTMLElement).style.color = 'var(--slate-900)'; } }}
                onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--slate-500)'; } }}
              >
                <span style={{ fontSize: 15, width: 18, textAlign: 'center' }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: '10px', borderTop: '1px solid var(--slate-100)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 12,
            background: 'var(--slate-50)', border: '1px solid var(--slate-200)',
            marginBottom: 6,
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              background: 'var(--blue-600)', color: 'white',
              fontSize: 12, fontWeight: 700, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--slate-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.firstName} {user?.lastName}
              </div>
              <div style={{ fontSize: 10, color: 'var(--slate-400)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email || 'student@email.com'}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 13px', borderRadius: 9, fontSize: 12, fontWeight: 600,
              color: 'var(--slate-500)', background: 'none', border: 'none',
              cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FEF2F2'; (e.currentTarget as HTMLElement).style.color = '#DC2626'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = 'var(--slate-500)'; }}
          >
            <span style={{ fontSize: 14 }}>↪</span> Log out
          </button>
        </div>
      </aside>

      {/* ── Main Area ─────────────────────────────────────── */}
      <div className="dash-main" style={{ flex: 1, marginLeft: 248, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Top Header */}
        <header style={{
          height: 58, position: 'sticky', top: 0, zIndex: 30,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px',
          background: scrolled ? 'rgba(255,255,255,0.96)' : 'white',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: '1px solid var(--slate-100)',
          transition: 'all 0.2s',
        }}>
          {/* Hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="mobile-menu-btn"
            style={{
              display: 'none', alignItems: 'center', justifyContent: 'center',
              width: 38, height: 38, borderRadius: 9,
              border: '1px solid var(--slate-200)', background: 'white',
              cursor: 'pointer', fontSize: 16, color: 'var(--slate-700)',
              flexShrink: 0,
            }}
          >☰</button>

          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--slate-900)', letterSpacing: '-0.01em' }}>
            {currentPage}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* AI badge — hidden on very small screens */}
            <div className="ai-badge" style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 11px', borderRadius: 100,
              background: 'var(--emerald-50)',
              border: '1px solid rgba(5,150,105,0.15)',
              fontSize: 11, fontWeight: 700, color: 'var(--emerald-600)',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#059669', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              AI Active
            </div>

            {/* Avatar */}
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: 'var(--blue-600)', color: 'white',
              fontSize: 12, fontWeight: 700, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}>{initials}</div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: '20px 16px', overflowY: 'auto', position: 'relative' }} className="dash-content">
          {mounted ? (
            <>
              {/* Unpaid Student Paywall Banner/Modal */}
              {user?.role === 'STUDENT' && user?.hasPaidAccessFee === false && pathname !== '/dashboard/profile' ? (
                <div style={{
                  background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                  borderRadius: 24, padding: '36px 32px', color: 'white',
                  border: '1.5px solid rgba(239,68,68,0.3)',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
                  marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 16,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 14, background: 'rgba(239,68,68,0.15)',
                      border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 20,
                    }}>🔒</div>
                    <div>
                      <h3 style={{ fontSize: 20, fontWeight: 900, color: 'white', margin: 0 }}>
                        Platform Access Locked (₦500 Access Fee Required)
                      </h3>
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: '4px 0 0', fontWeight: 500 }}>
                        Pay a one-time ₦500 platform fee to unlock unlimited practice CBT tests, AI step-by-step correction explainers, reading passages, interactive schematics, and analytics.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', paddingTop: 8 }}>
                    <button
                      onClick={async () => {
                        try {
                          // Fetch practice tests to initialize payment on test package
                          const testsRes = await api.get('/tests');
                          const tests = testsRes.data?.data?.tests || [];
                          const targetTestId = tests[0]?.id || 'cmrus90cf004nc1h0ezrn027p';

                          const payRes = await api.post('/payments/initialize', { testId: targetTestId });
                          const authUrl = payRes.data?.data?.authorization_url;
                          if (authUrl) {
                            window.location.href = authUrl;
                          }
                        } catch (err: any) {
                          alert(err.response?.data?.message || 'Payment initialization failed. Please try again.');
                        }
                      }}
                      style={{
                        padding: '12px 24px', borderRadius: 14, border: 'none',
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        color: 'white', fontSize: 13, fontWeight: 800, cursor: 'pointer',
                        boxShadow: '0 4px 20px rgba(5,150,105,0.4)', transition: 'all 0.18s',
                      }}
                    >
                      💳 Pay ₦500 via Paystack Now
                    </button>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                      ⚡ Instant automated activation via Paystack
                    </span>
                  </div>
                </div>
              ) : null}

              {children}
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
              <div style={{ width: 32, height: 32, border: '3px solid var(--slate-200)', borderTopColor: 'var(--blue-600)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            </div>
          )}
        </main>

        {/* ── Mobile Bottom Nav ──────────────────────────────── */}
        <nav className="mobile-bottom-nav" style={{
          display: 'none', position: 'fixed', bottom: 0, left: 0, right: 0,
          height: 64, background: 'white',
          borderTop: '1px solid var(--slate-200)',
          zIndex: 50, padding: '0 4px',
          alignItems: 'center', justifyContent: 'space-around',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.06)',
        }}>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  padding: '6px 10px', borderRadius: 12, textDecoration: 'none',
                  color: active ? 'var(--blue-600)' : 'var(--slate-400)',
                  background: active ? 'var(--blue-50)' : 'transparent',
                  flex: 1, transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: 18, lineHeight: 1 }}>{item.icon}</span>
                <span style={{ fontSize: 9, fontWeight: active ? 800 : 600, letterSpacing: '0.02em' }}>
                  {item.label.split(' ')[0]}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{ opacity:1; } 50%{ opacity:0.45; } }

        /* ── Tablet ── */
        @media (max-width: 1024px) {
          .dash-sidebar       { transform: translateX(-100%); box-shadow: none; }
          .dash-sidebar.open  { transform: translateX(0); box-shadow: 4px 0 32px rgba(0,0,0,0.15); }
          .dash-main          { margin-left: 0 !important; }
          .mobile-menu-btn    { display: flex !important; }
        }

        /* ── Desktop content padding ── */
        @media (min-width: 1025px) {
          .dash-content { padding: 28px 32px !important; }
        }

        /* ── Mobile ── */
        @media (max-width: 640px) {
          .ai-badge           { display: none !important; }
          .mobile-bottom-nav  { display: flex !important; }
          .dash-content       { padding: 16px 12px 80px !important; } /* bottom padding for nav */
        }
      `}</style>
    </div>
  );
}
