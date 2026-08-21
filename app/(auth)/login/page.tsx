'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Zap, BookOpen, BarChart3 } from 'lucide-react';
import { useAuthStore } from '../../../stores/auth.store';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(form);
      const targetPath = (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') ? '/admin' : '/dashboard';
      if (typeof window !== 'undefined') {
        window.location.href = targetPath;
      } else {
        router.push(targetPath);
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'var(--font)' }}>
      {/* Left Panel — Branding */}
      <div style={{
        display: 'none',
        width: '50%',
        position: 'relative',
        overflow: 'hidden',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px 48px',
        background: 'linear-gradient(160deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }} className="login-left-panel">
        {/* Glow decorations */}
        <div style={{ position: 'absolute', top: -100, left: -100, width: 400, height: 400, background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, right: -80, width: 350, height: 350, background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: 'var(--blue-600)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 18, color: 'white',
              boxShadow: '0 4px 16px rgba(37,99,235,0.3)',
            }}>G</div>
            <span style={{ fontSize: 20, fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>Grit Academy</span>
          </Link>
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 460 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 100,
            background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.2)',
            fontSize: 11, fontWeight: 700, color: 'rgba(147,197,253,1)',
            textTransform: 'uppercase', letterSpacing: '0.08em',
            marginBottom: 28,
          }}>AI CBT Examination Engine</div>

          <h1 style={{ fontSize: 40, fontWeight: 900, color: 'white', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 18 }}>
            Master your exams with{' '}
            <span style={{ background: 'linear-gradient(135deg, #60A5FA 0%, #A78BFA 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              AI Intelligence
            </span>
          </h1>

          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, fontWeight: 400 }}>
            Extract questions from PDF study sets, take dynamic multi-subject CBT tests, and unlock step-by-step corrections powered by artificial intelligence.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 36, paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            {[
              { value: '50K+', label: 'Students', icon: <BookOpen style={{ width: 16, height: 16 }} /> },
              { value: '4.9 ★', label: 'Rating', icon: <BarChart3 style={{ width: 16, height: 16 }} /> },
              { value: '94%', label: 'Pass Rate', icon: <Zap style={{ width: 16, height: 16 }} /> },
            ].map((s) => (
              <div key={s.label} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 14, padding: '16px 14px',
              }}>
                <div style={{ color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>{s.value}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1, fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>
          © 2026 Grit Academy Inc. All rights reserved.
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        background: 'var(--slate-50)',
        position: 'relative',
      }}>
        {/* Subtle background glow */}
        <div style={{ position: 'absolute', top: -200, right: -200, width: 500, height: 500, background: 'radial-gradient(circle, rgba(37,99,235,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
          {/* Mobile Logo */}
          <div style={{ marginBottom: 32 }} className="login-mobile-logo">
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: 'var(--blue-600)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 16, color: 'white',
                boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
              }}>G</div>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--slate-900)', letterSpacing: '-0.02em' }}>Grit Academy</span>
            </Link>
          </div>

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: 'var(--slate-900)', letterSpacing: '-0.02em', margin: 0 }}>
              Welcome back
            </h2>
            <p style={{ fontSize: 14, color: 'var(--slate-500)', marginTop: 8, fontWeight: 400 }}>
              Don&apos;t have an account?{' '}
              <Link href="/register" style={{ color: 'var(--blue-600)', fontWeight: 700, textDecoration: 'none' }}>
                Sign up free
              </Link>
            </p>
          </div>

          {/* Form Card */}
          <div style={{
            background: 'white',
            border: '1.5px solid var(--slate-200)',
            borderRadius: 20,
            padding: '32px 28px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {error && (
                <div style={{
                  padding: '12px 16px', borderRadius: 12,
                  background: '#FEF2F2', border: '1px solid rgba(220,38,38,0.12)',
                  fontSize: 13, fontWeight: 600, color: '#DC2626',
                }}>
                  {error}
                </div>
              )}

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 17, height: 17, color: 'var(--slate-400)', pointerEvents: 'none' }} />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="admin@gritacademy.com"
                    style={{
                      width: '100%', height: 48, paddingLeft: 44, paddingRight: 16,
                      borderRadius: 12,
                      border: '1.5px solid var(--slate-200)',
                      background: 'var(--slate-50)',
                      fontSize: 14, fontWeight: 500, color: 'var(--slate-900)',
                      outline: 'none',
                      transition: 'all 0.15s',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--blue-600)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.08)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--slate-200)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Password
                  </label>
                  <Link href="/forgot-password" style={{ fontSize: 12, fontWeight: 600, color: 'var(--blue-600)', textDecoration: 'none' }}>
                    Forgot password?
                  </Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 17, height: 17, color: 'var(--slate-400)', pointerEvents: 'none' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Enter your password"
                    style={{
                      width: '100%', height: 48, paddingLeft: 44, paddingRight: 44,
                      borderRadius: 12,
                      border: '1.5px solid var(--slate-200)',
                      background: 'var(--slate-50)',
                      fontSize: 14, fontWeight: 500, color: 'var(--slate-900)',
                      outline: 'none',
                      transition: 'all 0.15s',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--blue-600)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.08)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--slate-200)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--slate-400)', padding: 4,
                    }}
                  >
                    {showPassword ? <EyeOff style={{ width: 17, height: 17 }} /> : <Eye style={{ width: 17, height: 17 }} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', height: 48,
                  background: 'var(--blue-600)',
                  color: 'white',
                  fontSize: 14, fontWeight: 700,
                  borderRadius: 12,
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 4px 14px rgba(37,99,235,0.25)',
                  transition: 'all 0.15s',
                }}
              >
                {loading ? (
                  <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                ) : (
                  <>Log In <ArrowRight style={{ width: 16, height: 16 }} /></>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div style={{
            marginTop: 24,
            padding: '14px 0',
            textAlign: 'center',
            fontSize: 12,
            color: 'var(--slate-400)',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}>
            <ShieldCheck style={{ width: 14, height: 14, color: 'var(--emerald-600)' }} />
            Protected by Grit Academy AI Security
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (min-width: 1024px) {
          .login-left-panel { display: flex !important; }
          .login-mobile-logo { display: none !important; }
        }
      `}</style>
    </div>
  );
}
