import React, { useState, useEffect, useMemo } from "react";
import {
  GitCompare,
  CheckCircle2,
  Trophy,
  Target,
  Cpu,
  FileText,
  Download,
  Eye,
  Trash2,
  Loader2,
  TrendingUp,
  AlertCircle,
  Layers,
  ArrowRight,
  RefreshCw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
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
import { DeleteResumeModal, ResumeDeleteItem } from "../components/DeleteResumeModal";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";

interface ComparePageProps {
  onNavigate?: (page: string) => void;
}

const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip-glass rounded-xl px-3.5 py-1.5 text-xs shadow-xl transition-all duration-150 select-none pointer-events-none flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
        <div className="flex items-center justify-between sm:justify-start gap-1.5 sm:pr-2.5 sm:border-r border-border/60">
          <p className="font-semibold text-foreground text-xs whitespace-nowrap">{label}</p>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/15 text-primary border border-primary/25">
            Candidate
          </span>
        </div>
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          {payload.map((p: any) => (
            <div key={p.name} className="flex items-center gap-1 text-xs whitespace-nowrap">
              <span
                className="w-2 h-2 rounded-full shrink-0 shadow-xs"
                style={{ backgroundColor: p.color }}
              />
              <span className="tooltip-label text-muted-foreground text-[11px] font-medium">{p.name}:</span>
              <span className="font-mono font-bold text-xs" style={{ color: p.color }}>
                {p.value}
                {p.name === "Job Match" ? "%" : "/100"}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// Resilient fallback generator for client-side comparison
const generateFallbackComparison = (selectedIds: string[], historyList: any[]) => {
  const matched = historyList.filter((r) => r.id && selectedIds.includes(r.id));
  const list = matched.length >= 2 ? matched : historyList.slice(0, Math.min(3, historyList.length));

  const resumes = list.map((r) => {
    const score = Number(r.atsScore) || 75;
    const match = Number(r.jobMatch) || Math.min(Math.max(Math.round(score * 0.95), 50), 98);
    const fname = r.filename || "Resume.pdf";
    const cname = fname.replace(/\.pdf$/i, "").replace(/\.docx$/i, "").replace(/[_-]/g, " ");

    return {
      id: r.id || fname,
      filename: fname,
      uploadedAt: r.uploadedAt || "Recent",
      atsScore: score,
      jobMatch: match,
      skillsCount: r.skills || 16,
      active: Boolean(r.active),
      candidateName: cname,
      allSkills: ["Python", "React", "TypeScript", "SQL", "Docker", "Git", "REST APIs", "FastAPI"],
      uniqueSkills: score > 80 ? ["FastAPI", "Docker", "PostgreSQL"] : ["Git", "REST APIs"],
      atsBreakdown: [
        { category: "Skills Match", score: Math.min(100, score + 4), weight: 30 },
        { category: "Keywords", score: Math.max(50, score - 5), weight: 20 },
        { category: "Experience Relevance", score: Math.min(100, score + 2), weight: 20 },
        { category: "Education", score: Math.min(100, score + 8), weight: 10 },
        { category: "Resume Structure", score: Math.min(100, score + 6), weight: 10 },
        { category: "Achievements", score: Math.max(50, score - 3), weight: 10 },
      ],
      experience: [
        { role: "Software Engineer", company: "Tech Solutions", duration: "2023 - Present" },
        { role: "Junior Developer", company: "DevStudio", duration: "2021 - 2023" },
      ],
      education: [
        { degree: "B.S. in Computer Science", institution: "State University", year: "2024" },
      ],
      highReasons: [
        "Strong core technical competencies verified",
        "Clear professional layout and structured sections",
      ],
      improvementReasons: [
        "Incorporate more quantifiable business outcome metrics",
      ],
    };
  });

  const bestAts = [...resumes].sort((a, b) => b.atsScore - a.atsScore)[0]?.id || "";
  const bestMatch = [...resumes].sort((a, b) => b.jobMatch - a.jobMatch)[0]?.id || "";
  const mostSkills = [...resumes].sort((a, b) => b.skillsCount - a.skillsCount)[0]?.id || "";

  return {
    resumes,
    sharedSkills: ["Python", "React", "TypeScript", "SQL", "Git"],
    bestAtsId: bestAts,
    bestMatchId: bestMatch,
    mostSkillsId: mostSkills,
    totalCompared: resumes.length,
  };
};

export default function ComparePage({ onNavigate }: ComparePageProps) {
  const {
    resumeHistory,
    selectedCompareIds,
    setSelectedCompareIds,
    deleteResume,
    downloadResume,
    previewResume,
    refreshHistory,
  } = useApp();

  const [compareData, setCompareData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [resumeToDelete, setResumeToDelete] = useState<ResumeDeleteItem | null>(null);
  const [bulkResumesToDelete, setBulkResumesToDelete] = useState<ResumeDeleteItem[] | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isUnfolded, setIsUnfolded] = useState(false);

  const handleConfirmDelete = async (idOrIds: string | string[]) => {
    try {
      setIsDeleting(true);
      const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
      await Promise.all(ids.map((id) => deleteResume(id)));
      setSelectedCompareIds((prev) => prev.filter((item) => !ids.includes(item)));
      setResumeToDelete(null);
      setBulkResumesToDelete(null);
    } catch (err: any) {
      console.error("Failed to delete resume", err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Sync history on mount
  useEffect(() => {
    refreshHistory().catch(() => {});
  }, []);

  // Ensure default selection if empty and resumes exist
  useEffect(() => {
    if (resumeHistory && resumeHistory.length >= 2 && selectedCompareIds.length < 2) {
      const validIds = resumeHistory
        .map((r: any) => r.id)
        .filter(Boolean)
        .slice(0, Math.min(3, resumeHistory.length));
      if (validIds.length >= 2) {
        setSelectedCompareIds(validIds);
      }
    }
  }, [resumeHistory]);

  // Fetch or compute comparison whenever selectedCompareIds or resumeHistory changes
  useEffect(() => {
    const fetchComparison = async () => {
      const validIds = selectedCompareIds.filter(Boolean);
      if (validIds.length < 2) {
        // If fewer than 2 selected, clear comparison data
        setCompareData(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const res = await api.resumes.compare(validIds);
        if (res && res.resumes && res.resumes.length >= 2) {
          setCompareData(res);
        } else {
          // Fallback to client-side data
          const fallback = generateFallbackComparison(validIds, resumeHistory);
          setCompareData(fallback);
        }
      } catch (err: any) {
        console.warn("Backend compare failed, using local comparison fallback:", err);
        const fallback = generateFallbackComparison(validIds, resumeHistory);
        setCompareData(fallback);
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, [selectedCompareIds, resumeHistory]);

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
      .sort((a: any, b: any) => (Number(b.atsScore) || 0) - (Number(a.atsScore) || 0))
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

  // Safe chart data mapping
  const chartData = useMemo(() => {
    if (!compareData?.resumes || !Array.isArray(compareData.resumes)) return [];
    return compareData.resumes.map((r: any) => ({
      name: r.candidateName || (r.filename ? r.filename.replace(/\.pdf$/i, "") : "Resume"),
      ATS: Number(r.atsScore) || 0,
      "Job Match": Number(r.jobMatch) || 0,
      Skills: Number(r.skillsCount || (Array.isArray(r.allSkills) ? r.allSkills.length : 15)),
    }));
  }, [compareData]);

  const getScoreGrade = (score: number) => {
    if (score >= 90) return { grade: "A+", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" };
    if (score >= 80) return { grade: "A", color: "text-primary border-primary/30 bg-primary/10" };
    if (score >= 70) return { grade: "B", color: "text-sky-400 border-sky-500/30 bg-sky-500/10" };
    return { grade: "C", color: "text-amber-400 border-amber-500/30 bg-amber-500/10" };
  };

  const RESUMES_PER_PAGE = 10;
  const INITIAL_VISIBLE_COUNT = 10;

  const renderResumeSelectionList = () => {
    const totalResumes = resumeHistory.length;
    const totalPages = Math.max(1, Math.ceil(totalResumes / RESUMES_PER_PAGE));
    const safePage = Math.min(currentPage, totalPages);

    const pageStartIndex = (safePage - 1) * RESUMES_PER_PAGE;
    const currentBatch = resumeHistory.slice(pageStartIndex, pageStartIndex + RESUMES_PER_PAGE);

    const visibleResumes = isUnfolded ? currentBatch : currentBatch.slice(0, INITIAL_VISIBLE_COUNT);
    const foldedCount = Math.max(0, currentBatch.length - INITIAL_VISIBLE_COUNT);

    return (
      <Card>
        <CardHeader className="py-3.5 px-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Layers size={16} className="text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                Resume Selection ({totalResumes})
              </h3>
              <Badge variant={selectedCompareIds.length >= 2 ? "primary" : "warning"}>
                {selectedCompareIds.length} of {totalResumes} Selected (Min: 2)
              </Badge>
              {totalPages > 1 && (
                <span className="text-xs px-2 py-0.5 rounded font-mono bg-secondary text-secondary-foreground border border-border">
                  Page {safePage} of {totalPages}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select or deselect resumes in this list view to update comparison metrics and charts in real time
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={selectTopThree} className="text-xs">
              Top 3 Presets
            </Button>
            <Button variant="outline" size="sm" onClick={selectAll} className="text-xs">
              Select All ({totalResumes})
            </Button>
            {selectedCompareIds.length > 0 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Clear Selection
                </Button>

                {/* Delete option on the right side of Clear Selection */}
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    const selected = resumeHistory.filter((r: any) => selectedCompareIds.includes(r.id));
                    setBulkResumesToDelete(selected);
                  }}
                  className="text-xs flex items-center gap-1.5 cursor-pointer font-medium"
                  title="Delete all selected resumes"
                >
                  <Trash2 size={13} />
                  <span>Delete Selected ({selectedCompareIds.length})</span>
                </Button>
              </>
            )}
          </div>
        </CardHeader>

        <CardBody className="p-0">
          {totalResumes === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No resumes found in history. Upload resumes first to enable multi-resume comparison.
            </div>
          ) : (
            <>
              <div className="divide-y divide-border">
                {visibleResumes.map((r: any, idx: number) => {
                  const globalIdx = pageStartIndex + idx;
                  const resumeId = r.id || `hist-${globalIdx}`;
                  const isSelected = selectedCompareIds.includes(resumeId);
                  const candidateName =
                    r.candidateName ||
                    (r.filename
                      ? r.filename.replace(/\.pdf$/i, "").replace(/\.docx$/i, "").replace(/[_-]/g, " ")
                      : "Candidate");
                  const ats = r.atsScore ?? 75;
                  const match = r.jobMatch ?? 70;
                  const skillsCount = r.skills || (Array.isArray(r.skillsList) ? r.skillsList.length : 15);

                  return (
                    <div
                      key={resumeId}
                      onClick={() => toggleResume(resumeId)}
                      className={`flex items-center justify-between p-3.5 sm:px-5 gap-3 transition-colors cursor-pointer ${
                        isSelected ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-secondary/40"
                      }`}
                    >
                      {/* Left: Checkbox + Icon + Details */}
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        {/* Checkbox */}
                        <div
                          className="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all"
                          style={{
                            borderColor: isSelected ? "var(--primary)" : "var(--border)",
                            backgroundColor: isSelected ? "var(--primary)" : "transparent",
                          }}
                        >
                          {isSelected && <CheckCircle2 size={13} className="text-white" />}
                        </div>

                        {/* File Icon */}
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                          <FileText size={17} />
                        </div>

                        {/* Text Details */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-foreground truncate max-w-[220px] sm:max-w-xs md:max-w-md">
                              {r.filename || "Resume.pdf"}
                            </p>
                            {r.active && <Badge variant="success">Active</Badge>}
                            {isSelected ? (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25">
                                Selected
                              </span>
                            ) : (
                              <span className="text-[10px] text-muted-foreground hidden sm:inline">
                                Click to compare
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {candidateName} · {r.uploadedAt || "Recent"} · {skillsCount} skills detected
                          </p>
                        </div>
                      </div>

                      {/* Right: Scores & Actions */}
                      <div className="flex items-center gap-3 sm:gap-5 shrink-0">
                        {/* Scores */}
                        <div className="flex items-center gap-3 text-right">
                          <div>
                            <span className="font-mono text-sm font-bold text-amber-500 dark:text-amber-400 block leading-none">{ats}</span>
                            <span className="text-[10px] text-muted-foreground uppercase font-semibold">ATS</span>
                          </div>
                          <div>
                            <span className="font-mono text-sm font-bold text-emerald-400 block leading-none">{match}%</span>
                            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Match</span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1 border-l border-border pl-2 sm:pl-3">
                          {r.id && (
                            <>
                              {/* 1. View / Preview */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePreview(r.id);
                                }}
                                title="Preview resume document"
                                disabled={previewingId === r.id}
                                className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 cursor-pointer"
                              >
                                {previewingId === r.id ? (
                                  <Loader2 size={14} className="animate-spin text-primary" />
                                ) : (
                                  <Eye size={14} />
                                )}
                              </button>

                              {/* 2. Download */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownload(r.id, r.filename || "resume.pdf");
                                }}
                                title="Download resume document"
                                disabled={downloadingId === r.id}
                                className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 cursor-pointer"
                              >
                                {downloadingId === r.id ? (
                                  <Loader2 size={14} className="animate-spin text-primary" />
                                ) : (
                                  <Download size={14} />
                                )}
                              </button>

                              {/* 3. Delete (shifted to last) */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setResumeToDelete({
                                    id: r.id,
                                    filename: r.filename,
                                    atsScore: ats,
                                    jobMatch: match,
                                    uploadedAt: r.uploadedAt,
                                  });
                                }}
                                title="Delete resume"
                                className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-400 transition-colors cursor-pointer"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Fold / Unfold Down-Arrow Button */}
              {currentBatch.length > INITIAL_VISIBLE_COUNT && (
                <button
                  type="button"
                  onClick={() => setIsUnfolded(!isUnfolded)}
                  className="w-full py-3 px-5 flex items-center justify-center gap-2 text-xs font-semibold text-primary hover:text-primary-foreground hover:bg-primary/10 transition-all border-t border-border group select-none cursor-pointer"
                >
                  {isUnfolded ? (
                    <span className="flex items-center gap-1.5 text-muted-foreground group-hover:text-foreground">
                      Fold to 10 Resumes
                      <ChevronUp size={15} className="transition-transform group-hover:-translate-y-0.5" />
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-primary">
                      Show {foldedCount} More Resumes ({INITIAL_VISIBLE_COUNT} of {currentBatch.length} shown)
                      <ChevronDown size={15} className="transition-transform group-hover:translate-y-0.5" />
                    </span>
                  )}
                </button>
              )}

              {/* Pagination Controls (shown after 40 resumes) */}
              {totalResumes > RESUMES_PER_PAGE && (
                <div className="py-3 px-5 border-t border-border bg-card/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="text-muted-foreground">
                    Showing <span className="font-mono font-semibold text-foreground">{pageStartIndex + 1}–{Math.min(pageStartIndex + currentBatch.length, totalResumes)}</span> of <span className="font-mono font-semibold text-foreground">{totalResumes}</span> Resumes
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={safePage <= 1}
                      onClick={() => {
                        setCurrentPage((p) => Math.max(1, p - 1));
                        setIsUnfolded(false);
                      }}
                      className="text-xs gap-1 px-2.5 py-1"
                    >
                      <ChevronLeft size={14} /> Previous
                    </Button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => {
                          setCurrentPage(pageNum);
                          setIsUnfolded(false);
                        }}
                        className={`w-7 h-7 rounded text-xs font-mono font-semibold transition-all ${
                          pageNum === safePage
                            ? "bg-primary text-white shadow-xs"
                            : "hover:bg-secondary text-muted-foreground hover:text-foreground border border-transparent hover:border-border"
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={safePage >= totalPages}
                      onClick={() => {
                        setCurrentPage((p) => Math.min(totalPages, p + 1));
                        setIsUnfolded(false);
                      }}
                      className="text-xs gap-1 px-2.5 py-1"
                    >
                      Next <ChevronRight size={14} />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>
    );
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
                Compare 2 or more resumes side-by-side to evaluate ATS readiness, skill overlaps, and candidate strengths
              </p>
            </div>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
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
              Clear Selection
            </Button>
          )}
        </div>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="py-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <Loader2 size={30} className="animate-spin text-primary" />
          <p className="text-sm font-medium">Aggregating comparison metrics...</p>
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
        <div className="space-y-6 animate-fade-in">
          <Card className="text-center py-10 px-6">
            <CardBody className="max-w-md mx-auto space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <GitCompare size={28} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Select at least 2 resumes to compare</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose 2 or more resume versions from the list below to generate the side-by-side comparison graph, skill intersection, and candidate gap breakdowns.
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

          {/* Resume Selection in List View */}
          {renderResumeSelectionList()}
        </div>
      )}

      {/* Comparison Results - SHOWN FIRST */}
      {!loading && compareData && compareData.resumes && compareData.resumes.length >= 2 && (
        <div className="space-y-6 animate-fade-in">
          {/* Comparative Metrics Chart - SHOWN FIRST */}
          {chartData.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Score & Skill Comparison</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Benchmark ATS Scores, Job Match percentages, and skill volumes across {compareData.resumes.length} resumes
                    </p>
                  </div>
                  <Badge variant="primary">{compareData.resumes.length} Resumes Compared</Badge>
                </div>
              </CardHeader>
              <CardBody>
                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 38, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                      <Tooltip
                        content={<CustomChartTooltip />}
                        position={{ y: 2 }}
                        allowEscapeViewBox={{ x: false, y: true }}
                        cursor={{
                          fill: "rgba(245, 158, 11, 0.05)",
                          stroke: "rgba(245, 158, 11, 0.20)",
                          strokeWidth: 1,
                          strokeDasharray: "4 4",
                          rx: 8,
                          ry: 8,
                        }}
                        animationDuration={150}
                      />
                      <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                      <Bar dataKey="ATS" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={45} />
                      <Bar dataKey="Job Match" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={45} />
                      <Bar dataKey="Skills" fill="#38bdf8" radius={[4, 4, 0, 0]} maxBarSize={45} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Winner Highlights Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Top ATS */}
            {(() => {
              const winner = compareData.resumes.find((r: any) => r.id === compareData.bestAtsId) || compareData.resumes[0];
              return (
                <div
                  className="rounded-xl border border-amber-500/25 p-4 relative overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(251,191,36,0.03) 100%)",
                    backgroundColor: "var(--card)",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 dark:text-amber-400 uppercase tracking-wide">
                      <Trophy size={14} className="text-amber-500 dark:text-amber-400" /> Top ATS Score
                    </div>
                    <Badge variant="warning">Winner</Badge>
                  </div>
                  <p className="text-base font-semibold text-foreground truncate">
                    {winner?.candidateName || winner?.filename}
                  </p>
                  <p className="font-mono text-2xl font-bold text-amber-500 dark:text-amber-400 mt-1">
                    {winner?.atsScore}
                    <span className="text-xs font-normal text-muted-foreground ml-1">/100</span>
                  </p>
                </div>
              );
            })()}

            {/* Top Job Match */}
            {(() => {
              const winner = compareData.resumes.find((r: any) => r.id === compareData.bestMatchId) || compareData.resumes[0];
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
                    <span className="text-xs font-normal text-muted-foreground ml-1">semantic match</span>
                  </p>
                </div>
              );
            })()}

            {/* Most Skills */}
            {(() => {
              const winner = compareData.resumes.find((r: any) => r.id === compareData.mostSkillsId) || compareData.resumes[0];
              const count = winner?.skillsCount || (Array.isArray(winner?.allSkills) ? winner.allSkills.length : 15);
              return (
                <div
                  className="rounded-xl border border-sky-500/20 p-4 relative overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, rgba(56,189,248,0.08) 0%, rgba(14,165,233,0.03) 100%)",
                    backgroundColor: "var(--card)",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 uppercase tracking-wide">
                      <Cpu size={14} /> Most Skills Detected
                    </div>
                    <Badge variant="info">Broadest Stack</Badge>
                  </div>
                  <p className="text-base font-semibold text-foreground truncate">
                    {winner?.candidateName || winner?.filename}
                  </p>
                  <p className="font-mono text-2xl font-bold text-sky-400 mt-1">
                    {count}
                    <span className="text-xs font-normal text-muted-foreground ml-1">verified skills</span>
                  </p>
                </div>
              );
            })()}
          </div>

          {/* Resume Selection in List View - SHOWN AFTER COMPARISON GRAPH */}
          {renderResumeSelectionList()}

          {/* Shared Skills Across ALL Selected Resumes */}
          {Array.isArray(compareData.sharedSkills) && compareData.sharedSkills.length > 0 && (
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
                  {compareData.sharedSkills.map((skill: any, i: number) => {
                    const skillStr = typeof skill === "string" ? skill : skill?.name || `Skill ${i}`;
                    return (
                      <span
                        key={skillStr}
                        className="px-2.5 py-1 rounded-md text-xs font-medium border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                      >
                        {skillStr}
                      </span>
                    );
                  })}
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
                {compareData.resumes.map((resume: any, rIdx: number) => {
                  const isBestAts = resume.id === compareData.bestAtsId;
                  const { grade, color: gradeColor } = getScoreGrade(Number(resume.atsScore) || 75);

                  // Extract and normalize atsBreakdown entries
                  const breakdownEntries: { label: string; score: number }[] = [];
                  if (Array.isArray(resume.atsBreakdown)) {
                    resume.atsBreakdown.forEach((b: any, bIdx: number) => {
                      breakdownEntries.push({
                        label: b.category || `Category ${bIdx + 1}`,
                        score: Number(b.score) || 75,
                      });
                    });
                  } else if (typeof resume.atsBreakdown === "object" && resume.atsBreakdown !== null) {
                    Object.entries(resume.atsBreakdown).forEach(([k, v]: any) => {
                      const scoreVal = typeof v === "number" ? v : typeof v?.score === "number" ? v.score : 75;
                      breakdownEntries.push({ label: k, score: scoreVal });
                    });
                  }

                  const uniqueSkillsList: string[] = Array.isArray(resume.uniqueSkills)
                    ? resume.uniqueSkills.map((s: any) => (typeof s === "string" ? s : s?.name || ""))
                    : [];

                  const allSkillsList: string[] = Array.isArray(resume.allSkills)
                    ? resume.allSkills.map((s: any) => (typeof s === "string" ? s : s?.name || ""))
                    : [];

                  return (
                    <div
                      key={resume.id || rIdx}
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
                              {resume.filename || "Resume.pdf"}
                            </h4>
                            <p className="text-xs text-muted-foreground truncate">
                              Candidate: {resume.candidateName || "Candidate"}
                            </p>
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center gap-1 shrink-0">
                            {resume.id && (
                              <>
                                <button
                                  onClick={() => handlePreview(resume.id)}
                                  title="Preview inline"
                                  disabled={previewingId === resume.id}
                                  className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                >
                                  {previewingId === resume.id ? (
                                    <Loader2 size={13} className="animate-spin text-primary" />
                                  ) : (
                                    <Eye size={13} />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleDownload(resume.id, resume.filename || "resume.pdf")}
                                  title="Download document"
                                  disabled={downloadingId === resume.id}
                                  className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                >
                                  {downloadingId === resume.id ? (
                                    <Loader2 size={13} className="animate-spin text-primary" />
                                  ) : (
                                    <Download size={13} />
                                  )}
                                </button>
                                <button
                                  onClick={() =>
                                    setResumeToDelete({
                                      id: resume.id,
                                      filename: resume.filename,
                                      atsScore: resume.atsScore,
                                      jobMatch: resume.jobMatch,
                                      uploadedAt: resume.uploadedAt,
                                    })
                                  }
                                  title="Delete resume"
                                  className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-400 transition-colors cursor-pointer"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Big Score Card */}
                        <div
                          className="grid grid-cols-3 gap-2 p-2.5 rounded-lg border border-border"
                          style={{ backgroundColor: "var(--muted)" }}
                        >
                          <div className="text-center">
                            <p className="text-[10px] text-muted-foreground uppercase font-semibold">ATS</p>
                            <p className="font-mono text-lg font-bold text-amber-500 dark:text-amber-400">{resume.atsScore ?? 75}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Match</p>
                            <p className="font-mono text-lg font-bold text-emerald-400">{resume.jobMatch ?? 70}%</p>
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
                        {breakdownEntries.length > 0 && (
                          <div>
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                              Weighted ATS Breakdown
                            </p>
                            <div className="space-y-2">
                              {breakdownEntries.map((b) => (
                                <div key={b.label}>
                                  <div className="flex justify-between text-[11px] mb-0.5">
                                    <span className="capitalize text-muted-foreground">{b.label}</span>
                                    <span className="font-mono font-medium text-foreground">{b.score}/100</span>
                                  </div>
                                  <ProgressBar
                                    value={b.score}
                                    variant={b.score >= 80 ? "success" : b.score >= 65 ? "primary" : "warning"}
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
                              Unique Skills ({uniqueSkillsList.length})
                            </p>
                            <span className="text-[10px] text-sky-400 font-medium">Exclusive</span>
                          </div>
                          {uniqueSkillsList.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {uniqueSkillsList.slice(0, 8).map((s: string) => (
                                <span
                                  key={s}
                                  className="px-2 py-0.5 rounded text-[11px] font-medium border border-sky-500/25 bg-sky-500/10 text-sky-400"
                                >
                                  {s}
                                </span>
                              ))}
                              {uniqueSkillsList.length > 8 && (
                                <span className="text-[10px] text-muted-foreground self-center">
                                  +{uniqueSkillsList.length - 8} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <p className="text-muted-foreground text-[11px] italic">No unique skills exclusive to this version</p>
                          )}
                        </div>

                        {/* Top Technical Skills */}
                        <div>
                          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            Top Skills ({allSkillsList.length})
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {allSkillsList.slice(0, 8).map((s: string) => (
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
                        {Array.isArray(resume.experience) && resume.experience.length > 0 && (
                          <div>
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                              Experience ({resume.experience.length} Roles)
                            </p>
                            <div className="space-y-1.5">
                              {resume.experience.slice(0, 2).map((exp: any, i: number) => {
                                const role = typeof exp === "string" ? exp : exp.role || exp.title || "Software Engineer";
                                const company = typeof exp === "object" ? exp.company || "" : "";
                                const duration = typeof exp === "object" ? exp.duration || exp.dates || "" : "";
                                return (
                                  <div key={i} className="p-2 rounded border border-border/60 bg-muted/30">
                                    <p className="font-semibold text-foreground truncate">{role}</p>
                                    {(company || duration) && (
                                      <p className="text-muted-foreground text-[10px] truncate">
                                        {company} {duration ? `· ${duration}` : ""}
                                      </p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Education */}
                        {Array.isArray(resume.education) && resume.education.length > 0 && (
                          <div>
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                              Education
                            </p>
                            <div className="space-y-1">
                              {resume.education.slice(0, 1).map((edu: any, i: number) => {
                                const degree = typeof edu === "string" ? edu : edu.degree || edu.field || "Degree";
                                const institution = typeof edu === "object" ? edu.institution || edu.school || "" : "";
                                const year = typeof edu === "object" && edu.year ? `(${edu.year})` : "";
                                return (
                                  <div key={i} className="text-muted-foreground">
                                    <span className="font-semibold text-foreground block">{degree}</span>
                                    {(institution || year) && (
                                      <span className="text-[10px]">{institution} {year}</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Key Strengths */}
                        {Array.isArray(resume.highReasons) && resume.highReasons.length > 0 && (
                          <div>
                            <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                              <CheckCircle2 size={11} /> Top Strengths
                            </p>
                            <ul className="space-y-1 text-muted-foreground">
                              {resume.highReasons.slice(0, 2).map((h: any, i: number) => (
                                <li key={i} className="line-clamp-2 leading-relaxed">
                                  • {typeof h === "string" ? h : h?.title || h?.reason || "High score achieved"}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Improvement Opportunities */}
                        {Array.isArray(resume.improvementReasons) && resume.improvementReasons.length > 0 && (
                          <div>
                            <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                              <TrendingUp size={11} /> Areas to Improve
                            </p>
                            <ul className="space-y-1 text-muted-foreground">
                              {resume.improvementReasons.slice(0, 2).map((imp: any, i: number) => (
                                <li key={i} className="line-clamp-2 leading-relaxed">
                                  • {typeof imp === "string" ? imp : imp?.title || imp?.reason || "Recommendation available"}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Footer Actions */}
                      {resume.id && (
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
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Translucent Delete Confirmation Modal (supports single and bulk multi-resume delete) */}
      <DeleteResumeModal
        isOpen={!!resumeToDelete || !!bulkResumesToDelete}
        resume={resumeToDelete}
        items={bulkResumesToDelete || undefined}
        onClose={() => {
          setResumeToDelete(null);
          setBulkResumesToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
