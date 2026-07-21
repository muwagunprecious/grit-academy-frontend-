'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, CheckCircle, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-8 py-16 bg-[#FAFAFA]">
      <div className="w-full max-w-[440px]">
        <div className="mb-12">
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="w-9 h-9 bg-[#0F4C81] rounded-xl flex items-center justify-center">
              <span className="text-white font-extrabold text-[15px]">G</span>
            </div>
            <span className="font-extrabold text-[18px] text-[#111827] tracking-tight">Grit Academy</span>
          </Link>
        </div>

        {!sent ? (
          <>
            <h2 className="text-[32px] font-extrabold text-[#111827] tracking-[-0.02em]">Reset your password</h2>
            <p className="text-[16px] text-[#6B7280] mt-3 leading-[1.7]">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="mt-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[14px] font-semibold text-[#374151]">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#9CA3AF]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 h-[52px] bg-white border border-[#E5E7EB] rounded-2xl text-[15px] text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/10 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-[52px] bg-[#0F4C81] hover:bg-[#0A3560] text-white text-[15px] font-bold rounded-2xl transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2.5 hover:shadow-lg hover:shadow-[#0F4C81]/20 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Send Reset Link <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-[#ECFDF5] rounded-2xl flex items-center justify-center mx-auto mb-8">
              <CheckCircle className="w-8 h-8 text-[#059669]" />
            </div>
            <h2 className="text-[32px] font-extrabold text-[#111827] tracking-[-0.02em]">Check your email</h2>
            <p className="text-[16px] text-[#6B7280] mt-4 leading-[1.7] max-w-[360px] mx-auto">
              We&apos;ve sent a password reset link to <span className="font-semibold text-[#374151]">{email}</span>
            </p>
          </div>
        )}

        <div className="mt-12 text-center">
          <Link href="/login" className="inline-flex items-center gap-2 text-[15px] font-medium text-[#6B7280] hover:text-[#111827] transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to log in
          </Link>
        </div>
      </div>
    </div>
  );
}
