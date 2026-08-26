'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Unlock,
  Tag,
  BarChart3,
  Trophy,
  Clock,
  BookOpen,
  X,
  GraduationCap,
} from 'lucide-react';
import api from '../../../lib/api';

type PaymentRecord = {
  id: string;
  userId: string;
  testId: string;
  amount: number;
  currency: string;
  paymentRef: string;
  paymentProvider: string;
  paymentStatus: 'SUCCESS' | 'PENDING' | 'FAILED';
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    referralCode?: string;
  };
  test?: {
    title: string;
  };
};

type SubjectScoreItem = {
  subjectId?: string;
  subjectName?: string;
  score?: number;
  totalMarks?: number;
  percentage?: number;
};

type AttemptItem = {
  id: string;
  score?: number | null;
  percentage?: number | null;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';
  totalTime?: number;
  timeUsed?: number;
  subjectScores?: SubjectScoreItem[] | any;
  createdAt: string;
  test?: {
    title: string;
  };
};

type StudentUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  school?: string;
  class?: string;
  state?: string;
  faculty?: string;
  referralCode?: string;
  isActive: boolean;
  createdAt: string;
  attempts?: AttemptItem[];
};

export default function StudentsAdminPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [students, setStudents] = useState<StudentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'paid' | 'pending' | 'all'>('paid');
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentUser | null>(null);
  const [messageModal, setMessageModal] = useState<{ open: boolean; title: string; text: string; type?: 'success' | 'error' | 'info' }>({
    open: false,
    title: '',
    text: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [payRes, studRes] = await Promise.all([
        api.get('/payments/all').catch(() => ({ data: { data: { payments: [] } } })),
        api.get('/users?role=STUDENT').catch(() => ({ data: { data: { users: [] } } })),
      ]);

      setPayments(payRes.data?.data?.payments || []);
      setStudents(studRes.data?.data?.users || []);
    } catch (err) {
      console.error('Failed to fetch admin roster data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSyncAllPending = async () => {
    setSyncing(true);
    try {
      const res = await api.post('/payments/sync-pending');
      const synced = res.data?.data?.syncedCount || 0;
      await fetchData();
      setMessageModal({
        open: true,
        title: 'Sync Complete',
        text: `Checked pending Paystack transactions. ${synced} payment(s) successfully verified and unlocked!`,
        type: 'success',
      });
    } catch (err: any) {
      setMessageModal({
        open: true,
        title: 'Sync Error',
        text: err.response?.data?.message || 'Failed to sync pending payments.',
        type: 'error',
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleManualUnlock = async (userId: string, studentEmail: string) => {
    try {
      const res = await api.post('/payments/manual-unlock', { userId, email: studentEmail });
      await fetchData();
      setMessageModal({
        open: true,
        title: 'Access Granted',
        text: res.data?.message || `Access fee waived and account unlocked for ${studentEmail}`,
        type: 'success',
      });
    } catch (err: any) {
      setMessageModal({
        open: true,
        title: 'Unlock Failed',
        text: err.response?.data?.message || 'Could not unlock account.',
        type: 'error',
      });
    }
  };

  const handleVerifyReference = async (reference: string) => {
    try {
      await api.post('/payments/verify', { reference });
      await fetchData();
      setMessageModal({
        open: true,
        title: 'Payment Verified',
        text: `Reference ${reference} verified via Paystack and unlocked!`,
        type: 'success',
      });
    } catch (err: any) {
      setMessageModal({
        open: true,
        title: 'Verification Failed',
        text: err.response?.data?.message || 'Paystack verification failed.',
        type: 'error',
      });
    }
  };

  const paidPayments = payments.filter((p) => p.paymentStatus === 'SUCCESS');
  const pendingPayments = payments.filter((p) => p.paymentStatus === 'PENDING');

  // Filter list by search query
  const filteredPaid = paidPayments.filter(
    (p) =>
      p.user.firstName.toLowerCase().includes(search.toLowerCase()) ||
      p.user.lastName.toLowerCase().includes(search.toLowerCase()) ||
      p.user.email.toLowerCase().includes(search.toLowerCase()) ||
      (p.paymentRef && p.paymentRef.toLowerCase().includes(search.toLowerCase())) ||
      (p.user.referralCode && p.user.referralCode.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredPending = pendingPayments.filter(
    (p) =>
      p.user.firstName.toLowerCase().includes(search.toLowerCase()) ||
      p.user.lastName.toLowerCase().includes(search.toLowerCase()) ||
      p.user.email.toLowerCase().includes(search.toLowerCase()) ||
      (p.paymentRef && p.paymentRef.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredStudents = students.filter(
    (s) =>
      s.firstName.toLowerCase().includes(search.toLowerCase()) ||
      s.lastName.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.faculty && s.faculty.toLowerCase().includes(search.toLowerCase())) ||
      (s.referralCode && s.referralCode.toLowerCase().includes(search.toLowerCase()))
  );

  // Helper to compute subject performance breakdown for a student
  const getSubjectBreakdown = (attempts: AttemptItem[] = []) => {
    const subjectMap: Record<string, { subjectName: string; totalScore: number; attemptsCount: number; maxPercentage: number }> = {};

    attempts.forEach(attempt => {
      const scores: SubjectScoreItem[] = Array.isArray(attempt.subjectScores) ? attempt.subjectScores : [];
      scores.forEach(sub => {
        const name = sub.subjectName || 'General';
        if (!subjectMap[name]) {
          subjectMap[name] = { subjectName: name, totalScore: 0, attemptsCount: 0, maxPercentage: 0 };
        }
        subjectMap[name].totalScore += (sub.percentage || 0);
        subjectMap[name].attemptsCount += 1;
        if ((sub.percentage || 0) > subjectMap[name].maxPercentage) {
          subjectMap[name].maxPercentage = sub.percentage || 0;
        }
      });
    });

    return Object.values(subjectMap).map(item => ({
      ...item,
      avgPercentage: item.attemptsCount > 0 ? (item.totalScore / item.attemptsCount).toFixed(1) : '0',
    }));
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Page Header & Top Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--slate-900)', letterSpacing: '-0.02em', margin: 0 }}>
            Student Roster & Performance Analytics
          </h1>
          <p style={{ fontSize: 14, color: 'var(--slate-500)', marginTop: 4, fontWeight: 400 }}>
            Monitor paid students, inspect exam attempt counts, score breakdowns per subject, and verify payments.
          </p>
        </div>

        <button
          onClick={handleSyncAllPending}
          disabled={syncing}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            height: 44, padding: '0 20px', borderRadius: 12, border: 'none',
            background: '#0F172A', color: 'white', fontSize: 13, fontWeight: 800,
            cursor: syncing ? 'wait' : 'pointer', boxShadow: '0 4px 14px rgba(15,23,42,0.18)',
            transition: 'all 0.15s',
          }}
        >
          <RefreshCw style={{ width: 16, height: 16, animation: syncing ? 'spin 1s linear infinite' : 'none' }} />
          {syncing ? 'Syncing Paystack...' : '⚡ Auto-Verify All Pending Payments'}
        </button>
      </div>

      {/* Metric Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <div style={{ background: 'white', border: '1.5px solid var(--slate-200)', borderRadius: 20, padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Registered Students</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--slate-900)', marginTop: 4 }}>{students.length}</div>
          </div>
          <Users style={{ width: 24, height: 24, color: 'var(--blue-600)' }} />
        </div>

        <div style={{ background: 'white', border: '1.5px solid var(--slate-200)', borderRadius: 20, padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Paid & Unlocked Accounts</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#16A34A', marginTop: 4 }}>{paidPayments.length}</div>
          </div>
          <CheckCircle2 style={{ width: 24, height: 24, color: '#16A34A' }} />
        </div>

        <div style={{ background: 'white', border: '1.5px solid var(--slate-200)', borderRadius: 20, padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pending / Verification Issues</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#DC2626', marginTop: 4 }}>{pendingPayments.length}</div>
          </div>
          <AlertCircle style={{ width: 24, height: 24, color: '#DC2626' }} />
        </div>
      </div>

      {/* Tabs & Search Navigation Bar */}
      <div style={{ background: 'white', border: '1.5px solid var(--slate-200)', borderRadius: 20, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F8FAFC', padding: 4, borderRadius: 12, border: '1px solid #E2E8F0' }}>
          <button
            onClick={() => setActiveTab('paid')}
            style={{
              height: 36, padding: '0 16px', borderRadius: 8, border: 'none',
              background: activeTab === 'paid' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'paid' ? '#0F172A' : '#64748B',
              fontSize: 13, fontWeight: 800, cursor: 'pointer',
              boxShadow: activeTab === 'paid' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <CheckCircle2 style={{ width: 15, height: 15, color: '#16A34A' }} />
            Paid Students ({paidPayments.length})
          </button>

          <button
            onClick={() => setActiveTab('pending')}
            style={{
              height: 36, padding: '0 16px', borderRadius: 8, border: 'none',
              background: activeTab === 'pending' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'pending' ? '#DC2626' : '#64748B',
              fontSize: 13, fontWeight: 800, cursor: 'pointer',
              boxShadow: activeTab === 'pending' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <AlertCircle style={{ width: 15, height: 15, color: '#DC2626' }} />
            Verification Issues ({pendingPayments.length})
          </button>

          <button
            onClick={() => setActiveTab('all')}
            style={{
              height: 36, padding: '0 16px', borderRadius: 8, border: 'none',
              background: activeTab === 'all' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'all' ? '#0F172A' : '#64748B',
              fontSize: 13, fontWeight: 800, cursor: 'pointer',
              boxShadow: activeTab === 'all' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <Users style={{ width: 15, height: 15, color: 'var(--blue-600)' }} />
            All Registered Students ({students.length})
          </button>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: 280, flex: 1, maxWidth: 400 }}>
          <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--slate-400)' }} />
          <input
            type="text"
            placeholder="Search by name, email, faculty, or referral..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', height: 40, paddingLeft: 40, paddingRight: 16,
              borderRadius: 10, border: '1.5px solid var(--slate-200)', background: 'var(--slate-50)',
              fontSize: 13, fontWeight: 500, color: 'var(--slate-900)', outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Main Table Content */}
      <div style={{ background: 'white', border: '1.5px solid var(--slate-200)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
            <div style={{ width: 28, height: 28, border: '2.5px solid #E2E8F0', borderTopColor: '#0F172A', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          </div>
        ) : activeTab === 'paid' ? (
          /* TAB 1: PAID STUDENTS TABLE */
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--slate-50)', borderBottom: '1px solid var(--slate-200)', fontSize: 11, fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <th style={{ padding: '16px 24px' }}>Paid Student</th>
                <th style={{ padding: '16px 20px' }}>Faculty</th>
                <th style={{ padding: '16px 20px' }}>Attempts</th>
                <th style={{ padding: '16px 20px' }}>Top Score</th>
                <th style={{ padding: '16px 20px' }}>Provider</th>
                <th style={{ padding: '16px 20px' }}>Amount</th>
                <th style={{ padding: '16px 24px', textAlign: 'right' }}>Performance</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: 13 }}>
              {filteredPaid.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#64748B', fontWeight: 500 }}>
                    No paid student records found.
                  </td>
                </tr>
              ) : (
                filteredPaid.map((p, i) => {
                  const stud = students.find(s => s.id === p.userId);
                  const attempts = stud?.attempts || [];
                  const completed = attempts.filter(a => a.status === 'COMPLETED');
                  const topScore = completed.length > 0 ? Math.max(...completed.map(a => a.score || 0)) : null;
                  const topPct = completed.length > 0 ? Math.max(...completed.map(a => a.percentage || 0)) : null;

                  return (
                    <tr key={p.id} style={{ borderBottom: i === filteredPaid.length - 1 ? 'none' : '1px solid var(--slate-100)' }}>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{p.user.firstName} {p.user.lastName}</div>
                        <div style={{ fontSize: 12, color: 'var(--slate-400)', marginTop: 2 }}>{p.user.email}</div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        {stud?.faculty ? (
                          <span style={{ fontSize: 11, fontWeight: 700, background: '#F1F5F9', color: '#334155', padding: '3px 8px', borderRadius: 6, border: '1px solid #E2E8F0' }}>
                            {stud.faculty}
                          </span>
                        ) : (
                          <span style={{ fontSize: 12, color: '#94A3B8' }}>Unset</span>
                        )}
                      </td>
                      <td style={{ padding: '16px 20px', fontWeight: 700, color: '#334155' }}>
                        {attempts.length} tries ({completed.length} done)
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        {topScore !== null ? (
                          <span style={{ fontWeight: 800, color: '#15803D' }}>
                            {topScore} ({topPct?.toFixed(0)}%)
                          </span>
                        ) : (
                          <span style={{ color: '#94A3B8', fontSize: 12 }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '16px 20px', fontWeight: 600, color: '#334155' }}>
                        {p.paymentProvider === 'paystack' ? 'Paystack' : p.paymentProvider}
                      </td>
                      <td style={{ padding: '16px 20px', fontWeight: 800, color: '#0F172A' }}>
                        ₦{p.amount || 1010}
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        {stud && (
                          <button
                            onClick={() => setSelectedStudent(stud)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 6,
                              padding: '6px 12px', borderRadius: 8, border: 'none',
                              background: '#0F172A', color: 'white', fontSize: 11, fontWeight: 800,
                              cursor: 'pointer', boxShadow: '0 2px 6px rgba(15,23,42,0.15)',
                            }}
                          >
                            <BarChart3 style={{ width: 13, height: 13, color: '#60A5FA' }} /> Performance
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        ) : activeTab === 'pending' ? (
          /* TAB 2: VERIFICATION ISSUES / PENDING PAYMENTS */
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#FEF2F2', borderBottom: '1px solid #FCA5A5', fontSize: 11, fontWeight: 700, color: '#991B1B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <th style={{ padding: '16px 24px' }}>Student (Needs Verification)</th>
                <th style={{ padding: '16px 20px' }}>Reference</th>
                <th style={{ padding: '16px 20px' }}>Attempted On</th>
                <th style={{ padding: '16px 20px' }}>Status</th>
                <th style={{ padding: '16px 24px', textAlign: 'right' }}>Admin Verification Actions</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: 13 }}>
              {filteredPending.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#16A34A', fontWeight: 600 }}>
                    🎉 Great news! There are zero pending payment verification issues.
                  </td>
                </tr>
              ) : (
                filteredPending.map((p, i) => (
                  <tr key={p.id} style={{ borderBottom: i === filteredPending.length - 1 ? 'none' : '1px solid var(--slate-100)' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{p.user.firstName} {p.user.lastName}</div>
                      <div style={{ fontSize: 12, color: 'var(--slate-400)', marginTop: 2 }}>{p.user.email}</div>
                    </td>
                    <td style={{ padding: '16px 20px', fontFamily: 'monospace', fontSize: 12, color: '#DC2626' }}>
                      {p.paymentRef}
                    </td>
                    <td style={{ padding: '16px 20px', color: '#64748B', fontSize: 12 }}>
                      {new Date(p.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8, background: '#FEF2F2', color: '#DC2626', fontSize: 11, fontWeight: 800 }}>
                        <AlertCircle style={{ width: 13, height: 13 }} /> PENDING VERIFICATION
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                        <button
                          onClick={() => handleVerifyReference(p.paymentRef)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            padding: '6px 12px', borderRadius: 8, border: 'none',
                            background: '#0F172A', color: 'white', fontSize: 11, fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          <RefreshCw style={{ width: 12, height: 12 }} /> Verify via Paystack
                        </button>

                        <button
                          onClick={() => handleManualUnlock(p.user.id, p.user.email)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            padding: '6px 12px', borderRadius: 8, border: 'none',
                            background: '#16A34A', color: 'white', fontSize: 11, fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          <Unlock style={{ width: 12, height: 12 }} /> Manually Grant Access
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          /* TAB 3: ALL REGISTERED STUDENTS */
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--slate-50)', borderBottom: '1px solid var(--slate-200)', fontSize: 11, fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <th style={{ padding: '16px 24px' }}>Student</th>
                <th style={{ padding: '16px 20px' }}>Faculty</th>
                <th style={{ padding: '16px 20px' }}>Tries / Exams</th>
                <th style={{ padding: '16px 20px' }}>Top Score</th>
                <th style={{ padding: '16px 24px', textAlign: 'center' }}>Access Status</th>
                <th style={{ padding: '16px 24px', textAlign: 'right' }}>Performance & Actions</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: 13 }}>
              {filteredStudents.map((s, i) => {
                const hasPaid = payments.some((p) => p.userId === s.id && p.paymentStatus === 'SUCCESS');
                const attempts = s.attempts || [];
                const completed = attempts.filter(a => a.status === 'COMPLETED');
                const topScore = completed.length > 0 ? Math.max(...completed.map(a => a.score || 0)) : null;
                const topPct = completed.length > 0 ? Math.max(...completed.map(a => a.percentage || 0)) : null;

                return (
                  <tr key={s.id} style={{ borderBottom: i === filteredStudents.length - 1 ? 'none' : '1px solid var(--slate-100)' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{s.firstName} {s.lastName}</div>
                      <div style={{ fontSize: 12, color: 'var(--slate-400)', marginTop: 2 }}>{s.email}</div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      {s.faculty ? (
                        <span style={{ fontSize: 11, fontWeight: 700, background: '#F1F5F9', color: '#334155', padding: '3px 8px', borderRadius: 6, border: '1px solid #E2E8F0' }}>
                          {s.faculty}
                        </span>
                      ) : (
                        <span style={{ fontSize: 12, color: '#94A3B8' }}>Unset</span>
                      )}
                    </td>
                    <td style={{ padding: '16px 20px', fontWeight: 700, color: '#334155' }}>
                      {attempts.length} tries ({completed.length} done)
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      {topScore !== null ? (
                        <span style={{ fontWeight: 800, color: '#15803D' }}>
                          {topScore} ({topPct?.toFixed(0)}%)
                        </span>
                      ) : (
                        <span style={{ color: '#94A3B8', fontSize: 12 }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                      {hasPaid ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8, background: '#ECFDF5', color: '#16A34A', fontSize: 11, fontWeight: 800 }}>
                          <CheckCircle2 style={{ width: 13, height: 13 }} /> UNLOCKED
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8, background: '#FEF2F2', color: '#DC2626', fontSize: 11, fontWeight: 800 }}>
                          LOCKED
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                        <button
                          onClick={() => setSelectedStudent(s)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '6px 12px', borderRadius: 8, border: 'none',
                            background: '#0F172A', color: 'white', fontSize: 11, fontWeight: 800,
                            cursor: 'pointer', boxShadow: '0 2px 6px rgba(15,23,42,0.15)',
                          }}
                        >
                          <BarChart3 style={{ width: 13, height: 13, color: '#60A5FA' }} /> Performance
                        </button>

                        {!hasPaid && (
                          <button
                            onClick={() => handleManualUnlock(s.id, s.email)}
                            style={{
                              padding: '6px 12px', borderRadius: 8, border: 'none',
                              background: '#16A34A', color: 'white', fontSize: 11, fontWeight: 700,
                              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
                            }}
                          >
                            <Unlock style={{ width: 12, height: 12 }} /> Unlock
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── STUDENT PERFORMANCE & SUBJECT SCORES MODAL ── */}
      {selectedStudent && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedStudent(null); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
        >
          <div style={{
            background: '#FFFFFF', borderRadius: 24, padding: 28, width: '100%', maxWidth: 760,
            maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
            display: 'flex', flexDirection: 'column', gap: 20, border: '1px solid #E2E8F0',
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: 16 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {selectedStudent.firstName} {selectedStudent.lastName}
                  <span style={{ fontSize: 11, fontWeight: 800, background: '#EFF6FF', color: '#1D4ED8', padding: '3px 10px', borderRadius: 20, border: '1px solid #BFDBFE' }}>
                    <GraduationCap style={{ width: 13, height: 13, display: 'inline', marginRight: 4 }} />
                    {selectedStudent.faculty || 'Faculty Unset'}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
                  {selectedStudent.email} • Registered {new Date(selectedStudent.createdAt).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                style={{ width: 32, height: 32, borderRadius: 10, border: '1px solid #E2E8F0', background: '#F8FAFC', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X style={{ width: 16, height: 16, color: '#64748B' }} />
              </button>
            </div>

            {/* Performance Summary Metrics Cards */}
            {(() => {
              const attempts = selectedStudent.attempts || [];
              const completed = attempts.filter(a => a.status === 'COMPLETED');
              const totalScore = completed.reduce((acc, a) => acc + (a.score || 0), 0);
              const avgScore = completed.length > 0 ? (totalScore / completed.length).toFixed(1) : '0';
              const maxScore = completed.length > 0 ? Math.max(...completed.map(a => a.score || 0)) : 0;
              const maxPct = completed.length > 0 ? Math.max(...completed.map(a => a.percentage || 0)).toFixed(0) : '0';

              return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 14, padding: 14, textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#64748B', fontWeight: 700 }}>Total Tries</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', marginTop: 2 }}>{attempts.length}</div>
                    <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>{completed.length} completed</div>
                  </div>
                  <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 14, padding: 14, textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#065F46', fontWeight: 700 }}>High Score</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#16A34A', marginTop: 2 }}>{maxScore}</div>
                    <div style={{ fontSize: 10, color: '#047857', marginTop: 2 }}>{maxPct}% top score</div>
                  </div>
                  <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 14, padding: 14, textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#1E40AF', fontWeight: 700 }}>Avg Score</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#2563EB', marginTop: 2 }}>{avgScore}</div>
                    <div style={{ fontSize: 10, color: '#1D4ED8', marginTop: 2 }}>points / test</div>
                  </div>
                  <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 14, padding: 14, textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#92400E', fontWeight: 700 }}>Access</div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: '#D97706', marginTop: 6 }}>
                      {payments.some(p => p.userId === selectedStudent.id && p.paymentStatus === 'SUCCESS') ? 'UNLOCKED 🟢' : 'LOCKED 🔒'}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Subject Performance Breakdown Table */}
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <BookOpen style={{ width: 16, height: 16, color: '#2563EB' }} /> Score Breakdown Per Subject
              </h3>

              {(() => {
                const subBreakdown = getSubjectBreakdown(selectedStudent.attempts || []);
                if (subBreakdown.length === 0) {
                  return (
                    <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: 12, border: '1px dashed #CBD5E1', fontSize: 12, color: '#64748B', textAlign: 'center' }}>
                      No subject attempt scores recorded yet for this student.
                    </div>
                  );
                }

                return (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#F1F5F9', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: 700 }}>
                        <th style={{ padding: '10px 14px' }}>Subject</th>
                        <th style={{ padding: '10px 14px' }}>Times Attempted</th>
                        <th style={{ padding: '10px 14px' }}>Average Percentage</th>
                        <th style={{ padding: '10px 14px', textAlign: 'right' }}>Highest Score %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subBreakdown.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '10px 14px', fontWeight: 800, color: '#0F172A' }}>{item.subjectName}</td>
                          <td style={{ padding: '10px 14px', color: '#475569', fontWeight: 600 }}>{item.attemptsCount} tests</td>
                          <td style={{ padding: '10px 14px', fontWeight: 800, color: '#2563EB' }}>{item.avgPercentage}%</td>
                          <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 900, color: '#16A34A' }}>{item.maxPercentage.toFixed(0)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                );
              })()}
            </div>

            {/* Test Attempt Log Table */}
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock style={{ width: 16, height: 16, color: '#7C3AED' }} /> Full Exam Attempt History ({(selectedStudent.attempts || []).length} Tries)
              </h3>

              {(selectedStudent.attempts || []).length === 0 ? (
                <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: 12, border: '1px dashed #CBD5E1', fontSize: 12, color: '#64748B', textAlign: 'center' }}>
                  Student has not started any practice tests yet.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#F1F5F9', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: 700 }}>
                      <th style={{ padding: '10px 14px' }}>Exam Title</th>
                      <th style={{ padding: '10px 14px' }}>Status</th>
                      <th style={{ padding: '10px 14px' }}>Score</th>
                      <th style={{ padding: '10px 14px' }}>Percentage</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedStudent.attempts || []).map((att) => (
                      <tr key={att.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0F172A' }}>
                          {att.test?.title || 'Custom Practice Exam'}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          {att.status === 'COMPLETED' ? (
                            <span style={{ fontSize: 10, fontWeight: 800, color: '#16A34A', background: '#ECFDF5', padding: '2px 6px', borderRadius: 4 }}>
                              COMPLETED
                            </span>
                          ) : (
                            <span style={{ fontSize: 10, fontWeight: 800, color: '#D97706', background: '#FFFBEB', padding: '2px 6px', borderRadius: 4 }}>
                              IN PROGRESS
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '10px 14px', fontWeight: 800, color: '#0F172A' }}>
                          {att.score !== null && att.score !== undefined ? att.score : '—'}
                        </td>
                        <td style={{ padding: '10px 14px', fontWeight: 800, color: att.percentage && att.percentage >= 50 ? '#16A34A' : '#DC2626' }}>
                          {att.percentage !== null && att.percentage !== undefined ? `${att.percentage.toFixed(0)}%` : '—'}
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', color: '#64748B' }}>
                          {new Date(att.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 10 }}>
              <button
                onClick={() => setSelectedStudent(null)}
                style={{ padding: '9px 20px', borderRadius: 10, border: 'none', background: '#0F172A', color: 'white', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
              >
                Close Performance Panel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Popup for System Messages */}
      {messageModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 28, maxWidth: 440, width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', textAlign: 'center' }}>
            <div style={{ width: 50, height: 50, borderRadius: 14, background: messageModal.type === 'error' ? '#FEF2F2' : '#ECFDF5', color: messageModal.type === 'error' ? '#DC2626' : '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              {messageModal.type === 'error' ? <AlertCircle style={{ width: 26, height: 26 }} /> : <CheckCircle2 style={{ width: 26, height: 26 }} />}
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', margin: 0 }}>{messageModal.title}</h3>
            <p style={{ fontSize: 13, color: '#64748B', margin: '8px 0 20px', lineHeight: 1.5 }}>{messageModal.text}</p>
            <button
              onClick={() => setMessageModal({ ...messageModal, open: false })}
              style={{ width: '100%', height: 42, borderRadius: 10, border: 'none', background: '#0F172A', color: 'white', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}
            >
              OK, Got It
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
