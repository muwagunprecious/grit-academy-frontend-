'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit } from 'lucide-react';
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
              <th style={{ padding: '16px 24px', textAlign: 'center' }}>Status</th>
              <th style={{ padding: '16px 24px', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: 13 }}>
            {filtered.map((test, i) => (
              <tr key={test.id} style={{ borderBottom: i === filtered.length - 1 ? 'none' : '1px solid var(--slate-100)' }}>
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
                <td style={{ padding: '16px 24px', fontWeight: 800, color: 'var(--slate-900)' }}>₦{test.price.toLocaleString()}</td>
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
