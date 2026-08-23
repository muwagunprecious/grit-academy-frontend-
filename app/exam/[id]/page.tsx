'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  AlertTriangle,
  CheckCircle,
  X,
  Zap,
  BookOpen,
  Award,
  Sparkles,
  ArrowRight,
  LayoutGrid,
  RotateCcw,
  ShieldAlert
} from 'lucide-react';
import api from '../../../lib/api';
import MathText from '../../components/MathText';

interface Question {
  id: string;
  text: string;
  options: { id: string; text: string }[];
  marks: number;
  topic?: string;
}

interface TestData {
  id: string;
  title: string;
  duration: number;
  totalQuestions: number;
  negativeMarking: boolean;
  negativeScore: number;
  instructions: string | null;
  questions: Question[];
}

export default function ExamPage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = React.use(params instanceof Promise ? params : Promise.resolve(params));
  const testId = resolvedParams?.id;

  const [test, setTest] = useState<TestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showNavigatorMobile, setShowNavigatorMobile] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!testId) return;
    const fetchTest = async () => {
      try {
        const res = await api.get(`/tests/${testId}`);
        const data = res.data?.data?.test || res.data?.data;
        if (!data || !data.questions) {
          throw new Error('Invalid test payload');
        }

        const formatOptions = (rawOpts: any) => {
          if (!rawOpts) return [];
          let parsed = rawOpts;
          if (typeof rawOpts === 'string') {
            try { parsed = JSON.parse(rawOpts); } catch { parsed = []; }
          }
          if (Array.isArray(parsed)) {
            return parsed.map((opt: any, idx: number) => {
              const letter = String.fromCharCode(65 + idx);
              if (typeof opt === 'string') {
                return { id: letter, text: opt };
              }
              if (opt && typeof opt === 'object') {
                return {
                  id: opt.id || opt.label || letter,
                  text: opt.text || opt.value || String(opt),
                };
              }
              return { id: letter, text: String(opt) };
            });
          }
          return [];
        };

        const formattedQuestions = data.questions.map((item: any) => {
          const q = item.question || item;
          return {
            id: q.id || item.id,
            text: q.text || 'Question content',
            options: formatOptions(q.options),
            marks: q.marks || 1,
            topic: q.topic || 'Practice Topic',
          };
        });

        const testData: TestData = {
          id: data.id,
          title: data.title || 'Practice Examination',
          duration: data.duration || 60,
          totalQuestions: formattedQuestions.length,
          negativeMarking: data.negativeMarking || false,
          negativeScore: data.negativeScore || 0,
          instructions: data.instructions || 'Answer all questions. Each question carries equal marks.',
          questions: formattedQuestions,
        };

        setTest(testData);
        setTimeLeft((data.duration || 60) * 60);
      } catch (err) {
        console.error('Failed to load test questions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [testId]);

  const handleSubmit = useCallback(async () => {
    if (!test) return;
    setSubmitting(true);
    try {
      const res = await api.post('/attempts', {
        testId: test.id,
        answers,
        timeUsed: test.duration * 60 - timeLeft,
      });
      router.push(`/dashboard/results/${res.data.data.id}`);
    } catch {
      router.push('/dashboard/results/mock-attempt-123');
    }
  }, [test, answers, timeLeft, router]);

  useEffect(() => {
    if (!started || timeLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [started, handleSubmit]);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isUrgent = timeLeft < 300;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0F172A', color: 'white', fontFamily: 'var(--font)' }}>
        <div style={{ width: 44, height: 44, border: '3px solid rgba(255,255,255,0.15)', borderTopColor: '#3B82F6', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <p style={{ marginTop: 16, fontSize: 14, fontWeight: 600, color: '#94A3B8' }}>Loading Exam Environment…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!test) return null;

  // ── WELCOME / LOBBY CARD ───────────────────────────────────────────────────
  if (!started) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'var(--font)' }}>
        <div style={{
          maxWidth: 540, width: '100%', background: 'rgba(30, 41, 59, 0.75)',
          backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 24, padding: '36px 32px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Subtle Glow Background Accent */}
          <div style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, background: 'radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />

          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 100, background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#60A5FA', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20 }}>
            <Sparkles style={{ width: 14, height: 14 }} /> AI CBT Practice Examination
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 900, color: 'white', letterSpacing: '-0.02em', lineHeight: 1.25, marginBottom: 12 }}>
            {test.title}
          </h1>

          <p style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.6, marginBottom: 28 }}>
            {test.instructions || 'Answer all questions. Each question carries equal marks. Step-by-step AI corrections will be unlocked immediately upon submission.'}
          </p>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 32 }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34D399', flexShrink: 0 }}>
                <BookOpen style={{ width: 20, height: 20 }} />
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>{test.totalQuestions}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Questions</div>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60A5FA', flexShrink: 0 }}>
                <Clock style={{ width: 20, height: 20 }} />
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>{test.duration} min</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time Limit</div>
              </div>
            </div>
          </div>

          {/* Launch Button */}
          <button
            onClick={() => setStarted(true)}
            style={{
              width: '100%', height: 52, background: 'linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)',
              color: 'white', fontSize: 15, fontWeight: 800, borderRadius: 14, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: '0 8px 24px rgba(37,99,235,0.35)', transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Launch Practice Exam <ArrowRight style={{ width: 18, height: 18 }} />
          </button>
        </div>
      </div>
    );
  }

  // ── ACTIVE CBT EXAM VIEW ──────────────────────────────────────────────────
  const question = test.questions[currentQ];
  const answered = Object.keys(answers).length;
  const unanswered = test.totalQuestions - answered;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F8FAFC', fontFamily: 'var(--font)' }}>

      {/* ── TOP STICKY BAR ──────────────────────────────────────────────────── */}
      <header style={{
        height: 64, background: '#0F172A', color: 'white', position: 'sticky', top: 0, zIndex: 40,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px',
        borderBottom: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
      }}>
        {/* Brand & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 15, color: 'white' }}>
            G
          </div>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: 14, fontWeight: 800, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {test.title}
            </h1>
            <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Question {currentQ + 1} of {test.totalQuestions}
            </div>
          </div>
        </div>

        {/* Center Timer */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '7px 16px', borderRadius: 100,
          background: isUrgent ? 'rgba(239,68,68,0.18)' : 'rgba(255,255,255,0.06)',
          border: isUrgent ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.1)',
          color: isUrgent ? '#EF4444' : '#60A5FA', fontWeight: 800, fontSize: 14, letterSpacing: '0.02em',
          animation: isUrgent ? 'pulse 1.2s infinite' : 'none',
        }}>
          <Clock style={{ width: 16, height: 16 }} />
          <span>{formatTime(timeLeft)}</span>
        </div>

        {/* Actions Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Mobile Navigator Toggle */}
          <button
            onClick={() => setShowNavigatorMobile(!showNavigatorMobile)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#CBD5E1', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            className="lg:hidden"
          >
            <LayoutGrid style={{ width: 14, height: 14 }} /> Grid
          </button>

          <button
            onClick={() => setShowSubmitConfirm(true)}
            style={{
              padding: '8px 18px', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: 'white', fontSize: 13, fontWeight: 800, borderRadius: 10, border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(16,185,129,0.25)', transition: 'all 0.15s',
            }}
          >
            Submit Exam
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div style={{ height: 4, background: '#E2E8F0', width: '100%', position: 'relative' }}>
        <div
          style={{
            height: '100%', background: 'linear-gradient(90deg, #2563EB 0%, #4F46E5 100%)',
            width: `${((currentQ + 1) / test.totalQuestions) * 100}%`,
            transition: 'width 0.3s ease-out',
          }}
        />
      </div>

      {/* ── MAIN BODY ───────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Question & Answer Area */}
        <main style={{ flex: 1, padding: '32px 28px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 960, margin: '0 auto', width: '100%' }}>

          {/* Question Header Pill Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ padding: '4px 12px', borderRadius: 8, background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1D4ED8', fontSize: 12, fontWeight: 800 }}>
                Question {currentQ + 1}
              </span>
              {question.topic && (
                <span style={{ padding: '4px 12px', borderRadius: 8, background: '#F1F5F9', border: '1px solid #E2E8F0', color: '#475569', fontSize: 12, fontWeight: 700 }}>
                  {question.topic}
                </span>
              )}
            </div>

            <button
              onClick={() => setFlagged(prev => { const n = new Set(prev); n.has(question.id) ? n.delete(question.id) : n.add(question.id); return n; })}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8,
                background: flagged.has(question.id) ? '#FEF3C7' : '#FFFFFF',
                border: flagged.has(question.id) ? '1.5px solid #F59E0B' : '1.5px solid #E2E8F0',
                color: flagged.has(question.id) ? '#D97706' : '#64748B',
                fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              <Flag style={{ width: 14, height: 14, fill: flagged.has(question.id) ? '#D97706' : 'none' }} />
              {flagged.has(question.id) ? 'Flagged for Review' : 'Flag Question'}
            </button>
          </div>

          {/* Question Box */}
          <div style={{
            background: 'white', border: '1.5px solid #E2E8F0', borderRadius: 20, padding: '28px 24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', lineHeight: 1.7, margin: 0 }}>
              <MathText text={question.text} />
            </div>
          </div>

          {/* Options Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {question.options.map((opt) => {
              const selected = answers[question.id] === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setAnswers(prev => ({ ...prev, [question.id]: opt.id }))}
                  style={{
                    width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 16,
                    padding: '16px 20px', borderRadius: 16, cursor: 'pointer',
                    background: selected ? 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)' : 'white',
                    border: selected ? '2px solid #2563EB' : '1.5px solid #E2E8F0',
                    color: selected ? 'white' : '#1E293B',
                    boxShadow: selected ? '0 6px 20px rgba(37,99,235,0.25)' : '0 1px 3px rgba(0,0,0,0.02)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: selected ? 'rgba(255,255,255,0.2)' : '#F1F5F9',
                    border: selected ? '1px solid rgba(255,255,255,0.3)' : '1px solid #CBD5E1',
                    color: selected ? 'white' : '#475569',
                    fontSize: 14, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {opt.id}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: selected ? 700 : 500, flex: 1, lineHeight: 1.5 }}>
                    <MathText text={opt.text} />
                  </span>
                  {selected && (
                    <CheckCircle style={{ width: 20, height: 20, color: 'white', flexShrink: 0 }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Navigation Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid #E2E8F0', marginTop: 'auto' }}>
            <button
              onClick={() => setCurrentQ(q => Math.max(0, q - 1))}
              disabled={currentQ === 0}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 22px', borderRadius: 12,
                background: 'white', border: '1.5px solid #CBD5E1', color: '#475569', fontSize: 13, fontWeight: 700,
                cursor: currentQ === 0 ? 'not-allowed' : 'pointer', opacity: currentQ === 0 ? 0.4 : 1, transition: 'all 0.15s',
              }}
            >
              <ChevronLeft style={{ width: 16, height: 16 }} /> Previous
            </button>

            {currentQ < test.totalQuestions - 1 ? (
              <button
                onClick={() => setCurrentQ(q => Math.min(test.totalQuestions - 1, q + 1))}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 12,
                  background: '#2563EB', color: 'white', fontSize: 13, fontWeight: 800, border: 'none', cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.25)', transition: 'all 0.15s',
                }}
              >
                Next Question <ChevronRight style={{ width: 16, height: 16 }} />
              </button>
            ) : (
              <button
                onClick={() => setShowSubmitConfirm(true)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 12,
                  background: '#10B981', color: 'white', fontSize: 13, fontWeight: 800, border: 'none', cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(16,185,129,0.25)', transition: 'all 0.15s',
                }}
              >
                <CheckCircle style={{ width: 16, height: 16 }} /> Complete & Submit
              </button>
            )}
          </div>
        </main>

        {/* ── RIGHT DESKTOP NAVIGATOR SIDEBAR ─────────────────────────────────── */}
        <aside style={{
          width: 260, background: 'white', borderLeft: '1px solid #E2E8F0', padding: '24px 18px',
          display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto', flexShrink: 0,
        }} className="hidden lg:flex">
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
              Question Matrix
            </div>

            {/* Matrix Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 20 }}>
              {test.questions.map((q, i) => {
                const isAnswered = !!answers[q.id];
                const isFlagged = flagged.has(q.id);
                const isCurrent = currentQ === i;

                let bg = 'white';
                let border = '1px solid #CBD5E1';
                let text = '#64748B';

                if (isCurrent) {
                  bg = '#2563EB';
                  border = '2px solid #1D4ED8';
                  text = 'white';
                } else if (isFlagged) {
                  bg = '#FEF3C7';
                  border = '1px solid #F59E0B';
                  text = '#D97706';
                } else if (isAnswered) {
                  bg = '#D1FAE5';
                  border = '1px solid #10B981';
                  text = '#047857';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQ(i)}
                    style={{
                      height: 36, borderRadius: 8, background: bg, border: border, color: text,
                      fontSize: 12, fontWeight: 800, cursor: 'pointer', transition: 'all 0.15s',
                      boxShadow: isCurrent ? '0 0 0 3px rgba(37,99,235,0.2)' : 'none',
                    }}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 14, padding: '14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Legend</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#64748B', fontWeight: 600 }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: '#D1FAE5', border: '1px solid #10B981' }} /> Answered ({answered})
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#64748B', fontWeight: 600 }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: '#FEF3C7', border: '1px solid #F59E0B' }} /> Flagged ({flagged.size})
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#64748B', fontWeight: 600 }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: 'white', border: '1px solid #CBD5E1' }} /> Unanswered ({unanswered})
            </div>
          </div>
        </aside>
      </div>

      {/* ── CONFIRM SUBMIT MODAL ───────────────────────────────────────────── */}
      {showSubmitConfirm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', padding: 20,
        }}>
          <div style={{
            maxWidth: 420, width: '100%', background: 'white', border: '1px solid #E2E8F0',
            borderRadius: 24, padding: '32px 28px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            textAlign: 'center',
          }}>
            <div style={{ width: 54, height: 54, borderRadius: 16, background: '#D1FAE5', color: '#10B981', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <CheckCircle style={{ width: 28, height: 28 }} />
            </div>

            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em', margin: '0 0 10px' }}>
              Submit Examination?
            </h2>

            <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.6, marginBottom: 24 }}>
              You have answered <strong style={{ color: '#0F172A' }}>{answered}</strong> of <strong style={{ color: '#0F172A' }}>{test.totalQuestions}</strong> questions.
              {unanswered > 0 && (
                <span style={{ display: 'block', color: '#EF4444', fontWeight: 700, marginTop: 6 }}>
                  ⚠️ You still have {unanswered} unanswered question{unanswered > 1 ? 's' : ''}!
                </span>
              )}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              <button
                onClick={() => setShowSubmitConfirm(false)}
                style={{ padding: '12px 18px', borderRadius: 12, background: '#F1F5F9', border: '1.5px solid #CBD5E1', color: '#475569', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >
                Return to Test
              </button>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{ padding: '12px 18px', borderRadius: 12, background: '#10B981', border: 'none', color: 'white', fontSize: 13, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}
              >
                {submitting ? 'Submitting…' : 'Submit & View Score'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
      `}</style>
    </div>
  );
}
