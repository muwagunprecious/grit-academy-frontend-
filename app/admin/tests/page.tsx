'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Clock, Calendar } from 'lucide-react';
import api from '../../../lib/api';

interface Test {
  id: string;
  title: string;
  price: number;
  duration: number;
  difficulty: string;
  isPublished: boolean;
  totalQuestions: number;
  totalPurchases: number;
  combination?: { name: string };
  createdAt: string;
  startTime?: string;
  endTime?: string;
}

export default function AdminTests() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await api.get('/tests?limit=50');
        setTests(res.data.data.tests);
      } catch {
        setTests([
          {
            id: 't1',
            title: 'Complete JAMB Mock (Science)',
            price: 2500,
            duration: 120,
            difficulty: 'HARD',
            isPublished: true,
            totalQuestions: 180,
            totalPurchases: 324,
            combination: { name: 'Science' },
            createdAt: '2026-07-01T00:00:00Z',
          },
          {
            id: 't2',
            title: 'WAEC Physics Practice Test',
            price: 1500,
            duration: 90,
            difficulty: 'MEDIUM',
            isPublished: true,
            totalQuestions: 80,
            totalPurchases: 210,
            combination: { name: 'Science' },
            createdAt: '2026-07-03T00:00:00Z',
          },
          {
            id: 't3',
            title: 'JAMB English (Comprehension)',
            price: 1000,
            duration: 60,
            difficulty: 'EASY',
            isPublished: false,
            totalQuestions: 60,
            totalPurchases: 0,
            combination: { name: 'Arts' },
            createdAt: '2026-07-08T00:00:00Z',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, []);

  const togglePublish = async (id: string, current: boolean) => {
    try {
      await api.put(`/tests/${id}`, { isPublished: !current });
    } catch {}
    setTests((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isPublished: !t.isPublished } : t))
    );
  };

  const [scheduleEdit, setScheduleEdit] = useState<string | null>(null);
  const [scheduleForm, setScheduleForm] = useState<{ startTime: string; endTime: string; price: string }>({ startTime: '', endTime: '', price: '' });

  const openSchedule = (test: Test) => {
    setScheduleEdit(test.id);
    setScheduleForm({
      startTime: test.startTime ? test.startTime.slice(0, 16) : '',
      endTime: test.endTime ? test.endTime.slice(0, 16) : '',
      price: String(test.price),
    });
  };

  const saveSchedule = async (id: string) => {
    try {
      const payload: any = {
        price: Number(scheduleForm.price) || 0,
        startTime: scheduleForm.startTime || null,
        endTime: scheduleForm.endTime || null,
      };
      await api.put(`/tests/${id}`, payload);
      setTests((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, price: payload.price, startTime: payload.startTime, endTime: payload.endTime }
            : t
        )
      );
      setScheduleEdit(null);
    } catch {}
  };

  const filtered = tests.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.combination?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--slate-900)', letterSpacing: '-0.02em', margin: 0 }}>
            Test Packages Catalog
          </h1>
          <p style={{ fontSize: 14, color: 'var(--slate-500)', marginTop: 4, fontWeight: 400 }}>
            Manage test packages, pricing, durations, and live publications.
          </p>
        </div>

        <Link
          href="/admin/tests/new"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            height: 44, padding: '0 20px',
            background: 'var(--blue-600)', color: 'white',
            fontSize: 13, fontWeight: 700, borderRadius: 12,
            textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(37,99,235,0.25)',
          }}
        >
          <Plus style={{ width: 16, height: 16 }} /> Create New Test
        </Link>
      </div>

      {/* Metric Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <div style={{ background: 'white', border: '1.5px solid var(--slate-200)', borderRadius: 20, padding: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Packages</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--slate-900)', marginTop: 4 }}>{tests.length}</div>
        </div>

        <div style={{ background: 'white', border: '1.5px solid var(--slate-200)', borderRadius: 20, padding: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Published Live</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#059669', marginTop: 4 }}>{tests.filter((t) => t.isPublished).length}</div>
        </div>

        <div style={{ background: 'white', border: '1.5px solid var(--slate-200)', borderRadius: 20, padding: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Purchases</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--slate-900)', marginTop: 4 }}>
            {tests.reduce((a, t) => a + t.totalPurchases, 0)}
          </div>
        </div>

        <div style={{ background: 'white', border: '1.5px solid var(--slate-200)', borderRadius: 20, padding: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Estimated Revenue</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#7C3AED', marginTop: 4 }}>
            ₦{(tests.reduce((a, t) => a + t.price * t.totalPurchases, 0) / 1000).toFixed(0)}k
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: 400 }}>
        <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 17, height: 17, color: 'var(--slate-400)' }} />
        <input
          type="text"
          placeholder="Search test titles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%', height: 44, paddingLeft: 44, paddingRight: 16,
            borderRadius: 12, border: '1.5px solid var(--slate-200)', background: 'white',
            fontSize: 13, fontWeight: 500, color: 'var(--slate-900)', outline: 'none',
          }}
        />
      </div>

      {/* Table */}
      <div style={{ background: 'white', border: '1.5px solid var(--slate-200)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--slate-50)', borderBottom: '1px solid var(--slate-200)', fontSize: 11, fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              <th style={{ padding: '16px 24px' }}>Title</th>
              <th style={{ padding: '16px 24px' }}>Category</th>
              <th style={{ padding: '16px 24px' }}>Questions</th>
              <th style={{ padding: '16px 24px' }}>Duration</th>
              <th style={{ padding: '16px 24px' }}>Price</th>
              <th style={{ padding: '16px 24px' }}>Schedule</th>
              <th style={{ padding: '16px 24px', textAlign: 'center' }}>Status</th>
              <th style={{ padding: '16px 24px', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: 13 }}>
            {filtered.map((test, i) => (
              <tr key={test.id} style={{ borderBottom: i === filtered.length - 1 ? 'none' : '1px solid var(--slate-100)', verticalAlign: 'top' }}>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{test.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--slate-400)', marginTop: 2 }}>
                    Created {new Date(test.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}
                  </div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6, background: 'var(--slate-100)', color: 'var(--slate-600)' }}>
                    {test.combination?.name || 'General'}
                  </span>
                </td>
                <td style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--slate-700)' }}>{test.totalQuestions} Qs</td>
                <td style={{ padding: '16px 24px', color: 'var(--slate-500)' }}>{test.duration} Mins</td>
                <td style={{ padding: '16px 24px' }}>
                  {scheduleEdit === test.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 220 }}>
                      <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Price (₦)</label>
                      <input type="number" value={scheduleForm.price} onChange={e => setScheduleForm(f => ({ ...f, price: e.target.value }))}
                        style={{ height: 32, padding: '0 8px', borderRadius: 8, border: '1.5px solid var(--slate-200)', fontSize: 12, fontWeight: 600, outline: 'none' }} />
                      <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', marginTop: 4 }}>
                        <Calendar style={{ width: 11, height: 11, display: 'inline', marginRight: 4 }} />Start Time
                      </label>
                      <input type="datetime-local" value={scheduleForm.startTime} onChange={e => setScheduleForm(f => ({ ...f, startTime: e.target.value }))}
                        style={{ height: 32, padding: '0 8px', borderRadius: 8, border: '1.5px solid var(--slate-200)', fontSize: 12, outline: 'none' }} />
                      <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                        <Clock style={{ width: 11, height: 11, display: 'inline', marginRight: 4 }} />End Time
                      </label>
                      <input type="datetime-local" value={scheduleForm.endTime} onChange={e => setScheduleForm(f => ({ ...f, endTime: e.target.value }))}
                        style={{ height: 32, padding: '0 8px', borderRadius: 8, border: '1.5px solid var(--slate-200)', fontSize: 12, outline: 'none' }} />
                      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                        <button onClick={() => saveSchedule(test.id)} style={{ flex: 1, height: 30, background: 'var(--blue-600)', color: 'white', border: 'none', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Save</button>
                        <button onClick={() => setScheduleEdit(null)} style={{ flex: 1, height: 30, background: 'var(--slate-100)', color: 'var(--slate-600)', border: 'none', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontWeight: 800, color: test.price === 0 ? '#059669' : 'var(--slate-900)', fontSize: 13 }}>
                        {test.price === 0 ? 'Free' : `₦${test.price.toLocaleString()}`}
                      </div>
                      {(test.startTime || test.endTime) && (
                        <div style={{ fontSize: 10, color: 'var(--slate-400)', marginTop: 3, lineHeight: 1.6 }}>
                          {test.startTime && <div>🟢 {new Date(test.startTime).toLocaleString('en-NG', { timeZone: 'Africa/Lagos', dateStyle: 'short', timeStyle: 'short' })}</div>}
                          {test.endTime && <div>🔴 {new Date(test.endTime).toLocaleString('en-NG', { timeZone: 'Africa/Lagos', dateStyle: 'short', timeStyle: 'short' })}</div>}
                        </div>
                      )}
                      <button onClick={() => openSchedule(test)} style={{ marginTop: 6, fontSize: 10, fontWeight: 700, color: 'var(--blue-600)', background: '#EFF6FF', border: 'none', borderRadius: 6, padding: '3px 8px', cursor: 'pointer' }}>
                        ✏️ Set Price & Schedule
                      </button>
                    </div>
                  )}
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                  <button
                    onClick={() => togglePublish(test.id, test.isPublished)}
                    style={{
                      padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                      border: 'none', cursor: 'pointer',
                      background: test.isPublished ? '#ECFDF5' : 'var(--slate-100)',
                      color: test.isPublished ? '#059669' : 'var(--slate-500)',
                    }}
                  >
                    {test.isPublished ? 'Live' : 'Draft'}
                  </button>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <Link
                    href={`/admin/tests/${test.id}/edit`}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '6px 14px', borderRadius: 8, background: 'var(--slate-100)',
                      fontSize: 12, fontWeight: 700, color: 'var(--slate-700)', textDecoration: 'none',
                    }}
                  >
                    <Edit style={{ width: 13, height: 13 }} /> Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
