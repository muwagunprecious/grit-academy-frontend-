'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Play,
  Loader2,
  X,
  AlertCircle,
  BookOpen,
  Clock,
  Zap,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Target,
  Trophy,
  Timer,
  Lock,
  CreditCard,
  Sliders,
} from 'lucide-react';
import api from '../../../lib/api';
import { useAuthStore } from '../../../stores/auth.store';
import NotificationModal from '../../components/NotificationModal';

interface Subject {
  id: string;
  name: string;
  _count?: { questions: number };
}

interface TestPackage {
  id: string;
  title: string;
  description: string;
  subject: string;
  questionCount: number;
  duration: number;
  price: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
}

import { getSubjectsForFaculty } from '../../components/FacultySelectionModal';

const DURATION_STEPS = [5, 10, 15, 20, 25, 30];

export default function TestsPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const isLocked = user?.role === 'STUDENT' && user?.hasPaidAccessFee === false;

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [duration, setDuration] = useState(30);
  const [startingExam, setStartingExam] = useState(false);
  const [examError, setExamError] = useState('');

  // Scheduled test packages
  const [packages, setPackages] = useState<TestPackage[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [startingPackage, setStartingPackage] = useState<string | null>(null);
  const [packageError, setPackageError] = useState('');
  const [notifyModal, setNotifyModal] = useState<{ open: boolean; title: string; message: string; type?: 'error' | 'info' | 'success' }>({
    open: false, title: '', message: '',
  });

  const facultySubjects = subjects.filter((sub) => {
    if (!user?.faculty) return true;
    const allowed = getSubjectsForFaculty(user.faculty);
    if (!allowed || allowed.length === 0) return true;

    const sNorm = sub.name.trim().toLowerCase();
    return allowed.some(a => {
      const aNorm = a.trim().toLowerCase();
      if (sNorm.includes(aNorm) || aNorm.includes(sNorm)) return true;
      if (aNorm === 'english' && (sNorm.includes('english') || sNorm.includes('communication'))) return true;
      if (aNorm === 'math' && (sNorm.includes('math') || sNorm.includes('mathematics'))) return true;
      if (aNorm === 'crs' && (sNorm.includes('crs') || sNorm.includes('christian'))) return true;
      if (aNorm === 'literature' && (sNorm.includes('literature') || sNorm.includes('lit'))) return true;
      if (aNorm === 'gov' && (sNorm.includes('government') || sNorm.includes('gov'))) return true;
      if (aNorm === 'econ' && (sNorm.includes('economics') || sNorm.includes('econ'))) return true;
      return false;
    });
  });

  const handlePay = async () => {
    try {
      const targetTestId = packages[0]?.id || 'cmrus90cf004nc1h0ezrn027p';
      const payRes = await api.post('/payments/initialize', { testId: targetTestId });
      const authUrl = payRes.data?.data?.authorization_url;
      if (authUrl) {
        window.location.href = authUrl;
      }
    } catch (err: any) {
      setNotifyModal({
        open: true,
        title: 'Payment Error',
        message: err.response?.data?.message || 'Payment initialization failed. Please try again.',
        type: 'error',
      });
    }
  };

  useEffect(() => {
    api.get('/subjects')
      .then((res) => setSubjects(res.data.data.subjects || []))
      .catch((err) => console.error('Failed to load subjects:', err))
      .finally(() => setLoadingSubjects(false));

    api.get('/tests')
      .then((res) => setPackages(res.data.data.tests || []))
      .catch(() => {})
      .finally(() => setLoadingPackages(false));
  }, []);

  const toggleSubject = (id: string) => {
    if (selectedSubjectIds.includes(id)) {
      setSelectedSubjectIds(selectedSubjectIds.filter((x) => x !== id));
    } else {
      if (selectedSubjectIds.length >= 5) {
        setExamError('You can select a maximum of 5 subjects for a custom exam');
        return;
      }
      setExamError('');
      setSelectedSubjectIds([...selectedSubjectIds, id]);
    }
  };

  const handleStartCustomExam = async () => {
    if (isLocked) { handlePay(); return; }
    if (selectedSubjectIds.length === 0) { setExamError('Please select at least 1 subject'); return; }
    setStartingExam(true);
    setExamError('');
    try {
      const res = await api.post('/attempts/custom', {
        subjectIds: selectedSubjectIds,
        duration: Math.min(30, duration),
        questionsPerSubject: 30,
      });
      router.push(`/exam?attemptId=${res.data.data.attemptId}`);
    } catch (err: any) {
      setExamError(err.response?.data?.message || 'Failed to start exam. Make sure selected subjects have questions.');
    } finally {
      setStartingExam(false);
    }
  };

  const startCombinedFacultyExam = async () => {
    if (isLocked) { handlePay(); return; }
    
    const facultySubjectIds = facultySubjects.map(s => s.id);
    if (facultySubjectIds.length === 0) {
      setNotifyModal({
        open: true,
        title: 'Select Faculty Required',
        message: 'Please select your Faculty to enable your combined 30-minute CBT exam bundle.',
        type: 'info',
      });
      return;
    }

    setStartingExam(true);
    try {
      const res = await api.post('/attempts/custom', {
        subjectIds: facultySubjectIds,
        duration: 30, // Strictly 30 minutes total!
        questionsPerSubject: 20,
      });
      router.push(`/exam?attemptId=${res.data.data.attemptId}`);
    } catch (err: any) {
      setNotifyModal({
        open: true,
        title: 'Exam Initialization',
        message: err.response?.data?.message || 'Failed to start your 30-minute faculty exam bundle.',
        type: 'error',
      });
    } finally {
      setStartingExam(false);
    }
  };

  const handleStartSoloPractice = async (subjectName: string, subjectId: string) => {
    if (isLocked) { handlePay(); return; }
    // User Directive: Students do all attached faculty subjects together in ONE 30-minute exam bundle!
    await startCombinedFacultyExam();
  };

  const handleStartPackage = async (packageId: string) => {
    if (isLocked) { handlePay(); return; }
    router.push(`/exam/${packageId}`);
  };

  return (
    <div style={{ maxWidth: 1140, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* ── Hero Custom Exam Banner ──────────────────────── */}
      <div style={{
        background: '#0F172A',
        borderRadius: 20,
        padding: '36px 40px',
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(15,23,42,0.12)',
        color: 'white',
      }}>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 28, flexWrap: 'wrap' }}>
          <div style={{ maxWidth: 560 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 12px', borderRadius: 20,
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
              fontSize: 11, fontWeight: 700, color: '#10B981',
              textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16,
            }}>
              <Sliders style={{ width: 12, height: 12 }} /> 30-Minute Combined Faculty Exam Engine
            </div>

            <h1 style={{ fontSize: 28, fontWeight: 900, color: 'white', letterSpacing: '-0.03em', lineHeight: 1.15, margin: '0 0 10px' }}>
              {user?.faculty ? `${user.faculty} Exam Bundle` : 'Combined Faculty CBT Exam'}
            </h1>
            <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6, fontWeight: 400, margin: '0 0 24px' }}>
              You will take all {facultySubjects.length || 5} subjects attached to your faculty combined in ONE 30-minute exam session.
            </p>

            <button
              onClick={startCombinedFacultyExam}
              disabled={startingExam}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 9,
                height: 44, padding: '0 24px', borderRadius: 10,
                background: isLocked ? '#DC2626' : '#FFFFFF',
                color: isLocked ? 'white' : '#0F172A',
                fontSize: 13, fontWeight: 800, cursor: 'pointer', border: 'none',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                transition: 'all 0.15s ease',
              }}
            >
              {startingExam ? (
                <Loader2 style={{ width: 15, height: 15, animation: 'spin 0.7s linear infinite' }} />
              ) : isLocked ? (
                <Lock style={{ width: 15, height: 15 }} />
              ) : (
                <Play style={{ width: 15, height: 15, fill: '#0F172A' }} />
              )}
              {startingExam
                ? 'Initializing Bundle...'
                : isLocked
                ? '🔒 Pay ₦1,010 to Unlock Exam Bundle'
                : 'Start 30-Min Combined Faculty Exam'}
            </button>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 16, padding: '20px 24px',
            display: 'flex', flexDirection: 'column', gap: 10,
            minWidth: 220,
          }}>
            <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Faculty Bundle Specs
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>• All {facultySubjects.length || 5} Faculty Subjects</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#10B981' }}>• Strictly 30 Minutes Total</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>• AI Step-by-Step Solutions</div>
          </div>
        </div>
      </div>

      {/* ── Section 1: Solo Subject Practice ───────────────── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', letterSpacing: '-0.025em', margin: 0 }}>
              Solo Subject Practice Cards
            </h2>
            <p style={{ fontSize: 12, color: '#64748B', margin: '2px 0 0', fontWeight: 500 }}>
              Practice single subjects with 30 randomly selected past questions
            </p>
          </div>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#64748B', background: '#F1F5F9', padding: '4px 12px', borderRadius: 20, border: '1px solid #E2E8F0' }}>
            {facultySubjects.length} Available Subjects {user?.faculty ? `(${user.faculty})` : ''}
          </span>
        </div>

        {loadingSubjects ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 140 }}>
            <Loader2 style={{ width: 24, height: 24, animation: 'spin 0.7s linear infinite', color: '#0F172A' }} />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="tests-grid">
            {facultySubjects.map((sub) => (
              <div
                key={sub.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 16,
                  border: '1px solid #E2E8F0',
                  padding: '20px 22px',
                  display: 'flex', flexDirection: 'column', gap: 14,
                  transition: 'all 0.15s ease',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    fontSize: 11, fontWeight: 800, color: '#0F172A',
                    background: '#F1F5F9', padding: '3px 10px', borderRadius: 6,
                    border: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.04em',
                  }}>
                    {sub.name}
                  </span>
                  {isLocked && (
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#DC2626', background: '#FEF2F2', padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(220,38,38,0.15)' }}>
                      🔒 Locked (₦1,010)
                    </span>
                  )}
                </div>

                <div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#0F172A' }}>{sub.name}</div>
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 4, fontWeight: 500 }}>
                    {sub._count?.questions || 0} questions available
                  </div>
                </div>

                <button
                  onClick={() => handleStartSoloPractice(sub.name, sub.id)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    height: 38, borderRadius: 8, border: 'none',
                    background: isLocked ? '#FEF2F2' : '#0F172A',
                    color: isLocked ? '#DC2626' : 'white',
                    fontSize: 12, fontWeight: 800, cursor: 'pointer',
                    transition: 'all 0.15s ease', marginTop: 'auto',
                  }}
                >
                  {isLocked ? (
                    <><Lock style={{ width: 13, height: 13 }} /> Pay ₦1,010 to Unlock</>
                  ) : (
                    <><Play style={{ width: 13, height: 13, fill: 'white' }} /> Practice {sub.name}</>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Section 2: Standard Test Packages ────────────────── */}
      {packages.length > 0 && (
        <div>
          <div style={{ marginBottom: 18 }}>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', letterSpacing: '-0.025em', margin: 0 }}>
              Full Standard CBT Packages
            </h2>
            <p style={{ fontSize: 12, color: '#64748B', margin: '2px 0 0', fontWeight: 500 }}>
              Complete mock test suites designed according to official exam standards
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }} className="tests-grid">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 16,
                  border: '1px solid #E2E8F0',
                  padding: '24px',
                  display: 'flex', flexDirection: 'column', gap: 14,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#475569', background: '#F1F5F9', padding: '4px 10px', borderRadius: 6, border: '1px solid #E2E8F0' }}>
                    {pkg.subject || 'Full Mock'}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 900, color: '#059669' }}>
                    ₦1,010.00 Access
                  </span>
                </div>

                <div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#0F172A' }}>{pkg.title}</div>
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 4, lineHeight: 1.5, fontWeight: 500 }}>{pkg.description}</div>
                </div>

                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#64748B', fontWeight: 600 }}>
                  <span>⏱ {pkg.duration} min</span>
                  <span>📄 {pkg.questionCount} Questions</span>
                </div>

                <button
                  onClick={() => handleStartPackage(pkg.id)}
                  disabled={startingPackage === pkg.id}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    height: 40, borderRadius: 8, border: 'none',
                    background: isLocked ? '#FEF2F2' : '#0F172A',
                    color: isLocked ? '#DC2626' : 'white',
                    fontSize: 12, fontWeight: 800, cursor: 'pointer',
                    transition: 'all 0.15s ease', marginTop: 'auto',
                  }}
                >
                  {startingPackage === pkg.id ? (
                    <><Loader2 style={{ width: 14, height: 14, animation: 'spin 0.7s linear infinite' }} /> Starting...</>
                  ) : isLocked ? (
                    <><Lock style={{ width: 13, height: 13 }} /> 🔒 Pay ₦1,010 to Unlock</>
                  ) : (
                    <><Play style={{ width: 13, height: 13, fill: 'white' }} /> Start Full Test</>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Custom Exam Builder Modal ────────────────────── */}
      {showModal && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) { setShowModal(false); } }}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(15,23,42,0.6)',
            backdropFilter: 'blur(5px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
        >
          <div style={{
            background: '#FFFFFF', borderRadius: 24, padding: '32px',
            width: '100%', maxWidth: 580,
            boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
            border: '1px solid #E2E8F0',
            maxHeight: '90vh', overflowY: 'auto',
            display: 'flex', flexDirection: 'column', gap: 24,
          }}>

            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em' }}>Configure Custom CBT Exam</div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 2, fontWeight: 500 }}>Select up to 5 subjects & set exam duration</div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  width: 32, height: 32, borderRadius: 8, border: '1px solid #E2E8F0',
                  background: '#F8FAFC', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', color: '#64748B',
                }}
              >
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            {/* Error Message */}
            {examError && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 16px', borderRadius: 10,
                background: '#FEF2F2', border: '1px solid rgba(220,38,38,0.2)',
                fontSize: 12, fontWeight: 600, color: '#DC2626',
              }}>
                <AlertCircle style={{ width: 15, height: 15, flexShrink: 0 }} />
                {examError}
              </div>
            )}

            {/* Choose Subjects */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Select Subjects ({selectedSubjectIds.length}/5)
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }} className="modal-subjects">
                {subjects.map((sub) => {
                  const sel = selectedSubjectIds.includes(sub.id);
                  return (
                    <button
                      key={sub.id}
                      onClick={() => toggleSubject(sub.id)}
                      style={{
                        padding: '10px 14px', borderRadius: 10,
                        border: `1.5px solid ${sel ? '#0F172A' : '#E2E8F0'}`,
                        background: sel ? '#F8FAFC' : '#FFFFFF',
                        color: '#0F172A', fontSize: 13, fontWeight: sel ? 800 : 600,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        textAlign: 'left', transition: 'all 0.15s ease',
                      }}
                    >
                      {sub.name}
                      {sel && <CheckCircle2 style={{ width: 15, height: 15, color: '#0F172A' }} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Duration Selector */}
            <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 14, border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Exam Duration
                </span>
                <span style={{ fontSize: 14, fontWeight: 900, color: '#0F172A' }}>{duration} minutes</span>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {DURATION_STEPS.map((step) => (
                  <button
                    key={step}
                    onClick={() => setDuration(step)}
                    style={{
                      flex: 1, height: 36, borderRadius: 8, border: '1px solid #E2E8F0',
                      background: duration === step ? '#0F172A' : '#FFFFFF',
                      color: duration === step ? 'white' : '#64748B',
                      fontSize: 12, fontWeight: 800, cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >{step}m</button>
                ))}
              </div>
            </div>

            {/* Launch Button */}
            <button
              onClick={isLocked ? handlePay : handleStartCustomExam}
              disabled={startingExam || (!isLocked && selectedSubjectIds.length === 0)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                height: 48, borderRadius: 12, border: 'none', cursor: startingExam ? 'not-allowed' : 'pointer',
                background: isLocked ? '#DC2626' : selectedSubjectIds.length === 0 ? '#E2E8F0' : '#0F172A',
                color: selectedSubjectIds.length === 0 && !isLocked ? '#94A3B8' : 'white',
                fontSize: 13, fontWeight: 800, transition: 'all 0.15s ease',
              }}
            >
              {startingExam ? (
                <><Loader2 style={{ width: 16, height: 16, animation: 'spin 0.7s linear infinite' }} /> Launching Exam...</>
              ) : isLocked ? (
                <><Lock style={{ width: 15, height: 15 }} /> Pay ₦1,010 via Paystack to Unlock Exam</>
              ) : (
                <><Play style={{ width: 15, height: 15, fill: selectedSubjectIds.length > 0 ? 'white' : '#94A3B8' }} />
                  {selectedSubjectIds.length === 0 ? 'Select at least 1 subject' : `Start CBT Exam — ${selectedSubjectIds.length} Subject${selectedSubjectIds.length > 1 ? 's' : ''}`}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notifyModal.open}
        type={notifyModal.type || 'error'}
        title={notifyModal.title}
        message={notifyModal.message}
        onClose={() => setNotifyModal({ ...notifyModal, open: false })}
      />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .tests-grid   { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .tests-grid   { grid-template-columns: 1fr !important; }
          .modal-subjects { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
