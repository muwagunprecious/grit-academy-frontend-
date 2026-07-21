'use client'

import { useState, useEffect } from 'react'
import {
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Trophy,
  BarChart3,
  Loader2,
} from 'lucide-react'
import api from '../../../lib/api'

interface Attempt {
  id: string
  testId: string
  score: number
  percentage: number
  correctCount: number
  wrongCount: number
  skippedCount: number
  timeUsed: number
  isPassed: boolean
  completedAt: string
  test: { title: string; passingScore: number }
}

export default function AttemptsPage() {
  const [search, setSearch] = useState('')
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const res = await api.get('/attempts/user')
        setAttempts(res.data.data.attempts)
      } catch {
        setError('Failed to load attempts')
      } finally {
        setLoading(false)
      }
    }
    fetchAttempts()
  }, [])

  const filtered = attempts.filter(
    (a) =>
      a.test.title.toLowerCase().includes(search.toLowerCase())
  )

  const passed = attempts.filter((a) => a.isPassed).length
  const failed = attempts.length - passed
  const avgScore = attempts.length
    ? Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length)
    : 0
  const bestScore = attempts.length
    ? Math.round(Math.max(...attempts.map((a) => a.percentage)))
    : 0

  const stats = [
    { label: 'Total Attempts', value: attempts.length, icon: '📋', accent: '#2563EB' },
    { label: 'Passed', value: passed, icon: '✅', accent: '#059669' },
    { label: 'Failed', value: failed, icon: '❌', accent: '#DC2626' },
    { label: 'Avg Score', value: `${avgScore}%`, icon: '📈', accent: '#D97706' },
    { label: 'Best Score', value: `${bestScore}%`, icon: '🏆', accent: '#7C3AED' },
  ]

  return (
    <div style={{ padding: '36px 40px', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--slate-900)', margin: 0 }}>Attempts</h2>
          <p style={{ fontSize: 13, color: 'var(--slate-500)', marginTop: 4 }}>Your complete test attempt history</p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80, gap: 10, color: 'var(--slate-400)' }}>
            <Loader2 size={18} className="animate-spin" /> Loading attempts...
          </div>
        ) : error ? (
          <div style={{ background: 'white', border: '1.5px solid var(--slate-200)', borderRadius: 18, padding: 40, textAlign: 'center', color: 'var(--slate-500)' }}>{error}</div>
        ) : (
          <>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
              {stats.map((s) => (
                <div key={s.label} style={{
                  background: 'white', borderRadius: 18, border: '1.5px solid var(--slate-200)',
                  padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 12,
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    background: s.accent + '12', border: `1.5px solid ${s.accent}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                  }}>{s.icon}</div>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--slate-900)', lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: 'var(--slate-500)', marginTop: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Search */}
            <div style={{ position: 'relative', maxWidth: 400, marginBottom: 24 }}>
              <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
              <input
                type="text"
                placeholder="Search attempts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%', background: 'white', border: '1.5px solid var(--slate-200)',
                  borderRadius: 12, fontSize: 13, paddingLeft: 38, paddingRight: 14, height: 44,
                  color: 'var(--slate-900)', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Table */}
            <div style={{ background: 'white', border: '1.5px solid var(--slate-200)', borderRadius: 18, overflow: 'hidden' }}>
              {filtered.length === 0 ? (
                <div style={{ padding: 60, textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--slate-700)', margin: 0 }}>
                    {attempts.length === 0 ? 'No attempts yet' : 'No matching attempts'}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--slate-400)', marginTop: 4 }}>
                    {attempts.length === 0 ? 'Start a practice test to see your history here.' : 'Try a different search term.'}
                  </p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--slate-100)' }}>
                        {['Test', 'Score', 'Correct / Wrong', 'Date', 'Duration', 'Status'].map((h) => (
                          <th key={h} style={{
                            textAlign: 'left', padding: '14px 18px', fontSize: 11, fontWeight: 700,
                            color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '0.05em',
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((a) => (
                        <tr key={a.id} style={{ borderBottom: '1px solid var(--slate-50)' }}>
                          <td style={{ padding: '16px 18px' }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--slate-900)' }}>{a.test.title}</div>
                          </td>
                          <td style={{ padding: '16px 18px' }}>
                            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--slate-900)' }}>{Math.round(a.percentage)}%</span>
                            <span style={{ fontSize: 12, color: 'var(--slate-400)', marginLeft: 6 }}>({a.correctCount}/{a.correctCount + a.wrongCount + a.skippedCount})</span>
                          </td>
                          <td style={{ padding: '16px 18px' }}>
                            <span style={{ fontSize: 13, color: 'var(--slate-600)' }}>
                              <span style={{ color: '#059669', fontWeight: 600 }}>{a.correctCount}✓</span>
                              {' / '}
                              <span style={{ color: '#DC2626', fontWeight: 600 }}>{a.wrongCount}✗</span>
                            </span>
                          </td>
                          <td style={{ padding: '16px 18px', fontSize: 13, color: 'var(--slate-500)' }}>
                            {new Date(a.completedAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td style={{ padding: '16px 18px' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--slate-500)' }}>
                              <Clock size={13} style={{ color: 'var(--slate-400)' }} />
                              {Math.round(a.timeUsed / 60)}m
                            </span>
                          </td>
                          <td style={{ padding: '16px 18px' }}>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 5,
                              padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                              background: a.isPassed ? '#ECFDF5' : '#FEF2F2',
                              color: a.isPassed ? '#059669' : '#DC2626',
                            }}>
                              {a.isPassed ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                              {a.isPassed ? 'Passed' : 'Failed'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
