'use client'

import { useState, useEffect } from 'react'
import { Search, Bookmark, ChevronDown, ChevronUp, Trash2, BookOpen, Loader2 } from 'lucide-react'
import api from '../../../lib/api'

interface BookmarkQuestion {
  id: string
  questionId: string
  question: {
    id: string
    text: string
    options: Array<{ id: string; text: string; isCorrect: boolean }>
    explanation: string
    subject: { name: string }
  }
  createdAt: string
}

export default function BookmarksPage() {
  const [search, setSearch] = useState('')
  const [bookmarks, setBookmarks] = useState<BookmarkQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const res = await api.get('/questions/bookmarks')
        setBookmarks(res.data.data.bookmarks)
      } catch {
        setError('Failed to load bookmarks')
      } finally {
        setLoading(false)
      }
    }
    fetchBookmarks()
  }, [])

  const filtered = bookmarks.filter(
    (b) =>
      b.question.text.toLowerCase().includes(search.toLowerCase()) ||
      b.question.subject.name.toLowerCase().includes(search.toLowerCase())
  )

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const removeBookmark = async (questionId: string) => {
    try {
      await api.post(`/questions/${questionId}/bookmark`)
      setBookmarks(bookmarks.filter((b) => b.question.id !== questionId))
    } catch { /* silent */ }
  }

  return (
    <div style={{ padding: '36px 40px', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--slate-900)', margin: 0 }}>Bookmarks</h2>
          <p style={{ fontSize: 13, color: 'var(--slate-500)', marginTop: 4 }}>Questions you have saved for review</p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', maxWidth: 400, marginBottom: 28 }}>
          <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
          <input
            type="text"
            placeholder="Search bookmarks, subjects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', background: 'white', border: '1.5px solid var(--slate-200)',
              borderRadius: 12, fontSize: 13, paddingLeft: 38, paddingRight: 14, height: 44,
              color: 'var(--slate-900)', outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80, gap: 10, color: 'var(--slate-400)' }}>
            <Loader2 size={18} className="animate-spin" /> Loading bookmarks...
          </div>
        ) : error ? (
          <div style={{ background: 'white', border: '1.5px solid var(--slate-200)', borderRadius: 18, padding: 40, textAlign: 'center', color: 'var(--slate-500)' }}>{error}</div>
        ) : filtered.length === 0 ? (
          <div style={{ background: 'white', border: '1.5px solid var(--slate-200)', borderRadius: 18, padding: 60, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔖</div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--slate-700)', margin: 0 }}>
              {bookmarks.length === 0 ? 'No bookmarks saved' : 'No results found'}
            </p>
            <p style={{ fontSize: 12, color: 'var(--slate-400)', marginTop: 4 }}>
              {bookmarks.length === 0
                ? 'Bookmark tricky questions during practice tests to review them here.'
                : 'Try a different search term.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((bm) => {
              const isExpanded = expandedId === bm.id
              const correctIdx = bm.question.options.findIndex((o) => o.isCorrect)
              return (
                <div
                  key={bm.id}
                  style={{
                    background: 'white', border: '1.5px solid var(--slate-200)',
                    borderRadius: 18, overflow: 'hidden', transition: 'box-shadow 0.2s',
                  }}
                >
                  <button
                    onClick={() => toggleExpand(bm.id)}
                    style={{
                      width: '100%', padding: '18px 22px', display: 'flex', alignItems: 'flex-start',
                      gap: 14, cursor: 'pointer', background: 'none', border: 'none', textAlign: 'left',
                    }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: '#7C3AED12', border: '1.5px solid #7C3AED20',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED', fontSize: 14,
                    }}>
                      <Bookmark size={14} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '3px 10px', borderRadius: 7, fontSize: 11, fontWeight: 700,
                        background: 'var(--slate-50)', border: '1px solid var(--slate-100)',
                        color: 'var(--slate-500)', marginBottom: 8,
                      }}>
                        <BookOpen size={11} />
                        {bm.question.subject.name}
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--slate-900)', lineHeight: 1.5, margin: 0 }}>{bm.question.text}</p>
                    </div>
                    <div style={{ color: 'var(--slate-400)', flexShrink: 0, paddingTop: 4 }}>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div style={{ padding: '0 22px 22px', borderTop: '1px solid var(--slate-100)', paddingTop: 18 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                        {bm.question.options.map((opt, i) => (
                          <div
                            key={i}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 10,
                              padding: '10px 14px', borderRadius: 12, fontSize: 13,
                              border: `1.5px solid ${i === correctIdx ? '#D1FAE5' : 'var(--slate-100)'}`,
                              background: i === correctIdx ? '#ECFDF5' : 'white',
                              color: i === correctIdx ? '#065F46' : 'var(--slate-600)',
                              fontWeight: i === correctIdx ? 700 : 400,
                            }}
                          >
                            <span style={{
                              width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 11, fontWeight: 800,
                              background: i === correctIdx ? '#059669' : 'var(--slate-50)',
                              color: i === correctIdx ? 'white' : 'var(--slate-400)',
                              border: `1px solid ${i === correctIdx ? '#059669' : 'var(--slate-150)'}`,
                            }}>
                              {String.fromCharCode(65 + i)}
                            </span>
                            <span style={{ flex: 1 }}>{opt.text}</span>
                            {i === correctIdx && (
                              <span style={{ fontSize: 10, fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Correct</span>
                            )}
                          </div>
                        ))}
                      </div>

                      {bm.question.explanation && (
                        <div style={{ background: 'var(--slate-50)', border: '1px solid var(--slate-100)', borderRadius: 14, padding: 16, marginBottom: 16 }}>
                          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Explanation</p>
                          <p style={{ fontSize: 12, color: 'var(--slate-600)', lineHeight: 1.6, margin: 0 }}>{bm.question.explanation}</p>
                        </div>
                      )}

                      <button
                        onClick={(e) => { e.stopPropagation(); removeBookmark(bm.question.id) }}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '7px 14px', fontSize: 12, fontWeight: 700,
                          color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA',
                          borderRadius: 10, cursor: 'pointer', transition: 'background 0.15s',
                        }}
                      >
                        <Trash2 size={13} />
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
