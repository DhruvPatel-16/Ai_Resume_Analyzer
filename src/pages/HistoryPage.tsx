import React, { useState, useEffect } from "react";
import { FileText, CheckCircle2, Trash2, Download, Eye, Loader2, GitCompare, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardBody, CardHeader, Badge, Button } from "../components/ui";
import { DeleteResumeModal, ResumeDeleteItem } from "../components/DeleteResumeModal";
import { useApp } from "../context/AppContext";

interface HistoryPageProps {
  onNavigate?: (page: string) => void;
}

export default function HistoryPage({ onNavigate }: HistoryPageProps) {
  const {
    resumeHistory,
    deleteResume,
    downloadResume,
    previewResume,
    refreshHistory,
    selectedCompareIds,
    setSelectedCompareIds,
  } = useApp();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [resumeToDelete, setResumeToDelete] = useState<ResumeDeleteItem | null>(null);
  const [bulkResumesToDelete, setBulkResumesToDelete] = useState<ResumeDeleteItem[] | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const RESUMES_PER_PAGE = 10;
  const totalPages = Math.max(1, Math.ceil(resumeHistory.length / RESUMES_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pageStartIndex = (safePage - 1) * RESUMES_PER_PAGE;
  const paginatedResumes = resumeHistory.slice(pageStartIndex, pageStartIndex + RESUMES_PER_PAGE);

  useEffect(() => {
    refreshHistory();
  }, []);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [resumeHistory.length, totalPages, currentPage]);

  const handleConfirmDelete = async (idOrIds: string | string[]) => {
    try {
      setIsDeleting(true);
      const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
      await Promise.all(ids.map((id) => deleteResume(id)));
      setSelectedCompareIds((prev) => prev.filter((id) => !ids.includes(id)));
      setResumeToDelete(null);
      setBulkResumesToDelete(null);
    } catch (err: any) {
      console.error("Failed to delete resumes", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = async (e: React.MouseEvent, r: any) => {
    e.stopPropagation();
    if (!r.id) {
      window.open("/api/resumes/sample", "_blank");
      return;
    }
    try {
      setDownloadingId(r.id);
      await downloadResume(r.id, r.filename || "resume.pdf");
    } catch (err: any) {
      console.error("Download failed:", err);
      window.open(`/api/resumes/${r.id}/download`, "_blank");
    } finally {
      setDownloadingId(null);
    }
  };

  const handlePreview = async (e: React.MouseEvent, r: any) => {
    e.stopPropagation();
    if (!r.id) return;
    try {
      setPreviewingId(r.id);
      await previewResume(r.id);
    } catch (err: any) {
      console.error("Preview failed:", err);
      window.open(`/api/resumes/${r.id}/preview`, "_blank");
    } finally {
      setPreviewingId(null);
    }
  };

  const toggleResumeSelection = (id?: string) => {
    if (!id) return;
    setSelectedCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAllResumes = () => {
    setSelectedCompareIds(resumeHistory.map((r: any) => r.id).filter(Boolean));
  };

  const clearSelection = () => {
    setSelectedCompareIds([]);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <div>
        <h2 className="font-serif text-2xl text-foreground mb-0.5">Resume History</h2>
        <p className="text-sm text-muted-foreground">
          Manage your resume versions, preview or download files, and select candidates for multi-resume comparison
        </p>
      </div>

      {/* Version list */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-foreground">Resume Versions ({resumeHistory.length})</h3>
              {totalPages > 1 && (
                <span className="text-xs px-2 py-0.5 rounded font-mono font-medium bg-secondary text-secondary-foreground border border-border">
                  Page {safePage} of {totalPages}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select 2 or more resumes to compare them side-by-side on the Compare page
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {selectedCompareIds.length > 0 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSelection}
                  className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Clear ({selectedCompareIds.length})
                </Button>

                {/* Delete option on the right side of Clear */}
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
            <Button
              variant="outline"
              size="sm"
              onClick={selectAllResumes}
              className="text-xs cursor-pointer"
            >
              Select All
            </Button>
            {selectedCompareIds.length >= 2 && (
              <Button
                size="sm"
                onClick={() => onNavigate && onNavigate("compare")}
                className="text-xs flex items-center gap-1.5"
              >
                <GitCompare size={13} />
                Compare ({selectedCompareIds.length})
              </Button>
            )}
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="divide-y divide-border">
            {paginatedResumes.map((r, i) => {
              const isSelected = selectedCompareIds.includes(r.id);
              return (
                <div
                  key={r.id || i}
                  className={`flex items-center gap-4 px-5 py-4 transition-colors cursor-pointer ${
                    isSelected ? "bg-primary/5" : "hover:bg-secondary/30"
                  }`}
                  onClick={() => toggleResumeSelection(r.id)}
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
                    {/* 1. View / Preview Button */}
                    <button
                      className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 cursor-pointer"
                      onClick={(e) => handlePreview(e, r)}
                      title="Preview resume inline"
                      disabled={previewingId === (r as any).id}
                    >
                      {previewingId === (r as any).id ? (
                        <Loader2 size={13} className="animate-spin text-primary" />
                      ) : (
                        <Eye size={13} />
                      )}
                    </button>

                    {/* 2. Download Button */}
                    <button
                      className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 cursor-pointer"
                      onClick={(e) => handleDownload(e, r)}
                      title="Download resume file"
                      disabled={downloadingId === (r as any).id}
                    >
                      {downloadingId === (r as any).id ? (
                        <Loader2 size={13} className="animate-spin text-primary" />
                      ) : (
                        <Download size={13} />
                      )}
                    </button>

                    {/* 3. Delete Button (shifted to last) */}
                    <button
                      className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-400 transition-colors cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setResumeToDelete({
                          id: (r as any).id,
                          filename: r.filename,
                          atsScore: r.atsScore,
                          uploadedAt: r.uploadedAt,
                          jobMatch: r.jobMatch,
                        });
                      }}
                      title="Delete resume"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardBody>

        {/* Pagination Controls - 10 Resumes Per Page */}
        {totalPages > 1 && (
          <div className="border-t border-border px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 bg-secondary/15">
            <p className="text-xs text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground font-mono">
                {resumeHistory.length === 0 ? 0 : pageStartIndex + 1}–{Math.min(pageStartIndex + RESUMES_PER_PAGE, resumeHistory.length)}
              </span>{" "}
              of <span className="font-semibold text-foreground font-mono">{resumeHistory.length}</span> resumes
            </p>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="text-xs h-8 px-2.5 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                title="Previous page"
              >
                <ChevronLeft size={13} />
                <span>Prev</span>
              </Button>

              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => {
                  if (
                    totalPages > 7 &&
                    pageNum !== 1 &&
                    pageNum !== totalPages &&
                    Math.abs(pageNum - safePage) > 1
                  ) {
                    if (pageNum === 2 || pageNum === totalPages - 1) {
                      return (
                        <span key={pageNum} className="text-xs text-muted-foreground px-1 select-none">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                        safePage === pageNum
                          ? "bg-primary text-white shadow-xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="text-xs h-8 px-2.5 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                title="Next page"
              >
                <span>Next</span>
                <ChevronRight size={13} />
              </Button>
            </div>
          </div>
        )}
      </Card>

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
