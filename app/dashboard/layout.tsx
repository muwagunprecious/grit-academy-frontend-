'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Bookmark,
  History,
  User,
  LogOut,
  Sparkles,
  Lock,
  CreditCard,
  Menu,
  ShieldCheck,
  Ticket,
  CheckCircle2,
  GraduationCap,
} from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import api from '../../lib/api';

import NotificationModal from '../components/NotificationModal';
import FacultySelectionModal from '../components/FacultySelectionModal';

const NAV_ITEMS = [
  { label: 'Overview',       href: '/dashboard',           icon: LayoutDashboard },
  { label: 'Practice Tests', href: '/dashboard/tests',     icon: FileText },
  { label: 'Analytics',      href: '/dashboard/analytics', icon: BarChart3 },
  { label: 'Bookmarks',      href: '/dashboard/bookmarks', icon: Bookmark },
  { label: 'Attempts',       href: '/dashboard/attempts',  icon: History },
  { label: 'Profile',        href: '/dashboard/profile',   icon: User },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const { user, logout, checkAuth } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted,     setMounted]     = useState(false);
  const [scrolled,    setScrolled]    = useState(false);
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [notifyModal, setNotifyModal] = useState<{ open: boolean; title: string; message: string; type?: 'error' | 'info' | 'success' }>({
    open: false, title: '', message: '',
  });

  const isFacultyMissing =
    !!user &&
    (user.role === 'STUDENT' || (user as any).role === undefined) &&
    (!user.faculty || user.faculty.trim() === '' || user.faculty === 'null');

  useEffect(() => {
    setMounted(true);
    checkAuth().then((u) => {
      if (u && (u.role === 'STUDENT' || (u as any).role === undefined) && (!u.faculty || u.faculty.trim() === '' || u.faculty === 'null')) {
        setShowFacultyModal(true);
      }
    });

    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const reference = urlParams.get('reference') || urlParams.get('trxref');
      if (reference) {
        api.post('/payments/verify', { reference })
          .then(async () => {
            await checkAuth();
            setNotifyModal({
              open: true,
              title: '🎉 Payment Verified!',
              message: 'Your ₦1,010 platform access fee has been verified via Paystack! Please select your Faculty below to activate your 30-minute exam bundle.',
              type: 'success',
            });
            setShowFacultyModal(true);
            window.history.replaceState({}, document.title, window.location.pathname);
          })
          .catch((err) => {
            setNotifyModal({
              open: true,
              title: 'Payment Status',
              message: err.response?.data?.message || 'Verification checked.',
              type: 'info',
            });
            window.history.replaceState({}, document.title, window.location.pathname);
          });
      }
    }
  }, []);

  useEffect(() => {
    if (isFacultyMissing) {
      setShowFacultyModal(true);
    } else {
      setShowFacultyModal(false);
    }
  }, [user, isFacultyMissing]);

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
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC', color: '#0F172A' }}>

      {/* ── Backdrop (mobile) ──────────────────────────────── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 39,
            background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
          }}
        />
      )}

      {/* ── Sidebar ────────────────────────────────────────── */}
      <aside className={`dash-sidebar${sidebarOpen ? ' open' : ''}`} style={{
        width: 256, flexShrink: 0,
        background: '#FFFFFF',
        borderRight: '1px solid #E2E8F0',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, bottom: 0, left: 0,
        zIndex: 40, transition: 'transform 0.25s cubic-bezier(0.16,1,0.3,1)',
      }}>
        {/* Brand */}
        <div style={{ padding: '24px 22px 18px', borderBottom: '1px solid #F1F5F9' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: '#0F172A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: 16, color: 'white',
              letterSpacing: '-0.03em',
            }}>G</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#0F172A', letterSpacing: '-0.025em' }}>Grit Academy</div>
              <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>CBT Exam Portal</div>
            </div>
          </Link>
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', borderRadius: 10,
                  fontSize: 13, fontWeight: active ? 700 : 500,
                  color: active ? '#0F172A' : '#64748B',
                  background: active ? '#F1F5F9' : 'transparent',
                  border: `1px solid ${active ? '#E2E8F0' : 'transparent'}`,
                  textDecoration: 'none', transition: 'all 0.15s ease',
                }}
              >
                <Icon style={{ width: 17, height: 17, color: active ? '#0F172A' : '#94A3B8', strokeWidth: active ? 2.2 : 1.8 }} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div style={{ padding: 14, borderTop: '1px solid #F1F5F9' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 12,
            background: '#F8FAFC', border: '1px solid #E2E8F0',
            marginBottom: 8,
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: '#0F172A', color: 'white',
              fontSize: 12, fontWeight: 800, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.firstName} {user?.lastName}
              </div>
              <div style={{ fontSize: 10, color: user?.hasPaidAccessFee ? '#059669' : '#94A3B8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                {user?.hasPaidAccessFee ? <ShieldCheck style={{ width: 11, height: 11 }} /> : <Lock style={{ width: 11, height: 11 }} />}
                {user?.hasPaidAccessFee ? 'Paid Account' : '₦1,010 Unpaid'}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 10, fontSize: 12, fontWeight: 600,
              color: '#64748B', background: 'none', border: 'none',
              cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FEF2F2'; (e.currentTarget as HTMLElement).style.color = '#DC2626'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = '#64748B'; }}
          >
            <LogOut style={{ width: 15, height: 15 }} /> Log out
          </button>
        </div>
      </aside>

      {/* ── Main Canvas ─────────────────────────────────────── */}
      <div className="dash-main" style={{ flex: 1, marginLeft: 256, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Header Bar */}
        <header style={{
          height: 60, position: 'sticky', top: 0, zIndex: 30,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 28px',
          background: scrolled ? 'rgba(255,255,255,0.95)' : '#FFFFFF',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: '1px solid #E2E8F0',
          transition: 'all 0.2s',
        }}>
          {/* Mobile Hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="mobile-menu-btn"
            style={{
              display: 'none', alignItems: 'center', justifyContent: 'center',
              width: 36, height: 36, borderRadius: 8,
              border: '1px solid #E2E8F0', background: 'white',
              cursor: 'pointer', color: '#0F172A', flexShrink: 0,
            }}
          >
            <Menu style={{ width: 18, height: 18 }} />
          </button>

          <div style={{ fontSize: 15, fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em' }}>
            {currentPage}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {user?.role === 'STUDENT' && (
              <button
                onClick={() => setShowFacultyModal(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '5px 12px', borderRadius: 20,
                  background: '#0F172A', color: 'white',
                  fontSize: 11, fontWeight: 800, border: 'none',
                  cursor: 'pointer', transition: 'all 0.15s',
                  boxShadow: '0 2px 8px rgba(15,23,42,0.15)',
                }}
              >
                <GraduationCap style={{ width: 13, height: 13, color: '#10B981' }} />
                <span>{user?.faculty ? user.faculty : 'Select Faculty'}</span>
              </button>
            )}

            <div className="ai-badge" style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '4px 10px', borderRadius: 20,
              background: '#F1F5F9', border: '1px solid #E2E8F0',
              fontSize: 11, fontWeight: 700, color: '#0F172A',
            }}>
              <Sparkles style={{ width: 12, height: 12, color: '#4F46E5' }} />
              AI CBT Engine
            </div>

            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: '#0F172A', color: 'white',
              fontSize: 12, fontWeight: 800, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{initials}</div>
          </div>
        </header>

        {/* Content Container */}
        <main style={{ flex: 1, padding: '28px 24px', overflowY: 'auto', position: 'relative' }} className="dash-content">
          {mounted ? (
            <>
              {/* Sleek Minimalist Paywall Card */}
              {user?.role === 'STUDENT' && user?.hasPaidAccessFee === false && pathname !== '/dashboard/profile' ? (
                <div style={{
                  background: '#FFFFFF',
                  borderRadius: 18, padding: '24px 28px', color: '#0F172A',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                  marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: 20, flexWrap: 'wrap',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, maxWidth: 650 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, background: '#FEF2F2',
                      border: '1px solid rgba(220,38,38,0.15)', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Lock style={{ width: 20, height: 20, color: '#DC2626' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em' }}>
                        Platform Access Locked — ₦1,010 One-Time Fee Required
                      </div>
                      <p style={{ fontSize: 12, color: '#64748B', margin: '3px 0 0', fontWeight: 500, lineHeight: 1.5 }}>
                        Pay a one-time ₦1,010 fee via Paystack to unlock all 11 subject CBT practice tests, standard JAMB/WAEC packages, and AI explanation features.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <button
                      onClick={async () => {
                        try {
                          const testsRes = await api.get('/tests');
                          const tests = testsRes.data?.data?.tests || [];
                          const targetTestId = tests[0]?.id || 'cmrus90cf004nc1h0ezrn027p';

                          const payRes = await api.post('/payments/initialize', { testId: targetTestId });
                          const authUrl = payRes.data?.data?.authorization_url;
                          if (authUrl) {
                            window.location.href = authUrl;
                          }
                        } catch (err: any) {
                          setNotifyModal({
                            open: true,
                            title: 'Payment Error',
                            message: err.response?.data?.message || 'Payment initialization failed. Please try again.',
                            type: 'error',
                          });
                        }
                      }}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        height: 42, padding: '0 20px', borderRadius: 10, border: 'none',
                        background: '#0F172A', color: 'white', fontSize: 13, fontWeight: 800,
                        cursor: 'pointer', boxShadow: '0 4px 12px rgba(15,23,42,0.15)',
                        transition: 'all 0.15s', whiteSpace: 'nowrap',
                      }}
                    >
                      <CreditCard style={{ width: 15, height: 15 }} />
                      Pay ₦1,010 via Paystack
                    </button>

                    <button
                      onClick={async () => {
                        try {
                          await api.post('/payments/sync-pending');
                          await checkAuth();
                          setNotifyModal({
                            open: true,
                            title: 'Checking Payment',
                            message: 'Payment verification complete. If your payment was successful, your account access is now unlocked!',
                            type: 'success',
                          });
                        } catch (err: any) {
                          setNotifyModal({
                            open: true,
                            title: 'Verification Error',
                            message: err.response?.data?.message || 'Verification failed. Please try again.',
                            type: 'error',
                          });
                        }
                      }}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        height: 42, padding: '0 16px', borderRadius: 10,
                        border: '1.5px solid #CBD5E1', background: '#FFFFFF', color: '#334155',
                        fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        transition: 'all 0.15s', whiteSpace: 'nowrap',
                      }}
                    >
                      <CheckCircle2 style={{ width: 14, height: 14, color: '#16A34A' }} />
                      Already Paid? Verify Access
                    </button>
                  </div>
                </div>
              ) : null}

              {children}

              <FacultySelectionModal
                isOpen={showFacultyModal || isFacultyMissing}
                onClose={() => {
                  if (!isFacultyMissing) setShowFacultyModal(false);
                }}
                onFacultySaved={async () => {
                  await checkAuth();
                  setShowFacultyModal(false);
                }}
              />

              <NotificationModal
                isOpen={notifyModal.open}
                type={notifyModal.type || 'error'}
                title={notifyModal.title}
                message={notifyModal.message}
                onClose={() => setNotifyModal({ ...notifyModal, open: false })}
              />
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
              <div style={{ width: 28, height: 28, border: '2.5px solid #E2E8F0', borderTopColor: '#0F172A', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            </div>
          )}
        </main>
      </div>

      {/* ── Mobile Layout Responsive Styles ───────────────── */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .dash-sidebar { transform: translateX(-100%); }
          .dash-sidebar.open { transform: translateX(0); }
          .dash-main { margin-left: 0 !important; }
          .mobile-menu-btn { display: flex !important; }
        }
        @media (max-width: 480px) {
          .ai-badge { display: none !important; }
        }
      `}</style>
    </div>
  );
}
