import React, { useState, useEffect } from "react";
import {
  GitCompare,
  CheckCircle2,
  Trophy,
  Target,
  Cpu,
  FileText,
  Download,
  Eye,
  Loader2,
  TrendingUp,
  AlertCircle,
  Layers,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardBody, CardHeader, Badge, ProgressBar, Button } from "../components/ui";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";

interface ComparePageProps {
  onNavigate?: (page: string) => void;
}

const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div
        className="rounded-lg border border-border px-3 py-2 text-xs shadow-xl"
        style={{ backgroundColor: "var(--card)" }}
      >
        <p className="font-semibold text-foreground mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} className="font-mono font-medium" style={{ color: p.color }}>
            {p.name}: {p.value}
            {p.name === "Job Match" ? "%" : "/100"}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ComparePage({ onNavigate }: ComparePageProps) {
  const {
    resumeHistory,
    selectedCompareIds,
    setSelectedCompareIds,
    downloadResume,
    previewResume,
    refreshHistory,
  } = useApp();

  const [compareData, setCompareData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync history on mount
  useEffect(() => {
    refreshHistory();
  }, []);

  // Ensure default selection if empty and resumes exist
  useEffect(() => {
    if (resumeHistory.length >= 2 && selectedCompareIds.length < 2) {
      const validIds = resumeHistory
        .map((r: any) => r.id)
        .filter(Boolean)
        .slice(0, Math.min(3, resumeHistory.length));
      if (validIds.length >= 2) {
        setSelectedCompareIds(validIds);
      }
    }
  }, [resumeHistory]);

  // Fetch comparison when selectedCompareIds changes
  useEffect(() => {
    const fetchComparison = async () => {
      const validIds = selectedCompareIds.filter(Boolean);
      if (validIds.length < 2) {
        setCompareData(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const res = await api.resumes.compare(validIds);
        setCompareData(res);
      } catch (err: any) {
        console.error("Comparison fetch error:", err);
        setError(err.message || "Failed to compare selected resumes.");
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, [selectedCompareIds]);

  const toggleResume = (id: string) => {
    setSelectedCompareIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    const allIds = resumeHistory.map((r: any) => r.id).filter(Boolean);
    setSelectedCompareIds(allIds);
  };

  const clearAll = () => {
    setSelectedCompareIds([]);
  };

  const selectTopThree = () => {
    const topIds = [...resumeHistory]
      .sort((a, b) => b.atsScore - a.atsScore)
      .slice(0, 3)
      .map((r: any) => r.id)
      .filter(Boolean);
    setSelectedCompareIds(topIds);
  };

  const handleDownload = async (id: string, filename: string) => {
    try {
      setDownloadingId(id);
      await downloadResume(id, filename);
    } catch {
      window.open(`/api/resumes/${id}/download`, "_blank");
    } finally {
      setDownloadingId(null);
    }
  };

  const handlePreview = async (id: string) => {
    try {
      setPreviewingId(id);
      await previewResume(id);
    } catch {
      window.open(`/api/resumes/${id}/preview`, "_blank");
    } finally {
      setPreviewingId(null);
    }
  };

  // Prepare chart data
  const chartData = compareData?.resumes?.map((r: any) => ({
    name: r.candidateName || r.filename.replace(".pdf", ""),
    ATS: r.atsScore,
    "Job Match": r.jobMatch,
    Skills: r.skillsCount || r.allSkills?.length || 15,
  })) || [];

  const getScoreGrade = (score: number) => {
    if (score >= 90) return { grade: "A+", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" };
    if (score >= 80) return { grade: "A", color: "text-primary border-primary/30 bg-primary/10" };
    if (score >= 70) return { grade: "B", color: "text-sky-400 border-sky-500/30 bg-sky-500/10" };
    return { grade: "C", color: "text-amber-400 border-amber-500/30 bg-amber-500/10" };
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <GitCompare size={22} />
            </div>
            <div>
              <h2 className="font-serif text-2xl text-foreground">Multi-Resume Comparison</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Compare 2 or more resumes side-by-side to evaluate ATS readiness, skill overlaps, and strengths
              </p>
            </div>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2">
          {onNavigate && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate("history")}
              className="text-xs"
            >
              View History
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={selectTopThree}
            className="text-xs"
          >
            Top 3 Presets
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={selectAll}
            className="text-xs"
          >
            Select All ({resumeHistory.length})
          </Button>
          {selectedCompareIds.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Resume Selector Carousel/Bar */}
      <Card>
        <CardHeader className="py-3 px-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={15} className="text-primary" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Select Resumes from History
            </h3>
          </div>
          <span className="text-xs text-muted-foreground">
            {selectedCompareIds.length} of {resumeHistory.length} selected (Min: 2)
          </span>
        </CardHeader>
        <CardBody className="p-4">
          <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-thin">
            {resumeHistory.map((r: any) => {
              const isSelected = selectedCompareIds.includes(r.id);
              return (
                <div
                  key={r.id || r.filename}
                  onClick={() => r.id && toggleResume(r.id)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer select-none shrink-0 min-w-[220px] ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border hover:border-primary/40 hover:bg-secondary/40"
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors"
                    style={{
                      borderColor: isSelected ? "var(--primary)" : "var(--border)",
                      backgroundColor: isSelected ? "var(--primary)" : "transparent",
                    }}
                  >
                    {isSelected && <CheckCircle2 size={11} className="text-white" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{r.filename}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{r.uploadedAt}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono text-xs font-bold text-primary">{r.atsScore}</span>
                    <span className="text-[10px] text-muted-foreground block">ATS</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Loading state */}
      {loading && (
        <div className="py-16 flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-sm font-medium">Aggregating and analyzing resumes...</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 text-sm flex items-center gap-3">
          <AlertCircle size={18} />
          <p>{error}</p>
        </div>
      )}

      {/* Empty State: Less than 2 selected */}
      {!loading && selectedCompareIds.length < 2 && (
        <Card className="text-center py-12 px-6">
          <CardBody className="max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <GitCompare size={28} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Select at least 2 resumes</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Choose multiple resume versions from the selector bar above to generate side-by-side metric charts, skill intersection, and candidate gap breakdowns.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button onClick={selectTopThree} size="sm">
                Compare Top 3 Resumes
              </Button>
              <Button variant="outline" onClick={selectAll} size="sm">
                Compare All
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Comparison Results */}
      {!loading && compareData && compareData.resumes && compareData.resumes.length >= 2 && (
        <div className="space-y-6 animate-fade-in">
          {/* Winner Highlights Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Top ATS */}
            {(() => {
              const winner = compareData.resumes.find((r: any) => r.id === compareData.bestAtsId);
              return (
                <div
                  className="rounded-xl border border-primary/20 p-4 relative overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(16,185,129,0.04) 100%)",
                    backgroundColor: "var(--card)",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wide">
                      <Trophy size={14} /> Top ATS Score
                    </div>
                    <Badge variant="primary">Winner</Badge>
                  </div>
                  <p className="text-base font-semibold text-foreground truncate">
                    {winner?.candidateName || winner?.filename}
                  </p>
                  <p className="font-mono text-2xl font-bold text-primary mt-1">
                    {winner?.atsScore}
                    <span className="text-xs font-normal text-muted-foreground ml-1">/100</span>
                  </p>
                </div>
              );
            })()}

            {/* Top Job Match */}
            {(() => {
              const winner = compareData.resumes.find((r: any) => r.id === compareData.bestMatchId);
              return (
                <div
                  className="rounded-xl border border-emerald-500/20 p-4 relative overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(56,189,248,0.04) 100%)",
                    backgroundColor: "var(--card)",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wide">
                      <Target size={14} /> Highest Job Match
                    </div>
                    <Badge variant="success">Best Fit</Badge>
                  </div>
                  <p className="text-base font-semibold text-foreground truncate">
                    {winner?.candidateName || winner?.filename}
                  </p>
                  <p className="font-mono text-2xl font-bold text-emerald-400 mt-1">
                    {winner?.jobMatch}%
                    <span className="text-xs font-normal text-muted-foreground ml-1">semantic fit</span>
                  </p>
                </div>
              );
            })()}

            {/* Most Skills */}
            {(() => {
              const winner = compareData.resumes.find((r: any) => r.id === compareData.mostSkillsId);
              return (
                <div
                  className="rounded-xl border border-sky-500/20 p-4 relative overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, rgba(56,189,248,0.08) 0%, rgba(99,102,241,0.04) 100%)",
                    backgroundColor: "var(--card)",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 uppercase tracking-wide">
                      <Cpu size={14} /> Most Skills Detected
                    </div>
                    <Badge variant="secondary">Broadest Stack</Badge>
                  </div>
                  <p className="text-base font-semibold text-foreground truncate">
                    {winner?.candidateName || winner?.filename}
                  </p>
                  <p className="font-mono text-2xl font-bold text-sky-400 mt-1">
                    {winner?.skillsCount || winner?.allSkills?.length || 0}
                    <span className="text-xs font-normal text-muted-foreground ml-1">verified skills</span>
                  </p>
                </div>
              );
            })()}
          </div>

          {/* Comparative Metrics Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Score & Skill Comparison</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Benchmark ATS Scores, Job Match percentages, and skill volumes across {compareData.resumes.length} resumes
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Bar dataKey="ATS" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={45} />
                  <Bar dataKey="Job Match" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={45} />
                  <Bar dataKey="Skills" fill="#38bdf8" radius={[4, 4, 0, 0]} maxBarSize={45} />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Shared Skills Across ALL Selected Resumes */}
          {compareData.sharedSkills && compareData.sharedSkills.length > 0 && (
            <Card>
              <CardHeader className="py-3 px-5 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-400" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Shared Skills Across All {compareData.resumes.length} Resumes ({compareData.sharedSkills.length})
                  </h3>
                </div>
                <span className="text-xs text-emerald-400 font-medium">Common baseline</span>
              </CardHeader>
              <CardBody className="p-4">
                <div className="flex flex-wrap gap-1.5">
                  {compareData.sharedSkills.map((skill: string) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-md text-xs font-medium border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Side-by-Side Comparison Columns */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Layers size={16} className="text-primary" />
                Detailed Side-by-Side Breakdown ({compareData.resumes.length} Resumes)
              </h3>
              <p className="text-xs text-muted-foreground">Scroll horizontally if comparing 4+ versions</p>
            </div>

            <div className="overflow-x-auto pb-4 scrollbar-thin">
              <div
                className="grid gap-4"
                style={{
                  gridTemplateColumns: `repeat(${compareData.resumes.length}, minmax(310px, 1fr))`,
                  minWidth: `${compareData.resumes.length * 320}px`,
                }}
              >
                {compareData.resumes.map((resume: any) => {
                  const isBestAts = resume.id === compareData.bestAtsId;
                  const { grade, color: gradeColor } = getScoreGrade(resume.atsScore);

                  return (
                    <div
                      key={resume.id}
                      className={`rounded-xl border flex flex-col transition-all ${
                        isBestAts
                          ? "border-primary/50 ring-1 ring-primary/20 shadow-lg"
                          : "border-border"
                      }`}
                      style={{ backgroundColor: "var(--card)" }}
                    >
                      {/* Column Header */}
                      <div className="p-4 border-b border-border space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {isBestAts && <Badge variant="primary">Top Score</Badge>}
                              {resume.active && <Badge variant="success">Active</Badge>}
                            </div>
                            <h4 className="text-sm font-semibold text-foreground truncate" title={resume.filename}>
                              {resume.filename}
                            </h4>
                            <p className="text-xs text-muted-foreground truncate">
                              Candidate: {resume.candidateName}
                            </p>
                          </div>

                          {/* Action icons */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handlePreview(resume.id)}
                              title="Preview inline"
                              disabled={previewingId === resume.id}
                              className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {previewingId === resume.id ? (
                                <Loader2 size={13} className="animate-spin text-primary" />
                              ) : (
                                <Eye size={13} />
                              )}
                            </button>
                            <button
                              onClick={() => handleDownload(resume.id, resume.filename)}
                              title="Download document"
                              disabled={downloadingId === resume.id}
                              className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {downloadingId === resume.id ? (
                                <Loader2 size={13} className="animate-spin text-primary" />
                              ) : (
                                <Download size={13} />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Big Score Card */}
                        <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg border border-border" style={{ backgroundColor: "var(--muted)" }}>
                          <div className="text-center">
                            <p className="text-[10px] text-muted-foreground uppercase font-semibold">ATS</p>
                            <p className="font-mono text-lg font-bold text-primary">{resume.atsScore}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Match</p>
                            <p className="font-mono text-lg font-bold text-emerald-400">{resume.jobMatch}%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Grade</p>
                            <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded border ${gradeColor}`}>
                              {grade}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Content Sections */}
                      <div className="p-4 space-y-5 flex-1 text-xs">
                        {/* ATS Subscore Breakdown */}
                        {resume.atsBreakdown && (
                          <div>
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                              Weighted ATS Breakdown
                            </p>
                            <div className="space-y-2">
                              {Object.entries(resume.atsBreakdown).map(([k, v]: any) => (
                                <div key={k}>
                                  <div className="flex justify-between text-[11px] mb-0.5">
                                    <span className="capitalize text-muted-foreground">{k}</span>
                                    <span className="font-mono font-medium text-foreground">{v}/100</span>
                                  </div>
                                  <ProgressBar
                                    value={v}
                                    variant={v >= 80 ? "success" : v >= 65 ? "primary" : "warning"}
                                    size="sm"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Unique Skills exclusive to this resume */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                              Unique Skills ({resume.uniqueSkills?.length || 0})
                            </p>
                            <span className="text-[10px] text-primary">Exclusive</span>
                          </div>
                          {resume.uniqueSkills && resume.uniqueSkills.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {resume.uniqueSkills.slice(0, 10).map((s: string) => (
                                <span
                                  key={s}
                                  className="px-2 py-0.5 rounded text-[11px] font-medium border border-primary/25 bg-primary/10 text-primary"
                                >
                                  {s}
                                </span>
                              ))}
                              {resume.uniqueSkills.length > 10 && (
                                <span className="text-[10px] text-muted-foreground self-center">
                                  +{resume.uniqueSkills.length - 10} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <p className="text-muted-foreground text-[11px] italic">No unique skills</p>
                          )}
                        </div>

                        {/* Top Technical Skills */}
                        <div>
                          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            Top Skills ({resume.allSkills?.length || 0})
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {(resume.allSkills || []).slice(0, 8).map((s: string) => (
                              <span
                                key={s}
                                className="px-2 py-0.5 rounded text-[11px] border border-border bg-secondary/50 text-foreground"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Experience Highlights */}
                        {resume.experience && resume.experience.length > 0 && (
                          <div>
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                              Experience ({resume.experience.length} Roles)
                            </p>
                            <div className="space-y-1.5">
                              {resume.experience.slice(0, 2).map((exp: any, i: number) => (
                                <div key={i} className="p-2 rounded border border-border/60 bg-muted/30">
                                  <p className="font-semibold text-foreground truncate">{exp.role || exp.title || "Software Engineer"}</p>
                                  <p className="text-muted-foreground text-[10px] truncate">{exp.company} · {exp.duration || exp.dates}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Education */}
                        {resume.education && resume.education.length > 0 && (
                          <div>
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                              Education
                            </p>
                            <div className="space-y-1">
                              {resume.education.slice(0, 1).map((edu: any, i: number) => (
                                <div key={i} className="text-muted-foreground">
                                  <span className="font-semibold text-foreground block">{edu.degree || edu.field || "Computer Science"}</span>
                                  <span className="text-[10px]">{edu.institution || edu.school} {edu.year ? `(${edu.year})` : ""}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Key Strengths */}
                        {resume.highReasons && resume.highReasons.length > 0 && (
                          <div>
                            <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                              <CheckCircle2 size={11} /> Top Strengths
                            </p>
                            <ul className="space-y-1 text-muted-foreground">
                              {resume.highReasons.slice(0, 2).map((h: string, i: number) => (
                                <li key={i} className="line-clamp-2 leading-relaxed">
                                  • {h}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Improvement Opportunities */}
                        {resume.improvementReasons && resume.improvementReasons.length > 0 && (
                          <div>
                            <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                              <TrendingUp size={11} /> Areas to Improve
                            </p>
                            <ul className="space-y-1 text-muted-foreground">
                              {resume.improvementReasons.slice(0, 2).map((imp: string, i: number) => (
                                <li key={i} className="line-clamp-2 leading-relaxed">
                                  • {imp}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="p-3 border-t border-border mt-auto flex items-center justify-between">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-xs"
                          onClick={() => handlePreview(resume.id)}
                        >
                          <Eye size={12} className="mr-1.5" />
                          View Preview
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
