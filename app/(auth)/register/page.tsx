'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle2, Tag } from 'lucide-react';
import { useAuthStore } from '../../../stores/auth.store';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuthStore();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', referralCode: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.referralCode.trim() !== '' && form.referralCode.trim().toLowerCase() !== 'hydrogen') {
      setError('Invalid referral code. Only "hydrogen" is accepted.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { confirmPassword, ...data } = form;
      const user = await register(data);
      router.push(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? '/admin' : '/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
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
      }} className="register-left-panel">
        <div style={{ position: 'absolute', top: -100, left: -100, width: 400, height: 400, background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, right: -80, width: 350, height: 350, background: 'radial-gradient(circle, rgba(5,150,105,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

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
            background: 'rgba(5,150,105,0.12)', border: '1px solid rgba(5,150,105,0.2)',
            fontSize: 11, fontWeight: 700, color: 'rgba(110,231,183,1)',
            textTransform: 'uppercase', letterSpacing: '0.08em',
            marginBottom: 28,
          }}>Start Learning Today</div>

          <h1 style={{ fontSize: 40, fontWeight: 900, color: 'white', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 18 }}>
            Start your journey to{' '}
            <span style={{ background: 'linear-gradient(135deg, #34D399 0%, #60A5FA 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              exam excellence
            </span>
          </h1>

          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, fontWeight: 400, marginBottom: 32 }}>
            Join thousands of students preparing for JAMB, WAEC, and NECO with AI-extracted practice tests and instant step-by-step corrections.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            {[
              'Upload PDF past question study materials',
              'Custom CBT exams with up to 5 subjects per test',
              'Instant AI step-by-step corrections & score analytics',
            ].map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <CheckCircle2 style={{ width: 18, height: 18, color: '#34D399', flexShrink: 0 }} />
                <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.65)' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1, fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>
          © 2026 Grit Academy Inc. All rights reserved.
        </div>
      </div>

      {/* Right Panel — Register Form */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        background: 'var(--slate-50)',
        position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: -200, right: -200, width: 500, height: 500, background: 'radial-gradient(circle, rgba(5,150,105,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
          {/* Mobile Logo */}
          <div style={{ marginBottom: 28 }} className="register-mobile-logo">
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
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: 'var(--slate-900)', letterSpacing: '-0.02em', margin: 0 }}>
              Create Account
            </h2>
            <p style={{ fontSize: 14, color: 'var(--slate-500)', marginTop: 8, fontWeight: 400 }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: 'var(--blue-600)', fontWeight: 700, textDecoration: 'none' }}>
                Log in
              </Link>
            </p>
          </div>

          {/* Form Card */}
          <div style={{
            background: 'white',
            border: '1.5px solid var(--slate-200)',
            borderRadius: 20,
            padding: '28px 26px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {error && (
                <div style={{
                  padding: '12px 16px', borderRadius: 12,
                  background: '#FEF2F2', border: '1px solid rgba(220,38,38,0.12)',
                  fontSize: 13, fontWeight: 600, color: '#DC2626',
                }}>
                  {error}
                </div>
              )}

              {/* Name Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>First Name</label>
                  <div style={{ position: 'relative' }}>
                    <User style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--slate-400)', pointerEvents: 'none' }} />
                    <input
                      type="text" required value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      placeholder="Adaeze"
                      style={{
                        width: '100%', height: 44, paddingLeft: 38, paddingRight: 12,
                        borderRadius: 10, border: '1.5px solid var(--slate-200)',
                        background: 'var(--slate-50)', fontSize: 13, fontWeight: 500,
                        color: 'var(--slate-900)', outline: 'none', transition: 'all 0.15s',
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--blue-600)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.08)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--slate-200)'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Last Name</label>
                  <input
                    type="text" required value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    placeholder="Obi"
                    style={{
                      width: '100%', height: 44, paddingLeft: 14, paddingRight: 12,
                      borderRadius: 10, border: '1.5px solid var(--slate-200)',
                      background: 'var(--slate-50)', fontSize: 13, fontWeight: 500,
                      color: 'var(--slate-900)', outline: 'none', transition: 'all 0.15s',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--blue-600)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.08)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--slate-200)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--slate-400)', pointerEvents: 'none' }} />
                  <input
                    type="email" required value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    style={{
                      width: '100%', height: 44, paddingLeft: 38, paddingRight: 12,
                      borderRadius: 10, border: '1.5px solid var(--slate-200)',
                      background: 'var(--slate-50)', fontSize: 13, fontWeight: 500,
                      color: 'var(--slate-900)', outline: 'none', transition: 'all 0.15s',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--blue-600)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.08)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--slate-200)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--slate-400)', pointerEvents: 'none' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="At least 6 characters"
                    style={{
                      width: '100%', height: 44, paddingLeft: 38, paddingRight: 40,
                      borderRadius: 10, border: '1.5px solid var(--slate-200)',
                      background: 'var(--slate-50)', fontSize: 13, fontWeight: 500,
                      color: 'var(--slate-900)', outline: 'none', transition: 'all 0.15s',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--blue-600)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.08)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--slate-200)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)', padding: 4 }}>
                    {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--slate-400)', pointerEvents: 'none' }} />
                  <input
                    type="password" required value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    placeholder="Confirm your password"
                    style={{
                      width: '100%', height: 44, paddingLeft: 38, paddingRight: 12,
                      borderRadius: 10, border: '1.5px solid var(--slate-200)',
                      background: 'var(--slate-50)', fontSize: 13, fontWeight: 500,
                      color: 'var(--slate-900)', outline: 'none', transition: 'all 0.15s',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--blue-600)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.08)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--slate-200)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              {/* Referral Code (Optional) */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Referral Code (Optional)</label>
                <div style={{ position: 'relative' }}>
                  <Tag style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--slate-400)', pointerEvents: 'none' }} />
                  <input
                    type="text" value={form.referralCode}
                    onChange={(e) => setForm({ ...form, referralCode: e.target.value })}
                    placeholder="e.g. hydrogen"
                    style={{
                      width: '100%', height: 44, paddingLeft: 38, paddingRight: 12,
                      borderRadius: 10, border: '1.5px solid var(--slate-200)',
                      background: 'var(--slate-50)', fontSize: 13, fontWeight: 500,
                      color: 'var(--slate-900)', outline: 'none', transition: 'all 0.15s',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--blue-600)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.08)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--slate-200)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit" disabled={loading}
                style={{
                  width: '100%', height: 46,
                  background: 'var(--blue-600)', color: 'white',
                  fontSize: 14, fontWeight: 700, borderRadius: 12,
                  border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 4px 14px rgba(37,99,235,0.25)',
                  transition: 'all 0.15s', marginTop: 4,
                }}
              >
                {loading ? (
                  <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                ) : (
                  <>Create Account <ArrowRight style={{ width: 16, height: 16 }} /></>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div style={{
            marginTop: 20, padding: '12px 0', textAlign: 'center',
            fontSize: 11, color: 'var(--slate-400)', fontWeight: 500, lineHeight: 1.6,
          }}>
            By creating an account, you agree to Grit Academy Terms & Privacy Policy
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (min-width: 1024px) {
          .register-left-panel { display: flex !important; }
          .register-mobile-logo { display: none !important; }
        }
      `}</style>
    </div>
  );
}
