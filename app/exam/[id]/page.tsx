'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, ChevronLeft, ChevronRight, Flag, AlertTriangle, CheckCircle, X } from 'lucide-react';
import api from '../../../lib/api';

interface Question { id: string; text: string; options: { id: string; text: string }[]; marks: number; }
interface TestData {
  id: string; title: string; duration: number; totalQuestions: number; negativeMarking: boolean;
  negativeScore: number; instructions: string | null; questions: Question[];
}

export default function ExamPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [test, setTest] = useState<TestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchTest = async () => {
      try { const res = await api.get(`/tests/${params.id}/questions`); const data = res.data.data; setTest(data); setTimeLeft(data.duration * 60); }
      catch {
        const mockTest: TestData = {
          id: params.id, title: 'JAMB Mock Science (2024)', duration: 120, totalQuestions: 10, negativeMarking: false, negativeScore: 0,
          instructions: 'Answer all questions. Each question carries equal marks.',
          questions: Array.from({ length: 10 }, (_, i) => ({
            id: `q-${i + 1}`, text: `Question ${i + 1}: Which of the following statements is CORRECT regarding the concept being tested?`,
            options: [{ id: 'A', text: 'First possible answer.' }, { id: 'B', text: 'Second possible answer.' }, { id: 'C', text: 'Third possible answer.' }, { id: 'D', text: 'Fourth possible answer.' }], marks: 1,
          })),
        };
        setTest(mockTest); setTimeLeft(mockTest.duration * 60);
      } finally { setLoading(false); }
    };
    fetchTest();
  }, [params.id]);

  const handleSubmit = useCallback(async () => {
    if (!test) return;
    setSubmitting(true);
    try { const res = await api.post('/attempts', { testId: test.id, answers, timeUsed: test.duration * 60 - timeLeft }); router.push(`/dashboard/results/${res.data.data.id}`); }
    catch { router.push('/dashboard/results/mock-attempt-123'); }
  }, [test, answers, timeLeft, router]);

  useEffect(() => {
    if (!started || timeLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => { if (t <= 1) { clearInterval(timerRef.current!); handleSubmit(); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [started, handleSubmit]);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600); const m = Math.floor((secs % 3600) / 60); const s = secs % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isUrgent = timeLeft < 300;

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><div className="w-8 h-8 border-3 border-[#0078D4] border-t-transparent rounded-full animate-spin" /></div>;
  if (!test) return null;

  if (!started) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 antialiased font-['Poppins',sans-serif]">
        <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-sm border border-slate-100 space-y-6">
          <div className="space-y-4">
            <h1 className="text-[26px] font-extrabold text-[#0F172A] leading-[1.2] tracking-tight">
              {test.title}
            </h1>
            
            {test.instructions && (
              <p className="text-[13px] text-slate-400 font-light leading-relaxed">
                Instructions: {test.instructions}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Questions Card */}
            <div className="bg-[#F8FAFC] border border-slate-100 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100/50 flex items-center justify-center shrink-0">
                <Flag className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[18px] font-extrabold text-[#0F172A] leading-none">{test.totalQuestions}</p>
                <p className="text-[12px] text-slate-400 font-medium">Questions</p>
              </div>
            </div>

            {/* Time Limit Card */}
            <div className="bg-[#F8FAFC] border border-slate-100 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100/50 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[18px] font-extrabold text-[#0F172A] leading-none">{test.duration} min</p>
                <p className="text-[12px] text-slate-400 font-medium">Time limit</p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setStarted(true)}
            className="w-full h-[52px] inline-flex items-center justify-center gap-2 bg-[#059669] hover:bg-[#047857] active:scale-[0.98] text-white font-bold text-[14px] rounded-2xl transition duration-200 cursor-pointer shadow-md shadow-emerald-500/10"
          >
            Start practice test
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    );
  }

  const question = test.questions[currentQ];
  const answered = Object.keys(answers).length;
  const unanswered = test.totalQuestions - answered;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="h-[44px] bg-[#FAF9F8] border-b border-[#EDEBE9] flex items-center justify-between px-4 sm:px-6 shrink-0">
        <h1 className="text-[13px] font-semibold text-[#323130] truncate max-w-[40%]">{test.title}</h1>
        <div className={`flex items-center space-x-1.5 px-3 py-1 rounded font-bold text-[13px] ${isUrgent ? 'bg-[#FDE7E9] text-[#D13438]' : 'bg-white text-[#323130] border border-[#EDEBE9]'}`}>
          <Clock className="w-3.5 h-3.5" /><span>{formatTime(timeLeft)}</span>
        </div>
        <button onClick={() => setShowSubmitConfirm(true)} className="px-3 py-1 bg-[#0078D4] text-white text-[12px] font-semibold rounded hover:bg-[#106EBE] transition-colors">Submit</button>
      </header>

      <div className="w-full h-1 bg-[#F3F2F1]">
        <div className="h-full bg-[#0078D4] transition-all duration-300" style={{ width: `${((currentQ + 1) / test.totalQuestions) * 100}%` }} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#A19F9D] uppercase tracking-wider">Question {currentQ + 1} of {test.totalQuestions}</span>
            <button onClick={() => setFlagged(prev => { const n = new Set(prev); n.has(question.id) ? n.delete(question.id) : n.add(question.id); return n; })}
              className={`flex items-center space-x-1 text-[11px] font-semibold px-2.5 py-1 rounded border transition ${flagged.has(question.id) ? 'border-[#CA5010] text-[#CA5010] bg-[#FEF0CD]' : 'border-[#EDEBE9] text-[#A19F9D] hover:border-[#CA5010]'}`}>
              <Flag className="w-3 h-3" /><span>{flagged.has(question.id) ? 'Flagged' : 'Flag'}</span>
            </button>
          </div>

          <div className="bg-[#FAF9F8] border border-[#EDEBE9] rounded-lg p-4">
            <p className="text-[#323130] text-[14px] leading-relaxed font-medium">{question.text}</p>
          </div>

          <div className="space-y-2">
            {question.options.map((opt) => {
              const selected = answers[question.id] === opt.id;
              return (
                <button key={opt.id} onClick={() => setAnswers(prev => ({ ...prev, [question.id]: opt.id }))}
                  className={`w-full text-left flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                    selected ? 'border-[#0078D4] bg-[#DEECF9] text-[#004578]' : 'border-[#EDEBE9] bg-white text-[#605E5C] hover:border-[#D2D0CE]'
                  }`}>
                  <span className={`shrink-0 w-7 h-7 rounded flex items-center justify-center text-[12px] font-bold border ${
                    selected ? 'border-[#0078D4] bg-[#0078D4] text-white' : 'border-[#D2D0CE] text-[#A19F9D]'
                  }`}>{opt.id}</span>
                  <span className="text-[13px] leading-relaxed pt-0.5">{opt.text}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-1">
            <button onClick={() => setCurrentQ(q => Math.max(0, q - 1))} disabled={currentQ === 0}
              className="flex items-center space-x-1.5 px-4 py-2 bg-[#F3F2F1] border border-[#EDEBE9] text-[#605E5C] text-[13px] font-semibold rounded-md hover:bg-[#EDEBE9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft className="w-4 h-4" /><span>Previous</span>
            </button>
            {currentQ < test.totalQuestions - 1 ? (
              <button onClick={() => setCurrentQ(q => Math.min(test.totalQuestions - 1, q + 1))}
                className="flex items-center space-x-1.5 px-4 py-2 bg-[#0078D4] text-white text-[13px] font-semibold rounded-md hover:bg-[#106EBE] transition-colors">
                <span>Next</span><ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={() => setShowSubmitConfirm(true)}
                className="flex items-center space-x-1.5 px-4 py-2 bg-[#0078D4] text-white text-[13px] font-semibold rounded-md hover:bg-[#106EBE] transition-colors">
                <CheckCircle className="w-4 h-4" /><span>Submit</span>
              </button>
            )}
          </div>
        </main>

        {/* Question Navigator (desktop) */}
        <aside className="hidden lg:flex flex-col w-[200px] bg-[#FAF9F8] border-l border-[#EDEBE9] p-3 overflow-y-auto shrink-0">
          <p className="text-[10px] font-bold text-[#A19F9D] uppercase tracking-wider mb-2">Navigator</p>
          <div className="grid grid-cols-5 gap-1 mb-3">
            {test.questions.map((q, i) => {
              const isAnswered = !!answers[q.id]; const isFlagged = flagged.has(q.id); const isCurrent = currentQ === i;
              return (
                <button key={q.id} onClick={() => setCurrentQ(i)}
                  className={`w-7 h-7 rounded text-[11px] font-bold transition-colors ${
                    isCurrent ? 'bg-[#0078D4] text-white ring-2 ring-[#C7E0F4]'
                    : isFlagged ? 'bg-[#FEF0CD] text-[#CA5010] border border-[#FDDC86]'
                    : isAnswered ? 'bg-[#DFF6DD] text-[#107C10] border border-[#C7E0C5]'
                    : 'bg-white text-[#A19F9D] border border-[#EDEBE9] hover:border-[#D2D0CE]'
                  }`}>{i + 1}</button>
              );
            })}
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center space-x-1.5"><span className="w-3 h-3 bg-[#DFF6DD] border border-[#C7E0C5] rounded" /><span className="text-[#605E5C]">Answered ({answered})</span></div>
            <div className="flex items-center space-x-1.5"><span className="w-3 h-3 bg-[#FEF0CD] border border-[#FDDC86] rounded" /><span className="text-[#605E5C]">Flagged ({flagged.size})</span></div>
            <div className="flex items-center space-x-1.5"><span className="w-3 h-3 bg-white border border-[#EDEBE9] rounded" /><span className="text-[#605E5C]">Unanswered ({unanswered})</span></div>
          </div>
        </aside>
      </div>

      {/* Submit Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white border border-[#EDEBE9] rounded-lg max-w-sm w-full p-6 space-y-4 shadow-lg animate-scale-in">
            <div className="text-center space-y-2">
              <div className="inline-flex p-2.5 bg-[#DEECF9] rounded-lg"><CheckCircle className="w-7 h-7 text-[#0078D4]" /></div>
              <h2 className="text-[16px] font-bold text-[#323130]">Submit Exam?</h2>
              <p className="text-[13px] text-[#605E5C]">
                You answered <span className="font-bold text-[#323130]">{answered}</span> of <span className="font-bold text-[#323130]">{test.totalQuestions}</span> questions.
                {unanswered > 0 && <span className="text-[#CA5010] font-semibold"> {unanswered} unanswered.</span>}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button onClick={() => setShowSubmitConfirm(false)}
                className="py-2.5 bg-[#F3F2F1] text-[#605E5C] font-semibold rounded-md hover:bg-[#EDEBE9] transition-colors text-[13px]">Continue</button>
              <button onClick={handleSubmit} disabled={submitting}
                className="py-2.5 bg-[#0078D4] text-white font-semibold rounded-md hover:bg-[#106EBE] transition-colors text-[13px] disabled:opacity-60">
                {submitting ? 'Submitting...' : 'Submit Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
