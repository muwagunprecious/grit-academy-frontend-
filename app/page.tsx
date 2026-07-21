'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

/* ─── Helpers ─────────────────────────────────────────────── */
function useAnimateOnView(ref: React.RefObject<HTMLElement>) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref]);
  return visible;
}

function Anim({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null!);
  const visible = useAnimateOnView(ref);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.75s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

function AnimCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        let n = 0;
        const step = target / 80;
        const t = setInterval(() => {
          n += step;
          if (n >= target) { setCount(target); clearInterval(t); }
          else setCount(Math.floor(n));
        }, 20);
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ─── Data ─────────────────────────────────────────────────── */
const NAV = ['Features', 'Subjects', 'Pricing', 'Testimonials'];

const FEATURES = [
  { icon: '🧠', title: 'AI Explanations', desc: 'Step-by-step solutions that adapt to your level.', bg: '#EFF6FF' },
  { icon: '📊', title: 'Performance Analytics', desc: 'Deep insights into strengths, weaknesses and progress.', bg: '#ECFDF5' },
  { icon: '🎯', title: 'Adaptive Learning', desc: 'Questions that scale with your ability in real time.', bg: '#F5F3FF' },
  { icon: '📄', title: 'Mock Examinations', desc: 'Full-length JAMB, WAEC, NECO, and Post UTME simulations.', bg: '#FEF2F2' },
  { icon: '🏆', title: 'Leaderboard', desc: 'Compete with thousands of students nationwide.', bg: '#FFFBEB' },
  { icon: '📅', title: 'Study Planner', desc: 'AI-generated schedules tailored to your exam dates.', bg: '#F0FDFA' },
  { icon: '📱', title: 'Flashcards', desc: 'Spaced-repetition cards for long-term retention.', bg: '#FDF2F8' },
  { icon: '🔥', title: 'Streaks & Gamification', desc: 'Daily streaks, XP, and achievements that keep you going.', bg: '#FFF7ED' },
  { icon: '📈', title: 'Progress Tracking', desc: 'Visual dashboards showing improvement over time.', bg: '#EEF2FF' },
];

const SUBJECTS = [
  { name: 'Mathematics', tests: 48, icon: '∑', colors: '#2563EB,#4F46E5' },
  { name: 'Physics', tests: 36, icon: 'Φ', colors: '#7C3AED,#EC4899' },
  { name: 'Chemistry', tests: 42, icon: '⚗', colors: '#059669,#0D9488' },
  { name: 'Biology', tests: 38, icon: '🧬', colors: '#0891B2,#2563EB' },
  { name: 'English', tests: 52, icon: 'Aa', colors: '#DC2626,#EA580C' },
  { name: 'Economics', tests: 30, icon: '📈', colors: '#D97706,#CA8A04' },
  { name: 'Literature', tests: 24, icon: '📖', colors: '#BE185D,#9D174D' },
  { name: 'Government', tests: 22, icon: '🏛', colors: '#4F46E5,#2563EB' },
];

const TESTIMONIALS = [
  { name: 'Adaeze O.', uni: 'University of Lagos', quote: 'Grit Academy completely transformed how I prepared for JAMB. AI explanations made Physics click. Scored 310!', av: 'A' },
  { name: 'Emeka N.', uni: 'Ahmadu Bello University', quote: 'The adaptive learning knew exactly where I was weak and kept drilling those topics. Got into my dream school.', av: 'E' },
  { name: 'Fatima B.', uni: 'University of Ilorin', quote: 'I tried every CBT app out there. Grit Academy is in a different league. The analytics alone are worth it.', av: 'F' },
  { name: 'Oluwaseun A.', uni: 'Obafemi Awolowo University', quote: 'Mock exams felt exactly like the real thing. When I sat for WAEC, nothing surprised me. Straight A\'s.', av: 'O' },
  { name: 'Chidinma E.', uni: 'University of Nigeria', quote: 'Went from 45% to 89% in Chemistry in three weeks. The flashcards and spaced repetition work wonders.', av: 'C' },
  { name: 'Ibrahim K.', uni: 'Bayero University', quote: 'The leaderboard kept us competing. None of my friends scored below 280 in JAMB. Incredible platform.', av: 'I' },
];

const PRICING = [
  { name: 'Starter', price: 'Free', period: '', desc: 'Perfect for getting started', popular: false, features: ['10 questions per subject', 'Basic performance tracking', 'AI explanations', 'Community leaderboard'], cta: 'Get Started Free' },
  { name: 'Pro', price: '₦2,500', period: '/month', desc: 'For serious exam candidates', popular: true, features: ['Unlimited practice questions', 'Full analytics dashboard', 'All mock examinations', 'AI study planner', 'Advanced flashcards', 'Priority support'], cta: 'Start Pro Trial' },
  { name: 'Institution', price: 'Custom', period: '', desc: 'For schools and tutorials', popular: false, features: ['Everything in Pro', 'Bulk student management', 'Custom exam creation', 'Admin analytics dashboard', 'API access', 'Dedicated account manager'], cta: 'Contact Sales' },
];

const STATS = [
  { value: 50000, suffix: '+', label: 'Active Students', desc: 'Across Nigeria' },
  { value: 1200000, suffix: '+', label: 'Questions Solved', desc: 'AI-generated & verified' },
  { value: 94, suffix: '%', label: 'Improvement Rate', desc: 'Average grade increase' },
  { value: 4.9, suffix: '/5', label: 'Student Rating', desc: 'From 5,000+ reviews' },
];

/* ─── Navbar ─────────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <>
      <header className={`nav${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-inner">
          <Link href="/" className="nav-logo">
            <div className="nav-logo-icon">G</div>
            <span className="nav-logo-text">Grit Academy</span>
          </Link>

          <ul className="nav-links">
            {NAV.map(n => (
              <li key={n}><a href={`#${n.toLowerCase()}`}>{n}</a></li>
            ))}
          </ul>

          <div className="nav-actions">
            <Link href="/login" className="nav-login">Log in</Link>
            <Link href="/register" className="btn-primary">Get Started</Link>
          </div>
        </div>
      </header>
    </>
  );
}

/* ─── Mockup ─────────────────────────────────────────────── */
function Mockup() {
  const [sel, setSel] = useState(1);
  const [time, setTime] = useState(1800);
  useEffect(() => {
    const t = setInterval(() => setTime(p => p > 0 ? p - 1 : 0), 1000);
    return () => clearInterval(t);
  }, []);
  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  const opts = ['100J', '200J', '40J', '80J'];
  return (
    <div className="mockup-wrapper">
      <div className="mockup-card">
        <div className="mockup-top-bar" />
        <div className="mockup-browser">
          <div className="mockup-dots">
            <div className="dot dot-r" /><div className="dot dot-y" /><div className="dot dot-g" />
          </div>
          <div className="mockup-url">gritacademy.com/exam/physics-mock</div>
        </div>
        <div className="mockup-body">
          <div className="mockup-header">
            <div className="mockup-label">
              <span className="mockup-tag">Physics Mock</span>
              <span className="mockup-q-label">Question 1 of 3</span>
            </div>
            <div className="mockup-timer">
              <span>⏱</span>
              <span>{fmt(time)}</span>
            </div>
          </div>
          <div className="mockup-question">
            A body of mass 4kg is projected with a velocity of 10ms⁻¹. What is its kinetic energy?
          </div>
          <div className="mockup-options">
            {opts.map((o, i) => (
              <div
                key={i}
                className={`mockup-option${sel === i ? ' selected' : ''}`}
                onClick={() => setSel(i)}
              >
                <span className="opt-letter">{String.fromCharCode(65 + i)}</span>
                {o}
              </div>
            ))}
          </div>
          <div className="mockup-footer">
            <div className="mockup-qnums">
              {[1, 2, 3].map(n => (
                <div key={n} className={`qnum${n === 1 ? ' active' : ''}`}>{n}</div>
              ))}
            </div>
            <button className="mockup-next">Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Hero ─────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="hero">
      <div className="hero-inner">
        <div>
          <Anim>
            <div className="hero-badge">✦ AI-Powered Learning Platform</div>
          </Anim>
          <Anim delay={0.08}>
            <h1 className="hero-title">
              Pass your exams{' '}
              <span className="accent">without the stress</span>
            </h1>
          </Anim>
          <Anim delay={0.14}>
            <p className="hero-subtitle">
              Adaptive AI questions, real-time analytics, and intelligent study plans. Everything you need to ace JAMB, WAEC, NECO, and Post UTME.
            </p>
          </Anim>
          <Anim delay={0.2}>
            <div className="hero-ctas">
              <Link href="/register" className="btn-lg btn-lg-primary">
                Start Learning Free →
              </Link>
              <a href="#features" className="btn-lg btn-lg-outline">
                ▷ See How It Works
              </a>
            </div>
          </Anim>
          <Anim delay={0.26}>
            <div className="hero-social-proof">
              <div className="avatar-stack">
                {['A', 'E', 'F', 'O'].map(l => <div key={l} className="av">{l}</div>)}
              </div>
              <div>
                <div className="stars">{'★★★★★'.split('').map((s, i) => <span key={i} className="star">{s}</span>)}</div>
                <div className="social-text">4.9 from 2,400+ reviews</div>
              </div>
            </div>
          </Anim>
        </div>
        <Anim delay={0.18}>
          <Mockup />
        </Anim>
      </div>
    </section>
  );
}

/* ─── Trusted By ──────────────────────────────────────────── */
function TrustedBy() {
  const logos = [
    { name: 'JAMB', desc: 'Joint Admissions', icon: '🎓' },
    { name: 'WAEC', desc: 'West African Exams', icon: '📝' },
    { name: 'NECO', desc: 'National Examinations', icon: '📋' },
    { name: 'Post UTME', desc: 'University Screening', icon: '🏫' },
    { name: 'NABTEB', desc: 'Technical Education', icon: '🔧' },
  ];
  return (
    <section className="trusted">
      <div className="container">
        <p className="trusted-label">Trusted by students preparing for</p>
        <div className="trusted-logos">
          {logos.map(l => (
            <div key={l.name} className="trusted-logo">
              <div className="trusted-icon">{l.icon}</div>
              <div>
                <div className="trusted-name">{l.name}</div>
                <div className="trusted-desc">{l.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Statistics ──────────────────────────────────────────── */
function Statistics() {
  return (
    <section className="stats">
      <div className="container">
        <div className="stats-grid">
          {STATS.map((s, i) => (
            <Anim key={s.label} delay={i * 0.06}>
              <div className="stat-card">
                <div className="stat-value">
                  <AnimCounter target={s.value} suffix={s.suffix} />
                </div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-desc">{s.desc}</div>
              </div>
            </Anim>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Features ────────────────────────────────────────────── */
function Features() {
  return (
    <section className="section section-alt" id="features">
      <div className="container">
        <Anim>
          <div className="text-center mb-20">
            <p className="section-label">Platform Features</p>
            <h2 className="section-title">Everything you need to ace your exams</h2>
            <p className="section-sub">
              Built with cutting-edge AI and designed for how Nigerian students actually learn.
            </p>
          </div>
        </Anim>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <Anim key={f.title} delay={i * 0.05}>
              <div className="feature-card">
                <div className="feature-icon" style={{ background: f.bg }}>{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            </Anim>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Subjects ────────────────────────────────────────────── */
function Subjects() {
  return (
    <section className="section" id="subjects">
      <div className="container">
        <Anim>
          <div className="text-center mb-20">
            <p className="section-label">Available Subjects</p>
            <h2 className="section-title">Practice by Subject</h2>
            <p className="section-sub">
              Select any subject to explore practice questions, core materials, and exam templates.
            </p>
          </div>
        </Anim>
        <div className="subjects-grid">
          {SUBJECTS.map((s, i) => {
            const [c1, c2] = s.colors.split(',');
            return (
              <Anim key={s.name} delay={i * 0.04}>
                <Link href="/register" className="subject-card">
                  <div
                    className="subject-icon-wrap"
                    style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
                  >
                    {s.icon}
                  </div>
                  <div>
                    <div className="subject-name">{s.name}</div>
                    <div className="subject-count">{s.tests} Practice Tests</div>
                  </div>
                </Link>
              </Anim>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Pricing ─────────────────────────────────────────────── */
function Pricing() {
  return (
    <section className="section section-alt" id="pricing">
      <div className="container">
        <Anim>
          <div className="text-center mb-20">
            <p className="section-label">Flexible Pricing</p>
            <h2 className="section-title">Transparent Plans for Every Student</h2>
            <p className="section-sub">Start free and upgrade for unlimited practice attempts.</p>
          </div>
        </Anim>
        <div className="pricing-grid">
          {PRICING.map((p, i) => (
            <Anim key={p.name} delay={i * 0.06}>
              <div className={`pricing-card${p.popular ? ' popular' : ''}`}>
                {p.popular && <div className="popular-badge">Most Popular</div>}
                <div className="plan-name">{p.name}</div>
                <div className="plan-desc">{p.desc}</div>
                <div className="plan-price">
                  <span className="plan-amount">{p.price}</span>
                  {p.period && <span className="plan-period">{p.period}</span>}
                </div>
                <ul className="plan-features">
                  {p.features.map(f => (
                    <li key={f} className="plan-feature">
                      <span className="plan-feature-check">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className={`plan-cta${p.popular ? ' popular-cta' : ''}`}>
                  {p.cta}
                </Link>
              </div>
            </Anim>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials ────────────────────────────────────────── */
function Testimonials() {
  return (
    <section className="section" id="testimonials">
      <div className="container">
        <Anim>
          <div className="text-center mb-20">
            <p className="section-label">Testimonials</p>
            <h2 className="section-title">Success Stories from Real Students</h2>
            <p className="section-sub">See how students across Nigeria scored 300+ in national tests.</p>
          </div>
        </Anim>
        <div className="testi-grid">
          {TESTIMONIALS.map((t, i) => (
            <Anim key={t.name} delay={i * 0.05}>
              <div className="testi-card">
                <p className="testi-quote">"{t.quote}"</p>
                <div className="testi-footer">
                  <div className="testi-av">{t.av}</div>
                  <div>
                    <div className="testi-name">{t.name}</div>
                    <div className="testi-uni">{t.uni}</div>
                  </div>
                </div>
              </div>
            </Anim>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ ─────────────────────────────────────────────────── */
function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const items = [
    { q: 'How does the adaptive AI engine work?', a: 'As you answer mock questions, the engine tracks your response speed and success rate. It scales down complexity and inserts guided corrections in areas you struggle with, then gradually increases difficulty.' },
    { q: 'Do you offer school packages?', a: 'Yes! Secondary schools can register institution accounts to track bulk student performances, generate custom classroom tests, and access detailed subject performance reports.' },
    { q: 'Are questions modeled on actual JAMB past papers?', a: 'Absolutely. Every question in our repository is modeled directly on standard examination papers, syllabi, and official reading lists recommended by national testing boards.' },
    { q: 'Can I access the platform on mobile?', a: 'Yes, Grit Academy is fully responsive and optimized for mobile devices. You can practice on any screen size, including smartphones and tablets.' },
  ];
  return (
    <section className="section section-alt">
      <div className="container">
        <Anim>
          <div className="text-center mb-20">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-sub">Find answers to commonly asked questions about our platform.</p>
          </div>
        </Anim>
        <div className="faq-list">
          {items.map((item, i) => (
            <Anim key={i} delay={i * 0.04}>
              <div className="faq-item">
                <button className="faq-q" onClick={() => setOpen(open === i ? null : i)}>
                  <span>{item.q}</span>
                  <span className={`chevron${open === i ? ' open' : ''}`}>▾</span>
                </button>
                {open === i && <div className="faq-a">{item.a}</div>}
              </div>
            </Anim>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA Band ────────────────────────────────────────────── */
function CTABand() {
  return (
    <section className="cta-band">
      <div className="container">
        <Anim>
          <h2 className="cta-title">Pass Your Exams with Confidence</h2>
          <p className="cta-sub">
            Create a free student account, choose your subject track, and unlock official standard CBT simulator mock exams today.
          </p>
          <Link href="/register" className="btn-cta">
            Sign Up For Free →
          </Link>
        </Anim>
      </div>
    </section>
  );
}

/* ─── Footer ──────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">Grit<span>Academy</span></div>
            <p className="footer-tagline">
              Curriculum-mapped CBT platform built for ambitious Nigerian students preparing for JAMB, WAEC, NECO, and Post UTME.
            </p>
          </div>
          {[
            { title: 'Exam Prep', links: ['JAMB Mock Testing', 'WAEC Prep', 'NECO CBT Revision', 'Post UTME Mocks'] },
            { title: 'Platform', links: ['Features', 'Pricing', 'Analytics', 'AI Tools'] },
            { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Refund Policy', 'Contact'] },
          ].map(col => (
            <div key={col.title} className="footer-col">
              <h4>{col.title}</h4>
              <ul>
                {col.links.map(l => (
                  <li key={l}><a href="#">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <p className="footer-copy">© 2026 Grit Academy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

/* ─── Page ────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustedBy />
        <Statistics />
        <Features />
        <Subjects />
        <Pricing />
        <Testimonials />
        <FAQ />
        <CTABand />
      </main>
      <Footer />
    </>
  );
}
