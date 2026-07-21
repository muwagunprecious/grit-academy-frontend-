'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Loader2, X, AlertCircle, BookOpen, Clock, Zap, CheckCircle2, ChevronRight, Sparkles, Target, Trophy, Timer } from 'lucide-react';
import api from '../../../lib/api';

interface Subject {
  id: string;
  name: string;
  _count?: { questions: number };
}

const SUBJECT_ACCENTS: Record<string, { color: string; bg: string; icon: string }> = {
  Mathematics:  { color: '#2563EB', bg: 'rgba(37,99,235,0.08)',   icon: '∑' },
  Physics:      { color: '#7C3AED', bg: 'rgba(124,58,237,0.08)',  icon: '⚛' },
  Chemistry:    { color: '#059669', bg: 'rgba(5,150,105,0.08)',   icon: '🧪' },
  Biology:      { color: '#D97706', bg: 'rgba(217,119,6,0.08)',   icon: '🧬' },
  English:      { color: '#DC2626', bg: 'rgba(220,38,38,0.08)',   icon: 'A' },
  Economics:    { color: '#0891B2', bg: 'rgba(8,145,178,0.08)',   icon: '📈' },
  Government:   { color: '#BE185D', bg: 'rgba(190,24,93,0.08)',   icon: '⚖' },
  Commerce:     { color: '#065F46', bg: 'rgba(6,95,70,0.08)',     icon: '💹' },
  Literature:   { color: '#92400E', bg: 'rgba(146,64,14,0.08)',   icon: '📖' },
  Geography:    { color: '#1D4ED8', bg: 'rgba(29,78,216,0.08)',   icon: '🌍' },
};

function getAccent(name: string) {
  return SUBJECT_ACCENTS[name] || { color: '#2563EB', bg: 'rgba(37,99,235,0.08)', icon: name.charAt(0) };
}

const DURATION_STEPS = [5, 10, 15, 20, 25, 30];

