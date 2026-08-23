'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  BarChart3,
  Trophy,
  Clock,
  ArrowUpRight,
  Sparkles,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
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

function formatTime(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function StatCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: '#FFFFFF',
        borderRadius: 16,
        border: `1px solid ${hov ? '#CBD5E1' : '#E2E8F0'}`,
        padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14,
        transition: 'all 0.15s ease',
        boxShadow: hov ? '0 4px 16px rgba(0,0,0,0.03)' : '0 1px 2px rgba(0,0,0,0.02)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </span>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: '#F8FAFC', border: '1px solid #E2E8F0',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F172A',
        }}>
          <Icon style={{ width: 16, height: 16, strokeWidth: 1.8 }} />
        </div>
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 900, color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: 11, color: '#059669', marginTop: 8, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
          <TrendingUp style={{ width: 12, height: 12 }} /> {sub}
        </div>}
      </div>
    </div>
  );
}

function ProgressBar({ label, pct }: { label: string; pct: number }) {
  const [width, setWidth] = useState(0);
  useEffect(() => { const t = setTimeout(() => setWidth(pct), 100); return () => clearTimeout(t); }, [pct]);
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 800, color: '#64748B' }}>{pct}%</span>
      </div>
      <div style={{ height: 6, background: '#F1F5F9', borderRadius: 100, overflow: 'hidden' }}>
        <div style={{
          height: '100%', background: '#0F172A', borderRadius: 100,
          width: `${width}%`, transition: 'width 0.8s cubic-bezier(0.16,1,0.3,1)',
        }} />
      </div>
    </div>
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
      <div style={{ width: 28, height: 28, border: '2.5px solid #E2E8F0', borderTopColor: '#0F172A', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  );

  const firstName = user?.firstName || 'Student';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ maxWidth: 1140, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Minimalist Welcome Card ──────────────────────── */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: 20,
        border: '1px solid #E2E8F0',
        padding: '32px 36px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 24, flexWrap: 'wrap',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      }}>
        <div style={{ maxWidth: 560 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', borderRadius: 20,
            background: '#F1F5F9', border: '1px solid #E2E8F0',
            fontSize: 11, fontWeight: 700, color: '#475569',
            textTransform: 'uppercase', letterSpacing: '0.06em',
            marginBottom: 14,
          }}>
            <Sparkles style={{ width: 12, height: 12, color: '#0F172A' }} /> Student Portal Overview
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1.15, margin: '0 0 8px' }}>
            {greeting}, {firstName}
          </h1>
          <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6, fontWeight: 500, margin: '0 0 24px' }}>
            Track your progress, launch custom 5-subject practice CBT exams, and review AI explanations.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/dashboard/tests" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              height: 42, padding: '0 20px',
              background: '#0F172A', color: 'white',
              fontSize: 13, fontWeight: 800, borderRadius: 10,
              textDecoration: 'none', boxShadow: '0 4px 12px rgba(15,23,42,0.15)',
              transition: 'all 0.15s ease',
            }}>
              <FileText style={{ width: 15, height: 15 }} /> Launch Practice CBT →
            </Link>
            <Link href="/dashboard/analytics" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              height: 42, padding: '0 18px',
              background: '#FFFFFF', color: '#0F172A',
              border: '1px solid #E2E8F0',
              fontSize: 13, fontWeight: 700, borderRadius: 10,
              textDecoration: 'none', transition: 'all 0.15s ease',
            }}>
              <BarChart3 style={{ width: 15, height: 15 }} /> View Analytics
            </Link>
          </div>
        </div>

        {/* Right Quick Summary Badge */}
        <div style={{
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: 16,
          padding: '20px 24px',
          display: 'flex', flexDirection: 'column', gap: 12,
          minWidth: 220,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Account Status
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: user?.hasPaidAccessFee ? '#059669' : '#DC2626' }} />
            <span style={{ fontSize: 14, fontWeight: 900, color: '#0F172A' }}>
              {user?.hasPaidAccessFee ? 'Full Access Unlocked' : '₦1,010 Access Fee Required'}
            </span>
          </div>
          <div style={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>
            {data?.stats.attemptsCount || 0} total CBT exam attempts recorded.
          </div>
        </div>
      </div>

      {/* ── Stat Cards ────────────────────────────────────── */}
      <div className="dash-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard icon={FileText} label="Tests Completed" value={String(data?.stats.attemptsCount || 0)} />
        <StatCard icon={BarChart3} label="Average Score" value={`${data?.stats.averageScore?.toFixed(0) || 0}%`} sub="Top 15% rank" />
        <StatCard icon={Trophy} label="Highest Score" value={`${data?.stats.highestScore || 0}%`} />
        <StatCard icon={Clock} label="Total Study Time" value={formatTime(data?.stats.totalTimeSpent || 0)} />
      </div>

      {/* ── Analytics & AI Insights Grid ──────────────────── */}
      <div className="dash-analysis" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 18 }}>

        {/* Subject Performance */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: '26px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em' }}>Subject Performance</div>
              <div style={{ fontSize: 11, color: '#64748B', marginTop: 2, fontWeight: 500 }}>Average percentage per subject</div>
            </div>
            <Link href="/dashboard/analytics" style={{ fontSize: 12, fontWeight: 800, color: '#0F172A', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              Details <ArrowUpRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>
          {data?.subjectBreakdown.map(s => (
            <ProgressBar key={s.subjectId} label={s.subjectName} pct={s.percentage} />
          ))}
        </div>

        {/* AI Insights Card */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: '26px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F1F5F9', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles style={{ width: 16, height: 16, color: '#0F172A' }} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 900, color: '#0F172A' }}>AI Diagnostic</div>
              <div style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>Topic strength breakdown</div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
              <CheckCircle2 style={{ width: 12, height: 12 }} /> High Mastery Topics
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {data?.strongTopics.map(t => (
                <span key={t} style={{
                  padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                  background: '#ECFDF5', color: '#047857',
                  border: '1px solid rgba(5,150,105,0.15)',
                }}>{t}</span>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
              <AlertCircle style={{ width: 12, height: 12 }} /> Revision Needed
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {data?.weakTopics.map(t => (
                <span key={t} style={{
                  padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                  background: '#FEF2F2', color: '#B91C1C',
                  border: '1px solid rgba(220,38,38,0.15)',
                }}>{t}</span>
              ))}
            </div>
          </div>

          <Link href="/dashboard/tests" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            height: 40, borderRadius: 10,
            background: '#0F172A', color: 'white',
            fontSize: 12, fontWeight: 800, textAlign: 'center',
            textDecoration: 'none', marginTop: 'auto',
            transition: 'all 0.15s ease',
          }}>
            Target Weak Areas <ChevronRight style={{ width: 14, height: 14 }} />
          </Link>
        </div>
      </div>

      {/* ── Quick Action Cards ────────────────────────────── */}
      <div className="dash-actions" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { title: 'Practice Tests & Mock Exams', desc: 'Take custom 5-subject CBT tests or practice single subjects', href: '/dashboard/tests', icon: FileText },
          { title: 'Performance Analytics', desc: 'Review detailed speed, accuracy, and topic score analytics', href: '/dashboard/analytics', icon: BarChart3 },
          { title: 'Saved Question Bookmarks', desc: 'Access your saved revision questions and step-by-step explainers', href: '/dashboard/bookmarks', icon: Bookmark },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              href={item.href}
              style={{
                display: 'flex', flexDirection: 'column', gap: 12,
                padding: '24px', borderRadius: 18,
                border: '1px solid #E2E8F0',
                background: '#FFFFFF', textDecoration: 'none',
                transition: 'all 0.15s ease',
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: '#F8FAFC', border: '1px solid #E2E8F0',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F172A',
              }}>
                <Icon style={{ width: 18, height: 18, strokeWidth: 1.8 }} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5, fontWeight: 500 }}>{item.desc}</div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#0F172A', marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
                Open Section <ChevronRight style={{ width: 14, height: 14 }} />
              </div>
            </Link>
          );
        })}
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
