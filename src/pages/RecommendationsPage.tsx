import React, { useState } from "react";
import {
  AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, BookOpen, Clock, TrendingUp, Filter,
} from "lucide-react";
import { Card, CardBody, CardHeader, Badge, Button } from "../components/ui";
import { useApp } from "../context/AppContext";

type Priority = "all" | "high" | "medium" | "low";
type RecType = "all" | "skill-gap" | "content" | "structure";

const priorityConfig: Record<string, { color: string; bg: string; border: string; label: string }> = {
  high: { color: "#f43f5e", bg: "rgba(244,63,94,0.08)", border: "rgba(244,63,94,0.2)", label: "High" },
  medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)", label: "Medium" },
  low: { color: "#38bdf8", bg: "rgba(56,189,248,0.08)", border: "rgba(56,189,248,0.2)", label: "Low" },
};

const typeConfig: Record<string, { color: string; label: string }> = {
  "skill-gap": { color: "#f43f5e", label: "Skill Gap" },
  content: { color: "#6366f1", label: "Content" },
  structure: { color: "#10b981", label: "Structure" },
};

function RecommendationCard({ rec, expanded, onToggle }: { rec: any; expanded: boolean; onToggle: () => void }) {
  const p = priorityConfig[rec.priority] || priorityConfig.medium;
  const t = typeConfig[rec.type] || typeConfig.content;

  return (
    <Card className="transition-all">
      <button onClick={onToggle} className="w-full text-left">
        <div className="flex items-start gap-3 p-5">
          <div
            className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center mt-0.5"
            style={{ backgroundColor: p.bg, border: `1px solid ${p.border}` }}
          >
            <span className="text-sm font-mono font-semibold" style={{ color: p.color }}>{rec.id}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start gap-2 mb-1">
              <h3 className="text-sm font-semibold text-foreground leading-tight">{rec.title}</h3>
              <div className="flex gap-1.5 shrink-0">
                <Badge variant={rec.priority === "high" ? "danger" : rec.priority === "medium" ? "warning" : "info"}>
                  {p.label}
                </Badge>
                <span
                  className="text-xs px-2 py-0.5 rounded font-medium border"
                  style={{ color: t.color, backgroundColor: `${t.color}12`, borderColor: `${t.color}25` }}
                >
                  {t.label}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{rec.description}</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock size={11} /> {rec.effort}
              </span>
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <TrendingUp size={11} /> {rec.impact}
              </span>
            </div>
          </div>
          <div className="shrink-0 text-muted-foreground mt-1">
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border px-5 pb-5 pt-4 space-y-4 animate-fade-in">
          <div>
            <p className="text-xs font-semibold text-foreground mb-1.5">Why this matters</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{rec.reason}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground mb-1.5">Full recommendation</p>
            <div className="rounded-lg p-3 border border-primary/15 text-xs text-muted-foreground leading-relaxed" style={{ backgroundColor: "rgba(99,102,241,0.06)" }}>
              {rec.description}
            </div>
          </div>
          {rec.resources && rec.resources.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                <BookOpen size={12} className="text-primary" /> Suggested next steps
              </p>
              <ul className="space-y-1">
                {rec.resources.map((r: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="text-primary mt-0.5">→</span> {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export default function RecommendationsPage() {
  const { recommendations, skillRoadmap } = useApp();
  const [expanded, setExpanded] = useState<number | null>(1);
  const [filterPriority, setFilterPriority] = useState<Priority>("all");
  const [filterType, setFilterType] = useState<RecType>("all");

  const filtered = recommendations.filter((r) => {
    const pMatch = filterPriority === "all" || r.priority === filterPriority;
    const tMatch = filterType === "all" || r.type === filterType;
    return pMatch && tMatch;
  });

  const highCount = recommendations.filter((r) => r.priority === "high").length;
  const medCount = recommendations.filter((r) => r.priority === "medium").length;
  const lowCount = recommendations.filter((r) => r.priority === "low").length;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <div>
        <h2 className="font-serif text-2xl text-foreground mb-0.5">AI Recommendations</h2>
        <p className="text-sm text-muted-foreground">
          Personalized, evidence-based suggestions grounded in your resume and target job description
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "High priority", count: highCount, color: "#f43f5e", bg: "rgba(244,63,94,0.08)", border: "rgba(244,63,94,0.2)" },
          { label: "Medium priority", count: medCount, color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)" },
          { label: "Low priority", count: lowCount, color: "#38bdf8", bg: "rgba(56,189,248,0.08)", border: "rgba(56,189,248,0.2)" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-lg p-4 border"
            style={{ backgroundColor: s.bg, borderColor: s.border }}
          >
            <p className="font-mono text-2xl font-semibold" style={{ color: s.color }}>{s.count}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2.5 rounded-lg border border-sky-500/20 bg-sky-500/8 px-4 py-3 text-xs text-sky-400">
        <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
        <div>
          <p className="font-medium mb-0.5">Hallucination-free guarantee</p>
          <p className="text-sky-400/80">
            All recommendations are grounded in your uploaded resume and job description.
            No experience, skills, or metrics have been invented.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <Filter size={13} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Priority:</span>
        </div>
        {(["all", "high", "medium", "low"] as Priority[]).map((p) => (
          <button
            key={p}
            onClick={() => setFilterPriority(p)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all capitalize ${
              filterPriority === p ? "bg-primary text-white" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {p}
          </button>
        ))}
        <div className="w-px h-4 bg-border mx-1" />
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">Type:</span>
        </div>
        {(["all", "skill-gap", "content", "structure"] as RecType[]).map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all capitalize ${
              filterType === t ? "bg-primary text-white" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Recommendations */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">No recommendations match current filters.</div>
        ) : (
          filtered.map((rec) => (
            <RecommendationCard
              key={rec.id}
              rec={rec}
              expanded={expanded === rec.id}
              onToggle={() => setExpanded(expanded === rec.id ? null : rec.id)}
            />
          ))
        )}
      </div>

      {/* Skill Roadmap */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Recommended Learning Roadmap</h3>
          <Badge variant="info">4-month plan</Badge>
        </CardHeader>
        <CardBody>
          <p className="text-xs text-muted-foreground mb-4">
            Based on your skill gaps, this roadmap helps you close the most impactful gaps for senior backend roles.
            Treat this as a recommendation, not a guarantee of employability.
          </p>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-3.5 top-6 bottom-6 w-px bg-border" />

            <div className="space-y-4">
              {skillRoadmap.map((step, i) => (
                <div key={i} className="flex gap-4 relative">
                  <div
                    className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-mono font-semibold relative z-10"
                    style={{
                      backgroundColor: step.status === "in-progress" ? "var(--primary)" : "var(--muted)",
                      border: `2px solid ${step.status === "in-progress" ? "var(--primary)" : "var(--border)"}`,
                      color: step.status === "in-progress" ? "white" : "var(--muted-foreground)",
                    }}
                  >
                    {i + 1}
                  </div>
                  <div
                    className="flex-1 rounded-lg p-3.5 border"
                    style={{
                      backgroundColor: step.status === "in-progress" ? "rgba(99,102,241,0.08)" : "var(--muted)",
                      borderColor: step.status === "in-progress" ? "rgba(99,102,241,0.25)" : "var(--border)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <p className="text-xs text-muted-foreground">{step.month}</p>
                      {step.status === "in-progress" && (
                        <Badge variant="default">In Progress</Badge>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-foreground mb-2">{step.focus}</p>
                    <div className="flex flex-wrap gap-1">
                      {step.skills.map((s) => (
                        <span key={s} className="text-xs text-muted-foreground border border-border rounded px-2 py-0.5 font-mono">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
