import React, { useState } from "react";
import {
  Sparkles,
  Zap,
  Target,
  Search,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  FileText,
  Cpu,
  Lightbulb,
  Star,
  Shield,
  Users,
  Sun,
  Moon,
  Upload,
} from "lucide-react";
import { Button, AnimatedNumber, LiveStatusBadge } from "../components/ui";

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

const features = [
  {
    icon: <Zap size={20} />,
    color: "#6366f1",
    title: "ATS Score Analysis",
    description: "Get a detailed ATS-style score breakdown across 6 weighted categories — skills, keywords, structure, and more.",
  },
  {
    icon: <Search size={20} />,
    color: "#10b981",
    title: "Job Match Scoring",
    description: "Paste any job description and instantly see your compatibility score with matched, partial, and missing skills.",
  },
  {
    icon: <Cpu size={20} />,
    color: "#38bdf8",
    title: "Skill Gap Analysis",
    description: "Identify exactly which skills you're missing for your target role with prioritized recommendations.",
  },
  {
    icon: <Lightbulb size={20} />,
    color: "#f59e0b",
    title: "AI Recommendations",
    description: "Receive personalized, evidence-based suggestions grounded in your resume and target job — no hallucinated metrics.",
  },
  {
    icon: <FileText size={20} />,
    color: "#8b5cf6",
    title: "Resume Improvement",
    description: "Transform weak bullet points into powerful achievement statements with AI rewrite suggestions.",
  },
  {
    icon: <BarChart3 size={20} />,
    color: "#f43f5e",
    title: "Version Comparison",
    description: "Track your resume improvements over time with side-by-side version history and score progression charts.",
  },
];

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Software Engineer at Google",
    avatar: "PS",
    color: "#6366f1",
    text: "ResumeAI helped me identify that I was missing Kubernetes experience before applying to Google. Got the offer after adding a K8s project.",
  },
  {
    name: "Marcus Johnson",
    role: "Data Engineer at Databricks",
    avatar: "MJ",
    color: "#10b981",
    text: "The ATS breakdown showed exactly why my resume was getting filtered out. Went from 62% to 89% match score in one revision.",
  },
  {
    name: "Yuki Tanaka",
    role: "Product Manager at Notion",
    avatar: "YT",
    color: "#f59e0b",
    text: "The bullet point improvement feature is incredible. It rewrites your content without inventing fake metrics — very trustworthy.",
  },
];

const stats = [
  { value: "94%", label: "Interview rate improvement" },
  { value: "50K+", label: "Resumes analyzed" },
  { value: "3.2×", label: "Faster job search" },
  { value: "4.8★", label: "Average rating" },
];

