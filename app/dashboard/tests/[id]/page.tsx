'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Clock,
  HelpCircle,
  Star,
  CheckCircle2,
  XCircle,
  Trophy,
  BookOpen,
  Play,
  ShoppingCart,
} from 'lucide-react'
import api from '../../../../lib/api'

const difficultyConfig = {
  EASY: { label: 'Easy', color: 'text-[#059669]', bg: 'bg-[#ECFDF5]' },
  MEDIUM: { label: 'Medium', color: 'text-[#0F4C81]', bg: 'bg-[#EFF6FF]' },
  HARD: { label: 'Hard', color: 'text-[#D97706]', bg: 'bg-[#FFFBEB]' },
  EXPERT: { label: 'Expert', color: 'text-[#DC2626]', bg: 'bg-[#FEF2F2]' },
}

const mockTest = {
  id: '1',
  title: 'JAMB Physics 2024 Past Questions',
  description: 'Comprehensive physics test covering mechanics, optics, electricity, and modern physics. Based on the official JAMB 2024 syllabus with past questions from previous years.',
  subject: 'Physics',
  difficulty: 'HARD' as const,
  questionCount: 40,
  duration: 60,
  price: 1500,
  rating: 4.8,
  totalAttempts: 1240,
  purchased: false,
}

const mockAttempts = [
  { id: '1', date: '2025-01-15', score: 72, total: 40, timeSpent: 55, passed: true },
  { id: '2', date: '2025-01-10', score: 58, total: 40, timeSpent: 60, passed: false },
  { id: '3', date: '2024-12-28', score: 65, total: 40, timeSpent: 58, passed: true },
]

export default function TestDetailPage() {
  const router = useRouter()
  const test = mockTest
  const diff = difficultyConfig[test.difficulty]

  return (
    <div className="min-h-screen p-8 lg:p-10">
      <div className="max-w-[1280px] mx-auto space-y-10">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-[14px] text-[#6B7280] hover:text-[#111827] transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Tests
        </button>

        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-[12px] font-semibold text-slate-500">
              <BookOpen size={13} />
              {test.subject}
            </span>
            <span className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold ${diff.bg} ${diff.color} border border-blue-100/50`}>
              {diff.label}
            </span>
            <div className="flex items-center gap-1 ml-auto">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < Math.floor(test.rating) ? 'fill-[#FF7A00] text-[#FF7A00]' : 'text-[#E5E7EB]'}
                />
              ))}
              <span className="text-[13px] text-[#6B7280] ml-1">{test.rating}</span>
            </div>
          </div>

          <div>
            <h2 className="text-[26px] font-extrabold text-[#0F172A] leading-tight mb-2">{test.title}</h2>
            <p className="text-[14px] text-slate-400 font-light leading-relaxed">{test.description}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <HelpCircle size={18} className="text-emerald-600" />, label: 'Questions', value: `${test.questionCount} Qs`, bg: 'bg-emerald-50 border-emerald-100/50' },
              { icon: <Clock size={18} className="text-emerald-600" />, label: 'Time limit', value: `${test.duration} min`, bg: 'bg-emerald-50 border-emerald-100/50' },
              { icon: <Trophy size={18} className="text-blue-600" />, label: 'Attempts', value: test.totalAttempts.toLocaleString(), bg: 'bg-blue-50/80 border-blue-100/50' },
              { icon: <Star size={18} className="text-amber-600" />, label: 'Price', value: test.price === 0 ? 'Free' : `₦${test.price.toLocaleString()}`, bg: 'bg-amber-50/80 border-amber-100/50' },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#F8FAFC] border border-slate-100 rounded-2xl p-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${stat.bg}`}>
                  {stat.icon}
                </div>
                <div className="space-y-0.5">
                  <p className="text-[16px] font-extrabold text-[#0F172A] leading-none">{stat.value}</p>
                  <p className="text-[12px] text-slate-400 font-medium">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 pt-2">
            {test.purchased ? (
              <button
                onClick={() => router.push(`/dashboard/tests/${test.id}/start`)}
                className="inline-flex items-center justify-center gap-2 px-8 h-[52px] bg-[#059669] hover:bg-[#047857] active:scale-[0.98] text-white rounded-2xl text-[14px] font-bold transition shadow-md shadow-emerald-500/10 cursor-pointer"
              >
                <Play size={16} />
                Start practice test
              </button>
            ) : (
              <>
                <button 
                  onClick={() => router.push(`/dashboard/tests/${test.id}/start`)}
                  className="inline-flex items-center justify-center gap-2 px-8 h-[52px] bg-[#059669] hover:bg-[#047857] active:scale-[0.98] text-white rounded-2xl text-[14px] font-bold transition shadow-md shadow-emerald-500/10 cursor-pointer"
                >
                  <Play size={16} />
                  Start practice test
                </button>
                <button
                  onClick={() => router.push(`/dashboard/tests/${test.id}/start`)}
                  className="inline-flex items-center justify-center gap-2 px-6 h-[52px] bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-[0.98] rounded-2xl text-[14px] font-bold transition cursor-pointer"
                >
                  Preview Free
                </button>
              </>
            )}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-8">
          <h3 className="text-[16px] font-bold text-[#111827] mb-6">Attempt History</h3>

          {mockAttempts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[14px] text-[#9CA3AF]">No attempts yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mockAttempts.map((attempt) => {
                const percentage = Math.round((attempt.score / attempt.total) * 100)
                return (
                  <div
                    key={attempt.id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-[#E5E7EB] hover:border-[#0F4C81]/20 transition-all"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        attempt.passed ? 'bg-[#ECFDF5] text-[#059669]' : 'bg-[#FEF2F2] text-[#DC2626]'
                      }`}
                    >
                      {attempt.passed ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="text-[14px] font-semibold text-[#111827]">{percentage}%</span>
                        <span className={`text-[13px] font-medium ${attempt.passed ? 'text-[#059669]' : 'text-[#DC2626]'}`}>
                          {attempt.passed ? 'Passed' : 'Failed'}
                        </span>
                      </div>
                      <p className="text-[13px] text-[#9CA3AF] mt-0.5">
                        {attempt.score}/{attempt.total} correct · {attempt.timeSpent} min
                      </p>
                    </div>
                    <span className="text-[13px] text-[#9CA3AF]">{new Date(attempt.date).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
