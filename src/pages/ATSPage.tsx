import React, { useState } from "react";
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";
import { Card, CardBody, CardHeader, CircularScore, ProgressBar, Badge } from "../components/ui";
import { useApp } from "../context/AppContext";

const defaultAtsChecks = [
  {
    group: "Resume Structure",
    status: "pass",
    checks: [
      { label: "Proper section headings", pass: true },
      { label: "Consistent formatting", pass: true },
      { label: "Contact information block", pass: true },
      { label: "Education section", pass: true },
      { label: "Work experience section", pass: true },
      { label: "Skills section", pass: true },
      { label: "Projects section", pass: true },
      { label: "Professional summary", pass: false },
      { label: "Certifications section", pass: false },
    ],
  },
  {
    group: "Content Quality",
    status: "warn",
    checks: [
      { label: "Action verbs in bullets", pass: true },
      { label: "Quantifiable achievements", pass: true },
      { label: "Concise descriptions", pass: true },
      { label: "Relevant keywords present", pass: true },
      { label: "Job-specific skills listed", pass: true },
      { label: "All cloud keywords present", pass: false },
    ],
  },
  {
    group: "ATS Compatibility",
    status: "pass",
    checks: [
      { label: "No excessive graphics or images", pass: true },
      { label: "No complex tables", pass: true },
      { label: "Standard section headings", pass: true },
      { label: "Text is machine-readable", pass: true },
      { label: "No unusual Unicode characters", pass: true },
      { label: "Single-column layout", pass: true },
    ],
  },
  {
    group: "Formatting Issues",
    status: "warn",
    checks: [
      { label: "Consistent date format", pass: true },
      { label: "Reasonable line length", pass: true },
      { label: "No very long paragraphs", pass: true },
      { label: "Readable font size (implied)", pass: true },
      { label: "Portfolio/demo links present", pass: false },
    ],
  },
];

