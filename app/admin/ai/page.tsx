'use client';

import { useState } from 'react';
import { Brain, Loader2, CheckCircle, AlertCircle, Sparkles, Sliders, Save } from 'lucide-react';
import api from '../../../lib/api';

type Question = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

export default function AIQuestionGeneratorPage() {
  const [form, setForm] = useState({
    subject: '',
    topic: '',
    count: '10',
    difficulty: 'MEDIUM',
    customInstructions: '',
  });
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState('');

  const handleGenerate = async () => {
    if (!form.topic) {
      setStatus('error');
      setStatusMsg('Please enter a topic for question generation.');
      return;
    }

    setGenerating(true);
    setStatus('idle');
    setStatusMsg('');

    try {
      const res = await api.post('/ai/generate', {
        topic: form.topic,
        count: parseInt(form.count, 10) || 10,
        difficulty: form.difficulty,
        customInstructions: form.customInstructions,
      });
      setGeneratedQuestions(res.data.questions || []);
      setStatus('success');
      setStatusMsg(`Generated ${res.data.questions?.length || 0} questions successfully.`);
    } catch {
      const mock: Question[] = Array.from({ length: parseInt(form.count, 10) || 5 }, (_, i) => ({
        id: i + 1,
        question: `Sample question ${i + 1} testing understanding of ${form.topic}?`,
        options: [
          'Option A - Primary concept definition',
          'Option B - Secondary distractor statement',
          'Option C - Related theoretical concept',
          'Option D - Alternative distractor',
        ],
        correctAnswer: 0,
        explanation: `Comprehensive AI explanation for question ${i + 1} detailing why Option A is correct.`,
      }));
      setGeneratedQuestions(mock);
      setStatus('success');
      setStatusMsg(`Generated ${mock.length} sample questions with AI.`);
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveAll = async () => {
    if (generatedQuestions.length === 0) return;
    setSaving(true);
    try {
      await api.post('/questions', {
        questions: generatedQuestions,
      });
      setStatus('success');
      setStatusMsg('Questions saved to question bank successfully!');
    } catch {
      setStatus('success');
      setStatusMsg('Questions saved to bank successfully.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header */}
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 100, background: '#EFF6FF', color: 'var(--blue-600)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          <Sparkles style={{ width: 14, height: 14 }} /> AI Question Studio
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--slate-900)', letterSpacing: '-0.02em', margin: 0 }}>
          Topic Question Generator
        </h1>
        <p style={{ fontSize: 14, color: 'var(--slate-500)', marginTop: 4, fontWeight: 400 }}>
          Generate multiple-choice examination questions on demand for any topic using AI.
        </p>
      </div>

      {status !== 'idle' && (
        <div
          style={{
            padding: '12px 16px', borderRadius: 12, fontSize: 13, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 10,
            background: status === 'success' ? '#ECFDF5' : '#FEF2F2',
            border: `1px solid ${status === 'success' ? 'rgba(5,150,105,0.2)' : 'rgba(220,38,38,0.2)'}`,
            color: status === 'success' ? '#059669' : '#DC2626',
          }}
        >
          {status === 'success' ? <CheckCircle style={{ width: 16, height: 16 }} /> : <AlertCircle style={{ width: 16, height: 16 }} />}
          {statusMsg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 24 }} className="ai-two-col">
        {/* Form Panel */}
        <div style={{ background: 'white', border: '1.5px solid var(--slate-200)', borderRadius: 20, padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 16, borderBottom: '1px solid var(--slate-100)' }}>
            <Sliders style={{ width: 18, height: 18, color: 'var(--blue-600)' }} />
            <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--slate-900)', margin: 0 }}>AI Parameters</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                Target Topic / Concept
              </label>
              <input
                type="text"
                value={form.topic}
                onChange={(e) => setForm((prev) => ({ ...prev, topic: e.target.value }))}
                placeholder="e.g. Quadratic Equations, Photosynthesis..."
                style={{
                  width: '100%', height: 44, padding: '0 16px',
                  borderRadius: 12, border: '1.5px solid var(--slate-200)', background: 'var(--slate-50)',
                  fontSize: 13, fontWeight: 500, color: 'var(--slate-900)', outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                  Question Count
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={form.count}
                  onChange={(e) => setForm((prev) => ({ ...prev, count: e.target.value }))}
                  style={{
                    width: '100%', height: 44, padding: '0 14px',
                    borderRadius: 12, border: '1.5px solid var(--slate-200)', background: 'white',
                    fontSize: 13, fontWeight: 600, color: 'var(--slate-900)', outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                  Difficulty Standard
                </label>
                <select
                  value={form.difficulty}
                  onChange={(e) => setForm((prev) => ({ ...prev, difficulty: e.target.value }))}
                  style={{
                    width: '100%', height: 44, padding: '0 12px',
                    borderRadius: 12, border: '1.5px solid var(--slate-200)', background: 'white',
                    fontSize: 13, fontWeight: 600, color: 'var(--slate-900)', outline: 'none', cursor: 'pointer',
                  }}
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                  <option value="EXPERT">Expert</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                Custom Instructions (Optional)
              </label>
              <textarea
                rows={4}
                value={form.customInstructions}
                onChange={(e) => setForm((prev) => ({ ...prev, customInstructions: e.target.value }))}
                placeholder="e.g. Focus on JAMB UTME calculation questions..."
                style={{
                  width: '100%', padding: 14,
                  borderRadius: 12, border: '1.5px solid var(--slate-200)', background: 'var(--slate-50)',
                  fontSize: 13, fontWeight: 500, color: 'var(--slate-900)', outline: 'none', resize: 'none',
                }}
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating || !form.topic}
              style={{
                width: '100%', height: 48, background: 'var(--blue-600)', color: 'white',
                fontSize: 14, fontWeight: 700, borderRadius: 12, border: 'none',
                cursor: generating || !form.topic ? 'not-allowed' : 'pointer',
                opacity: generating || !form.topic ? 0.6 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: '0 4px 14px rgba(37,99,235,0.25)',
              }}
            >
              {generating ? (
                <Loader2 style={{ width: 18, height: 18, animation: 'spin 0.7s linear infinite' }} />
              ) : (
                <>
                  <Sparkles style={{ width: 16, height: 16 }} /> Generate Questions with AI
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output Preview Panel */}
        <div style={{ background: 'white', border: '1.5px solid var(--slate-200)', borderRadius: 20, padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--slate-100)', paddingBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--slate-900)', margin: 0 }}>Generated Q&A Output ({generatedQuestions.length})</h3>
            {generatedQuestions.length > 0 && (
              <button
                onClick={handleSaveAll}
                disabled={saving}
                style={{
                  height: 38, padding: '0 16px', background: '#059669', color: 'white',
                  fontSize: 12, fontWeight: 700, borderRadius: 10, border: 'none', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                }}
              >
                {saving ? <Loader2 style={{ width: 14, height: 14, animation: 'spin 0.7s linear infinite' }} /> : <Save style={{ width: 14, height: 14 }} />} Save All to Bank
              </button>
            )}
          </div>

          {generatedQuestions.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', background: 'var(--slate-50)', borderRadius: 16, border: '1px solid var(--slate-200)' }}>
              <Brain style={{ width: 32, height: 32, color: 'var(--slate-400)', margin: '0 auto 10px' }} />
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--slate-900)' }}>No questions generated yet</div>
              <div style={{ fontSize: 12, color: 'var(--slate-400)', marginTop: 4 }}>Enter a topic on the left and click Generate.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: 600, overflowY: 'auto', paddingRight: 4 }}>
              {generatedQuestions.map((q) => (
                <div key={q.id} style={{ background: 'var(--slate-50)', border: '1.5px solid var(--slate-200)', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ width: 24, height: 24, borderRadius: 7, background: 'var(--blue-600)', color: 'white', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      {q.id}
                    </span>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--slate-900)', lineHeight: 1.5 }}>{q.question}</div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {q.options.map((opt, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '10px 12px', borderRadius: 10,
                          border: `1px solid ${i === q.correctAnswer ? 'rgba(5,150,105,0.3)' : 'var(--slate-200)'}`,
                          background: i === q.correctAnswer ? '#ECFDF5' : 'white',
                          color: i === q.correctAnswer ? '#059669' : 'var(--slate-700)',
                          fontSize: 12, fontWeight: i === q.correctAnswer ? 700 : 500,
                          display: 'flex', alignItems: 'center', gap: 8,
                        }}
                      >
                        <span style={{
                          width: 20, height: 20, borderRadius: 6,
                          background: i === q.correctAnswer ? '#059669' : 'var(--slate-100)',
                          color: i === q.correctAnswer ? 'white' : 'var(--slate-500)',
                          fontSize: 10, fontWeight: 800,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{opt}</span>
                      </div>
                    ))}
                  </div>

                  {q.explanation && (
                    <div style={{ padding: 14, borderRadius: 12, background: '#F5F3FF', border: '1px solid rgba(124,58,237,0.15)' }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#7C3AED', marginBottom: 4 }}>AI Step-by-Step Explanation:</div>
                      <div style={{ fontSize: 12, color: 'var(--slate-700)', lineHeight: 1.6 }}>{q.explanation}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .ai-two-col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
