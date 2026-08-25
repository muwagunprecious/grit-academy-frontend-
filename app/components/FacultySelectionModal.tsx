'use client';

import React, { useState } from 'react';
import { GraduationCap, CheckCircle, ChevronRight, BookOpen, Lock } from 'lucide-react';
import api from '../../lib/api';
import { useAuthStore } from '../../stores/auth.store';

export const FACULTY_GROUPS = [
  {
    category: 'STEM, Engineering & Medical Sciences',
    faculties: [
      'Faculty of Science',
      'Faculty of Basic Medical Science',
      'Faculty of Clinical Science',
      'Faculty of Pharmacy',
      'Faculty of Engineering',
      'Faculty of Agriculture',
      'Faculty of Education STED',
    ],
    allowedSubjects: ['Mathematics', 'Communication in English', 'Physics', 'Chemistry', 'Biology'],
    badgeBg: '#EFF6FF',
    badgeText: '#1E40AF',
    borderColor: '#BFDBFE',
  },
  {
    category: 'Social Sciences & Administration',
    faculties: [
      'Faculty of Social Science',
      'Faculty of Administration',
    ],
    allowedSubjects: ['Mathematics', 'Communication in English', 'Economics', 'Government', 'CRS'],
    badgeBg: '#ECFDF5',
    badgeText: '#065F46',
    borderColor: '#A7F3D0',
  },
  {
    category: 'Law & Arts',
    faculties: [
      'Faculty of Law',
      'Faculty of Art',
    ],
    allowedSubjects: ['Communication in English', 'Government', 'CRS', 'Literature', 'Economics'],
    badgeBg: '#FFFBEB',
    badgeText: '#92400E',
    borderColor: '#FDE68A',
  },
];

export function getSubjectsForFaculty(facultyName?: string | null): string[] | null {
  if (!facultyName) return null;
  const norm = facultyName.trim().toLowerCase();
  for (const group of FACULTY_GROUPS) {
    if (group.faculties.some(f => f.toLowerCase() === norm)) {
      return group.allowedSubjects;
    }
  }
  return null;
}

interface FacultySelectionModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onFacultySaved: (faculty: string) => void;
}

export default function FacultySelectionModal({ isOpen, onClose, onFacultySaved }: FacultySelectionModalProps) {
  const { user, setUser } = useAuthStore();
  const [selectedFaculty, setSelectedFaculty] = useState<string>(user?.faculty || '');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const currentGroup = FACULTY_GROUPS.find(g =>
    g.faculties.some(f => f.toLowerCase() === selectedFaculty.trim().toLowerCase())
  );

  const handleSave = async () => {
    if (!selectedFaculty) return;
    setSaving(true);
    try {
      const res = await api.put('/users/profile', { faculty: selectedFaculty });
      const updatedUser = res.data?.data?.user;
      if (updatedUser) {
        setUser({ ...user, ...updatedUser, faculty: selectedFaculty });
      } else if (user) {
        setUser({ ...user, faculty: selectedFaculty });
      }
      onFacultySaved(selectedFaculty);
      if (onClose) onClose();
    } catch (e) {
      if (user) setUser({ ...user, faculty: selectedFaculty });
      onFacultySaved(selectedFaculty);
      if (onClose) onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        background: '#FFFFFF', borderRadius: 24, width: '100%', maxWidth: 640,
        maxHeight: '90vh', overflowY: 'auto', border: '1px solid #E2E8F0',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', padding: '32px 36px',
        display: 'flex', flexDirection: 'column', gap: 24, position: 'relative',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, background: '#F1F5F9',
            border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0, color: '#0F172A',
          }}>
            <GraduationCap style={{ width: 24, height: 24 }} />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
              Select Your Academic Faculty
            </h2>
            <p style={{ fontSize: 13, color: '#64748B', marginTop: 4, fontWeight: 500, lineHeight: 1.5 }}>
              Choose your faculty to filter your CBT practice subjects and exam packages according to your UTME/WAEC track.
            </p>
          </div>
        </div>

        {/* Mandatory Notice if Faculty not set */}
        {(!user?.faculty || user?.faculty?.trim() === '' || user?.faculty === 'null') && (
          <div style={{
            background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 14,
            padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10,
            fontSize: 12, fontWeight: 700, color: '#991B1B',
          }}>
            <Lock style={{ width: 16, height: 16, flexShrink: 0 }} />
            <span>Faculty Selection Required: Choose your faculty below to unlock your dashboard and activate your 30-minute exam bundle.</span>
          </div>
        )}

        {/* Faculty Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {FACULTY_GROUPS.map((group) => (
            <div key={group.category} style={{
              background: '#F8FAFC', borderRadius: 16, border: '1px solid #E2E8F0', padding: 18,
            }}>
              <div style={{
                fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase',
                letterSpacing: '0.05em', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span>{group.category}</span>
                <span style={{
                  fontSize: 11, background: group.badgeBg, color: group.badgeText,
                  padding: '2px 8px', borderRadius: 12, border: `1px solid ${group.borderColor}`, fontWeight: 700,
                }}>
                  {group.allowedSubjects.join(', ')}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 8 }}>
                {group.faculties.map((fac) => {
                  const isSelected = selectedFaculty === fac;
                  return (
                    <button
                      key={fac}
                      onClick={() => setSelectedFaculty(fac)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 16px', borderRadius: 12, border: `1.5px solid ${isSelected ? '#0F172A' : '#E2E8F0'}`,
                        background: isSelected ? '#0F172A' : '#FFFFFF',
                        color: isSelected ? '#FFFFFF' : '#0F172A',
                        fontSize: 13, fontWeight: 700, cursor: 'pointer',
                        transition: 'all 0.15s ease', textAlign: 'left',
                      }}
                    >
                      <span>{fac}</span>
                      {isSelected && <CheckCircle style={{ width: 16, height: 16, color: '#10B981' }} />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Selected Faculty Subject Preview */}
        {currentGroup && (
          <div style={{
            background: '#F1F5F9', borderRadius: 14, padding: 16, border: '1px solid #CBD5E1',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <BookOpen style={{ width: 20, height: 20, color: '#0F172A', flexShrink: 0 }} />
            <div style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>
              <strong style={{ color: '#0F172A' }}>Available CBT Subjects for {selectedFaculty}:</strong>{' '}
              {currentGroup.allowedSubjects.join(', ')}
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleSave}
          disabled={!selectedFaculty || saving}
          style={{
            height: 48, borderRadius: 14, border: 'none',
            background: selectedFaculty ? '#0F172A' : '#94A3B8',
            color: 'white', fontSize: 14, fontWeight: 800, cursor: selectedFaculty ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 4px 12px rgba(15,23,42,0.15)', transition: 'all 0.15s ease',
          }}
        >
          {saving ? 'Saving Faculty...' : 'Confirm Faculty & Continue →'}
        </button>
      </div>
    </div>
  );
}
