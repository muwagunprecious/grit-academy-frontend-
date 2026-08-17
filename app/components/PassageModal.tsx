'use client';

import React from 'react';
import { X, BookOpen, Layers } from 'lucide-react';

interface PassageModalProps {
  isOpen: boolean;
  onClose: () => void;
  passageText: string;
  questionText?: string;
}

export default function PassageModal({ isOpen, onClose, passageText, questionText }: PassageModalProps) {
  if (!isOpen || !passageText) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(15,23,42,0.82)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
    }}>
      <div style={{
        background: '#0F172A',
        borderRadius: 24,
        border: '1.5px solid rgba(59,130,246,0.35)',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6), 0 0 40px rgba(59,130,246,0.18)',
        width: '100%', maxWidth: 680, maxHeight: '85vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          background: 'linear-gradient(90deg, rgba(30,58,138,0.5) 0%, rgba(15,23,42,0.9) 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(59,130,246,0.25)', border: '1px solid rgba(59,130,246,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BookOpen style={{ width: 18, height: 18, color: '#60A5FA' }} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 900, color: 'white', letterSpacing: '-0.01em' }}>
                📖 Reading Passage & Story
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
                English Comprehension & Story Reference
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 34, height: 34, borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Question context bar if provided */}
        {questionText && (
          <div style={{
            padding: '12px 24px', background: 'rgba(30,58,138,0.2)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            fontSize: 12, color: '#93C5FD', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <Layers style={{ width: 14, height: 14, flexShrink: 0 }} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <strong>Referenced Question:</strong> "{questionText}"
            </span>
          </div>
        )}

        {/* Passage Content Box */}
        <div style={{
          padding: '24px', flex: 1, overflowY: 'auto',
          fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.92)',
          lineHeight: 1.85, whiteSpace: 'pre-line',
          background: 'rgba(0,0,0,0.25)',
        }}>
          {passageText}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px', background: 'rgba(15,23,42,0.95)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
            Scroll to read full text • Close when ready to answer
          </span>
          <button
            onClick={onClose}
            style={{
              padding: '10px 22px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              color: 'white', fontSize: 13, fontWeight: 800,
              boxShadow: '0 4px 14px rgba(37,99,235,0.3)', transition: 'all 0.15s',
            }}
          >
            Close & Continue Exam →
          </button>
        </div>
      </div>
    </div>
  );
}
