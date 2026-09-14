import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  CheckCircle2,
  AlertTriangle,
  User,
  GraduationCap,
  Briefcase,
  FolderGit2,
  Cpu,
  Mail,
  Phone,
  MapPin,
  GitBranch as GithubIcon,
  Link as LinkedinIcon,
  ExternalLink,
} from "lucide-react";
import { Card, CardBody, CardHeader, CircularScore, Badge, ProgressBar } from "../components/ui";
import { useApp } from "../context/AppContext";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-lg border border-border px-3 py-2 text-xs shadow-lg" style={{ backgroundColor: "var(--card)" }}>
        <p className="text-muted-foreground mb-0.5">{label}</p>
        <p className="font-mono font-semibold text-foreground">{payload[0].value}/100</p>
      </div>
    );
  }
  return null;
};

const tabs = ["Overview", "Extracted Info", "Score Breakdown", "Quality Checks"];

export default function AnalysisPage() {
  const { resumeData, atsBreakdown, qualityChecks: appQualityChecks, highReasons, improvementReasons } = useApp();
  const [activeTab, setActiveTab] = useState(0);

  const displayHighReasons = highReasons && highReasons.length > 0
    ? highReasons
    : ["Strong Python experience", "Relevant backend projects", "Good keyword coverage"];

  const displayImprovementReasons = improvementReasons && improvementReasons.length > 0
    ? improvementReasons
    : ["Docker not demonstrated", "AWS experience missing"];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-serif text-2xl text-foreground mb-0.5">Analysis Results</h2>
          <p className="text-sm text-muted-foreground">
            {resumeData.filename} · Analyzed {resumeData.uploadedAt}
          </p>
        </div>
        <Badge variant="success">Analysis complete</Badge>
      </div>

      {/* Score hero */}
      <div
        className="rounded-xl border border-border p-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(16,185,129,0.05) 100%)", backgroundColor: "var(--card)" }}
      >
        <div className="flex items-center gap-8 flex-wrap">
          <CircularScore score={resumeData.atsScore} size={130} color="#3b82f6" label="ATS" sublabel="/100" />
          <div className="flex-1 min-w-0">
            <h3 className="font-serif text-xl text-foreground mb-1">
              {resumeData.atsScore >= 80
                ? "Strong resume — ready for applications"
                : resumeData.atsScore >= 65
                ? "Good resume with room for improvement"
                : "Resume needs significant improvements"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your resume scores in the{" "}
              <span className="text-emerald-400 font-medium">top 25%</span> of analyzed resumes.
              Strongest in Education and Structure; lowest in Achievements and Keywords.
            </p>
            <div className="flex flex-wrap gap-2">
              {displayHighReasons.map((r, i) => (
                <span key={i} className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded px-2 py-1">
                  <CheckCircle2 size={11} /> {r}
                </span>
              ))}
              {displayImprovementReasons.map((r, i) => (
                <span key={i} className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded px-2 py-1">
                  <AlertTriangle size={11} /> {r}
                </span>
              ))}
            </div>
          </div>

          {/* Category mini-scores */}
          <div className="grid grid-cols-3 gap-2">
            {atsBreakdown.map((b) => (
              <div key={b.category} className="rounded-lg px-3 py-2 text-center" style={{ backgroundColor: "var(--muted)" }}>
                <p className="font-mono text-base font-semibold" style={{ color: b.color }}>{b.score}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{b.category.split(" ")[0]}</p>
                <p className="text-[10px] text-muted-foreground">{b.weight}% wt.</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === i
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === 0 && (
        <div className="grid lg:grid-cols-2 gap-5 animate-fade-in">
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-foreground">Category Scores</h3>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={atsBreakdown} barSize={20} margin={{ left: -15, right: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="category"
                    tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                    tickFormatter={(v) => v.split(" ")[0]}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {atsBreakdown.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-foreground">Score Explainability</h3>
            </CardHeader>
            <CardBody className="space-y-3">
              <div>
                <p className="text-xs font-medium text-emerald-400 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 size={12} /> Why your score is high
                </p>
                <div className="space-y-1.5">
                  {[
                    "Strong Python and TypeScript experience demonstrated across multiple projects",
                    "Relevant internship experience at top-tier companies (Stripe, Figma)",
                    "Clear section structure with proper headings and formatting",
                    "Quantified achievements present in multiple bullet points",
                    "Education section complete with GPA and graduation year",
                  ].map((r) => (
                    <p key={r} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5 shrink-0">✓</span> {r}
                    </p>
                  ))}
                </div>
              </div>
              <div className="border-t border-border pt-3">
                <p className="text-xs font-medium text-amber-400 mb-2 flex items-center gap-1.5">
                  <AlertTriangle size={12} /> Why it is not higher
                </p>
                <div className="space-y-1.5">
                  {[
                    "Docker is mentioned but lacks dedicated project demonstrating container orchestration",
                    "AWS / cloud experience not demonstrated — high priority gap for target roles",
                    "Professional summary section is missing",
                    "Some achievement metrics could be more specific",
                  ].map((r) => (
                    <p key={r} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-amber-400 mt-0.5 shrink-0">⚠</span> {r}
                    </p>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Tab: Extracted Info */}
      {activeTab === 1 && (
        <div className="grid lg:grid-cols-2 gap-5 animate-fade-in">
          {/* Contact */}
          <Card>
            <CardHeader className="flex items-center gap-2">
              <User size={15} className="text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Contact Information</h3>
            </CardHeader>
            <CardBody className="space-y-2">
              {[
                { icon: <User size={13} />, label: "Name", value: resumeData.personal.name, ok: true },
                { icon: <Mail size={13} />, label: "Email", value: resumeData.personal.email, ok: true },
                { icon: <Phone size={13} />, label: "Phone", value: resumeData.personal.phone, ok: true },
                { icon: <MapPin size={13} />, label: "Location", value: resumeData.personal.location, ok: true },
                { icon: <LinkedinIcon size={13} />, label: "LinkedIn", value: resumeData.personal.linkedin, ok: true },
                { icon: <GithubIcon size={13} />, label: "GitHub", value: resumeData.personal.github, ok: true },
                { icon: <ExternalLink size={13} />, label: "Portfolio", value: "Not found", ok: false },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2.5 text-xs">
                  <span className={`${item.ok ? "text-muted-foreground" : "text-rose-400"}`}>{item.icon}</span>
                  <span className="text-muted-foreground w-16 shrink-0">{item.label}</span>
                  <span className={`flex-1 truncate ${item.ok ? "text-foreground" : "text-rose-400"}`}>{item.value}</span>
                  {item.ok ? (
                    <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle size={12} className="text-rose-400 shrink-0" />
                  )}
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader className="flex items-center gap-2">
              <GraduationCap size={15} className="text-sky-400" />
              <h3 className="text-sm font-semibold text-foreground">Education</h3>
            </CardHeader>
            <CardBody>
              {resumeData.education.map((e, i) => (
                <div key={i} className="rounded-lg p-3" style={{ backgroundColor: "var(--muted)" }}>
                  <p className="text-sm font-medium text-foreground">{e.degree}</p>
                  <p className="text-xs text-muted-foreground">{e.institution}</p>
                  <div className="flex gap-3 mt-1.5">
                    <Badge variant="info">Class of {e.year}</Badge>
                    <Badge variant="success">GPA {e.gpa}</Badge>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Experience */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex items-center gap-2">
              <Briefcase size={15} className="text-violet-400" />
              <h3 className="text-sm font-semibold text-foreground">Work Experience</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              {resumeData.experience.map((exp, i) => (
                <div key={i} className="rounded-lg border border-border p-4" style={{ backgroundColor: "var(--muted)" }}>
                  <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{exp.role}</p>
                      <p className="text-xs text-muted-foreground">{exp.company} · {exp.duration}</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {exp.technologies.map((t) => (
                        <Badge key={t} variant="default">{t}</Badge>
                      ))}
                    </div>
                  </div>
                  <ul className="space-y-1">
                    {exp.bullets.map((b, j) => (
                      <li key={j} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-0.5 shrink-0">·</span> {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Projects */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex items-center gap-2">
              <FolderGit2 size={15} className="text-amber-400" />
              <h3 className="text-sm font-semibold text-foreground">Projects</h3>
            </CardHeader>
            <CardBody className="grid sm:grid-cols-3 gap-3">
              {resumeData.projects.map((p, i) => (
                <div key={i} className="rounded-lg border border-border p-3.5" style={{ backgroundColor: "var(--muted)" }}>
                  <p className="text-sm font-semibold text-foreground mb-0.5">{p.name}</p>
                  <p className="text-xs text-muted-foreground mb-2 leading-relaxed">{p.description}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {p.technologies.map((t) => (
                      <Badge key={t} variant="muted">{t}</Badge>
                    ))}
                  </div>
                  <p className="text-xs text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={10} /> {p.outcome}
                  </p>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      )}

      {/* Tab: Score Breakdown */}
      {activeTab === 2 && (
        <div className="space-y-4 animate-fade-in">
          {atsBreakdown.map((b) => (
            <Card key={b.category}>
              <CardBody>
                <div className="flex items-start justify-between mb-3 flex-wrap gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{b.category}</h3>
                    <p className="text-xs text-muted-foreground">Weight: {b.weight}% of total ATS score</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xl font-semibold" style={{ color: b.color }}>{b.score}</span>
                    <span className="text-muted-foreground text-sm">/100</span>
                  </div>
                </div>
                <ProgressBar value={b.score} color={b.color} height="h-2" animated />
                <div className="mt-3 grid sm:grid-cols-2 gap-2">
                  {getBreakdownDetails(b.category).map((d, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <span style={{ color: d.ok ? "#10b981" : "#f59e0b" }} className="mt-0.5 shrink-0">
                        {d.ok ? "✓" : "⚠"}
                      </span>
                      <span className="text-muted-foreground">{d.text}</span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Tab: Quality Checks */}
      {activeTab === 3 && (
        <div className="grid sm:grid-cols-2 gap-4 animate-fade-in">
          {[
            {
              label: "Contact Information",
              items: [
                { text: "Email address present", ok: true },
                { text: "Phone number present", ok: true },
                { text: "LinkedIn profile linked", ok: true },
                { text: "GitHub profile linked", ok: true },
                { text: "Portfolio URL present", ok: false },
              ],
            },
            {
              label: "Resume Structure",
              items: [
                { text: "Clear section headings", ok: true },
                { text: "Consistent date formatting", ok: true },
                { text: "Appropriate length (1 page)", ok: true },
                { text: "Professional summary present", ok: false },
                { text: "No tables or complex graphics", ok: true },
              ],
            },
            {
              label: "Experience Quality",
              items: [
                { text: "Company names present", ok: true },
                { text: "Job titles clear", ok: true },
                { text: "Employment dates included", ok: true },
                { text: "Action verbs used", ok: true },
                { text: "Quantified achievements present", ok: true },
              ],
            },
            {
              label: "Skills & Keywords",
              items: [
                { text: "Technical skills section present", ok: true },
                { text: "Programming languages listed", ok: true },
                { text: "Frameworks and tools listed", ok: true },
                { text: "ATS-optimized keywords included", ok: true },
                { text: "Cloud/DevOps skills covered", ok: false },
              ],
            },
          ].map((section) => (
            <Card key={section.label}>
              <CardHeader>
                <h3 className="text-sm font-semibold text-foreground">{section.label}</h3>
              </CardHeader>
              <CardBody className="space-y-2 pt-0">
                {section.items.map((item) => (
                  <div key={item.text} className="flex items-center gap-2 text-xs">
                    {item.ok ? (
                      <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle size={13} className="text-amber-400 shrink-0" />
                    )}
                    <span className={item.ok ? "text-foreground" : "text-amber-400"}>{item.text}</span>
                  </div>
                ))}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function getBreakdownDetails(category: string): { text: string; ok: boolean }[] {
  const map: Record<string, { text: string; ok: boolean }[]> = {
    "Skills Match": [
      { text: "12 technical skills identified", ok: true },
      { text: "Python, React, TypeScript — high relevance", ok: true },
      { text: "Docker skills underrepresented", ok: false },
      { text: "AWS/cloud skills missing", ok: false },
    ],
    "Keywords": [
      { text: "Python appears 8× in resume", ok: true },
      { text: "API/backend terms present", ok: true },
      { text: "Missing: 'scalable', 'microservices'", ok: false },
      { text: "Good action verb density", ok: true },
    ],
    "Experience Relevance": [
      { text: "2 relevant internships at top companies", ok: true },
      { text: "Backend/frontend experience aligned", ok: true },
      { text: "Technologies match target job stack", ok: true },
      { text: "Total experience near required range", ok: true },
    ],
    "Education": [
      { text: "B.Tech CS from UC Berkeley", ok: true },
      { text: "Graduation year clearly stated", ok: true },
      { text: "GPA included (3.8)", ok: true },
      { text: "No relevant certifications listed", ok: false },
    ],
    "Resume Structure": [
      { text: "All major sections present", ok: true },
      { text: "Consistent formatting throughout", ok: true },
      { text: "Appropriate 1-page length", ok: true },
      { text: "Missing professional summary", ok: false },
    ],
    "Achievements / Impact": [
      { text: "CloudPulse: 800+ instances metric", ok: true },
      { text: "Figma: frame drop reduction quantified", ok: true },
      { text: "Some bullets lack measurable outcomes", ok: false },
      { text: "No absolute user/revenue numbers for Stripe", ok: false },
    ],
  };
  return map[category] ?? [];
}
