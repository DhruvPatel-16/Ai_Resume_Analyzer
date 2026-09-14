import React, { useState } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from "recharts";
import {
  CheckCircle2, AlertTriangle, Search, Briefcase, MapPin, Clock, ArrowRight,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { Card, CardBody, CardHeader, CircularScore, Badge, ProgressBar, Button } from "../components/ui";
import { useApp } from "../context/AppContext";

type MatchState = "empty" | "loading" | "results";

const sampleJD = `Senior Backend Engineer

We are looking for a Senior Backend Engineer to join our infrastructure team. You will design and build highly scalable backend systems that power payments for millions of businesses globally.

Requirements:
- 3+ years Python or Go backend development
- Strong SQL and PostgreSQL experience
- Docker and Kubernetes for containerization
- AWS cloud infrastructure
- REST API design and development
- CI/CD pipelines
- Strong computer science fundamentals

Nice to have:
- Kafka or message queue experience
- GraphQL
- Terraform / Infrastructure as Code`;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-lg border border-border px-3 py-2 text-xs shadow-lg" style={{ backgroundColor: "var(--card)" }}>
        <p className="text-muted-foreground mb-0.5">{label}</p>
        <p className="font-mono font-semibold text-foreground">{payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

export default function JobMatcherPage() {
  const { jobDescription, multiJobComparison, analyzeJobMatch } = useApp();
  const [matchState, setMatchState] = useState<MatchState>("results");
  const [jdText, setJdText] = useState(jobDescription.description || sampleJD);
  const [jobTitle, setJobTitle] = useState(jobDescription.title || "Senior Backend Engineer");
  const [company, setCompany] = useState(jobDescription.company || "Stripe");
  const [showFormula, setShowFormula] = useState(false);

  const radarData = [
    { subject: "Skills", score: jobDescription.skillScore ?? 85 },
    { subject: "Semantic", score: jobDescription.semanticScore ?? 83 },
    { subject: "Experience", score: jobDescription.experienceScore ?? 88 },
    { subject: "Education", score: jobDescription.educationScore ?? 95 },
    { subject: "Keywords", score: jobDescription.keywordScore ?? 78 },
  ];

  const runAnalysis = async () => {
    setMatchState("loading");
    try {
      await analyzeJobMatch(jobTitle, jdText, company);
      setMatchState("results");
    } catch {
      setMatchState("results");
    }
  };

  const getScoreColor = (s: number) => s >= 80 ? "#10b981" : s >= 65 ? "#6366f1" : s >= 50 ? "#f59e0b" : "#f43f5e";

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <div>
        <h2 className="font-serif text-2xl text-foreground mb-0.5">Job Matcher</h2>
        <p className="text-sm text-muted-foreground">
          Paste any job description to see how well your resume matches
        </p>
      </div>

      {/* Input panel */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-foreground">Job Description Input</h3>
        </CardHeader>
        <CardBody className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Job Title</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Backend Developer"
                className="w-full px-3.5 py-2 rounded-md border border-border text-sm focus:outline-none focus:border-primary transition-colors"
                style={{ backgroundColor: "var(--muted)", color: "var(--foreground)" }}
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Company (optional)</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Stripe"
                className="w-full px-3.5 py-2 rounded-md border border-border text-sm focus:outline-none focus:border-primary transition-colors"
                style={{ backgroundColor: "var(--muted)", color: "var(--foreground)" }}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Job Description</label>
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              rows={8}
              className="w-full px-3.5 py-2.5 rounded-md border border-border text-sm focus:outline-none focus:border-primary transition-colors resize-none font-mono"
              style={{ backgroundColor: "var(--muted)", color: "var(--foreground)" }}
              placeholder="Paste job description here..."
            />
          </div>
          <div className="flex items-center gap-3">
            <Button variant="primary" size="md" onClick={runAnalysis} icon={<Search size={14} />}>
              Analyze Match
            </Button>
            <Button variant="ghost" size="md" onClick={() => { setJdText(""); setMatchState("empty"); }}>
              Clear
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Loading */}
      {matchState === "loading" && (
        <Card>
          <CardBody className="flex flex-col items-center py-12 gap-4">
            <svg className="animate-spin w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
            </svg>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Analyzing match...</p>
              <p className="text-xs text-muted-foreground mt-0.5">Extracting JD requirements and comparing with your resume</p>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Results */}
      {matchState === "results" && (
        <>
          {/* JD metadata */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Briefcase size={13} className="text-primary" />
              {jobDescription.title}
            </div>
            <span>·</span>
            <div className="flex items-center gap-1.5">
              <MapPin size={13} />
              {jobDescription.location}
            </div>
            <span>·</span>
            <div className="flex items-center gap-1.5">
              <Clock size={13} />
              {jobDescription.type}
            </div>
            <Badge variant="success">Analysis ready</Badge>
          </div>

          {/* Score hero */}
          <div
            className="rounded-xl border p-6 relative overflow-hidden"
            style={{
              borderColor: "rgba(16,185,129,0.25)",
              background: "linear-gradient(135deg, rgba(16,185,129,0.07) 0%, rgba(99,102,241,0.07) 100%)",
              backgroundColor: "var(--card)",
            }}
          >
            <div className="flex items-center gap-8 flex-wrap">
              <CircularScore score={jobDescription.matchScore} size={140} color={getScoreColor(jobDescription.matchScore)} label="Match" sublabel="/100" />
              <div className="flex-1 min-w-0">
                <h3 className="font-serif text-xl text-foreground mb-1">
                  {jobDescription.matchScore >= 80
                    ? "Excellent match — strong candidate"
                    : jobDescription.matchScore >= 65
                    ? "Good match — address skill gaps before applying"
                    : "Moderate match — significant gaps to close"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You match <strong className="text-foreground">{jobDescription.matchedSkills.length}</strong> of the required skills.{" "}
                  <strong className="text-rose-400">{jobDescription.missingSkills.length} skills</strong> are missing.
                  Semantic similarity is <strong className="text-foreground">{jobDescription.semanticScore}%</strong> — your experience
                  aligns with the role's responsibilities.
                </p>

                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {[
                    { label: "Skills", score: jobDescription.skillScore, weight: "40%" },
                    { label: "Semantic", score: jobDescription.semanticScore, weight: "25%" },
                    { label: "Experience", score: jobDescription.experienceScore, weight: "15%" },
                    { label: "Education", score: jobDescription.educationScore, weight: "10%" },
                    { label: "Keywords", score: jobDescription.keywordScore, weight: "10%" },
                  ].map((m) => (
                    <div key={m.label} className="rounded-lg px-2.5 py-2 text-center" style={{ backgroundColor: "var(--muted)" }}>
                      <p className="font-mono text-sm font-semibold" style={{ color: getScoreColor(m.score) }}>{m.score}%</p>
                      <p className="text-[10px] text-muted-foreground">{m.label}</p>
                      <p className="text-[10px] text-muted-foreground opacity-60">{m.weight}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowFormula(!showFormula)}
                  className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  {showFormula ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  {showFormula ? "Hide" : "Show"} score formula
                </button>
              </div>
            </div>
          </div>

          {showFormula && (
            <div className="font-mono text-xs rounded-lg p-4 border border-border animate-fade-in" style={{ backgroundColor: "var(--muted)" }}>
              <p className="text-muted-foreground mb-1.5">Job Match Score =</p>
              <p className="text-foreground">0.40 × Skills (85) = <span className="text-emerald-400">34.0</span></p>
              <p className="text-foreground">0.25 × Semantic (83) = <span className="text-emerald-400">20.75</span></p>
              <p className="text-foreground">0.15 × Experience (88) = <span className="text-emerald-400">13.2</span></p>
              <p className="text-foreground">0.10 × Education (95) = <span className="text-emerald-400">9.5</span></p>
              <p className="text-foreground">0.10 × Keywords (78) = <span className="text-emerald-400">7.8</span></p>
              <div className="border-t border-border mt-2 pt-2">
                <p className="text-foreground font-semibold">Total = <span className="text-primary">85.25 / 100 ≈ 81%</span></p>
              </div>
            </div>
          )}

          {/* Skills comparison */}
          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <h3 className="text-sm font-semibold text-foreground">Skills Comparison</h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-emerald-400 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 size={12} /> Exact Matches
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {jobDescription.matchedSkills.map((s) => (
                      <span key={s} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded font-mono border border-emerald-500/20 text-emerald-400" style={{ backgroundColor: "rgba(16,185,129,0.08)" }}>
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-amber-400 mb-2 flex items-center gap-1.5">
                    <AlertTriangle size={12} /> Partial Match
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {jobDescription.partialSkills.map((s) => (
                      <span key={s} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded font-mono border border-amber-500/20 text-amber-400" style={{ backgroundColor: "rgba(245,158,11,0.08)" }}>
                        ~ {s}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">Docker is present but underrepresented</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-rose-400 mb-2 flex items-center gap-1.5">
                    <AlertTriangle size={12} /> Missing Skills
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {jobDescription.missingSkills.map((s) => (
                      <span key={s} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded font-mono border border-rose-500/20 text-rose-400" style={{ backgroundColor: "rgba(244,63,94,0.08)" }}>
                        ✗ {s}
                      </span>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-sm font-semibold text-foreground">Match Dimensions</h3>
              </CardHeader>
              <CardBody className="pt-2">
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                    <Radar
                      dataKey="score"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.15}
                      strokeWidth={1.5}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </div>

          {/* Multi-job comparison */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Multi-Job Comparison</h3>
              <p className="text-xs text-muted-foreground">Your resume vs. 6 different roles</p>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={multiJobComparison} barSize={24} margin={{ left: -10, right: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="role"
                    tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                    tickFormatter={(v) => v.split(" ").slice(-1)[0]}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="match" radius={[4, 4, 0, 0]}>
                    {multiJobComparison.map((entry, i) => (
                      <Cell key={i} fill={entry.color} opacity={entry.role === jobDescription.title ? 1 : 0.55} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-4 space-y-1.5">
                {multiJobComparison.map((j) => (
                  <div key={j.role} className="flex items-center gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: j.color }} />
                    <span className="text-foreground flex-1 truncate">{j.role}</span>
                    <span className="text-muted-foreground">{j.company}</span>
                    <ProgressBar value={j.match} color={j.color} className="w-20 shrink-0" />
                    <span className="font-mono text-foreground w-8 text-right shrink-0">{j.match}%</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </>
      )}

      {matchState === "empty" && (
        <div className="flex flex-col items-center py-16 text-center">
          <Search size={40} className="text-muted-foreground/30 mb-4" />
          <h3 className="text-foreground font-medium mb-1">No analysis yet</h3>
          <p className="text-muted-foreground text-sm max-w-xs">Paste a job description above and click Analyze Match to see your compatibility score.</p>
        </div>
      )}
    </div>
  );
}
