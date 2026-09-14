import React, { useEffect } from "react";
import { Trash2, FileText, X, Loader2, Layers } from "lucide-react";

export interface ResumeDeleteItem {
  id: string;
  filename?: string;
  atsScore?: number | string;
  uploadedAt?: string;
  jobMatch?: number | string;
}

export interface DeleteResumeModalProps {
  isOpen: boolean;
  resume?: ResumeDeleteItem | null;
  items?: ResumeDeleteItem[];
  onClose: () => void;
  onConfirm: (idOrIds: string | string[]) => Promise<void> | void;
  isDeleting?: boolean;
}

export function DeleteResumeModal({
  isOpen,
  resume,
  items,
  onClose,
  onConfirm,
  isDeleting = false,
}: DeleteResumeModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isDeleting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  const targetList = items && items.length > 0 ? items : resume ? [resume] : [];
  const isMultiple = targetList.length > 1;

  if (!isOpen || targetList.length === 0) return null;

  const handleConfirmAction = () => {
    if (isMultiple) {
      onConfirm(targetList.map((r) => r.id));
    } else {
      onConfirm(targetList[0].id);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-resume-title"
    >
      {/* Translucent Frosted Glass Card */}
      <div
        className="relative w-full max-w-md rounded-2xl p-6 overflow-hidden transition-all border bg-white/75 dark:bg-[#101422]/75 backdrop-blur-2xl border-white/60 dark:border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_25px_rgba(244,63,94,0.18)] text-foreground animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient translucent danger aura */}
        <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-rose-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors disabled:opacity-40 cursor-pointer"
          title="Close dialog"
        >
          <X size={16} />
        </button>

        {/* Translucent Rose Danger Badge */}
        <div className="mx-auto mb-4 w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500 shadow-inner">
          <Trash2 size={22} className="animate-pulse" />
        </div>

        {/* Title & Warning */}
        <div className="text-center mb-5">
          <h3 id="delete-resume-title" className="text-lg font-semibold text-foreground tracking-tight">
            {isMultiple ? `Delete ${targetList.length} Resumes?` : "Delete Resume?"}
          </h3>
          <p className="text-xs text-muted-foreground mt-1.5 max-w-xs mx-auto leading-relaxed">
            {isMultiple
              ? `Are you sure you want to permanently delete these ${targetList.length} selected resumes? This action cannot be undone.`
              : "Are you sure you want to delete this resume? This will permanently remove it from your evaluation history."}
          </p>
        </div>

        {/* Translucent Resume Summary Box / List */}
        {isMultiple ? (
          <div className="mb-6">
            <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
              <span>Selected Resumes ({targetList.length})</span>
            </div>
            <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 backdrop-blur-sm pr-1.5">
              {targetList.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2.5 px-2.5 py-1.5 rounded-lg bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/5 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText size={14} className="text-primary shrink-0" />
                    <span className="font-medium text-foreground truncate">{item.filename || "Resume"}</span>
                  </div>
                  {item.atsScore !== undefined && (
                    <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary shrink-0">
                      ATS {item.atsScore}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 backdrop-blur-sm flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
              <FileText size={18} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-semibold text-foreground truncate">
                {targetList[0].filename || "Resume Document"}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                {targetList[0].atsScore !== undefined && (
                  <span className="text-[11px] font-mono font-medium text-primary">
                    ATS {targetList[0].atsScore}
                  </span>
                )}
                {targetList[0].jobMatch !== undefined && (
                  <span className="text-[11px] font-mono font-medium text-emerald-500">
                    {targetList[0].jobMatch}% Match
                  </span>
                )}
                {targetList[0].uploadedAt && (
                  <span className="text-[10px] text-muted-foreground truncate">
                    · {targetList[0].uploadedAt}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10 text-foreground text-xs font-semibold transition-all hover:scale-[1.01] cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmAction}
            disabled={isDeleting}
            className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600/90 hover:bg-rose-600 active:bg-rose-700 text-white text-xs font-semibold transition-all hover:scale-[1.01] shadow-lg shadow-rose-600/25 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 size={13} />
                <span>{isMultiple ? `Delete ${targetList.length} Resumes` : "Delete Resume"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
