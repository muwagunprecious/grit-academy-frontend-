'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3, Clock, Target, TrendingUp, Zap, Brain,
  Trophy, BookOpen, Loader2, AlertCircle, RefreshCw,
  CheckCircle2, XCircle, ArrowRight, Sparkles, Activity,
} from 'lucide-react';
import api from '../../../lib/api';

/* ─── Types matching backend response ─── */
interface Stats {
  attemptsCount: number;
  averageScore: number;
  highestScore: number;
  totalTimeSpent: number;
  completionRate: number;
}

interface SubjectScore {
  subjectId: string;
  subjectName: string;
  percentage: number;
}

interface ProgressPoint {
  attemptId: string;
  score: number;
  date: string;
}

interface AnalyticsData {
  stats: Stats;
  weakTopics: string[];
  strongTopics: string[];
  subjectBreakdown: SubjectScore[];
  progress: ProgressPoint[];
}

/* ─── Helpers ─── */
function formatTime(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${secs}s`;
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

const SUBJECT_COLORS: Record<string, string> = {
  Mathematics:  '#2563EB',
  Physics:      '#7C3AED',
  Chemistry:    '#059669',
  Biology:      '#D97706',
  English:      '#DC2626',
  Economics:    '#0891B2',
  Government:   '#BE185D',
  Commerce:     '#065F46',
  Literature:   '#92400E',
  Geography:    '#1D4ED8',
};
function subjectColor(name: string) { return SUBJECT_COLORS[name] || '#2563EB'; }

/* ─── Mini sparkline bar chart ─── */
function ScoreSparkline({ points }: { points: ProgressPoint[] }) {
  if (!points.length) return (
    <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--slate-300)', fontSize: 12 }}>
      No history yet
    </div>
  );
  const max = Math.max(...points.map(p => p.score), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80, padding: '0 4px' }}>
      {points.map((p, i) => {
        const pct  = (p.score / max) * 100;
        const color = p.score >= 70 ? '#059669' : p.score >= 50 ? '#2563EB' : '#DC2626';
        return (
          <div key={p.attemptId} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ fontSize: 9, color: 'var(--slate-400)', fontWeight: 700 }}>{Math.round(p.score)}%</div>
            <div
              title={`${Math.round(p.score)}% — ${formatDate(p.date)}`}
              style={{
                width: '100%', borderRadius: '4px 4px 0 0',
                height: `${Math.max(pct, 6)}%`,
                background: color,
                opacity: i === points.length - 1 ? 1 : 0.65,
                transition: 'height 0.6s ease',
                cursor: 'default',
              }}
            />
            <div style={{ fontSize: 9, color: 'var(--slate-400)', fontWeight: 600, whiteSpace: 'nowrap' }}>
              {formatDate(p.date)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Animated progress bar ─── */
function AnimBar({ pct, color }: { pct: number; color: string }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), 120); return () => clearTimeout(t); }, [pct]);
  return (
    <div style={{ height: 7, background: 'var(--slate-100)', borderRadius: 100, overflow: 'hidden' }}>
      <div style={{ height: '100%', borderRadius: 100, background: color, width: `${w}%`, transition: 'width 0.9s cubic-bezier(0.16,1,0.3,1)' }} />
    </div>
  );
}

/* ─── Stat card ─── */
function StatCard({ icon, label, value, sub, accent }: { icon: string; label: string; value: string; sub?: string; accent: string }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'white', borderRadius: 18, padding: '20px',
        border: `1.5px solid ${hov ? accent + '30' : 'var(--slate-200)'}`,
        display: 'flex', flexDirection: 'column', gap: 12,
        transition: 'all 0.18s', cursor: 'default',
        transform: hov ? 'translateY(-2px)' : 'none',
        boxShadow: hov ? `0 8px 24px ${accent}14` : '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ width: 40, height: 40, borderRadius: 11, background: accent + '12', border: `1.5px solid ${accent}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--slate-900)', letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 11, color: 'var(--slate-500)', marginTop: 5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
        {sub && <div style={{ fontSize: 10, color: accent, marginTop: 3, fontWeight: 700 }}>{sub}</div>}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════ */