export default function ATSPage() {
  const { atsBreakdown, qualityChecks: appQualityChecks } = useApp();
  const [showFormula, setShowFormula] = useState(false);

  const getScore = (cat: string, def: number) => {
    const found = atsBreakdown.find((b) => b.category.toLowerCase().includes(cat.toLowerCase()));
    return found ? found.score : def;
  };

  const atsFormula = [
    { label: "Skills Match", weight: 0.3, score: getScore("Skills", 85) },
    { label: "Keyword Score", weight: 0.2, score: getScore("Keyword", 78) },
    { label: "Experience Score", weight: 0.2, score: getScore("Experience", 88) },
    { label: "Education Score", weight: 0.1, score: getScore("Education", 95) },
    { label: "Structure Score", weight: 0.1, score: getScore("Structure", 92) },
    { label: "Achievement Score", weight: 0.1, score: getScore("Achievement", 72) },
  ];

  const computed = atsFormula.reduce((sum, r) => sum + r.weight * r.score, 0);

  const atsChecks = appQualityChecks && appQualityChecks.length > 0 ? appQualityChecks : defaultAtsChecks;

  const radialData = atsBreakdown.map((b) => ({
    name: b.category,
    value: b.score,
    fill: b.color,
  }));

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-serif text-2xl text-foreground mb-0.5">ATS Analysis</h2>
          <p className="text-sm text-muted-foreground">
            Applicant Tracking System compatibility check — not affiliated with any specific ATS product
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/8 px-3 py-1.5 text-xs text-amber-400">
          <Info size={12} />
          ATS scores are estimates, not guarantees
        </div>
      </div>

      {/* Score summary */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="flex flex-col items-center justify-center py-6">
          <CircularScore score={Math.round(computed)} size={140} color="#3b82f6" label="ATS" sublabel="/100" />
          <p className="text-sm font-medium text-foreground mt-3">Overall ATS Score</p>
          <p className="text-xs text-muted-foreground text-center mt-0.5 max-w-[160px]">
            Weighted average across 6 categories
          </p>
          <button
            onClick={() => setShowFormula(!showFormula)}
            className="text-xs text-primary hover:underline mt-3"
          >
            {showFormula ? "Hide" : "Show"} calculation
          </button>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Category Breakdown</h3>
            <Badge variant="default">6 categories</Badge>
          </CardHeader>
          <CardBody className="space-y-3">
            {atsBreakdown.map((b) => (
              <div key={b.category} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-36 shrink-0">{b.category}</span>
                <div className="flex-1">
                  <ProgressBar value={b.score} color={b.color} height="h-2" animated />
                </div>
                <span className="font-mono text-xs text-foreground w-6 text-right shrink-0">{b.score}</span>
                <span className="text-xs text-muted-foreground w-12 shrink-0">×{b.weight}</span>
                <span className="font-mono text-xs w-8 text-right shrink-0" style={{ color: b.color }}>
                  {(b.score * b.weight).toFixed(1)}
                </span>
              </div>
            ))}
            <div className="border-t border-border pt-2 flex items-center justify-between">
              <span className="text-xs font-medium text-foreground">Weighted Total</span>
              <span className="font-mono text-sm font-semibold text-primary">{computed.toFixed(1)} / 100</span>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Formula */}
      {showFormula && (
        <Card className="animate-fade-in">
          <CardHeader className="flex items-center gap-2">
            <Info size={14} className="text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Score Formula</h3>
          </CardHeader>
          <CardBody>
            <div className="font-mono text-xs rounded-lg p-4 space-y-1" style={{ backgroundColor: "var(--muted)" }}>
              <p className="text-muted-foreground mb-2">ATS Score = </p>
              {atsFormula.map((r) => (
                <p key={r.label} className="text-foreground">
                  <span className="text-primary">{r.weight}</span> × {r.label.split(" ")[0]} ({r.score})
                  {" "}= <span className="text-emerald-400">{(r.weight * r.score).toFixed(2)}</span>
                </p>
              ))}
              <div className="border-t border-border mt-2 pt-2">
                <p className="text-foreground">Total = <span className="text-primary text-sm font-semibold">{computed.toFixed(2)}</span></p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* ATS Checks */}
      <div className="grid sm:grid-cols-2 gap-4">
        {atsChecks.map((group) => {
          const passCount = group.checks.filter((c: any) => c.pass).length;
          const total = group.checks.length;
          const pct = Math.round((passCount / total) * 100);
          const statusColor = group.status === "pass" ? "#10b981" : "#f59e0b";

          return (
            <Card key={group.group}>
              <CardHeader className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">{group.group}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs" style={{ color: statusColor }}>
                    {passCount}/{total}
                  </span>
                  <ProgressBar value={pct} color={statusColor} className="w-16" />
                </div>
              </CardHeader>
              <CardBody className="space-y-1.5 pt-0">
                {group.checks.map((check: any) => (
                  <div key={check.label} className="flex items-center gap-2 text-xs">
                    {check.pass ? (
                      <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle size={12} className="text-amber-400 shrink-0" />
                    )}
                    <span className={check.pass ? "text-foreground" : "text-amber-400"}>
                      {check.label}
                    </span>
                  </div>
                ))}
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Common issues detected */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-foreground">Detected Issues & Recommendations</h3>
        </CardHeader>
        <CardBody className="space-y-3">
          {[
            {
              severity: "medium",
              issue: "Missing professional summary",
              fix: "Add a 2–3 sentence professional summary at the top of your resume. This helps ATS systems categorize your profile and gives human reviewers immediate context.",
              impact: "+3 ATS score",
            },
            {
              severity: "medium",
              issue: "Cloud & DevOps keywords underrepresented",
              fix: "Add a dedicated 'Cloud & DevOps' subsection to your skills. List: Docker, Git, GitHub Actions, and any AWS services you've used.",
              impact: "+4 ATS score",
            },
            {
              severity: "low",
              issue: "No portfolio URL in contact section",
              fix: "If you have a personal portfolio or demo site, add it to your contact info. Many ATS systems score completeness of contact information.",
              impact: "+1 ATS score",
            },
            {
              severity: "low",
              issue: "Certifications section absent",
              fix: "If you have any certifications (AWS, Google Cloud, etc.), add a Certifications section. Even course completions from reputable platforms add weight.",
              impact: "+2 ATS score",
            },
          ].map((issue, i) => (
            <div
              key={i}
              className="flex gap-3 rounded-lg p-3.5"
              style={{ backgroundColor: "var(--muted)" }}
            >
              <div className="shrink-0 mt-0.5">
                {issue.severity === "high" ? (
                  <XCircle size={15} className="text-rose-400" />
                ) : issue.severity === "medium" ? (
                  <AlertTriangle size={15} className="text-amber-400" />
                ) : (
                  <Info size={15} className="text-sky-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-xs font-semibold text-foreground">{issue.issue}</p>
                  <Badge variant={issue.severity === "high" ? "danger" : issue.severity === "medium" ? "warning" : "info"}>
                    {issue.severity}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{issue.fix}</p>
              </div>
              <div className="shrink-0 text-xs font-mono text-emerald-400 whitespace-nowrap">{issue.impact}</div>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
