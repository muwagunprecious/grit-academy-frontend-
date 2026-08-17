'use client';

import React, { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  CheckCircle2,
  Loader2,
  BookOpen,
  AlertTriangle,
  X,
  Image as ImageIcon,
  HelpCircle,
} from 'lucide-react';
import api from '../../lib/api';
import DiagramModal from '../components/DiagramModal';
import PassageModal from '../components/PassageModal';

interface Option   { id: string; text: string; }
interface Question { id: string; order: number; text: string; passage?: string | null; imageUrl?: string | null; type: string; options: Option[]; subjectId: string; subjectName?: string; topic?: string; }
interface SubjectTab { id: string; name: string; }

const ALPHA = ['A', 'B', 'C', 'D', 'E'];

const DEFAULT_ENGLISH_STORY = `A hungry Wolf once saw a Lamb drinking water at a stream far down below. Seeking a pretext to devour the innocent Lamb, the Wolf called out angrily: "How dare you muddle the water I am drinking?"\n\nThe Lamb replied humbly: "Sir, I am drinking far downstream from you, so the water flows from you to me, not from me to you."\n\nSeeing his initial excuse fail, the Wolf snarled: "Well, last year you slandered me!"\n\n"Sir," pleaded the Lamb, "I was not even born last year!"\n\n"Then it must have been your father or your forefather who spoke ill of me!" roared the Wolf, and without waiting another moment, he pounced upon the helpless Lamb and devoured him.`;

function isDiagramQuestion(text: string, imageUrl?: string | null): boolean {
  if (imageUrl) return true;
  return /diagram|figure|illustration|circuit|capacitors?\s+[pq]|capacitance|graph\s+below|shown\s+below/i.test(text);
}

function getQuestionPassage(q?: Question | null): string | null {
  if (!q) return null;
  if (q.passage && q.passage.trim().length > 10) return q.passage;
  const lower = q.text.toLowerCase();
  if (lower.includes('passage') || lower.includes('story') || lower.includes('moral of the story') || lower.includes('wolf') || lower.includes('lamb') || lower.includes('comprehension')) {
    return DEFAULT_ENGLISH_STORY;
  }
  return null;
}

