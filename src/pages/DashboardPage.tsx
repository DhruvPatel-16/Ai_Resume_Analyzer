import React from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  ArrowUpRight,
  Zap,
  Target,
  Cpu,
  Lightbulb,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Upload,
  ChevronRight,
} from "lucide-react";
import { Card, CardBody, CardHeader, CircularScore, Badge, ProgressBar, Button, AnimatedNumber } from "../components/ui";
import { useApp } from "../context/AppContext";

interface DashboardPageProps {
  onNavigate: (page: string) => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div
        className="rounded-lg border border-border px-3 py-2 text-xs shadow-lg"
        style={{ backgroundColor: "var(--card)" }}
      >
        <p className="text-muted-foreground mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} className="font-mono font-semibold" style={{ color: p.color }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const {
    currentUser,
    resumeData,
    atsBreakdown,
    missingSkills,
    scoreHistory,
    multiJobComparison,
    jobDescription,
  } = useApp();

  const radarData = atsBreakdown.map((b) => ({
    subject: b.category.replace(" Relevance", "").replace(" Match", ""),
    A: b.score,
    fullMark: 100,
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Welcome banner */}
      <div
        className="rounded-xl border border-primary/20 p-5 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(16,185,129,0.06) 100%)" }}
      >
        <div className="absolute inset-0 grid-pattern opacity-40" />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="font-serif text-2xl text-foreground mb-0.5">Good morning, {currentUser.name.split(" ")[0]}</h2>
            <p className="text-sm text-muted-foreground">
              Your resume was last analyzed <strong className="text-foreground">{resumeData.uploadedAt}</strong> · ATS Score: {resumeData.atsScore}/100
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigate("upload")}
            icon={<Upload size={14} />}
          >
            Upload New Resume
          </Button>
        </div>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "ATS Score",
            value: resumeData.atsScore,
            sublabel: "↑ +4 from v3",
            color: "#3b82f6",
            icon: <Zap size={16} />,
            page: "analysis",
          },
          {
            label: "Job Match",
            value: `${resumeData.jobMatchScore}%`,
            sublabel: "Senior Backend Engineer",
            color: "#10b981",
            icon: <Target size={16} />,
            page: "job-matcher",
          },
          {
            label: "Skills Found",
            value: "20",
            sublabel: "12 technical · 8 soft",
            color: "#38bdf8",
            icon: <Cpu size={16} />,
            page: "skills",
          },
          {
            label: "Missing Skills",
            value: "6",
            sublabel: "2 high priority",
            color: "#f59e0b",
            icon: <AlertTriangle size={16} />,
            page: "skills",
          },
        ].map((s, idx) => (
          <Card
            key={s.label}
            hover
            living
            stagger={((idx % 4) + 1) as 1 | 2 | 3 | 4}
            onClick={() => onNavigate(s.page)}
            className="group cursor-pointer relative overflow-hidden"
          >
            <div
              className="absolute -right-8 -bottom-8 w-20 h-20 rounded-full opacity-0 group-hover:opacity-15 transition-opacity duration-300 pointer-events-none blur-xl"
              style={{ backgroundColor: s.color }}
            />
            <CardBody className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-medium">{s.label}</p>
                <p className="font-mono text-2xl font-semibold" style={{ color: s.color }}>
                  <AnimatedNumber value={s.value} />
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.sublabel}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div
                  className="p-2 rounded-lg transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6 shadow-inner"
                  style={{ backgroundColor: `${s.color}18` }}
                >
                  <span style={{ color: s.color }}>{s.icon}</span>
                </div>
                <ArrowUpRight size={12} className="text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Main row: Score overview + Progress */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Circular score + breakdown */}
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-foreground">ATS Score Overview</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Weighted across 6 categories</p>
          </CardHeader>
          <CardBody>
            <div className="flex items-center gap-6">
              <CircularScore score={84} size={100} color="#3b82f6" label="ATS" sublabel="/100" />
              <div className="flex-1 space-y-2.5">
                {atsBreakdown.map((b) => (
                  <div key={b.category} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-16 shrink-0 truncate">{b.category.split(" ")[0]}</span>
                    <ProgressBar value={b.score} color={b.color} animated />
                    <span className="font-mono text-xs text-foreground w-8 text-right shrink-0">{b.score}</span>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => onNavigate("ats")}
              className="mt-4 w-full flex items-center justify-center gap-1.5 text-xs text-primary hover:underline"
            >
              Full ATS Analysis <ChevronRight size={12} />
            </button>
          </CardBody>
        </Card>

        {/* Radar chart */}
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-foreground">Resume Profile</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Strength across dimensions</p>
          </CardHeader>
          <CardBody className="pt-2">
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                <Radar
                  name="Score"
                  dataKey="A"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.15}
                  strokeWidth={1.5}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Score history */}
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-foreground">Score Progression</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Across resume versions</p>
          </CardHeader>
          <CardBody className="pt-2">
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={scoreHistory} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="atsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="matchGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="version" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="ats" name="ATS" stroke="#3b82f6" fill="url(#atsGrad)" strokeWidth={2} dot={{ r: 3, fill: "#3b82f6" }} />
                <Area type="monotone" dataKey="match" name="Match" stroke="#10b981" fill="url(#matchGrad)" strokeWidth={2} dot={{ r: 3, fill: "#10b981" }} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2.5 h-0.5 rounded bg-primary" />
                ATS Score
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2.5 h-0.5 rounded" style={{ backgroundColor: "#10b981" }} />
                Job Match
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Second row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Job match */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Job Match Analysis</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{jobDescription.title} · {jobDescription.company}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl font-semibold text-emerald-400">{jobDescription.matchScore}%</span>
            </div>
          </CardHeader>
          <CardBody className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Skills", score: jobDescription.skillScore, color: "#3b82f6" },
                { label: "Semantic", score: jobDescription.semanticScore, color: "#10b981" },
                { label: "Experience", score: jobDescription.experienceScore, color: "#38bdf8" },
              ].map((m) => (
                <div key={m.label} className="rounded-lg p-3 text-center" style={{ backgroundColor: "var(--muted)" }}>
                  <p className="font-mono text-base font-semibold" style={{ color: m.color }}>{m.score}%</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{m.label}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="text-xs font-medium text-emerald-400 mb-1.5 flex items-center gap-1">
                <CheckCircle2 size={12} /> Matched Skills
              </p>
              <div className="flex flex-wrap gap-1">
                {jobDescription.matchedSkills.map((s) => (
                  <span key={s} className="text-xs px-2 py-0.5 rounded font-mono border border-emerald-500/20 text-emerald-400" style={{ backgroundColor: "rgba(16,185,129,0.08)" }}>
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-rose-400 mb-1.5 flex items-center gap-1">
                <AlertTriangle size={12} /> Missing Skills
              </p>
              <div className="flex flex-wrap gap-1">
                {jobDescription.missingSkills.map((s) => (
                  <span key={s} className="text-xs px-2 py-0.5 rounded font-mono border border-rose-500/20 text-rose-400" style={{ backgroundColor: "rgba(244,63,94,0.08)" }}>
                    ✗ {s}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => onNavigate("job-matcher")}
              className="w-full flex items-center justify-center gap-1.5 text-xs text-primary hover:underline pt-1"
            >
              View full analysis <ChevronRight size={12} />
            </button>
          </CardBody>
        </Card>

        {/* Quick actions + missing skills */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-foreground">Top Priority Actions</h3>
            </CardHeader>
            <CardBody className="p-0">
              {[
                {
                  icon: <AlertTriangle size={14} />,
                  color: "#f43f5e",
                  title: "Add AWS experience",
                  sub: "+8 match score points",
                  page: "recommendations",
                },
                {
                  icon: <Lightbulb size={14} />,
                  color: "#f59e0b",
                  title: "Add professional summary",
                  sub: "+3 ATS score points",
                  page: "improvement",
                },
                {
                  icon: <FileText size={14} />,
                  color: "#3b82f6",
                  title: "Improve Stripe bullet #1",
                  sub: "Stronger impact statement",
                  page: "improvement",
                },
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={() => onNavigate(item.page as any)}
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-secondary transition-colors text-left border-b border-border last:border-0"
                >
                  <div className="p-1.5 rounded" style={{ backgroundColor: `${item.color}18` }}>
                    <span style={{ color: item.color }}>{item.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.sub}</p>
                  </div>
                  <ChevronRight size={12} className="text-muted-foreground shrink-0" />
                </button>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Multi-Job Comparison</h3>
              <Badge variant="muted">6 roles</Badge>
            </CardHeader>
            <CardBody className="space-y-2">
              {multiJobComparison.slice(0, 4).map((j) => (
                <div key={j.role} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground truncate flex-1 min-w-0">{j.role}</span>
                  <ProgressBar value={j.match} color={j.color} className="w-24 shrink-0" />
                  <span className="font-mono text-xs text-foreground w-8 text-right shrink-0">{j.match}%</span>
                </div>
              ))}
              <button
                onClick={() => onNavigate("job-matcher")}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-primary hover:underline pt-1"
              >
                View all matches <ChevronRight size={12} />
              </button>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
          <button onClick={() => onNavigate("history")} className="text-xs text-primary hover:underline flex items-center gap-1">
            View history <ChevronRight size={12} />
          </button>
        </CardHeader>
        <CardBody className="p-0">
          <div className="divide-y divide-border">
            {[
              { icon: <Upload size={13} />, color: "#3b82f6", text: "Resume uploaded", detail: "Marcus_Vance_Resume.pdf", time: "2 hours ago" },
              { icon: <Zap size={13} />, color: "#10b981", text: "ATS analysis completed", detail: "Score: 84/100 (+4 from v3)", time: "2 hours ago" },
              { icon: <Target size={13} />, color: "#38bdf8", text: "Job match analyzed", detail: "Senior Backend Engineer · Stripe · 81%", time: "1 hour ago" },
              { icon: <Lightbulb size={13} />, color: "#f59e0b", text: "5 recommendations generated", detail: "2 high priority, 2 medium, 1 low", time: "1 hour ago" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3">
                <div className="p-1.5 rounded shrink-0" style={{ backgroundColor: `${item.color}18` }}>
                  <span style={{ color: item.color }}>{item.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">{item.text}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.detail}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                  <Clock size={11} />
                  {item.time}
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
