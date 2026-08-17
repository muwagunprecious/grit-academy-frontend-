'use client';

import React, { useEffect, useState } from 'react';
import { Flag, Loader2, CheckCircle2, AlertTriangle, Trash2, BookOpen, User } from 'lucide-react';
import api from '../../../lib/api';

interface FlaggedItem {
  logId: string;
  questionId: string;
  text: string;
  passage?: string | null;
  subjectName: string;
  topic: string;
  options: Array<{ id: string; text: string; isCorrect?: boolean }>;
  explanation?: string;
  flaggedBy: string;
  studentName: string;
  createdAt: string;
}

export default function FlaggedQuestionsPage() {
  const [items, setItems] = useState<FlaggedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissingId, setDismissingId] = useState<string | null>(null);

  const fetchFlagged = async () => {
    try {
      const res = await api.get('/questions/flagged');
      setItems(res.data.data.flaggedQuestions || []);
    } catch (err) {
      console.error('Failed to load flagged questions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlagged();
  }, []);

  const handleDismiss = async (logId: string) => {
    setDismissingId(logId);
    try {
      await api.delete(`/questions/flagged/${logId}`);
      setItems(prev => prev.filter(item => item.logId !== logId));
    } catch (err) {
      console.error('Failed to dismiss flag:', err);
    } finally {
      setDismissingId(null);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <Loader2 style={{ width: 28, height: 28, color: '#0F172A', animation: 'spin 0.7s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ maxWidth: 1140, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', borderRadius: 20,
            background: '#FEF2F2', border: '1px solid rgba(220,38,38,0.2)',
            fontSize: 11, fontWeight: 700, color: '#DC2626',
            textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8,
          }}>
            <Flag style={{ width: 12, height: 12 }} /> Student Flagged Questions
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
            Flagged Question Review
          </h1>
          <p style={{ fontSize: 13, color: '#64748B', marginTop: 4, fontWeight: 500 }}>
            Review questions flagged by students during CBT exams for potential typos, errors, or disputed answers.
          </p>
        </div>

        <span style={{ fontSize: 12, fontWeight: 800, color: '#0F172A', background: '#F1F5F9', padding: '6px 14px', borderRadius: 20, border: '1px solid #E2E8F0' }}>
          {items.length} Flagged Reports
        </span>
      </div>

      {items.length === 0 ? (
        <div style={{
          background: '#FFFFFF', borderRadius: 20, border: '1px solid #E2E8F0',
          padding: '60px 20px', textAlign: 'center', color: '#64748B',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        }}>
          <CheckCircle2 style={{ width: 36, height: 36, color: '#059669' }} />
          <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>No Flagged Questions</div>
          <p style={{ fontSize: 13, color: '#64748B', margin: 0, maxWidth: 400 }}>
            No student has flagged any question recently. All past question banks are operating cleanly.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {items.map((item) => (
            <div
              key={item.logId}
              style={{
                background: '#FFFFFF',
                borderRadius: 18,
                border: '1px solid #E2E8F0',
                padding: '24px 28px',
                display: 'flex', flexDirection: 'column', gap: 16,
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}
            >
              {/* Header Badges */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#0F172A', background: '#F1F5F9', padding: '4px 10px', borderRadius: 6, border: '1px solid #E2E8F0' }}>
                    {item.subjectName}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B' }}>
                    Topic: {item.topic}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#DC2626', fontWeight: 700, background: '#FEF2F2', padding: '4px 10px', borderRadius: 20 }}>
                  <User style={{ width: 12, height: 12 }} /> Flagged by {item.studentName} ({item.flaggedBy})
                </div>
              </div>

              {/* Question Text */}
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', lineHeight: 1.6, margin: 0 }}>
                  {item.text}
                </p>
                {item.passage && (
                  <div style={{ marginTop: 10, padding: 12, background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 12, color: '#475569', lineHeight: 1.6 }}>
                    <strong style={{ color: '#0F172A' }}>Passage:</strong> {item.passage}
                  </div>
                )}
              </div>

              {/* Options */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {item.options.map((opt) => (
                  <div
                    key={opt.id}
                    style={{
                      padding: '10px 14px', borderRadius: 8,
                      border: `1px solid ${opt.isCorrect ? '#86EFAC' : '#E2E8F0'}`,
                      background: opt.isCorrect ? '#ECFDF5' : '#F8FAFC',
                      fontSize: 12, fontWeight: opt.isCorrect ? 700 : 500,
                      color: opt.isCorrect ? '#14532D' : '#334155',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}
                  >
                    <span style={{ fontWeight: 900 }}>[{opt.id}]</span>
                    <span>{opt.text}</span>
                    {opt.isCorrect && (
                      <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 900, background: '#059669', color: 'white', padding: '2px 6px', borderRadius: 4 }}>
                        Correct Answer
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Footer Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #F1F5F9' }}>
                <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>
                  Reported on {new Date(item.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>

                <button
                  onClick={() => handleDismiss(item.logId)}
                  disabled={dismissingId === item.logId}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '8px 16px', borderRadius: 8, border: '1px solid #E2E8F0',
                    background: '#FFFFFF', color: '#DC2626', fontSize: 12, fontWeight: 800,
                    cursor: dismissingId === item.logId ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {dismissingId === item.logId ? (
                    <Loader2 style={{ width: 14, height: 14, animation: 'spin 0.7s linear infinite' }} />
                  ) : (
                    <Trash2 style={{ width: 14, height: 14 }} />
                  )}
                  Dismiss Flag Report
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
