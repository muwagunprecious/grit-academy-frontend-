'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  type?: 'error' | 'success' | 'info';
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
  onClose: () => void;
}

export default function NotificationModal({
  isOpen,
  type = 'error',
  title,
  message,
  actionText = 'OK',
  onAction,
  onClose,
}: NotificationModalProps) {
  if (!isOpen) return null;

  const isError = type === 'error';
  const isSuccess = type === 'success';

  const mainColor = isError ? '#DC2626' : isSuccess ? '#059669' : '#2563EB';
  const bgColor = isError ? '#FEF2F2' : isSuccess ? '#ECFDF5' : '#EFF6FF';
  const borderColor = isError ? 'rgba(220,38,38,0.2)' : isSuccess ? 'rgba(5,150,105,0.2)' : 'rgba(37,99,235,0.2)';

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 24,
          padding: '28px 32px',
          width: '100%',
          maxWidth: 440,
          boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
          border: '1.5px solid rgba(255,255,255,0.8)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 16,
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 18,
            background: bgColor,
            border: `1.5px solid ${borderColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            boxShadow: `0 8px 20px ${mainColor}20`,
          }}
        >
          {isError ? (
            <AlertTriangle style={{ width: 26, height: 26, color: '#DC2626' }} />
          ) : isSuccess ? (
            <CheckCircle2 style={{ width: 26, height: 26, color: '#059669' }} />
          ) : (
            <Info style={{ width: 26, height: 26, color: '#2563EB' }} />
          )}
        </div>

        {/* Title & Message */}
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            {title}
          </h3>
          <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
            {message}
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            if (onAction) onAction();
            onClose();
          }}
          style={{
            width: '100%',
            height: 46,
            borderRadius: 12,
            border: 'none',
            background: isError ? 'linear-gradient(135deg, #DC2626, #B91C1C)' : isSuccess ? 'linear-gradient(135deg, #059669, #047857)' : 'linear-gradient(135deg, #2563EB, #1D4ED8)',
            color: 'white',
            fontSize: 14,
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: `0 4px 16px ${mainColor}35`,
            transition: 'all 0.15s',
            marginTop: 8,
          }}
        >
          {actionText}
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
