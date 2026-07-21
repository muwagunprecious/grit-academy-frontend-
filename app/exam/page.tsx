'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Clock, ChevronLeft, ChevronRight, Flag, CheckCircle2, Loader2, BookOpen, AlertTriangle, X } from 'lucide-react';
import api from '../../lib/api';

interface Option   { id: string; text: string; }
interface Question { id: string; order: number; text: string; type: string; options: Option[]; subjectId: string; subjectName?: string; topic?: string; }
interface SubjectTab { id: string; name: string; }

const ALPHA = ['A', 'B', 'C', 'D', 'E'];

export default function CustomExamPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const attemptId    = searchParams.get('attemptId');

  const [questions,         setQuestions]         = useState<Question[]>([]);
  const [subjects,          setSubjects]           = useState<SubjectTab[]>([]);
  const [activeSubjectId,   setActiveSubjectId]    = useState<string>('');
  const [currentQIndex,     setCurrentQIndex]      = useState(0);
  const [answers,           setAnswers]            = useState<Record<string, string>>({});
  const [flagged,           setFlagged]            = useState<Set<string>>(new Set());
  const [timeLeft,          setTimeLeft]           = useState(30 * 60);
  const [totalDurationSecs, setTotalDurationSecs]  = useState(30 * 60);
  const [loading,           setLoading]            = useState(true);
  const [submitting,        setSubmitting]         = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm]  = useState(false);
  const [showQNav,          setShowQNav]           = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!attemptId) { router.push('/dashboard/tests'); return; }
    api.get(`/attempts/${attemptId}`)
      .then((res) => {
        const attempt = res.data.data.result;
        const qList: Question[] = attempt.questions || [];
        setQuestions(qList);
        const subMap = new Map<string, string>();
        qList.forEach((q) => { if (q.subjectId) subMap.set(q.subjectId, q.subjectName || 'Subject'); });
        const subTabs: SubjectTab[] = Array.from(subMap.entries()).map(([id, name]) => ({ id, name }));
        setSubjects(subTabs);
        if (subTabs.length > 0) setActiveSubjectId(subTabs[0].id);
        const totalSecs = attempt.totalTime || 30 * 60;
        setTotalDurationSecs(totalSecs);
        setTimeLeft(totalSecs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [attemptId, router]);

  const handleSubmit = useCallback(async () => {
    if (!attemptId) return;
    setSubmitting(true);
    try {
      const payloadAnswers = Object.entries(answers).map(([qId, optId]) => ({ questionId: qId, selectedOptionId: optId }));
      const timeUsed = totalDurationSecs - timeLeft;
      await api.post(`/attempts/${attemptId}/submit`, { answers: payloadAnswers, timeUsed });
      router.push(`/dashboard/results/${attemptId}`);
    } catch {
      router.push(`/dashboard/results/${attemptId}`);
    } finally {
      setSubmitting(false);
    }
  }, [attemptId, answers, totalDurationSecs, timeLeft, router]);

  useEffect(() => {
    if (loading || timeLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => { if (t <= 1) { clearInterval(timerRef.current!); handleSubmit(); return 0; } return t - 1; });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [loading, timeLeft, handleSubmit]);

  const formatTime = (secs: number) => `${Math.floor(secs / 60).toString().padStart(2, '0')}:${(secs % 60).toString().padStart(2, '0')}`;

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0B1120', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(37,99,235,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 style={{ width: 22, height: 22, color: '#60A5FA', animation: 'spin 0.7s linear infinite' }} />
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>Preparing your CBT exam environment…</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const activeSubjectQuestions = questions.filter((q) => q.subjectId === activeSubjectId);
  const currentQuestion        = activeSubjectQuestions[currentQIndex] || questions[0];
  const totalAnswered          = Object.keys(answers).length;
  const isUrgent               = timeLeft < 300;
  const timerPct               = (timeLeft / totalDurationSecs) * 100;

  return (
    <div style={{ minHeight: '100vh', background: '#0B1120', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font, system-ui)' }}>

      {/* ── Header ───────────────────────────────────────── */}
      <header style={{
        height: 58, flexShrink: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 16px',
        background: 'rgba(255,255,255,0.03)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13, color: 'white', boxShadow: '0 0 16px rgba(37,99,235,0.5)', flexShrink: 0 }}>G</div>
          <span style={{ fontSize: 13, fontWeight: 800, color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.02em' }} className="exam-brand">Grit Academy CBT</span>
        </div>

        {/* Timer */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '7px 14px', borderRadius: 100,
          background: isUrgent ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)',
          border: `1px solid ${isUrgent ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)'}`,
          fontSize: 14, fontWeight: 900, letterSpacing: '0.04em',
          color: isUrgent ? '#F87171' : '#60A5FA',
          animation: isUrgent ? 'pulse 1s ease-in-out infinite' : 'none',
        }}>
          <Clock style={{ width: 14, height: 14, flexShrink: 0 }} />
          {formatTime(timeLeft)}
        </div>

        {/* Submit btn */}
        <button
          onClick={() => setShowSubmitConfirm(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            height: 36, padding: '0 16px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg, #059669, #047857)',
            color: 'white', fontSize: 12, fontWeight: 800, cursor: 'pointer',
            boxShadow: '0 0 20px rgba(5,150,105,0.4)',
          }}
        >
          <CheckCircle2 style={{ width: 14, height: 14 }} />
          <span className="exam-submit-label">Submit Exam</span>
        </button>
      </header>

      {/* Timer progress bar */}
      <div style={{ height: 2, background: 'rgba(255,255,255,0.05)', flexShrink: 0 }}>
        <div style={{
          height: '100%', borderRadius: 1,
          background: isUrgent ? '#EF4444' : 'linear-gradient(90deg, #2563EB, #7C3AED)',
          width: `${timerPct}%`, transition: 'width 1s linear',
        }} />
      </div>

      {/* ── Subject Tabs ───────────────────────────────────── */}
      <div style={{
        background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', flexShrink: 0, marginRight: 4 }}>Subjects:</span>
        {subjects.map((sub) => {
          const isActive   = activeSubjectId === sub.id;
          const subQs      = questions.filter((q) => q.subjectId === sub.id);
          const subAnswered = subQs.filter((q) => !!answers[q.id]).length;
          return (
            <button key={sub.id}
              onClick={() => { setActiveSubjectId(sub.id); setCurrentQIndex(0); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '6px 13px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: isActive ? '#2563EB' : 'rgba(255,255,255,0.05)',
                color: isActive ? 'white' : 'rgba(255,255,255,0.45)',
                fontSize: 12, fontWeight: 800, flexShrink: 0, transition: 'all 0.18s',
                boxShadow: isActive ? '0 0 16px rgba(37,99,235,0.4)' : 'none',
              }}
            >
              {sub.name}
              <span style={{
                fontSize: 10, padding: '2px 7px', borderRadius: 6, fontWeight: 700,
                background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)',
                color: isActive ? 'white' : 'rgba(255,255,255,0.4)',
              }}>{subAnswered}/{subQs.length}</span>
            </button>
          );
        })}

        {/* Q Nav toggle on mobile */}
        <button
          onClick={() => setShowQNav(v => !v)}
          className="exam-qnav-btn"
          style={{
            display: 'none', marginLeft: 'auto', padding: '6px 12px', borderRadius: 10,
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 700, cursor: 'pointer', flexShrink: 0,
          }}
        >
          <BookOpen style={{ width: 13, height: 13, display: 'inline', marginRight: 4 }} />
          Q {currentQIndex + 1}/{activeSubjectQuestions.length}
        </button>
      </div>

      {/* ── Main Area ──────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Question Panel */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 820, margin: '0 auto', width: '100%' }}>
          {currentQuestion ? (
            <>
              {/* Question Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 10, background: 'rgba(37,99,235,0.15)',
                    border: '1px solid rgba(37,99,235,0.3)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 13, fontWeight: 900, color: '#60A5FA', flexShrink: 0,
                  }}>{currentQIndex + 1}</div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#60A5FA', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                      {currentQuestion.subjectName || 'Question'}
                    </div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>
                      {currentQIndex + 1} of {activeSubjectQuestions.length}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setFlagged((prev) => {
                    const next = new Set(prev);
                    next.has(currentQuestion.id) ? next.delete(currentQuestion.id) : next.add(currentQuestion.id);
                    return next;
                  })}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '7px 13px', borderRadius: 10, border: 'none', cursor: 'pointer',
                    background: flagged.has(currentQuestion.id) ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.05)',
                    color: flagged.has(currentQuestion.id) ? '#FCD34D' : 'rgba(255,255,255,0.4)',
                    fontSize: 11, fontWeight: 700, transition: 'all 0.15s',
                  }}
                >
                  <Flag style={{ width: 13, height: 13 }} />
                  {flagged.has(currentQuestion.id) ? 'Flagged' : 'Flag'}
                </button>
              </div>

              {/* Question Card */}
              <div style={{
                background: 'rgba(255,255,255,0.04)', borderRadius: 20,
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '24px', backdropFilter: 'blur(4px)',
              }}>
                <p style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.92)', lineHeight: 1.7, margin: 0 }}>
                  {currentQuestion.text}
                </p>
                {currentQuestion.topic && (
                  <div style={{ marginTop: 12, fontSize: 10, color: 'rgba(255,255,255,0.25)', fontWeight: 600 }}>
                    Topic: {currentQuestion.topic}
                  </div>
                )}
              </div>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {currentQuestion.options.map((opt, i) => {
                  const isSelected = answers[currentQuestion.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setAnswers((prev) => ({ ...prev, [currentQuestion.id]: opt.id }))}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: 14,
                        padding: '16px 18px', borderRadius: 16, border: 'none',
                        background: isSelected ? 'rgba(37,99,235,0.2)' : 'rgba(255,255,255,0.04)',
                        outline: isSelected ? '1.5px solid rgba(37,99,235,0.6)' : '1.5px solid rgba(255,255,255,0.07)',
                        cursor: 'pointer', textAlign: 'left', width: '100%',
                        transition: 'all 0.18s',
                        boxShadow: isSelected ? '0 0 20px rgba(37,99,235,0.2)' : 'none',
                      }}
                    >
                      <div style={{
                        width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                        background: isSelected ? '#2563EB' : 'rgba(255,255,255,0.07)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 900,
                        color: isSelected ? 'white' : 'rgba(255,255,255,0.4)',
                        transition: 'all 0.18s',
                        boxShadow: isSelected ? '0 0 12px rgba(37,99,235,0.5)' : 'none',
                      }}>{ALPHA[i] || opt.id}</div>
                      <span style={{
                        fontSize: 14, fontWeight: 500, lineHeight: 1.6, paddingTop: 5,
                        color: isSelected ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.6)',
                        transition: 'color 0.15s',
                      }}>{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Controls */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)',
              }}>
                <button
                  onClick={() => setCurrentQIndex((q) => Math.max(0, q - 1))}
                  disabled={currentQIndex === 0}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '10px 18px', borderRadius: 11, border: 'none',
                    background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)',
                    fontSize: 12, fontWeight: 700, cursor: currentQIndex === 0 ? 'not-allowed' : 'pointer',
                    opacity: currentQIndex === 0 ? 0.4 : 1, transition: 'all 0.15s',
                  }}
                >
                  <ChevronLeft style={{ width: 15, height: 15 }} /> Prev
                </button>

                {/* Dot progress indicators */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 200 }}>
                  {activeSubjectQuestions.slice(0, 10).map((q, i) => (
                    <button key={q.id} onClick={() => setCurrentQIndex(i)} style={{
                      width: i === currentQIndex ? 20 : 8, height: 8, borderRadius: 4, border: 'none',
                      background: i === currentQIndex ? '#2563EB' : answers[q.id] ? '#059669' : flagged.has(q.id) ? '#F59E0B' : 'rgba(255,255,255,0.15)',
                      cursor: 'pointer', transition: 'all 0.2s', padding: 0,
                    }} />
                  ))}
                  {activeSubjectQuestions.length > 10 && <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>+{activeSubjectQuestions.length - 10}</span>}
                </div>

                {currentQIndex < activeSubjectQuestions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQIndex((q) => Math.min(activeSubjectQuestions.length - 1, q + 1))}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 7,
                      padding: '10px 18px', borderRadius: 11, border: 'none',
                      background: '#2563EB', color: 'white',
                      fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      boxShadow: '0 0 16px rgba(37,99,235,0.4)', transition: 'all 0.15s',
                    }}
                  >
                    Next <ChevronRight style={{ width: 15, height: 15 }} />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowSubmitConfirm(true)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 7,
                      padding: '10px 18px', borderRadius: 11, border: 'none',
                      background: 'linear-gradient(135deg, #059669, #047857)', color: 'white',
                      fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      boxShadow: '0 0 16px rgba(5,150,105,0.4)',
                    }}
                  >
                    <CheckCircle2 style={{ width: 14, height: 14 }} /> Finish
                  </button>
                )}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
              Select a subject tab to begin
            </div>
          )}
        </main>

        {/* ── Question Grid Sidebar (Desktop) ─────────────── */}
        <aside className="exam-sidebar" style={{
          width: 220, flexShrink: 0, overflowY: 'auto', padding: '20px 16px',
          borderLeft: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.02)',
        }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>
            Question Navigator
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {[
              { color: '#2563EB', label: 'Current' },
              { color: '#059669', label: 'Answered' },
              { color: '#F59E0B', label: 'Flagged' },
              { color: 'rgba(255,255,255,0.1)', label: 'Unanswered' },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color }} />
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>{l.label}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
            {activeSubjectQuestions.map((q, i) => (
              <button key={q.id} onClick={() => setCurrentQIndex(i)} style={{
                width: '100%', aspectRatio: '1', borderRadius: 8, border: 'none',
                background: i === currentQIndex ? '#2563EB' : answers[q.id] ? '#059669' : flagged.has(q.id) ? '#F59E0B' : 'rgba(255,255,255,0.07)',
                color: i === currentQIndex || answers[q.id] || flagged.has(q.id) ? 'white' : 'rgba(255,255,255,0.4)',
                fontSize: 10, fontWeight: 800, cursor: 'pointer',
                boxShadow: i === currentQIndex ? '0 0 10px rgba(37,99,235,0.5)' : 'none',
                transition: 'all 0.15s',
              }}>{i + 1}</button>
            ))}
          </div>

          {/* Summary */}
          <div style={{ marginTop: 20, padding: '14px', borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Progress</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: 'white', lineHeight: 1 }}>{totalAnswered}<span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>/{questions.length}</span></div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>Questions answered</div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 100, marginTop: 12, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#2563EB', borderRadius: 100, width: `${questions.length ? (totalAnswered / questions.length) * 100 : 0}%`, transition: 'width 0.4s ease' }} />
            </div>
          </div>
        </aside>
      </div>

      {/* ── Submit Modal ───────────────────────────────────── */}
      {showSubmitConfirm && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setShowSubmitConfirm(false); }}
          style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
          <div style={{
            background: '#111827', borderRadius: 24, padding: '32px 28px',
            width: '100%', maxWidth: 400,
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 32px 64px rgba(0,0,0,0.5)',
          }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(5,150,105,0.15)', border: '1px solid rgba(5,150,105,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle2 style={{ width: 24, height: 24, color: '#34D399' }} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: 'white', margin: '0 0 8px' }}>Submit Exam?</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, margin: 0 }}>
                You've answered <strong style={{ color: 'white' }}>{totalAnswered}</strong> of <strong style={{ color: 'white' }}>{questions.length}</strong> questions.
                {totalAnswered < questions.length && <span style={{ color: '#FBBF24' }}> {questions.length - totalAnswered} unanswered.</span>}
              </p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
              {[
                { label: 'Answered', value: totalAnswered, color: '#34D399' },
                { label: 'Flagged',  value: flagged.size, color: '#FBBF24' },
                { label: 'Skipped',  value: questions.length - totalAnswered, color: '#F87171' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center', padding: '12px 8px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 600, marginTop: 3 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowSubmitConfirm(false)} style={{
                flex: 1, height: 46, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}>Continue Test</button>
              <button onClick={handleSubmit} disabled={submitting} style={{
                flex: 1, height: 46, borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #059669, #047857)', color: 'white',
                fontSize: 13, fontWeight: 800, cursor: submitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 20px rgba(5,150,105,0.4)', opacity: submitting ? 0.7 : 1,
              }}>
                {submitting ? 'Submitting…' : 'Submit Now →'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{ opacity:1; } 50%{ opacity:0.6; } }

        @media (max-width: 768px) {
          .exam-sidebar   { display: none !important; }
          .exam-qnav-btn  { display: flex !important; }
          .exam-brand     { display: none !important; }
        }
        @media (max-width: 480px) {
          .exam-submit-label { display: none; }
        }
      `}</style>
    </div>
  );
}