export default function LandingPage({ onGetStarted, onLogin, theme, onToggleTheme }: LandingPageProps) {
  const [email, setEmail] = useState("");

  return (
    <div className={`min-h-screen ${theme}`} style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
      {/* Nav */}
      <nav
        className="sticky top-0 z-50 border-b border-border backdrop-blur-xl"
        style={{ backgroundColor: "rgba(var(--background), 0.85)" }}
      >
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/20">
              <Sparkles size={14} className="text-white" />
            </div>
            <span className="font-semibold text-sm tracking-tight">ResumeAI</span>
            <div className="hidden sm:block ml-2">
              <LiveStatusBadge text="Engine Active" variant="emerald" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors interactive-tap"
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <Button variant="ghost" size="sm" onClick={onLogin}>Sign in</Button>
            <Button variant="primary" size="sm" onClick={onGetStarted}>Get started free</Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-60" />
        
        {/* Dynamic drifting background orbs */}
        <div className="absolute top-10 left-1/4 w-[500px] h-[350px] rounded-full bg-primary/10 blur-[100px] animate-ambient-1 pointer-events-none" />
        <div className="absolute top-28 right-1/4 w-[450px] h-[350px] rounded-full bg-emerald-500/8 blur-[110px] animate-ambient-2 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-16">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto animate-fade-in-up">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs text-indigo-300 shadow-sm shadow-primary/10">
              <Sparkles size={11} className="animate-spin text-primary" style={{ animationDuration: "6s" }} />
              Powered by NLP + LLM + Semantic Matching
            </div>
            <h1 className="font-serif text-5xl md:text-6xl leading-tight text-foreground mb-5">
              Analyze your resume.
              <br />
              <span style={{ color: "var(--primary)" }}>Land your dream job.</span>
            </h1>
            <p className="text-base text-muted-foreground max-w-xl leading-relaxed mb-8">
              AI-powered resume analysis with ATS scoring, skill gap detection, and job match comparison.
              Get actionable, evidence-based feedback — not generic advice.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-md border border-border text-sm focus:outline-none focus:border-primary transition-colors"
                style={{ backgroundColor: "var(--card)" }}
              />
              <Button variant="primary" size="md" onClick={onGetStarted} icon={<ArrowRight size={15} />}>
                Analyze My Resume
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">Free forever · No credit card required · PDF & DOCX supported</p>
          </div>

          {/* Stats row with animated counters */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {stats.map((s, idx) => (
              <div key={s.label} className={`text-center animate-fade-in-up stagger-${idx + 1}`}>
                <p className="font-mono text-2xl font-semibold text-foreground">
                  <AnimatedNumber value={s.value} />
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard preview card */}
      <section className="max-w-6xl mx-auto px-6 -mt-2 pb-12">
        <div
          className="rounded-xl border border-border overflow-hidden shadow-2xl gradient-border"
          style={{ backgroundColor: "var(--card)" }}
        >
          {/* Fake browser bar */}
          <div className="px-4 py-2.5 border-b border-border flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500/60" />
              <div className="w-3 h-3 rounded-full bg-amber-500/60" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
            </div>
            <div className="flex-1 mx-4 px-3 py-1 rounded text-xs text-muted-foreground border border-border" style={{ backgroundColor: "var(--muted)", maxWidth: 280 }}>
              app.resumeai.com/dashboard
            </div>
          </div>
          {/* Dashboard screenshot mockup */}
          <div className="p-5 grid grid-cols-4 gap-4">
            {[
              { label: "ATS Score", value: "84", color: "#6366f1", sub: "+8 from last version" },
              { label: "Job Match", value: "81%", color: "#10b981", sub: "Senior Backend Eng." },
              { label: "Skills Found", value: "20", color: "#38bdf8", sub: "12 technical · 8 soft" },
              { label: "Missing Skills", value: "6", color: "#f59e0b", sub: "2 high priority" },
            ].map((c) => (
              <div key={c.label} className="rounded-lg border border-border p-3.5" style={{ backgroundColor: "var(--muted)" }}>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{c.label}</p>
                <p className="font-mono text-xl font-semibold" style={{ color: c.color }}>{c.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{c.sub}</p>
              </div>
            ))}
            <div className="col-span-2 rounded-lg border border-border p-3.5" style={{ backgroundColor: "var(--muted)" }}>
              <p className="text-xs text-muted-foreground mb-2">ATS Score Breakdown</p>
              {[
                { label: "Skills Match", score: 85, color: "#6366f1" },
                { label: "Keywords", score: 78, color: "#10b981" },
                { label: "Experience", score: 88, color: "#38bdf8" },
                { label: "Structure", score: 92, color: "#8b5cf6" },
              ].map((b) => (
                <div key={b.label} className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs text-muted-foreground w-24 shrink-0">{b.label}</span>
                  <div className="flex-1 h-1 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${b.score}%`, backgroundColor: b.color }} />
                  </div>
                  <span className="font-mono text-xs text-foreground w-8 text-right">{b.score}</span>
                </div>
              ))}
            </div>
            <div className="col-span-2 rounded-lg border border-border p-3.5" style={{ backgroundColor: "var(--muted)" }}>
              <p className="text-xs text-muted-foreground mb-2">Job Match · Senior Backend Engineer</p>
              {[
                { label: "Matched", skills: ["Python", "Go", "PostgreSQL", "SQL", "REST API", "Git"], color: "#10b981" },
                { label: "Missing", skills: ["AWS", "Kubernetes", "Terraform"], color: "#f43f5e" },
              ].map((g) => (
                <div key={g.label} className="mb-2">
                  <p className="text-xs font-medium mb-1" style={{ color: g.color }}>{g.label}</p>
                  <div className="flex flex-wrap gap-1">
                    {g.skills.map((s) => (
                      <span
                        key={s}
                        className="text-[10px] px-1.5 py-0.5 rounded font-mono border"
                        style={{ backgroundColor: `${g.color}12`, color: g.color, borderColor: `${g.color}25` }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <p className="text-xs text-primary font-mono uppercase tracking-widest mb-2">Features</p>
          <h2 className="font-serif text-3xl text-foreground mb-3">Everything you need to get hired</h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            From upload to offer — a complete AI-powered career analysis platform.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {features.map((f, idx) => (
            <div
              key={f.title}
              className={`rounded-lg border border-border p-5 living-card group cursor-pointer animate-fade-in-up stagger-${(idx % 6) + 1}`}
              style={{ backgroundColor: "var(--card)" }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3 shadow-inner"
                style={{ backgroundColor: `${f.color}18` }}
              >
                <span style={{ color: f.color }}>{f.icon}</span>
              </div>
              <h3 className="font-medium text-sm text-foreground mb-1.5 transition-colors group-hover:text-primary">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border py-16" style={{ backgroundColor: "var(--card)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs text-primary font-mono uppercase tracking-widest mb-2">How it works</p>
            <h2 className="font-serif text-3xl text-foreground">From upload to actionable insights</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Upload Resume", desc: "PDF or DOCX. We extract and parse all sections automatically.", icon: <Upload size={18} /> },
              { step: "02", title: "AI Analysis", desc: "NLP and LLM analyze your skills, experience, structure, and keywords.", icon: <Cpu size={18} /> },
              { step: "03", title: "Job Matching", desc: "Paste a job description to see your compatibility score and skill gaps.", icon: <Target size={18} /> },
              { step: "04", title: "Get Recommendations", desc: "Receive evidence-based, personalized suggestions to improve your profile.", icon: <Lightbulb size={18} /> },
            ].map((s, i) => (
              <div key={s.step} className="relative">
                {i < 3 && (
                  <div className="hidden md:block absolute top-6 left-full w-full h-px border-t border-dashed border-border z-0" />
                )}
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3 text-primary">
                    {s.icon}
                  </div>
                  <p className="font-mono text-xs text-primary/60 mb-1">{s.step}</p>
                  <h3 className="font-medium text-sm text-foreground mb-1">{s.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <p className="text-xs text-primary font-mono uppercase tracking-widest mb-2">Testimonials</p>
          <h2 className="font-serif text-3xl text-foreground">Loved by job seekers</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-lg border border-border p-5" style={{ backgroundColor: "var(--card)" }}>
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">"{t.text}"</p>
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                  style={{ backgroundColor: t.color }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-t border-border py-10" style={{ backgroundColor: "var(--card)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-8 items-center">
            {[
              { icon: <Shield size={16} />, text: "SOC 2 Compliant" },
              { icon: <CheckCircle2 size={16} />, text: "Data never sold" },
              { icon: <Users size={16} />, text: "50,000+ users" },
              { icon: <Star size={16} />, text: "4.8/5 rating" },
            ].map((b) => (
              <div key={b.text} className="flex items-center gap-2 text-muted-foreground text-sm">
                <span className="text-primary">{b.icon}</span>
                {b.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="relative rounded-2xl border border-primary/20 overflow-hidden p-12 text-center">
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, rgba(99,102,241,0.12) 0%, transparent 70%)" }} />
          <div className="relative">
            <h2 className="font-serif text-4xl text-foreground mb-3">Ready to level up your resume?</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm">
              Join thousands of job seekers who have improved their interview rate with AI-powered resume analysis.
            </p>
            <Button variant="primary" size="lg" onClick={onGetStarted} icon={<ArrowRight size={16} />}>
              Analyze My Resume Free
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8" style={{ backgroundColor: "var(--card)" }}>
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-primary flex items-center justify-center">
              <Sparkles size={10} className="text-white" />
            </div>
            <span className="text-xs text-muted-foreground">ResumeAI © 2026 · Built with React + FastAPI + NLP</span>
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
