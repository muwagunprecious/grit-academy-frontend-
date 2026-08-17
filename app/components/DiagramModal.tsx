'use client';

import React from 'react';
import { X, Image as ImageIcon, Zap, Maximize2 } from 'lucide-react';

interface DiagramModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionText: string;
  imageUrl?: string | null;
}

export default function DiagramModal({ isOpen, onClose, questionText, imageUrl }: DiagramModalProps) {
  if (!isOpen) return null;

  const isCapacitorQ = /capacitors?\s+[pq]|capacitance/i.test(questionText);
  const isCircuitQ   = /circuit|resistor|voltage|current|d\.c\s+source|battery/i.test(questionText);
  const isLensQ      = /lens|refraction|mirror|focal/i.test(questionText);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
    }}>
      <div style={{
        background: '#0F172A',
        borderRadius: 24,
        border: '1.5px solid rgba(59,130,246,0.3)',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), 0 0 40px rgba(59,130,246,0.15)',
        width: '100%', maxWidth: 640, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          background: 'linear-gradient(90deg, rgba(30,58,138,0.4) 0%, rgba(15,23,42,0.8) 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ImageIcon style={{ width: 18, height: 18, color: '#60A5FA' }} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 900, color: 'white', letterSpacing: '-0.01em' }}>
                Question Diagram & Visual Schematic
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                High-Resolution Figure Reference
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          {imageUrl ? (
            <div style={{ width: '100%', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
              <img src={imageUrl} alt="Question Diagram" style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
          ) : isCapacitorQ ? (
            /* Custom SVG Schematic for Capacitor P (2F) and Q (4F) Circuit */
            <div style={{
              width: '100%', padding: '20px', borderRadius: 16,
              background: '#0B1120', border: '1px solid rgba(59,130,246,0.2)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
            }}>
              <svg width="340" height="180" viewBox="0 0 340 180" style={{ maxWidth: '100%' }}>
                {/* Circuit Wires */}
                <path d="M 40 90 L 90 90 M 150 90 L 210 90 M 270 90 L 300 90 M 300 90 L 300 150 L 40 150 L 40 90" stroke="#60A5FA" strokeWidth="2.5" fill="none" />
                
                {/* D.C Source Battery */}
                <line x1="160" y1="140" x2="160" y2="160" stroke="#F59E0B" strokeWidth="4" />
                <line x1="175" y1="145" x2="175" y2="155" stroke="#F59E0B" strokeWidth="2" />
                <text x="160" y="132" fill="#F59E0B" fontSize="11" fontWeight="bold" textAnchor="middle">D.C. Source (V)</text>
                <text x="148" y="153" fill="#34D399" fontSize="12" fontWeight="bold">+</text>
                <text x="187" y="153" fill="#F87171" fontSize="12" fontWeight="bold">-</text>

                {/* Capacitor P (2F) */}
                <rect x="90" y="65" width="60" height="50" rx="6" fill="#1E293B" stroke="#3B82F6" strokeWidth="2" />
                <line x1="114" y1="75" x2="114" y2="105" stroke="#93C5FD" strokeWidth="3" />
                <line x1="126" y1="75" x2="126" y2="105" stroke="#93C5FD" strokeWidth="3" />
                <text x="120" y="52" fill="#E2E8F0" fontSize="13" fontWeight="900" textAnchor="middle">Capacitor P</text>
                <text x="120" y="128" fill="#93C5FD" fontSize="11" fontWeight="bold" textAnchor="middle">C₁ = 2F</text>

                {/* Capacitor Q (4F) */}
                <rect x="210" y="65" width="60" height="50" rx="6" fill="#1E293B" stroke="#8B5CF6" strokeWidth="2" />
                <line x1="234" y1="75" x2="234" y2="105" stroke="#C4B5FD" strokeWidth="3" />
                <line x1="246" y1="75" x2="246" y2="105" stroke="#C4B5FD" strokeWidth="3" />
                <text x="240" y="52" fill="#E2E8F0" fontSize="13" fontWeight="900" textAnchor="middle">Capacitor Q</text>
                <text x="240" y="128" fill="#C4B5FD" fontSize="11" fontWeight="bold" textAnchor="middle">C₂ = 4F</text>
              </svg>

              <div style={{
                padding: '10px 14px', borderRadius: 10,
                background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
                fontSize: 11, color: '#93C5FD', fontWeight: 600, textAlign: 'center',
              }}>
                ⚡ <strong>Circuit Reference:</strong> Two Capacitors P (2F) and Q (4F) connected in series to a D.C. Voltage Source.
              </div>
            </div>
          ) : (
            /* General Scientific Schematic Render */
            <div style={{
              width: '100%', padding: '24px', borderRadius: 16,
              background: '#0B1120', border: '1px solid rgba(59,130,246,0.2)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
            }}>
              <div style={{ width: 60, height: 60, borderRadius: 16, background: 'rgba(96,165,250,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap style={{ width: 30, height: 30, color: '#60A5FA' }} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'white', textAlign: 'center' }}>
                {questionText.slice(0, 90)}...
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 1.6 }}>
                Refer to the component values and relationships given in the problem statement above.
              </div>
            </div>
          )}

          {/* Question Caption */}
          <div style={{
            padding: '12px 16px', borderRadius: 12,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, width: '100%',
          }}>
            <strong>Question text:</strong> "{questionText}"
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px', background: 'rgba(15,23,42,0.95)', borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', justifyContent: 'flex-end',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '9px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              color: 'white', fontSize: 12, fontWeight: 800, boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
            }}
          >
            Close Diagram
          </button>
        </div>
      </div>
    </div>
  );
}