function ExamContent() {
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
  const [showPassage,       setShowPassage]        = useState(true);
  const [showDiagramModal,  setShowDiagramModal]   = useState(false);
  const [showPassageModal,  setShowPassageModal]   = useState(false);
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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFFFF', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 style={{ width: 20, height: 20, color: '#0F172A', animation: 'spin 0.7s linear infinite' }} />
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#64748B' }}>Loading CBT Examination Engine…</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const activeSubjectQuestions = questions.filter((q) => q.subjectId === activeSubjectId);
  const currentQuestion        = activeSubjectQuestions[currentQIndex] || questions[0];
  const totalAnswered          = Object.keys(answers).length;
  const isUrgent               = timeLeft < 300;
  const timerPct               = (timeLeft / totalDurationSecs) * 100;

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', color: '#0F172A', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font, system-ui)' }}>

      {/* ── Header ───────────────────────────────────────── */}
      <header style={{
        height: 60, flexShrink: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 24px',
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 15, color: 'white' }}>G</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, color: '#0F172A', letterSpacing: '-0.025em' }} className="exam-brand">Grit CBT Examination Engine</div>
            <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>JAMB / WAEC Standard Test</div>
          </div>
        </div>

        {/* Timer */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 16px', borderRadius: 20,
          background: isUrgent ? '#FEF2F2' : '#F1F5F9',
          border: `1px solid ${isUrgent ? '#DC2626' : '#E2E8F0'}`,
          fontSize: 14, fontWeight: 900, letterSpacing: '0.03em',
          color: isUrgent ? '#DC2626' : '#0F172A',
        }}>
          <Clock style={{ width: 15, height: 15, flexShrink: 0, color: isUrgent ? '#DC2626' : '#475569' }} />
          {formatTime(timeLeft)}
        </div>

        {/* Submit Exam Button */}
        <button
          onClick={() => setShowSubmitConfirm(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            height: 38, padding: '0 18px', borderRadius: 10, border: 'none',
            background: '#0F172A',
            color: 'white', fontSize: 12, fontWeight: 800, cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(15,23,42,0.12)',
            transition: 'all 0.15s ease',
          }}
        >
          <CheckCircle2 style={{ width: 15, height: 15 }} />
          <span className="exam-submit-label">Submit Exam</span>
        </button>
      </header>

      {/* Timer Progress Line */}
      <div style={{ height: 2, background: '#E2E8F0', flexShrink: 0 }}>
        <div style={{
          height: '100%',
          background: isUrgent ? '#DC2626' : '#0F172A',
          width: `${timerPct}%`, transition: 'width 1s linear',
        }} />
      </div>

      {/* ── Subject Tabs ───────────────────────────────────── */}
      <div style={{
        background: '#FFFFFF', borderBottom: '1px solid #E2E8F0',
        padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 10, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0, marginRight: 4 }}>Subjects:</span>
        {subjects.map((sub) => {
          const isActive    = activeSubjectId === sub.id;
          const subQs       = questions.filter((q) => q.subjectId === sub.id);
          const subAnswered = subQs.filter((q) => !!answers[q.id]).length;
          return (
            <button key={sub.id}
              onClick={() => { setActiveSubjectId(sub.id); setCurrentQIndex(0); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 14px', borderRadius: 8, border: '1px solid',
                borderColor: isActive ? '#0F172A' : '#E2E8F0',
                background: isActive ? '#0F172A' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : '#64748B',
                fontSize: 12, fontWeight: isActive ? 800 : 600, flexShrink: 0, transition: 'all 0.15s ease',
                cursor: 'pointer',
              }}
            >
              {sub.name}
              <span style={{
                fontSize: 10, padding: '2px 6px', borderRadius: 4, fontWeight: 700,
                background: isActive ? 'rgba(255,255,255,0.2)' : '#F1F5F9',
                color: isActive ? '#FFFFFF' : '#64748B',
              }}>{subAnswered}/{subQs.length}</span>
            </button>
          );
        })}

        {/* Mobile Q Nav toggle */}
        <button
          onClick={() => setShowQNav(v => !v)}
          className="exam-qnav-btn"
          style={{
            display: 'none', marginLeft: 'auto', padding: '6px 12px', borderRadius: 8,
            background: '#F1F5F9', border: '1px solid #E2E8F0',
            color: '#0F172A', fontSize: 11, fontWeight: 700, cursor: 'pointer', flexShrink: 0,
          }}
        >
          <BookOpen style={{ width: 13, height: 13, display: 'inline', marginRight: 4 }} />
          Q {currentQIndex + 1}/{activeSubjectQuestions.length}
        </button>
      </div>

      {/* ── Main Workspace ──────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Question Area */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 840, margin: '0 auto', width: '100%' }}>
          {currentQuestion ? (
            <>
              {/* Question Control Line */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, background: '#0F172A',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 900, color: 'white', flexShrink: 0,
                  }}>{currentQIndex + 1}</div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {currentQuestion.subjectName || 'Question'}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748B', marginTop: 1, fontWeight: 500 }}>
                      Question {currentQIndex + 1} of {activeSubjectQuestions.length}
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
                    padding: '6px 14px', borderRadius: 8, border: '1px solid',
                    borderColor: flagged.has(currentQuestion.id) ? '#F59E0B' : '#E2E8F0',
                    background: flagged.has(currentQuestion.id) ? '#FFFBEB' : '#FFFFFF',
                    color: flagged.has(currentQuestion.id) ? '#B45309' : '#64748B',
                    fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s ease',
                  }}
                >
                  <Flag style={{ width: 14, height: 14 }} />
                  {flagged.has(currentQuestion.id) ? 'Flagged for Review' : 'Flag Question'}
                </button>
              </div>

              {/* Passage Card */}
              {currentQuestion.passage && (
                <div style={{
                  background: '#FFFFFF',
                  borderRadius: 16,
                  border: '1px solid #E2E8F0',
                  padding: '20px 24px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <BookOpen style={{ width: 16, height: 16, color: '#0F172A' }} />
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Reading Passage
                      </span>
                    </div>
                    <button
                      onClick={() => setShowPassage(v => !v)}
                      style={{
                        padding: '4px 10px', borderRadius: 6, border: '1px solid #E2E8F0',
                        background: '#F8FAFC', color: '#64748B',
                        fontSize: 11, fontWeight: 700, cursor: 'pointer',
                      }}
                    >
                      {showPassage ? 'Minimize' : 'Read Passage'}
                    </button>
                  </div>

                  {showPassage && (
                    <div style={{
                      maxHeight: 260, overflowY: 'auto', paddingRight: 8,
                      fontSize: 13, fontWeight: 400, color: '#334155',
                      lineHeight: 1.75, whiteSpace: 'pre-line',
                      background: '#F8FAFC', padding: '16px', borderRadius: 10,
                      border: '1px solid #E2E8F0',
                    }}>
                      {currentQuestion.passage}
                    </div>
                  )}
                </div>
              )}

              {/* Question Body Card */}
              <div style={{
                background: '#FFFFFF', borderRadius: 16,
                border: '1px solid #E2E8F0',
                padding: '26px 28px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}>
                <p style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', lineHeight: 1.7, margin: 0 }}>
                  {currentQuestion.text}
                </p>

                {/* Additional Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 18 }}>
                  {getQuestionPassage(currentQuestion) && (
                    <button
                      onClick={() => setShowPassageModal(true)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '8px 16px', borderRadius: 8, border: '1px solid #E2E8F0',
                        background: '#F8FAFC', color: '#0F172A', fontSize: 12, fontWeight: 800, cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <BookOpen style={{ width: 14, height: 14 }} /> Read Full Passage
                    </button>
                  )}

                  {isDiagramQuestion(currentQuestion.text, currentQuestion.imageUrl) && (
                    <button
                      onClick={() => setShowDiagramModal(true)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '8px 16px', borderRadius: 8, border: '1px solid #E2E8F0',
                        background: '#F8FAFC', color: '#0F172A', fontSize: 12, fontWeight: 800, cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <ImageIcon style={{ width: 14, height: 14 }} /> View Diagram / Schematic
                    </button>
                  )}
                </div>

                {currentQuestion.topic && (
                  <div style={{ marginTop: 14, fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>
                    Topic: {currentQuestion.topic}
                  </div>
                )}
              </div>

              {/* Multiple Choice Option Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {currentQuestion.options.map((opt, i) => {
                  const isSelected = answers[currentQuestion.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setAnswers((prev) => ({ ...prev, [currentQuestion.id]: opt.id }))}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: 14,
                        padding: '16px 20px', borderRadius: 12, border: '1px solid',
                        borderColor: isSelected ? '#0F172A' : '#E2E8F0',
                        background: isSelected ? '#F1F5F9' : '#FFFFFF',
                        cursor: 'pointer', textAlign: 'left', width: '100%',
                        transition: 'all 0.15s ease',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                      }}
                    >
                      <div style={{
                        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                        background: isSelected ? '#0F172A' : '#F8FAFC',
                        border: `1px solid ${isSelected ? '#0F172A' : '#E2E8F0'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 900,
                        color: isSelected ? 'white' : '#64748B',
                        transition: 'all 0.15s ease',
                      }}>{ALPHA[i] || opt.id}</div>
                      <span style={{
                        fontSize: 14, fontWeight: isSelected ? 700 : 500, lineHeight: 1.6, paddingTop: 4,
                        color: '#0F172A',
                      }}>{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Bar */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                paddingTop: 24, borderTop: '1px solid #E2E8F0', gap: 12, flexWrap: 'wrap',
              }}>
                <button
                  onClick={() => setCurrentQIndex((q) => Math.max(0, q - 1))}
                  disabled={currentQIndex === 0}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 18px', borderRadius: 8, border: '1px solid #E2E8F0',
                    background: '#FFFFFF', color: '#0F172A',
                    fontSize: 12, fontWeight: 700, cursor: currentQIndex === 0 ? 'not-allowed' : 'pointer',
                    opacity: currentQIndex === 0 ? 0.35 : 1, transition: 'all 0.15s ease',
                  }}
                >
                  <ChevronLeft style={{ width: 16, height: 16 }} /> Previous Question
                </button>

                <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>
                  Question {currentQIndex + 1} of {activeSubjectQuestions.length}
                </div>

                {(() => {
                  const currentSubIndex = subjects.findIndex((s) => s.id === activeSubjectId);
                  const nextSubject = subjects[currentSubIndex + 1];

                  if (currentQIndex < activeSubjectQuestions.length - 1) {
                    return (
                      <button
                        onClick={() => setCurrentQIndex((q) => Math.min(activeSubjectQuestions.length - 1, q + 1))}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '10px 20px', borderRadius: 8, border: 'none',
                          background: '#0F172A', color: 'white',
                          fontSize: 12, fontWeight: 800, cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(15,23,42,0.15)', transition: 'all 0.15s ease',
                        }}
                      >
                        Next Question <ChevronRight style={{ width: 16, height: 16 }} />
                      </button>
                    );
                  } else if (nextSubject) {
                    return (
                      <button
                        onClick={() => {
                          setActiveSubjectId(nextSubject.id);
                          setCurrentQIndex(0);
                        }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '10px 20px', borderRadius: 8, border: 'none',
                          background: '#0F172A', color: 'white',
                          fontSize: 12, fontWeight: 800, cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(15,23,42,0.15)', transition: 'all 0.15s ease',
                        }}
                      >
                        Next Subject: {nextSubject.name} <ChevronRight style={{ width: 16, height: 16 }} />
                      </button>
                    );
                  } else {
                    return (
                      <button
                        onClick={() => setShowSubmitConfirm(true)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '10px 20px', borderRadius: 8, border: 'none',
                          background: '#059669', color: 'white',
                          fontSize: 12, fontWeight: 800, cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(5,150,105,0.2)', transition: 'all 0.15s ease',
                        }}
                      >
                        <CheckCircle2 style={{ width: 16, height: 16 }} /> Submit Exam Now →
                      </button>
                    );
                  }
                })()}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#94A3B8', fontSize: 14 }}>
              Select a subject tab above to display questions
            </div>
          )}
        </main>

        {/* ── Question Grid Sidebar ────────────────────────── */}
        <aside className="exam-sidebar" style={{
          width: 240, flexShrink: 0, overflowY: 'auto', padding: '24px 20px',
          borderLeft: '1px solid #E2E8F0',
          background: '#FFFFFF',
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
            Question Grid
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {[
              { color: '#0F172A', label: 'Current' },
              { color: '#059669', label: 'Answered' },
              { color: '#D97706', label: 'Flagged' },
              { color: '#F1F5F9', label: 'Unanswered' },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color }} />
                <span style={{ fontSize: 10, color: '#64748B', fontWeight: 600 }}>{l.label}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
            {activeSubjectQuestions.map((q, i) => (
              <button key={q.id} onClick={() => setCurrentQIndex(i)} style={{
                width: '100%', aspectRatio: '1', borderRadius: 6, border: '1px solid',
                borderColor: i === currentQIndex ? '#0F172A' : answers[q.id] ? '#059669' : flagged.has(q.id) ? '#D97706' : '#E2E8F0',
                background: i === currentQIndex ? '#0F172A' : answers[q.id] ? '#059669' : flagged.has(q.id) ? '#FFFBEB' : '#F8FAFC',
                color: i === currentQIndex || answers[q.id] ? 'white' : flagged.has(q.id) ? '#B45309' : '#475569',
                fontSize: 11, fontWeight: 900, cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}>{i + 1}</button>
            ))}
          </div>

          {/* Overall Progress Box */}
          <div style={{ marginTop: 24, padding: '16px', borderRadius: 12, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: 10, color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Exam Progress</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>{totalAnswered}<span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>/{questions.length}</span></div>
            <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>Questions answered</div>
            <div style={{ height: 4, background: '#E2E8F0', borderRadius: 100, marginTop: 12, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#0F172A', borderRadius: 100, width: `${questions.length ? (totalAnswered / questions.length) * 100 : 0}%`, transition: 'width 0.4s ease' }} />
            </div>
          </div>
        </aside>
      </div>

      {/* ── Submit Modal ───────────────────────────────────── */}
      {showSubmitConfirm && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setShowSubmitConfirm(false); }}
          style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
          <div style={{
            background: '#FFFFFF', borderRadius: 20, padding: '32px 28px',
            width: '100%', maxWidth: 420,
            border: '1px solid #E2E8F0',
            boxShadow: '0 25px 60px rgba(0,0,0,0.15)',
          }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#ECFDF5', border: '1px solid rgba(5,150,105,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle2 style={{ width: 24, height: 24, color: '#059669' }} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', margin: '0 0 6px' }}>Submit Examination?</h3>
              <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                You have answered <strong style={{ color: '#0F172A' }}>{totalAnswered}</strong> of <strong style={{ color: '#0F172A' }}>{questions.length}</strong> questions.
                {totalAnswered < questions.length && <span style={{ color: '#DC2626' }}> {questions.length - totalAnswered} questions remain unanswered.</span>}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
              {[
                { label: 'Answered', value: totalAnswered, color: '#059669' },
                { label: 'Flagged',  value: flagged.size, color: '#D97706' },
                { label: 'Skipped',  value: questions.length - totalAnswered, color: '#DC2626' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center', padding: '12px 8px', borderRadius: 10, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: '#64748B', fontWeight: 600, marginTop: 3 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowSubmitConfirm(false)} style={{
                flex: 1, height: 44, borderRadius: 10, border: '1px solid #E2E8F0',
                background: '#FFFFFF', color: '#0F172A',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}>Return to Exam</button>
              <button onClick={handleSubmit} disabled={submitting} style={{
                flex: 1, height: 44, borderRadius: 10, border: 'none',
                background: '#059669', color: 'white',
                fontSize: 13, fontWeight: 800, cursor: submitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 16px rgba(5,150,105,0.2)', opacity: submitting ? 0.7 : 1,
              }}>
                {submitting ? 'Submitting…' : 'Confirm Submit →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Diagram Modal */}
      {currentQuestion && (
        <DiagramModal
          isOpen={showDiagramModal}
          onClose={() => setShowDiagramModal(false)}
          questionText={currentQuestion.text}
          imageUrl={currentQuestion.imageUrl}
        />
      )}

      {/* Passage Modal */}
      {currentQuestion && (
        <PassageModal
          isOpen={showPassageModal}
          onClose={() => setShowPassageModal(false)}
          passageText={getQuestionPassage(currentQuestion) || ''}
          questionText={currentQuestion.text}
        />
      )}

      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
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

export default function CustomExamPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 10, color: '#64748B', background: '#FFFFFF' }}>
        <Loader2 size={20} className="animate-spin" /> Loading exam...
      </div>
    }>
      <ExamContent />
    </Suspense>
  );
}
