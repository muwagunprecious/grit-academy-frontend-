'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Unlock,
  ShieldCheck,
  CreditCard,
  Tag,
  ExternalLink,
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

type StudentUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  school?: string;
  class?: string;
  state?: string;
  referralCode?: string;
  isActive: boolean;
  createdAt: string;
};

export default function StudentsAdminPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [students, setStudents] = useState<StudentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'paid' | 'pending' | 'all'>('paid');
  const [search, setSearch] = useState('');
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
      (s.referralCode && s.referralCode.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Page Header & Top Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--slate-900)', letterSpacing: '-0.02em', margin: 0 }}>
            Student Roster & Payment Verification
          </h1>
          <p style={{ fontSize: 14, color: 'var(--slate-500)', marginTop: 4, fontWeight: 400 }}>
            Monitor paid students, track referral codes, and verify or manually resolve pending payment issues.
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
            placeholder="Search by student name, email, or referral..."
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
                <th style={{ padding: '16px 20px' }}>Referral Code</th>
                <th style={{ padding: '16px 20px' }}>Provider</th>
                <th style={{ padding: '16px 20px' }}>Reference</th>
                <th style={{ padding: '16px 20px' }}>Amount Paid</th>
                <th style={{ padding: '16px 20px' }}>Date Paid</th>
                <th style={{ padding: '16px 24px', textAlign: 'center' }}>Access Status</th>
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
                filteredPaid.map((p, i) => (
                  <tr key={p.id} style={{ borderBottom: i === filteredPaid.length - 1 ? 'none' : '1px solid var(--slate-100)' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{p.user.firstName} {p.user.lastName}</div>
                      <div style={{ fontSize: 12, color: 'var(--slate-400)', marginTop: 2 }}>{p.user.email}</div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      {p.user.referralCode ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, background: '#EFF6FF', color: 'var(--blue-600)', fontSize: 11, fontWeight: 800 }}>
                          <Tag style={{ width: 12, height: 12 }} /> {p.user.referralCode}
                        </span>
                      ) : (
                        <span style={{ fontSize: 12, color: '#94A3B8' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '16px 20px', fontWeight: 600, color: '#334155' }}>
                      {p.paymentProvider === 'paystack' ? 'Paystack Gateway' : p.paymentProvider}
                    </td>
                    <td style={{ padding: '16px 20px', fontFamily: 'monospace', fontSize: 12, color: '#475569' }}>
                      {p.paymentRef}
                    </td>
                    <td style={{ padding: '16px 20px', fontWeight: 800, color: '#0F172A' }}>
                      ₦{p.amount || 500}
                    </td>
                    <td style={{ padding: '16px 20px', color: '#64748B', fontSize: 12 }}>
                      {new Date(p.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 12px', borderRadius: 8, background: '#ECFDF5', color: '#16A34A', fontSize: 11, fontWeight: 800 }}>
                        <CheckCircle2 style={{ width: 13, height: 13 }} /> UNLOCKED
                      </span>
                    </td>
                  </tr>
                ))
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
                <th style={{ padding: '16px 20px' }}>Referral Code</th>
                <th style={{ padding: '16px 20px' }}>State / School</th>
                <th style={{ padding: '16px 20px' }}>Joined Date</th>
                <th style={{ padding: '16px 24px', textAlign: 'center' }}>Access Status</th>
                <th style={{ padding: '16px 24px', textAlign: 'right' }}>Admin Action</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: 13 }}>
              {filteredStudents.map((s, i) => {
                const hasPaid = payments.some((p) => p.userId === s.id && p.paymentStatus === 'SUCCESS');
                return (
                  <tr key={s.id} style={{ borderBottom: i === filteredStudents.length - 1 ? 'none' : '1px solid var(--slate-100)' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{s.firstName} {s.lastName}</div>
                      <div style={{ fontSize: 12, color: 'var(--slate-400)', marginTop: 2 }}>{s.email}</div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      {s.referralCode ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, background: '#EFF6FF', color: 'var(--blue-600)', fontSize: 11, fontWeight: 800 }}>
                          <Tag style={{ width: 12, height: 12 }} /> {s.referralCode}
                        </span>
                      ) : (
                        <span style={{ fontSize: 12, color: '#94A3B8' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '16px 20px', color: '#475569' }}>
                      {s.state || 'N/A'} {s.school ? `• ${s.school}` : ''}
                    </td>
                    <td style={{ padding: '16px 20px', color: '#64748B', fontSize: 12 }}>
                      {new Date(s.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
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
                      {!hasPaid && (
                        <button
                          onClick={() => handleManualUnlock(s.id, s.email)}
                          style={{
                            padding: '6px 12px', borderRadius: 8, border: 'none',
                            background: '#16A34A', color: 'white', fontSize: 11, fontWeight: 700,
                            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
                          }}
                        >
                          <Unlock style={{ width: 12, height: 12 }} /> Unlock Access
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Popup for Actions */}
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