export default function AnalyticsPage() {
  const router  = useRouter();
  const [data,    setData]    = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    api.get('/analytics/student')
      .then(r => setData(r.data.data))
      .catch(() => setError('Failed to load analytics. Please try again.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  /* ── Loading ── */
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
      <Loader2 style={{ width: 28, height: 28, color: 'var(--blue-600)', animation: 'spin 0.7s linear infinite' }} />
      <div style={{ fontSize: 13, color: 'var(--slate-400)', fontWeight: 600 }}>Loading your analytics…</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  /* ── Error ── */
  if (error) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 16, padding: 24 }}>
      <div style={{ width: 52, height: 52, borderRadius: 16, background: '#FEF2F2', border: '1px solid rgba(220,38,38,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AlertCircle style={{ width: 24, height: 24, color: '#DC2626' }} />
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--slate-700)' }}>{error}</div>
      <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', borderRadius: 11, background: 'var(--blue-600)', color: 'white', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
        <RefreshCw style={{ width: 13, height: 13 }} /> Retry
      </button>
    </div>
  );

  /* ── Empty state ── */
  if (!data || data.stats.attemptsCount === 0) return (
    <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--slate-900)', letterSpacing: '-0.02em', margin: '0 0 4px' }}>Analytics</h1>
        <p style={{ fontSize: 13, color: 'var(--slate-400)', margin: 0 }}>Track your performance across all practice exams</p>
      </div>
      <div style={{
        borderRadius: 22, padding: '60px 32px', textAlign: 'center',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
        <div style={{ fontSize: 18, fontWeight: 900, color: 'white', marginBottom: 8 }}>No data yet</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 24, lineHeight: 1.7 }}>
          Complete your first practice exam to start seeing<br />your performance analytics here.
        </div>
        <button
          onClick={() => router.push('/dashboard/tests')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 12, border: 'none', background: '#2563EB', color: 'white', fontSize: 13, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 16px rgba(37,99,235,0.4)' }}
        >
          Take Your First Practice Test <ArrowRight style={{ width: 15, height: 15 }} />
        </button>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const { stats, subjectBreakdown, strongTopics, weakTopics, progress } = data;
  const avgPct   = stats.averageScore;
  const grade    = avgPct >= 70 ? { label: 'High Performer 🏆', color: '#059669' }
                 : avgPct >= 50 ? { label: 'Progressing 📈',   color: '#2563EB' }
                 : { label: 'Keep Practicing 💪', color: '#D97706' };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Page Header ──────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--slate-900)', letterSpacing: '-0.02em', margin: '0 0 4px' }}>Analytics</h1>
          <p style={{ fontSize: 13, color: 'var(--slate-400)', margin: 0 }}>
            Based on <strong style={{ color: 'var(--slate-700)' }}>{stats.attemptsCount}</strong> completed exam{stats.attemptsCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 14px', borderRadius: 100, background: grade.color + '12', border: `1px solid ${grade.color}25`, fontSize: 12, fontWeight: 700, color: grade.color }}>
            {grade.label}
          </div>
          <button onClick={load} style={{ width: 36, height: 36, borderRadius: 10, border: '1.5px solid var(--slate-200)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--slate-500)' }}>
            <RefreshCw style={{ width: 14, height: 14 }} />
          </button>
        </div>
      </div>

      {/* ── Stat Cards ────────────────────────────────────── */}
      <div className="analytics-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
        <StatCard icon="📄" label="Tests Taken"   value={String(stats.attemptsCount)}                     accent="#2563EB" />
        <StatCard icon="📈" label="Avg Score"      value={`${stats.averageScore.toFixed(1)}%`}            accent="#059669"
          sub={avgPct >= 50 ? 'Above 50% threshold' : 'Below pass mark'} />
        <StatCard icon="🏆" label="Best Score"     value={`${stats.highestScore.toFixed(0)}%`}            accent="#7C3AED" />
        <StatCard icon="⏱"  label="Study Time"     value={formatTime(stats.totalTimeSpent)}               accent="#D97706" />
        <StatCard icon="✅" label="Completion Rate" value={`${stats.completionRate.toFixed(0)}%`}          accent="#0891B2" />
      </div>

      {/* ── Score History + Subject Breakdown ─────────────── */}
      <div className="analytics-mid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Score History Chart */}
        <div style={{ background: 'white', borderRadius: 20, border: '1.5px solid var(--slate-200)', padding: '22px 22px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--slate-900)' }}>Score History</div>
              <div style={{ fontSize: 11, color: 'var(--slate-400)', marginTop: 2 }}>Last {progress.length} attempt{progress.length !== 1 ? 's' : ''}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {[{ color: '#059669', label: '≥70%' }, { color: '#2563EB', label: '50–69%' }, { color: '#DC2626', label: '<50%' }].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: l.color }} />
                  <span style={{ fontSize: 9, color: 'var(--slate-400)', fontWeight: 600 }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          <ScoreSparkline points={progress} />
          {progress.length > 0 && (
            <div style={{ display: 'flex', gap: 20, paddingTop: 12, borderTop: '1px solid var(--slate-100)' }}>
              <div style={{ fontSize: 11, color: 'var(--slate-500)' }}>
                Latest: <strong style={{ color: 'var(--slate-900)' }}>{Math.round(progress[progress.length - 1]?.score || 0)}%</strong>
              </div>
              <div style={{ fontSize: 11, color: 'var(--slate-500)' }}>
                Average: <strong style={{ color: 'var(--slate-900)' }}>{stats.averageScore.toFixed(1)}%</strong>
              </div>
            </div>
          )}
        </div>

        {/* Subject Performance */}
        <div style={{ background: 'white', borderRadius: 20, border: '1.5px solid var(--slate-200)', padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--slate-900)' }}>Subject Performance</div>
            <div style={{ fontSize: 11, color: 'var(--slate-400)' }}>{subjectBreakdown.length} subject{subjectBreakdown.length !== 1 ? 's' : ''}</div>
          </div>

          {subjectBreakdown.length === 0 ? (
            <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--slate-400)', fontSize: 12 }}>
              Complete exams with subject questions to see breakdown
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {subjectBreakdown
                .sort((a, b) => b.percentage - a.percentage)
                .map((sub) => {
                  const color = subjectColor(sub.subjectName);
                  const pct   = Math.min(100, sub.percentage);
                  return (
                    <div key={sub.subjectId}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--slate-700)' }}>{sub.subjectName}</span>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 900, color: pct >= 70 ? '#059669' : pct >= 50 ? '#2563EB' : '#DC2626' }}>
                          {pct.toFixed(0)}%
                        </span>
                      </div>
                      <AnimBar pct={pct} color={color} />
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* ── Performance Summary Banner ─────────────────────── */}
      <div style={{
        borderRadius: 20, overflow: 'hidden', position: 'relative',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        padding: '28px 32px',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Performance Summary</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: 'white', letterSpacing: '-0.025em', marginBottom: 6 }}>
              {stats.averageScore >= 70 ? "You're performing excellently!" : stats.averageScore >= 50 ? "Solid progress — keep going!" : "Consistency is key to improvement"}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
              You've completed <strong style={{ color: 'white' }}>{stats.attemptsCount} exam{stats.attemptsCount !== 1 ? 's' : ''}</strong> with an average of <strong style={{ color: 'white' }}>{stats.averageScore.toFixed(1)}%</strong> and a best score of <strong style={{ color: 'white' }}>{stats.highestScore.toFixed(0)}%</strong>.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => router.push('/dashboard/tests')} style={{ display: 'flex', alignItems: 'center', gap: 8, height: 42, padding: '0 20px', borderRadius: 12, border: 'none', background: '#2563EB', color: 'white', fontSize: 12, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 16px rgba(37,99,235,0.4)' }}>
              Practice Again <ArrowRight style={{ width: 13, height: 13 }} />
            </button>
          </div>
        </div>
      </div>

      {/* ── AI Insights: Strong & Weak Topics ─────────────── */}
      <div style={{ background: 'white', borderRadius: 20, border: '1.5px solid var(--slate-200)', padding: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#F5F3FF', border: '1px solid rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles style={{ width: 18, height: 18, color: '#7C3AED' }} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--slate-900)' }}>AI Topic Insights</div>
            <div style={{ fontSize: 11, color: 'var(--slate-400)', marginTop: 2 }}>Derived from your answer patterns across all exams</div>
          </div>
        </div>

        <div className="analytics-topics" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Strong */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
              <CheckCircle2 style={{ width: 14, height: 14, color: '#059669' }} />
              <span style={{ fontSize: 11, fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Strong Topics ({strongTopics.length})
              </span>
            </div>
            {strongTopics.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--slate-400)', padding: '16px', borderRadius: 12, background: 'var(--slate-50)', border: '1px dashed var(--slate-200)', textAlign: 'center' }}>
                Complete more exams to identify strong topics
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {strongTopics.map((topic) => (
                  <span key={topic} style={{ padding: '6px 12px', borderRadius: 10, fontSize: 12, fontWeight: 700, background: '#F0FDF4', color: '#15803D', border: '1px solid rgba(5,150,105,0.15)' }}>
                    {topic}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Weak */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
              <XCircle style={{ width: 14, height: 14, color: '#DC2626' }} />
              <span style={{ fontSize: 11, fontWeight: 800, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Needs Focus ({weakTopics.length})
              </span>
            </div>
            {weakTopics.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--slate-400)', padding: '16px', borderRadius: 12, background: 'var(--slate-50)', border: '1px dashed var(--slate-200)', textAlign: 'center' }}>
                {strongTopics.length > 0 ? 'No weak topics identified — great work!' : 'Complete more exams to identify weak areas'}
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {weakTopics.map((topic) => (
                  <span key={topic} style={{ padding: '6px 12px', borderRadius: 10, fontSize: 12, fontWeight: 700, background: '#FFF5F5', color: '#B91C1C', border: '1px solid rgba(220,38,38,0.15)' }}>
                    {topic}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Focus tip */}
        {weakTopics.length > 0 && (
          <div style={{ marginTop: 20, padding: '14px 16px', borderRadius: 14, background: 'linear-gradient(135deg, #EEF2FF, #F5F3FF)', border: '1px solid rgba(124,58,237,0.12)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#5B21B6', marginBottom: 4 }}>
              💡 Focus tip
            </div>
            <div style={{ fontSize: 12, color: 'var(--slate-600)', lineHeight: 1.6 }}>
              Your weakest area is <strong>{weakTopics[0]}</strong>. Try selecting it as your next solo practice subject to target it directly.
            </div>
            <button onClick={() => router.push('/dashboard/tests')} style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 9, background: '#7C3AED', color: 'white', fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
              Practice {weakTopics[0]} <ArrowRight style={{ width: 11, height: 11 }} />
            </button>
          </div>
        )}
      </div>

      {/* ── Recent Attempts Table ─────────────────────────── */}
      {progress.length > 0 && (
        <div style={{ background: 'white', borderRadius: 20, border: '1.5px solid var(--slate-200)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 22px', borderBottom: '1px solid var(--slate-100)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EFF6FF', border: '1px solid rgba(37,99,235,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity style={{ width: 16, height: 16, color: 'var(--blue-600)' }} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--slate-900)' }}>Recent Exam History</div>
              <div style={{ fontSize: 11, color: 'var(--slate-400)', marginTop: 1 }}>Your last {progress.length} completed exam{progress.length !== 1 ? 's' : ''}</div>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--slate-50)' }}>
                  {['#', 'Date', 'Score', 'Grade', 'Result'].map(h => (
                    <th key={h} style={{ padding: '10px 18px', fontSize: 10, fontWeight: 800, color: 'var(--slate-400)', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.07em', borderBottom: '1px solid var(--slate-100)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...progress].reverse().map((p, i) => {
                  const pct    = Math.round(p.score);
                  const passed = pct >= 50;
                  const color  = pct >= 70 ? '#059669' : pct >= 50 ? '#2563EB' : '#DC2626';
                  return (
                    <tr
                      key={p.attemptId}
                      onClick={() => router.push(`/dashboard/results/${p.attemptId}`)}
                      style={{ borderBottom: '1px solid var(--slate-50)', cursor: 'pointer', transition: 'background 0.1s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--slate-50)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                    >
                      <td style={{ padding: '13px 18px', fontSize: 12, color: 'var(--slate-400)', fontWeight: 700 }}>#{progress.length - i}</td>
                      <td style={{ padding: '13px 18px', fontSize: 12, color: 'var(--slate-600)', fontWeight: 600 }}>{formatDate(p.date)}</td>
                      <td style={{ padding: '13px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 60, height: 5, background: 'var(--slate-100)', borderRadius: 100, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 100 }} />
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 900, color }}>{pct}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '13px 18px' }}>
                        <span style={{ fontSize: 10, fontWeight: 800, color: pct >= 70 ? '#059669' : pct >= 50 ? '#2563EB' : '#DC2626', background: pct >= 70 ? '#F0FDF4' : pct >= 50 ? '#EFF6FF' : '#FFF5F5', padding: '3px 9px', borderRadius: 20, border: `1px solid ${pct >= 70 ? 'rgba(5,150,105,0.15)' : pct >= 50 ? 'rgba(37,99,235,0.15)' : 'rgba(220,38,38,0.15)'}` }}>
                          {pct >= 70 ? 'Excellent' : pct >= 50 ? 'Pass' : 'Below Pass'}
                        </span>
                      </td>
                      <td style={{ padding: '13px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: 'var(--blue-600)' }}>
                          View <ArrowRight style={{ width: 11, height: 11 }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .analytics-stats  { grid-template-columns: repeat(3, 1fr) !important; }
          .analytics-mid    { grid-template-columns: 1fr !important; }
          .analytics-topics { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 560px) {
          .analytics-stats  { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