function SubjectPill({ sub, selected, onClick }: { sub: Subject; selected: boolean; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  const acc = getAccent(sub.name);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
        borderRadius: 14, border: `1.5px solid ${selected ? acc.color : hov ? acc.color + '60' : 'var(--slate-200)'}`,
        background: selected ? acc.color : hov ? acc.bg : 'white',
        cursor: 'pointer', transition: 'all 0.18s', textAlign: 'left',
        transform: hov && !selected ? 'translateY(-1px)' : 'none',
        boxShadow: selected ? `0 4px 16px ${acc.color}30` : hov ? '0 2px 12px rgba(0,0,0,0.06)' : 'none',
      }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: 9, flexShrink: 0,
        background: selected ? 'rgba(255,255,255,0.2)' : acc.bg,
        border: `1px solid ${selected ? 'rgba(255,255,255,0.25)' : acc.color + '30'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 800,
        color: selected ? 'white' : acc.color,
      }}>{acc.icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: selected ? 'white' : 'var(--slate-800)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {sub.name}
        </div>
        <div style={{ fontSize: 10, color: selected ? 'rgba(255,255,255,0.7)' : 'var(--slate-400)', fontWeight: 500, marginTop: 1 }}>
          {sub._count?.questions || 0} Qs
        </div>
      </div>
      {selected && (
        <CheckCircle2 style={{ width: 16, height: 16, color: 'white', flexShrink: 0 }} />
      )}
    </button>
  );
}

function SubjectCard({ sub, onStart }: { sub: Subject; onStart: () => void }) {
  const [hov, setHov] = useState(false);
  const acc = getAccent(sub.name);
  const qCount = sub._count?.questions || 0;
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'white',
        border: `1.5px solid ${hov ? acc.color + '40' : 'var(--slate-200)'}`,
        borderRadius: 20, padding: '22px',
        display: 'flex', flexDirection: 'column', gap: 16,
        transition: 'all 0.2s',
        transform: hov ? 'translateY(-3px)' : 'none',
        boxShadow: hov ? `0 12px 32px ${acc.color}14` : '0 1px 4px rgba(0,0,0,0.04)',
        cursor: 'default',
      }}
    >
      {/* Icon + Name */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14, background: acc.bg,
          border: `1.5px solid ${acc.color}25`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, fontWeight: 900, color: acc.color,
        }}>{acc.icon}</div>
        <div style={{
          fontSize: 10, fontWeight: 700, color: qCount > 0 ? '#059669' : 'var(--slate-400)',
          background: qCount > 0 ? '#ECFDF5' : 'var(--slate-100)',
          border: `1px solid ${qCount > 0 ? 'rgba(5,150,105,0.15)' : 'transparent'}`,
          padding: '3px 9px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.04em',
        }}>
          {qCount > 0 ? 'Ready' : 'No Qs'}
        </div>
      </div>

      {/* Subject Name */}
      <div>
        <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--slate-900)' }}>{sub.name}</div>
        <div style={{ fontSize: 12, color: 'var(--slate-400)', marginTop: 3, fontWeight: 500 }}>
          {qCount} question{qCount !== 1 ? 's' : ''} available
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: 'var(--slate-100)', borderRadius: 100, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 100, background: acc.color,
          width: `${Math.min(100, (qCount / 50) * 100)}%`,
          transition: 'width 0.6s ease',
        }} />
      </div>

      {/* Start Button */}
      <button
        onClick={onStart}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          height: 40, borderRadius: 11,
          background: hov ? acc.color : 'transparent',
          border: `1.5px solid ${acc.color}`,
          color: hov ? 'white' : acc.color,
          fontSize: 12, fontWeight: 700, cursor: 'pointer',
          transition: 'all 0.18s',
        }}
      >
        <Play style={{ width: 13, height: 13, fill: hov ? 'white' : acc.color }} />
        Start Solo Practice
      </button>
    </div>
  );
}

export default function TestsPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [duration, setDuration] = useState(30);
  const [startingExam, setStartingExam] = useState(false);
  const [examError, setExamError] = useState('');

  useEffect(() => {
    api.get('/subjects')
      .then((res) => setSubjects(res.data.data.subjects || []))
      .catch((err) => console.error('Failed to load subjects:', err))
      .finally(() => setLoadingSubjects(false));
  }, []);

  const toggleSubject = (id: string) => {
    if (selectedSubjectIds.includes(id)) {
      setSelectedSubjectIds((prev) => prev.filter((s) => s !== id));
    } else {
      if (selectedSubjectIds.length >= 5) {
        setExamError('You can select a maximum of 5 subjects per test');
        return;
      }
      setExamError('');
      setSelectedSubjectIds((prev) => [...prev, id]);
    }
  };

  const handleStartCustomExam = async () => {
    if (selectedSubjectIds.length === 0) { setExamError('Please select at least 1 subject'); return; }
    setStartingExam(true);
    setExamError('');
    try {
      const res = await api.post('/attempts/custom', {
        subjectIds: selectedSubjectIds,
        duration: Math.min(30, duration),
      });
      router.push(`/exam?attemptId=${res.data.data.attemptId}`);
    } catch (err: any) {
      setExamError(err.response?.data?.message || 'Failed to start exam. Make sure selected subjects have questions.');
    } finally {
      setStartingExam(false);
    }
  };

  const openModalForSubject = (subId: string) => {
    setSelectedSubjectIds([subId]);
    setExamError('');
    setShowModal(true);
  };

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* ── Hero Banner ──────────────────────────────────────── */}
      <div className="hero-banner" style={{
        borderRadius: 24, overflow: 'hidden', position: 'relative',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 50%, #0F172A 100%)',
        padding: '44px 48px', boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
      }}>
        {/* decorative blobs */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: '40%', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '30%', right: '15%', width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(5,150,105,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="hero-inner" style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 28, flexWrap: 'wrap' }}>
          <div style={{ maxWidth: 520 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 14px', borderRadius: 100,
              background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(37,99,235,0.35)',
              fontSize: 10, fontWeight: 800, color: 'rgba(147,197,253,1)',
              textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20,
            }}>
              <Zap style={{ width: 11, height: 11 }} /> CBT Practice Engine
            </div>
            <h1 style={{ fontSize: 34, fontWeight: 900, color: 'white', letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 14px' }}>
              Build Your Custom<br />
              <span style={{ background: 'linear-gradient(90deg, #60A5FA, #A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Practice CBT Exam
              </span>
            </h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, fontWeight: 400, margin: '0 0 28px' }}>
              Pick up to <strong style={{ color: 'rgba(255,255,255,0.8)' }}>5 subjects</strong>, set a timer up to <strong style={{ color: 'rgba(255,255,255,0.8)' }}>30 minutes</strong>, and launch your timed exam — just like the real JAMB, WAEC, or NECO.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                onClick={() => { setSelectedSubjectIds([]); setExamError(''); setShowModal(true); }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 9,
                  height: 48, padding: '0 26px', borderRadius: 14,
                  background: 'var(--blue-600)', color: 'white',
                  fontSize: 13, fontWeight: 800, cursor: 'pointer', border: 'none',
                  boxShadow: '0 6px 24px rgba(37,99,235,0.45)',
                  transition: 'all 0.18s',
                }}
              >
                <Play style={{ width: 15, height: 15, fill: 'white' }} />
                Start Custom Exam
              </button>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { icon: <BookOpen style={{ width: 13, height: 13 }} />, label: 'Up to 5 Subjects' },
                  { icon: <Clock style={{ width: 13, height: 13 }} />, label: '30 Min Max' },
                ].map((chip) => (
                  <div key={chip.label} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    height: 48, padding: '0 16px', borderRadius: 14,
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                    fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.65)',
                  }}>
                    {chip.icon} {chip.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div className="hero-stats" style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 180 }}>
            {[
              { icon: <Target style={{ width: 16, height: 16 }} />, label: 'Subjects Available', value: subjects.length.toString(), color: '#60A5FA' },
              { icon: <Trophy style={{ width: 16, height: 16 }} />, label: 'Total Questions', value: subjects.reduce((a, s) => a + (s._count?.questions || 0), 0).toString(), color: '#A78BFA' },
              { icon: <Timer style={{ width: 16, height: 16 }} />, label: 'Max Duration', value: '30 Mins', color: '#34D399' },
            ].map((stat) => (
              <div key={stat.label} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', borderRadius: 14,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: stat.color + '20', color: stat.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>{stat.icon}</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: 'white', lineHeight: 1 }}>{stat.value}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 3, fontWeight: 600 }}>{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Available Subjects Grid ──────────────────────────── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--slate-900)', letterSpacing: '-0.02em' }}>
              Available Subjects
            </div>
            <div style={{ fontSize: 12, color: 'var(--slate-400)', marginTop: 3, fontWeight: 500 }}>
              {loadingSubjects ? 'Loading...' : `${subjects.length} subject${subjects.length !== 1 ? 's' : ''} with question banks`}
            </div>
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: 20,
            background: '#EFF6FF', border: '1px solid rgba(37,99,235,0.15)',
            fontSize: 11, fontWeight: 700, color: 'var(--blue-600)',
          }}>
            <Sparkles style={{ width: 12, height: 12 }} /> Click any to practice solo
          </div>
        </div>

        {loadingSubjects ? (
          <div className="tests-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} style={{
                height: 200, borderRadius: 20, border: '1.5px solid var(--slate-200)',
                background: 'linear-gradient(90deg, var(--slate-100) 25%, var(--slate-50) 50%, var(--slate-100) 75%)',
                animation: 'shimmer 1.4s ease-in-out infinite',
              }} />
            ))}
          </div>
        ) : subjects.length === 0 ? (
          <div style={{
            padding: '60px 32px', textAlign: 'center', borderRadius: 20,
            border: '1.5px dashed var(--slate-200)', background: 'var(--slate-50)',
          }}>
            <BookOpen style={{ width: 36, height: 36, color: 'var(--slate-300)', margin: '0 auto 12px' }} />
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--slate-700)' }}>No subjects found</div>
            <div style={{ fontSize: 13, color: 'var(--slate-400)', marginTop: 6 }}>Ask your admin to upload question banks</div>
          </div>
        ) : (
          <div className="tests-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {subjects.map((sub) => (
              <SubjectCard
                key={sub.id}
                sub={sub}
                onStart={() => openModalForSubject(sub.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modal ────────────────────────────────────────────── */}
      {showModal && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) { setShowModal(false); } }}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(15,23,42,0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
        >
          <div style={{
            background: 'white', borderRadius: 28, padding: '32px',
            width: '100%', maxWidth: 620,
            boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
            border: '1px solid rgba(255,255,255,0.8)',
            maxHeight: '90vh', overflowY: 'auto',
            display: 'flex', flexDirection: 'column', gap: 24,
          }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 46, height: 46, borderRadius: 14,
                  background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(37,99,235,0.3)',
                }}>
                  <Zap style={{ width: 20, height: 20, color: 'white' }} />
                </div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 900, color: 'var(--slate-900)' }}>Setup Your Exam</div>
                  <div style={{ fontSize: 11, color: 'var(--slate-400)', marginTop: 2 }}>Select subjects & set your timer</div>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  width: 36, height: 36, borderRadius: 10, border: '1px solid var(--slate-200)',
                  background: 'var(--slate-50)', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', color: 'var(--slate-500)',
                  transition: 'all 0.15s',
                }}
              >
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            {/* Error */}
            {examError && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 16px', borderRadius: 12,
                background: '#FEF2F2', border: '1px solid rgba(220,38,38,0.2)',
                fontSize: 12, fontWeight: 600, color: '#DC2626',
              }}>
                <AlertCircle style={{ width: 15, height: 15, flexShrink: 0 }} />
                {examError}
              </div>
            )}

            {/* Subject Selection */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  Choose Subjects
                </div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '4px 10px', borderRadius: 20,
                  background: selectedSubjectIds.length >= 5 ? '#FEF2F2' : '#EFF6FF',
                  border: `1px solid ${selectedSubjectIds.length >= 5 ? 'rgba(220,38,38,0.2)' : 'rgba(37,99,235,0.15)'}`,
                  fontSize: 11, fontWeight: 700,
                  color: selectedSubjectIds.length >= 5 ? '#DC2626' : 'var(--blue-600)',
                }}>
                  {selectedSubjectIds.length}/5 Selected
                </div>
              </div>

              {loadingSubjects ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--slate-400)', padding: '20px 0' }}>
                  <Loader2 style={{ width: 16, height: 16, animation: 'spin 0.7s linear infinite' }} /> Loading subjects...
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }} className="modal-subjects">
                  {subjects.map((sub) => (
                    <SubjectPill
                      key={sub.id}
                      sub={sub}
                      selected={selectedSubjectIds.includes(sub.id)}
                      onClick={() => toggleSubject(sub.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Timer */}
            <div style={{
              padding: '20px', borderRadius: 16,
              background: 'var(--slate-50)', border: '1.5px solid var(--slate-200)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Clock style={{ width: 15, height: 15, color: 'var(--blue-600)' }} />
                  <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--slate-600)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                    Exam Duration
                  </span>
                </div>
                <div style={{
                  fontSize: 18, fontWeight: 900, color: 'var(--blue-600)',
                  background: '#EFF6FF', padding: '4px 14px', borderRadius: 10,
                  border: '1px solid rgba(37,99,235,0.15)',
                }}>
                  {duration} min
                </div>
              </div>

              <input
                type="range" min={5} max={30} step={5} value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#2563EB', cursor: 'pointer', height: 6 }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                {DURATION_STEPS.map((step) => (
                  <button
                    key={step}
                    onClick={() => setDuration(step)}
                    style={{
                      fontSize: 10, fontWeight: 700,
                      padding: '4px 8px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      background: duration === step ? 'var(--blue-600)' : 'transparent',
                      color: duration === step ? 'white' : 'var(--slate-400)',
                      transition: 'all 0.15s',
                    }}
                  >{step}m</button>
                ))}
              </div>
            </div>

            {/* Summary row */}
            {selectedSubjectIds.length > 0 && (
              <div style={{
                padding: '14px 18px', borderRadius: 14,
                background: 'linear-gradient(135deg, #EFF6FF, #F5F3FF)',
                border: '1px solid rgba(37,99,235,0.12)',
                display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Exam Summary:
                </div>
                {selectedSubjectIds.map((id) => {
                  const s = subjects.find((x) => x.id === id);
                  if (!s) return null;
                  const acc = getAccent(s.name);
                  return (
                    <span key={id} style={{
                      fontSize: 11, fontWeight: 700, color: acc.color,
                      background: acc.bg, padding: '3px 10px', borderRadius: 20,
                      border: `1px solid ${acc.color}25`,
                    }}>{s.name}</span>
                  );
                })}
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--slate-500)', marginLeft: 'auto' }}>
                  · {duration} min timer
                </span>
              </div>
            )}

            {/* Start Button */}
            <button
              onClick={handleStartCustomExam}
              disabled={startingExam || selectedSubjectIds.length === 0}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                height: 52, borderRadius: 14, border: 'none', cursor: startingExam || selectedSubjectIds.length === 0 ? 'not-allowed' : 'pointer',
                background: selectedSubjectIds.length === 0
                  ? 'var(--slate-200)'
                  : 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                color: selectedSubjectIds.length === 0 ? 'var(--slate-400)' : 'white',
                fontSize: 14, fontWeight: 800,
                boxShadow: selectedSubjectIds.length > 0 ? '0 6px 24px rgba(37,99,235,0.35)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {startingExam ? (
                <><Loader2 style={{ width: 18, height: 18, animation: 'spin 0.7s linear infinite' }} /> Launching Exam...</>
              ) : (
                <><Play style={{ width: 16, height: 16, fill: selectedSubjectIds.length > 0 ? 'white' : 'var(--slate-400)' }} />
                  {selectedSubjectIds.length === 0 ? 'Select at least 1 subject' : `Start CBT Exam — ${selectedSubjectIds.length} Subject${selectedSubjectIds.length > 1 ? 's' : ''}`}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }

        /* Tablet */
        @media (max-width: 900px) {
          .tests-grid   { grid-template-columns: repeat(2, 1fr) !important; }
          .hero-stats   { flex-direction: row !important; flex-wrap: wrap !important; min-width: unset !important; }
        }

        /* Mobile */
        @media (max-width: 640px) {
          .hero-banner  { padding: 28px 20px !important; border-radius: 18px !important; }
          .hero-inner   { flex-direction: column !important; }
          .hero-stats   { display: none !important; }
          .tests-grid   { grid-template-columns: 1fr !important; }
          .modal-subjects { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
