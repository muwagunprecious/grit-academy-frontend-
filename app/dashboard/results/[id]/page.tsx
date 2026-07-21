'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft, CheckCircle2, XCircle, Clock, Trophy, Sparkles,
  ChevronDown, ChevronUp, Loader2, RotateCcw, BookOpen, Target,
} from 'lucide-react';
import api from '../../../../lib/api';

interface Option        { id: string; text: string; isCorrect?: boolean; }
interface QuestionDetail {
  id: string; text: string; type: string; options: Option[];
  explanation?: string; selectedOptionId: string | null;
  isCorrect: boolean; subjectId: string; topic?: string;
}
interface SubjectScore  {
  subjectId: string; subjectName: string; correctCount: number;
  totalCount: number; score: number; totalMarks: number; percentage: number;
}
interface AttemptResult {
  id: string; testTitle?: string; score: number; percentage: number;
  correctCount: number; wrongCount: number; skippedCount: number;
  timeUsed: number; totalTime: number; isPassed: boolean;
  subjectScores?: SubjectScore[]; questions?: QuestionDetail[];
}

function formatSecs(s: number) {
  const m = Math.floor(s / 60); const sec = s % 60;
  return `${m}m ${sec.toString().padStart(2, '0')}s`;
}

function ScoreRing({ percentage }: { percentage: number }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 200); return () => clearTimeout(t); }, []);
  const r             = 54;
  const circumference = 2 * Math.PI * r;
  const offset        = circumference - ((animated ? percentage : 0) / 100) * circumference;
  const color         = percentage >= 70 ? '#059669' : percentage >= 50 ? '#2563EB' : '#DC2626';
  const glow          = percentage >= 70 ? 'rgba(5,150,105,0.4)' : percentage >= 50 ? 'rgba(37,99,235,0.4)' : 'rgba(220,38,38,0.3)';

  return (
    <div style={{ position: 'relative', width: 160, height: 160 }}>
      <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)', filter: `drop-shadow(0 0 12px ${glow})` }} viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="9" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="9"
          strokeLinecap="round" strokeDasharray={circumference}
          strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 30, fontWeight: 900, color: 'var(--slate-900)', lineHeight: 1, letterSpacing: '-0.03em' }}>{percentage.toFixed(0)}%</span>
        <span style={{ fontSize: 10, color: 'var(--slate-400)', fontWeight: 700, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Score</span>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  const router    = useRouter();
  const params    = useParams();
  const attemptId = params?.id as string;

  const [result,       setResult]       = useState<AttemptResult | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [expandedQId,  setExpandedQId]  = useState<string | null>(null);
  const [filterMode,   setFilterMode]   = useState<'ALL' | 'WRONG' | 'CORRECT'>('ALL');

  useEffect(() => {
    if (!attemptId) return;
    api.get(`/attempts/${attemptId}`)
      .then((res) => setResult(res.data.data.result))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [attemptId]);

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
      <Loader2 style={{ width: 28, height: 28, color: 'var(--blue-600)', animation: 'spin 0.7s linear infinite' }} />
      <div style={{ fontSize: 13, color: 'var(--slate-400)', fontWeight: 600 }}>Loading results & corrections…</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!result) return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--slate-700)' }}>Attempt record not found</div>
      <button onClick={() => router.push('/dashboard/tests')} style={{ padding: '10px 20px', borderRadius: 11, background: 'var(--blue-600)', color: 'white', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
        Return to Tests
      </button>
    </div>
  );

  const questionsList     = result.questions || [];
  const filteredQuestions = questionsList.filter((q) => {
    if (filterMode === 'CORRECT') return q.isCorrect;
    if (filterMode === 'WRONG')   return !q.isCorrect;
    return true;
  });

  const pct   = result.percentage;
  const grade = pct >= 70 ? { label: 'Excellent!', color: '#059669', bg: '#ECFDF5', border: 'rgba(5,150,105,0.2)' }
              : pct >= 50 ? { label: 'Good effort', color: '#2563EB', bg: '#EFF6FF', border: 'rgba(37,99,235,0.2)' }
              : { label: 'Keep practicing', color: '#DC2626', bg: '#FEF2F2', border: 'rgba(220,38,38,0.2)' };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 48 }}>

      {/* Back */}
      <button onClick={() => router.push('/dashboard/tests')} style={{
        display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 14px',
        borderRadius: 10, border: '1px solid var(--slate-200)', background: 'white',
        fontSize: 12, fontWeight: 700, color: 'var(--slate-600)', cursor: 'pointer',
        alignSelf: 'flex-start', transition: 'all 0.15s',
      }}>
        <ArrowLeft style={{ width: 14, height: 14 }} /> Back to Tests
      </button>

      {/* ── Hero Result Card ──────────────────────────────── */}
      <div style={{
        borderRadius: 24, overflow: 'hidden',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.14)',
        position: 'relative',
      }}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, ${grade.color}18 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: '30%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, padding: '36px 32px' }}>
          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 14px', borderRadius: 100,
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
              fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.6)',
              textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12,
            }}>
              ✦ Practice CBT Result
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: 'white', letterSpacing: '-0.025em', margin: '0 0 6px' }}>
              {result.testTitle || 'Custom Practice Exam'}
            </h1>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Your performance breakdown is below</div>
          </div>

          {/* Score Ring + Grade + Stats Row */}
          <div className="result-hero-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40, flexWrap: 'wrap' }}>
            {/* Ring */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              {/* Wrap ScoreRing in a white background circle for contrast */}
              <div style={{ background: 'white', borderRadius: '50%', padding: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                <ScoreRing percentage={pct} />
              </div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 16px',
                borderRadius: 100, background: grade.bg, border: `1px solid ${grade.border}`,
                fontSize: 12, fontWeight: 800, color: grade.color,
              }}>
                {result.isPassed ? <Trophy style={{ width: 13, height: 13 }} /> : <Target style={{ width: 13, height: 13 }} />}
                {grade.label}
              </div>
            </div>

            {/* Quick stats */}
            <div className="result-stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { icon: '✓', label: 'Correct',  value: result.correctCount,  color: '#34D399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.2)'  },
                { icon: '✕', label: 'Wrong',    value: result.wrongCount,    color: '#F87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)' },
                { icon: '⤸', label: 'Skipped',  value: result.skippedCount,  color: '#FBBF24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.2)'  },
                { icon: '⏱', label: 'Time Used', value: formatSecs(result.timeUsed), color: '#60A5FA', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.2)' },
              ].map((s) => (
                <div key={s.label} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 16px', borderRadius: 14,
                  background: s.bg, border: `1px solid ${s.border}`,
                }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: s.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{s.icon}</div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: 'white', lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginTop: 3 }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Subject Breakdown ─────────────────────────────── */}
      {result.subjectScores && result.subjectScores.length > 0 && (
        <div style={{ background: 'white', borderRadius: 20, border: '1.5px solid var(--slate-200)', padding: '24px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EFF6FF', border: '1px solid rgba(37,99,235,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen style={{ width: 16, height: 16, color: 'var(--blue-600)' }} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--slate-900)' }}>Per-Subject Breakdown</div>
          </div>
          <div className="subject-breakdown-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {result.subjectScores.map((sub) => {
              const sc = sub.percentage >= 70 ? '#059669' : sub.percentage >= 50 ? '#2563EB' : '#DC2626';
              return (
                <div key={sub.subjectId} style={{ padding: '16px', borderRadius: 14, background: 'var(--slate-50)', border: '1.5px solid var(--slate-200)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--slate-900)' }}>{sub.subjectName}</div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: sc }}>{sub.percentage.toFixed(0)}%</div>
                  </div>
                  <div style={{ height: 6, background: 'var(--slate-200)', borderRadius: 100, overflow: 'hidden', marginBottom: 8 }}>
                    <div style={{ height: '100%', background: sc, borderRadius: 100, width: `${Math.min(100, sub.percentage)}%`, transition: 'width 0.8s ease' }} />
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--slate-400)', fontWeight: 600 }}>{sub.correctCount} / {sub.totalCount} correct</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Detailed Q&A Review ───────────────────────────── */}
      <div style={{ background: 'white', borderRadius: 20, border: '1.5px solid var(--slate-200)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#F5F3FF', border: '1px solid rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles style={{ width: 18, height: 18, color: '#7C3AED' }} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--slate-900)' }}>Detailed Answer Review</div>
              <div style={{ fontSize: 11, color: 'var(--slate-400)', marginTop: 2 }}>Tap any question to see full corrections & AI explanations</div>
            </div>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--slate-100)', padding: '4px', borderRadius: 12 }}>
            {(['ALL', 'WRONG', 'CORRECT'] as const).map((mode) => (
              <button key={mode} onClick={() => setFilterMode(mode)} style={{
                padding: '7px 14px', borderRadius: 9, border: 'none', cursor: 'pointer',
                background: filterMode === mode ? 'white' : 'transparent',
                color: filterMode === mode ? 'var(--slate-900)' : 'var(--slate-400)',
                fontSize: 11, fontWeight: 700, transition: 'all 0.15s',
                boxShadow: filterMode === mode ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              }}>
                {mode === 'ALL' ? `All (${questionsList.length})` : mode === 'WRONG' ? `Wrong (${questionsList.filter(q => !q.isCorrect).length})` : `Correct (${questionsList.filter(q => q.isCorrect).length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Questions */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredQuestions.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--slate-400)', fontSize: 13 }}>No questions in this filter.</div>
          )}
          {filteredQuestions.map((q, idx) => {
            const isExpanded = expandedQId === q.id;
            const status     = q.isCorrect ? 'correct' : q.selectedOptionId ? 'wrong' : 'skipped';
            const statusCfg  = {
              correct: { bg: '#F0FDF4', border: 'rgba(5,150,105,0.2)', badgeBg: '#DCFCE7', badgeColor: '#15803D', badgeLabel: '✓ Correct',    numBg: '#059669' },
              wrong:   { bg: '#FFF5F5', border: 'rgba(220,38,38,0.15)', badgeBg: '#FEE2E2', badgeColor: '#B91C1C', badgeLabel: '✕ Incorrect', numBg: '#DC2626' },
              skipped: { bg: '#FFFBEB', border: 'rgba(217,119,6,0.15)',  badgeBg: '#FEF3C7', badgeColor: '#92400E', badgeLabel: '⤸ Skipped',  numBg: '#D97706' },
            }[status];

            return (
              <div key={q.id} style={{
                borderRadius: 16, border: `1.5px solid ${statusCfg.border}`,
                background: statusCfg.bg, overflow: 'hidden', transition: 'all 0.2s',
              }}>
                {/* Q Header — always visible */}
                <div
                  onClick={() => setExpandedQId(isExpanded ? null : q.id)}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', cursor: 'pointer' }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: statusCfg.numBg, color: 'white', fontSize: 11, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    {idx + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--slate-800)', lineHeight: 1.6, margin: '0 0 8px' }}>{q.text}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: statusCfg.badgeColor, background: statusCfg.badgeBg, padding: '3px 9px', borderRadius: 20 }}>
                        {statusCfg.badgeLabel}
                      </span>
                      {q.topic && <span style={{ fontSize: 10, color: 'var(--slate-400)', fontWeight: 600 }}>Topic: {q.topic}</span>}
                    </div>
                  </div>
                  <div style={{ flexShrink: 0, color: 'var(--slate-400)', marginTop: 4 }}>
                    {isExpanded ? <ChevronUp style={{ width: 16, height: 16 }} /> : <ChevronDown style={{ width: 16, height: 16 }} />}
                  </div>
                </div>

                {/* Expanded: Options + Explanation */}
                {isExpanded && (
                  <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${statusCfg.border}`, paddingTop: 14 }}>
                    <div className="options-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                      {q.options.map((opt) => {
                        const isStudentPick = q.selectedOptionId === opt.id;
                        const isCorrectAns  = opt.isCorrect;
                        let optStyle: React.CSSProperties = {
                          padding: '10px 12px', borderRadius: 12, border: '1.5px solid',
                          fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 10,
                          background: 'white', borderColor: 'var(--slate-200)', color: 'var(--slate-700)',
                        };
                        if (isCorrectAns) optStyle = { ...optStyle, background: '#F0FDF4', borderColor: '#86EFAC', color: '#14532D' };
                        if (isStudentPick && !isCorrectAns) optStyle = { ...optStyle, background: '#FFF5F5', borderColor: '#FCA5A5', color: '#7F1D1D' };

                        return (
                          <div key={opt.id} style={optStyle}>
                            <div style={{
                              width: 24, height: 24, borderRadius: 7, flexShrink: 0,
                              background: isCorrectAns ? '#059669' : isStudentPick ? '#DC2626' : 'var(--slate-100)',
                              color: isCorrectAns || isStudentPick ? 'white' : 'var(--slate-400)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 10, fontWeight: 900,
                            }}>{opt.id}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 12 }}>{opt.text}</div>
                              <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                                {isStudentPick && (
                                  <span style={{ fontSize: 9, fontWeight: 800, background: '#1E293B', color: 'white', padding: '2px 6px', borderRadius: 4 }}>Your Pick</span>
                                )}
                                {isCorrectAns && (
                                  <span style={{ fontSize: 9, fontWeight: 800, background: '#059669', color: 'white', padding: '2px 6px', borderRadius: 4 }}>Correct</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div style={{
                        padding: '14px 16px', borderRadius: 14,
                        background: 'linear-gradient(135deg, #EEF2FF, #F5F3FF)',
                        border: '1px solid rgba(124,58,237,0.12)',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                          <Sparkles style={{ width: 13, height: 13, color: '#7C3AED' }} />
                          <span style={{ fontSize: 11, fontWeight: 800, color: '#5B21B6' }}>AI Explanation</span>
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--slate-700)', lineHeight: 1.7, margin: 0 }}>{q.explanation}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── CTA Footer ───────────────────────────────────── */}
      <div style={{
        borderRadius: 20, padding: '24px 28px',
        background: 'linear-gradient(135deg, #0F172A, #1E293B)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 900, color: 'white', marginBottom: 4 }}>Ready for another round?</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Practice makes perfect — keep sharpening your skills.</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => router.push('/dashboard/analytics')} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            height: 42, padding: '0 18px', borderRadius: 12,
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}>
            <Target style={{ width: 14, height: 14 }} /> Analytics
          </button>
          <button onClick={() => router.push('/dashboard/tests')} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            height: 42, padding: '0 20px', borderRadius: 12, border: 'none',
            background: '#2563EB', color: 'white', fontSize: 12, fontWeight: 800, cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(37,99,235,0.4)',
          }}>
            <RotateCcw style={{ width: 14, height: 14 }} /> Try Again
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 700px) {
          .result-hero-inner      { gap: 24px !important; }
          .result-stats-grid      { grid-template-columns: 1fr 1fr !important; }
          .subject-breakdown-grid { grid-template-columns: 1fr !important; }
          .options-grid           { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .result-stats-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}
