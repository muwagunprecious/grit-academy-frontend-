'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '../../lib/api';
import { useAuthStore } from '../../stores/auth.store';

interface Stats { attemptsCount: number; averageScore: number; highestScore: number; totalTimeSpent: number; completionRate: number; }
interface AnalyticsData {
  stats: Stats;
  weakTopics: string[];
  strongTopics: string[];
  subjectBreakdown: Array<{ subjectId: string; subjectName: string; percentage: number }>;
  progress: Array<{ attemptId: string; score: number; date: string }>;
}

const MOCK: AnalyticsData = {
  stats: { attemptsCount: 8, averageScore: 68.5, highestScore: 84, totalTimeSpent: 18400, completionRate: 100 },
  weakTopics: ['Equations of Motion', 'Gravitational Potentials', 'Organic Nomenclature'],
  strongTopics: ['Electric Fields', 'Current Electricity', 'Verbal Aptitude'],
  subjectBreakdown: [
    { subjectId: '1', subjectName: 'Physics', percentage: 76 },
    { subjectId: '2', subjectName: 'Chemistry', percentage: 58 },
    { subjectId: '3', subjectName: 'Mathematics', percentage: 72 },
    { subjectId: '4', subjectName: 'English', percentage: 84 },
  ],
  progress: [],
};

const SUBJECT_COLORS: Record<string, string> = {
  Physics: '#2563EB', Chemistry: '#7C3AED', Mathematics: '#059669', English: '#D97706',
};

const QUICK_ACTIONS = [
  { title: 'Take a Practice Test', desc: 'Browse available standard exams and mock tests', href: '/dashboard/tests', icon: '📄', accent: '#2563EB' },
  { title: 'View Analytics', desc: 'Detailed performance summaries and score trends', href: '/dashboard/analytics', icon: '📊', accent: '#059669' },
  { title: 'Saved Bookmarks', desc: 'Review your saved questions and revision sets', href: '/dashboard/bookmarks', icon: '🔖', accent: '#7C3AED' },
];

function formatTime(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function StatCard({ icon, label, value, sub, accent }: { icon: string; label: string; value: string; sub?: string; accent: string }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'white',
        borderRadius: 18,
        border: `1.5px solid ${hov ? accent + '30' : 'var(--slate-200)'}`,
        padding: '22px 20px', display: 'flex', flexDirection: 'column', gap: 14,
        transition: 'all 0.18s',
        transform: hov ? 'translateY(-2px)' : 'none',
        boxShadow: hov ? `0 8px 24px ${accent}14` : '0 1px 3px rgba(0,0,0,0.04)',
        cursor: 'default',
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 11, flexShrink: 0,
        background: accent + '12', border: `1.5px solid ${accent}20`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--slate-900)', letterSpacing: '-0.025em', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 11, color: 'var(--slate-500)', marginTop: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
        {sub && <div style={{ fontSize: 10, color: accent, marginTop: 4, fontWeight: 700 }}>{sub}</div>}
      </div>
    </div>
  );
}

function ProgressBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  const [width, setWidth] = useState(0);
  useEffect(() => { const t = setTimeout(() => setWidth(pct), 100); return () => clearTimeout(t); }, [pct]);
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--slate-700)' }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--slate-900)' }}>{pct}%</span>
      </div>
      <div style={{ height: 7, background: 'var(--slate-100)', borderRadius: 100, overflow: 'hidden' }}>
        <div style={{
          height: '100%', background: color, borderRadius: 100,
          width: `${width}%`, transition: 'width 0.8s cubic-bezier(0.16,1,0.3,1)',
        }} />
      </div>
    </div>
  );
}

function QuickActionCard({ item }: { item: { title: string; desc: string; href: string; icon: string; accent: string } }) {
  const [hov, setHov] = useState(false);
  return (
    <Link
      href={item.href}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', flexDirection: 'column', gap: 14,
        padding: '22px', borderRadius: 18,
        border: `1.5px solid ${hov ? item.accent + '35' : 'var(--slate-200)'}`,
        background: 'white', textDecoration: 'none',
        transition: 'all 0.18s',
        transform: hov ? 'translateY(-2px)' : 'none',
        boxShadow: hov ? `0 8px 24px ${item.accent}12` : 'none',
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 11,
        background: item.accent + '12', border: `1.5px solid ${item.accent}20`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
      }}>{item.icon}</div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--slate-900)', marginBottom: 5 }}>{item.title}</div>
        <div style={{ fontSize: 11, color: 'var(--slate-400)', lineHeight: 1.6, fontWeight: 400 }}>{item.desc}</div>
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: item.accent }}>Open →</div>
    </Link>
  );
}

