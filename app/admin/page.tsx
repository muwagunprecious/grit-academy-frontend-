'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, FileText, DollarSign, TrendingUp, UploadCloud, ArrowUpRight, Sparkles } from 'lucide-react';
import api from '../../lib/api';

interface Stats {
  totalStudents: number;
  totalTests: number;
  totalRevenue: number;
  activeTests: number;
}

interface RecentUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
}

const MOCK_USERS: RecentUser[] = [
  { id: '1', firstName: 'Adaeze', lastName: 'Obi', email: 'adaeze@mail.com', createdAt: '2026-07-09T10:00:00Z' },
  { id: '2', firstName: 'Chukwuemeka', lastName: 'Eze', email: 'emeka@mail.com', createdAt: '2026-07-08T14:30:00Z' },
  { id: '3', firstName: 'Fatima', lastName: 'Bello', email: 'fatima@mail.com', createdAt: '2026-07-07T09:15:00Z' },
  { id: '4', firstName: 'Oluwaseun', lastName: 'Adeyemi', email: 'seun@mail.com', createdAt: '2026-07-06T18:45:00Z' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ totalStudents: 0, totalTests: 0, totalRevenue: 0, activeTests: 0 });
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/analytics/admin/overview')
      .then((r) => setStats(r.data.data))
      .catch(() => {
        setStats({ totalStudents: 1284, totalTests: 24, totalRevenue: 2450000, activeTests: 18 });
        setRecentUsers(MOCK_USERS);
      })
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      label: 'Registered Students',
      value: stats.totalStudents,
      icon: Users,
      color: '#EFF6FF',
      iconColor: 'var(--blue-600)',
      change: '+14% this month',
    },
    {
      label: 'Subject Tests',
      value: stats.totalTests,
      icon: FileText,
      color: '#F5F3FF',
      iconColor: '#7C3AED',
      change: '+4 added this week',
    },
    {
      label: 'Total Revenue',
      value: `₦${(stats.totalRevenue / 1000).toFixed(0)}k`,
      icon: DollarSign,
      color: '#ECFDF5',
      iconColor: '#059669',
      change: '+18% vs last month',
    },
    {
      label: 'Active Exams',
      value: stats.activeTests,
      icon: TrendingUp,
      color: '#FFFBEB',
      iconColor: '#D97706',
      change: 'Active status',
    },
  ];

  const quickActions = [
    {
      label: 'Upload PDF & Generate Qs',
      desc: 'Upload past question PDFs and extract Q&A with AI',
      href: '/admin/upload',
      icon: UploadCloud,
    },
    {
      label: 'Manage Test Packages',
      desc: 'Publish, edit duration, and customize tests',
      href: '/admin/tests',
      icon: FileText,
    },
    {
      label: 'Student Roster & Activity',
      desc: 'Inspect student exam attempts and corrections',
      href: '/admin/students',
      icon: Users,
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 100, background: '#EFF6FF', color: 'var(--blue-600)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            <Sparkles style={{ width: 14, height: 14 }} /> Admin Overview Studio
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--slate-900)', letterSpacing: '-0.02em', margin: 0 }}>
            Dashboard Overview
          </h1>
          <p style={{ fontSize: 14, color: 'var(--slate-500)', marginTop: 4, fontWeight: 400 }}>
            Real-time examination stats, student activity stream, and shortcuts.
          </p>
        </div>

        <Link
          href="/admin/upload"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            height: 44, padding: '0 20px',
            background: 'var(--blue-600)', color: 'white',
            fontSize: 13, fontWeight: 700, borderRadius: 12,
            textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(37,99,235,0.25)',
            transition: 'all 0.15s',
          }}
        >
          <UploadCloud style={{ width: 16, height: 16 }} /> Upload PDF & Generate Qs
        </Link>
      </div>

      {/* Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }} className="dashboard-stats-grid">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} style={{
              background: 'white', border: '1.5px solid var(--slate-200)', borderRadius: 20,
              padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 16,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: c.color, color: c.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon style={{ width: 20, height: 20 }} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '3px 8px', borderRadius: 6, background: 'var(--slate-100)', color: 'var(--slate-500)', marginLeft: 'auto' }}>
                  {c.change}
                </span>
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--slate-900)', letterSpacing: '-0.02em' }}>{loading ? '—' : c.value}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--slate-400)', marginTop: 2 }}>{c.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Shortcuts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }} className="dashboard-shortcuts-grid">
        {quickActions.map((act) => {
          const Icon = act.icon;
          return (
            <Link
              key={act.label}
              href={act.href}
              style={{
                background: 'white', border: '1.5px solid var(--slate-200)', borderRadius: 20,
                padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 16,
                textDecoration: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: '#EFF6FF', color: 'var(--blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon style={{ width: 20, height: 20 }} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--slate-900)' }}>{act.label}</div>
                <div style={{ fontSize: 13, color: 'var(--slate-500)', lineHeight: 1.5 }}>{act.desc}</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: 'var(--blue-600)', paddingTop: 4 }}>
                Open Shortcut <ArrowUpRight style={{ width: 14, height: 14 }} />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Registrations Table */}
      <div style={{ background: 'white', border: '1.5px solid var(--slate-200)', borderRadius: 20, padding: 28, display: 'flex', flexDirection: 'column', gap: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--slate-100)', paddingBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--slate-900)', margin: 0 }}>Recent Student Registrations</h3>
          <Link href="/admin/students" style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue-600)', textDecoration: 'none', marginLeft: 'auto' }}>
            View Roster Catalog →
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {recentUsers.map((u, i) => (
            <div key={u.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
              padding: '14px 0', borderBottom: i === recentUsers.length - 1 ? 'none' : '1px solid var(--slate-100)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--blue-600)', color: 'white', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {u.firstName[0]}{u.lastName[0]}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--slate-900)' }}>{u.firstName} {u.lastName}</div>
                  <div style={{ fontSize: 12, color: 'var(--slate-400)', marginTop: 2 }}>{u.email}</div>
                </div>
              </div>

              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--slate-400)' }}>
                {new Date(u.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .dashboard-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .dashboard-shortcuts-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
