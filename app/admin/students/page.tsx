'use client';

import { useState } from 'react';
import { Users, Search, UserCheck, ShoppingCart } from 'lucide-react';

type Student = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  school: string;
  state: string;
  attempts: number;
  purchases: number;
  joined: string;
  active: boolean;
};

const MOCK_STUDENTS: Student[] = [
  {
    id: '1',
    name: 'Adaeze Obi',
    email: 'adaeze@email.com',
    avatar: 'AO',
    school: 'Federal Government College',
    state: 'Lagos',
    attempts: 47,
    purchases: 3,
    joined: '2025-09-15',
    active: true,
  },
  {
    id: '2',
    name: 'Emeka Eze',
    email: 'emeka.eze@email.com',
    avatar: 'EE',
    school: 'Government College Umuahia',
    state: 'Enugu',
    attempts: 32,
    purchases: 2,
    joined: '2025-11-03',
    active: true,
  },
  {
    id: '3',
    name: 'Fatima Bello',
    email: 'fatima.bello@email.com',
    avatar: 'FB',
    school: 'Federal Government College Bida',
    state: 'Kano',
    attempts: 18,
    purchases: 1,
    joined: '2026-01-20',
    active: false,
  },
  {
    id: '4',
    name: 'Oluwaseun Adeyemi',
    email: 'seun.adeyemi@email.com',
    avatar: 'OA',
    school: 'Government College Ibadan',
    state: 'Oyo',
    attempts: 56,
    purchases: 4,
    joined: '2025-08-10',
    active: true,
  },
];

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [search, setSearch] = useState('');
  const [filterState, setFilterState] = useState('');

  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.active).length;
  const totalPurchases = students.reduce((acc, s) => acc + s.purchases, 0);

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchesState = !filterState || s.state === filterState;
    return matchesSearch && matchesState;
  });

  const uniqueStates = [...new Set(students.map((s) => s.state))].sort();

  const toggleActive = (id: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--slate-900)', letterSpacing: '-0.02em', margin: 0 }}>
          Student Roster Management
        </h1>
        <p style={{ fontSize: 14, color: 'var(--slate-500)', marginTop: 4, fontWeight: 400 }}>
          Manage registered students, exam attempts, and status permissions.
        </p>
      </div>

      {/* Metric Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <div style={{ background: 'white', border: '1.5px solid var(--slate-200)', borderRadius: 20, padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Students</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--slate-900)', marginTop: 4 }}>{totalStudents}</div>
          </div>
          <Users style={{ width: 24, height: 24, color: 'var(--blue-600)', marginLeft: 'auto' }} />
        </div>

        <div style={{ background: 'white', border: '1.5px solid var(--slate-200)', borderRadius: 20, padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Active Accounts</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#059669', marginTop: 4 }}>{activeStudents}</div>
          </div>
          <UserCheck style={{ width: 24, height: 24, color: '#059669', marginLeft: 'auto' }} />
        </div>

        <div style={{ background: 'white', border: '1.5px solid var(--slate-200)', borderRadius: 20, padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Test Packages Bought</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#7C3AED', marginTop: 4 }}>{totalPurchases}</div>
          </div>
          <ShoppingCart style={{ width: 24, height: 24, color: '#7C3AED', marginLeft: 'auto' }} />
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div style={{ background: 'white', border: '1.5px solid var(--slate-200)', borderRadius: 20, padding: 20, display: 'flex', itemsCenter: 'center', gap: 16 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 17, height: 17, color: 'var(--slate-400)' }} />
          <input
            type="text"
            placeholder="Search by student name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', height: 44, paddingLeft: 44, paddingRight: 16,
              borderRadius: 12, border: '1.5px solid var(--slate-200)', background: 'var(--slate-50)',
              fontSize: 13, fontWeight: 500, color: 'var(--slate-900)', outline: 'none',
            }}
          />
        </div>

        <select
          value={filterState}
          onChange={(e) => setFilterState(e.target.value)}
          style={{ width: 180, height: 44, padding: '0 14px', borderRadius: 12, border: '1.5px solid var(--slate-200)', background: 'white', fontSize: 13, fontWeight: 600, color: 'var(--slate-900)', outline: 'none', cursor: 'pointer' }}
        >
          <option value="">All States</option>
          {uniqueStates.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Roster Table */}
      <div style={{ background: 'white', border: '1.5px solid var(--slate-200)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--slate-50)', borderBottom: '1px solid var(--slate-200)', fontSize: 11, fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              <th style={{ padding: '16px 24px' }}>Student</th>
              <th style={{ padding: '16px 24px' }}>School</th>
              <th style={{ padding: '16px 24px' }}>State</th>
              <th style={{ padding: '16px 24px', textAlign: 'center' }}>Attempts</th>
              <th style={{ padding: '16px 24px', textAlign: 'center' }}>Status</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: 13 }}>
            {filteredStudents.map((s, i) => (
              <tr key={s.id} style={{ borderBottom: i === filteredStudents.length - 1 ? 'none' : '1px solid var(--slate-100)' }}>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--blue-600)', color: 'white', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {s.avatar}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--slate-400)', marginTop: 2 }}>{s.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 24px', color: 'var(--slate-600)', fontWeight: 500 }}>{s.school}</td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6, background: 'var(--slate-100)', color: 'var(--slate-600)' }}>
                    {s.state}
                  </span>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'center', fontWeight: 800, color: 'var(--slate-900)' }}>{s.attempts}</td>
                <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                  <button
                    onClick={() => toggleActive(s.id)}
                    style={{
                      padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                      border: 'none', cursor: 'pointer',
                      background: s.active ? '#ECFDF5' : 'var(--slate-100)',
                      color: s.active ? '#059669' : 'var(--slate-500)',
                    }}
                  >
                    {s.active ? 'Active' : 'Inactive'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
