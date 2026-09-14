import React, { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell,
} from "recharts";
import { FileText, TrendingUp, CheckCircle2, Trash2, Download, Eye, ArrowUp } from "lucide-react";
import { Card, CardBody, CardHeader, Badge, ProgressBar, Button } from "../components/ui";
import { useApp } from "../context/AppContext";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-lg border border-border px-3 py-2 text-xs shadow-lg" style={{ backgroundColor: "var(--card)" }}>
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

export default function HistoryPage() {
  const { resumeHistory, scoreHistory, deleteResume } = useApp();
  const [selectedVersions, setSelectedVersions] = useState<number[]>([0, Math.max(0, resumeHistory.length - 1)]);

  const toggleVersion = (i: number) => {
    setSelectedVersions((prev) =>
      prev.includes(i) ? prev.filter((v) => v !== i) : prev.length < 2 ? [...prev, i] : [prev[1], i]
    );
  };

  const compareVersions = selectedVersions.length === 2 && selectedVersions[0] < resumeHistory.length && selectedVersions[1] < resumeHistory.length
    ? selectedVersions.map((i) => resumeHistory[i])
    : null;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <div>
        <h2 className="font-serif text-2xl text-foreground mb-0.5">Resume History</h2>
        <p className="text-sm text-muted-foreground">
          Track your resume improvements across versions and compare scores
        </p>
      </div>

      {/* Progress summary */}
      <div
        className="rounded-xl border border-emerald-500/20 p-5 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.07) 0%, rgba(99,102,241,0.07) 100%)", backgroundColor: "var(--card)" }}
      >
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <TrendingUp size={20} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total improvement</p>
              <p className="font-serif text-xl text-foreground">ATS Score +16 points</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {[
              { label: "v1 → v4", value: "+16", sub: "ATS Score" },
              { label: "v1 → v4", value: "+19%", sub: "Job Match" },
              { label: "Skills", value: "+6", sub: "Added since v1" },
            ].map((s) => (
              <div key={s.sub} className="rounded-lg px-4 py-2 text-center" style={{ backgroundColor: "var(--muted)" }}>
                <p className="font-mono text-base font-semibold text-emerald-400">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Score progression chart */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-foreground">Score Progression</h3>
          <p className="text-xs text-muted-foreground mt-0.5">ATS and Job Match scores across resume versions</p>
        </CardHeader>
        <CardBody>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={scoreHistory} margin={{ left: -15, right: 5 }}>
              <defs>
                <linearGradient id="atsG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="matchG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="version" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
              <YAxis domain={[50, 100]} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="ats" name="ATS" stroke="#6366f1" fill="url(#atsG)" strokeWidth={2} dot={{ r: 4, fill: "#6366f1" }} />
              <Area type="monotone" dataKey="match" name="Match" stroke="#10b981" fill="url(#matchG)" strokeWidth={2} dot={{ r: 4, fill: "#10b981" }} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="w-3 h-0.5 bg-primary rounded" /> ATS Score
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="w-3 h-0.5 rounded" style={{ backgroundColor: "#10b981" }} /> Job Match
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Version list */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Resume Versions</h3>
          <p className="text-xs text-muted-foreground">Select 2 versions to compare</p>
        </CardHeader>
        <CardBody className="p-0">
          <div className="divide-y divide-border">
            {resumeHistory.map((r, i) => {
              const isSelected = selectedVersions.includes(i);
              return (
                <div
                  key={i}
                  className={`flex items-center gap-4 px-5 py-4 transition-colors cursor-pointer ${
                    isSelected ? "bg-primary/5" : "hover:bg-secondary/30"
                  }`}
                  onClick={() => toggleVersion(i)}
                >
                  {/* Checkbox */}
                  <div
                    className="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all"
                    style={{
                      borderColor: isSelected ? "var(--primary)" : "var(--border)",
                      backgroundColor: isSelected ? "var(--primary)" : "transparent",
                    }}
                  >
                    {isSelected && <CheckCircle2 size={12} className="text-white" />}
                  </div>

                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText size={15} className="text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">{r.filename}</p>
                      {r.active && <Badge variant="success">Active</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{r.uploadedAt} · {r.skills} skills detected</p>
                  </div>

                  <div className="hidden sm:flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-mono text-sm font-semibold text-primary">{r.atsScore}</p>
                      <p className="text-xs text-muted-foreground">ATS</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-semibold text-emerald-400">{r.jobMatch}%</p>
                      <p className="text-xs text-muted-foreground">Match</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" onClick={(e) => e.stopPropagation()}>
                      <Eye size={13} />
                    </button>
                    <button className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" onClick={(e) => e.stopPropagation()}>
                      <Download size={13} />
                    </button>
                    {!r.active && (
                      <button
                        className="p-1.5 rounded hover:bg-rose-500/10 text-muted-foreground hover:text-rose-400 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          if ((r as any).id) deleteResume((r as any).id);
                        }}
                        title="Delete resume"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Comparison */}
      {compareVersions && (
        <Card className="animate-fade-in">
          <CardHeader>
            <h3 className="text-sm font-semibold text-foreground">
              Version Comparison — {compareVersions[0].filename.split("_").pop()?.replace(".pdf", "")} vs {compareVersions[1].filename.split("_").pop()?.replace(".pdf", "")}
            </h3>
          </CardHeader>
          <CardBody>
            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              {compareVersions.map((v, i) => (
                <div
                  key={i}
                  className="rounded-lg p-4 border"
                  style={{ backgroundColor: "var(--muted)", borderColor: i === 1 && v.active ? "rgba(16,185,129,0.3)" : "var(--border)" }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium text-foreground">{v.filename}</p>
                    {v.active && <Badge variant="success">Current</Badge>}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="font-mono text-lg font-semibold text-primary">{v.atsScore}</p>
                      <p className="text-xs text-muted-foreground">ATS</p>
                    </div>
                    <div>
                      <p className="font-mono text-lg font-semibold text-emerald-400">{v.jobMatch}%</p>
                      <p className="text-xs text-muted-foreground">Match</p>
                    </div>
                    <div>
                      <p className="font-mono text-lg font-semibold text-sky-400">{v.skills}</p>
                      <p className="text-xs text-muted-foreground">Skills</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Delta */}
            <div className="rounded-lg p-4 border border-emerald-500/20" style={{ backgroundColor: "rgba(16,185,129,0.06)" }}>
              <p className="text-xs font-semibold text-emerald-400 mb-3 flex items-center gap-1.5">
                <ArrowUp size={12} /> Improvements from {compareVersions[0].filename.split("_").pop()?.replace(".pdf", "")} to {compareVersions[1].filename.split("_").pop()?.replace(".pdf", "")}
              </p>
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  {
                    label: "ATS Score",
                    delta: compareVersions[1].atsScore - compareVersions[0].atsScore,
                    from: compareVersions[0].atsScore,
                    to: compareVersions[1].atsScore,
                  },
                  {
                    label: "Job Match",
                    delta: compareVersions[1].jobMatch - compareVersions[0].jobMatch,
                    from: `${compareVersions[0].jobMatch}%`,
                    to: `${compareVersions[1].jobMatch}%`,
                  },
                  {
                    label: "Skills",
                    delta: compareVersions[1].skills - compareVersions[0].skills,
                    from: compareVersions[0].skills,
                    to: compareVersions[1].skills,
                  },
                ].map((m) => (
                  <div key={m.label} className="text-center">
                    <p className="text-xs text-muted-foreground mb-0.5">{m.label}</p>
                    <p className="text-xs text-muted-foreground">{m.from} → {m.to}</p>
                    <p className="font-mono text-base font-semibold text-emerald-400 mt-0.5">
                      {m.delta > 0 ? "+" : ""}{m.delta}{typeof m.delta === "number" && m.label === "Job Match" ? "%" : ""}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