export default function DashboardOverview() {
  const { user } = useAuthStore();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/student')
      .then(r => setData(r.data.data))
      .catch(() => setData(MOCK))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--slate-200)', borderTopColor: 'var(--blue-600)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  );

  const firstName = user?.firstName || 'Student';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Welcome Banner ────────────────────────────────── */}
      <div style={{
        borderRadius: 22,
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        padding: '36px 40px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 32px rgba(0,0,0,0.12)',
      }}>
        <div style={{ position: 'absolute', right: -100, top: -100, width: 400, height: 400, background: 'radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: '55%', bottom: -60, width: 300, height: 300, background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 500 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '5px 14px', borderRadius: 100,
            background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.25)',
            fontSize: 11, fontWeight: 700, color: 'rgba(147,197,253,1)',
            textTransform: 'uppercase', letterSpacing: '0.07em',
            marginBottom: 16,
          }}>✦ Personalized Dashboard</div>

          <h1 style={{ fontSize: 30, fontWeight: 900, color: 'white', letterSpacing: '-0.025em', lineHeight: 1.1, margin: '0 0 10px' }}>
            {greeting}, {firstName} 👋
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, fontWeight: 400, margin: '0 0 24px' }}>
            You&apos;re making great progress. Keep it up — your next exam preparation is within reach.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link href="/dashboard/tests" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              height: 44, padding: '0 22px',
              background: 'var(--blue-600)', color: 'white',
              fontSize: 13, fontWeight: 700, borderRadius: 12,
              textDecoration: 'none', boxShadow: '0 4px 16px rgba(37,99,235,0.35)',
              transition: 'all 0.15s',
            }}>Practice CBT Mock →</Link>
            <Link href="/dashboard/analytics" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              height: 44, padding: '0 20px',
              background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)',
              border: '1px solid rgba(255,255,255,0.12)',
              fontSize: 13, fontWeight: 600, borderRadius: 12,
              textDecoration: 'none', transition: 'all 0.15s',
            }}>View Analytics</Link>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ────────────────────────────────────── */}
      <div className="dash-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        <StatCard icon="📄" label="Tests Taken" value={String(data?.stats.attemptsCount || 0)} accent="#2563EB" />
        <StatCard icon="📈" label="Avg. Score" value={`${data?.stats.averageScore?.toFixed(0) || 0}%`} sub="vs 65% last month ↑" accent="#059669" />
        <StatCard icon="🏆" label="Best Score" value={`${data?.stats.highestScore || 0}%`} accent="#7C3AED" />
        <StatCard icon="⏱" label="Study Time" value={formatTime(data?.stats.totalTimeSpent || 0)} accent="#D97706" />
      </div>

      {/* ── Analysis Row ──────────────────────────────────── */}
      <div className="dash-analysis" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>

        {/* Subject Performance */}
        <div style={{ background: 'white', border: '1.5px solid var(--slate-200)', borderRadius: 20, padding: '26px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--slate-900)' }}>Subject Performance</div>
            <Link href="/dashboard/analytics" style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue-600)', textDecoration: 'none' }}>View Analytics →</Link>
          </div>
          {data?.subjectBreakdown.map(s => (
            <ProgressBar key={s.subjectId} label={s.subjectName} pct={s.percentage} color={SUBJECT_COLORS[s.subjectName] || '#2563EB'} />
          ))}
        </div>

        {/* AI Insights */}
        <div style={{ background: 'white', border: '1.5px solid var(--slate-200)', borderRadius: 20, padding: '26px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15 }}>✦</span>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--slate-900)' }}>AI Insights</div>
          </div>

          <div>
            <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--emerald-600)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Strong Topics</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {data?.strongTopics.map(t => (
                <span key={t} style={{
                  padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                  background: 'var(--emerald-50)', color: 'var(--emerald-600)',
                  border: '1px solid rgba(5,150,105,0.12)',
                }}>{t}</span>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 9, fontWeight: 800, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Needs Focus</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {data?.weakTopics.map(t => (
                <span key={t} style={{
                  padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                  background: '#FEF2F2', color: '#DC2626',
                  border: '1px solid rgba(220,38,38,0.1)',
                }}>{t}</span>
              ))}
            </div>
          </div>

          <Link href="/dashboard/tests" style={{
            display: 'block', padding: '11px', borderRadius: 12,
            background: 'var(--blue-600)', color: 'white',
            fontSize: 12, fontWeight: 700, textAlign: 'center',
            textDecoration: 'none', marginTop: 'auto',
            boxShadow: '0 4px 12px rgba(37,99,235,0.2)',
          }}>Study Weak Topics →</Link>
        </div>
      </div>

      {/* ── Quick Action Cards ────────────────────────────── */}
      <div className="dash-actions" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {QUICK_ACTIONS.map((item) => (
          <QuickActionCard key={item.title} item={item} />
        ))}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .dash-stats   { grid-template-columns: repeat(2, 1fr) !important; }
          .dash-analysis{ grid-template-columns: 1fr !important; }
          .dash-actions { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 520px) {
          .dash-stats   { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
          .dash-actions { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
