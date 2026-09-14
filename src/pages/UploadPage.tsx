import React, { useState, useRef } from "react";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  FileUp,
  Cpu,
  Zap,
  Lightbulb,
  Layers,
  ArrowRight,
  Sparkles,
  BarChart3,
  Users,
} from "lucide-react";
import { Card, CardBody, CardHeader, Button, ProgressBar } from "../components/ui";
import { useApp } from "../context/AppContext";

interface UploadPageProps {
  onNavigate: (page: string) => void;
}

type UploadState =
  | "idle"
  | "dragging"
  | "uploading"
  | "processing"
  | "complete"
  | "error"
  | "batch_uploading"
  | "batch_complete";

interface BatchItem {
  id: string;
  name: string;
  size: string;
  status: "pending" | "processing" | "complete" | "error";
  atsScore?: number;
  jobMatchScore?: number;
  skillsCount?: number;
  error?: string;
}

const processingSteps = [
  { id: 1, label: "Extracting text from PDF/DOCX", icon: <FileText size={14} />, color: "#3b82f6" },
  { id: 2, label: "Cleaning and normalizing text", icon: <Cpu size={14} />, color: "#38bdf8" },
  { id: 3, label: "Detecting resume sections", icon: <FileUp size={14} />, color: "#0ea5e9" },
  { id: 4, label: "Extracting skills & entities", icon: <Cpu size={14} />, color: "#10b981" },
  { id: 5, label: "Running ATS analysis", icon: <Zap size={14} />, color: "#f59e0b" },
  { id: 6, label: "Generating AI recommendations", icon: <Lightbulb size={14} />, color: "#f43f5e" },
];

export default function UploadPage({ onNavigate }: UploadPageProps) {
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [file, setFile] = useState<{ name: string; size: string } | null>(null);
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [batchStats, setBatchStats] = useState<{
    total: number;
    successful: number;
    avgAts: number;
    topScore: number;
    topCandidate: string;
  }>({ total: 0, successful: 0, avgAts: 0, topScore: 0, topCandidate: "" });
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    uploadResume,
    uploadBatchResumes,
    useSampleResume,
    resumeData,
    technicalSkills,
    softSkills,
    missingSkills,
  } = useApp();

  const handleSingleFile = async (rawFile: File) => {
    const ext = rawFile.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "docx"].includes(ext ?? "")) {
      setError("Unsupported file format. Please upload a PDF or DOCX file.");
      setState("error");
      return;
    }
    if (rawFile.size > 10 * 1024 * 1024) {
      setError("File too large. Maximum size is 10MB.");
      setState("error");
      return;
    }
    const sizeStr =
      rawFile.size < 1024 * 1024
        ? `${(rawFile.size / 1024).toFixed(0)} KB`
        : `${(rawFile.size / 1024 / 1024).toFixed(1)} MB`;
    setFile({ name: rawFile.name, size: sizeStr });
    setError("");

    setState("uploading");
    setProgress(20);
    setCurrentStep(0);
    setCompletedSteps([]);

    try {
      const stepTimer = setInterval(() => {
        setCurrentStep((s) => {
          const next = Math.min(s + 1, processingSteps.length - 1);
          setCompletedSteps((prev) => [...prev, s]);
          setProgress(Math.round(((next + 1) / processingSteps.length) * 90));
          return next;
        });
      }, 380);

      await uploadResume(rawFile);
      clearInterval(stepTimer);

      setCompletedSteps(processingSteps.map((_, i) => i));
      setProgress(100);
      setState("complete");
    } catch (err: any) {
      setError(err.message || "Failed to parse and analyze resume.");
      setState("error");
    }
  };

  const handleBatchFiles = async (rawFiles: File[]) => {
    const validFiles: File[] = [];
    const initialItems: BatchItem[] = [];

    for (let i = 0; i < rawFiles.length; i++) {
      const f = rawFiles[i];
      const ext = f.name.split(".").pop()?.toLowerCase();
      const sizeStr =
        f.size < 1024 * 1024
          ? `${(f.size / 1024).toFixed(0)} KB`
          : `${(f.size / 1024 / 1024).toFixed(1)} MB`;

      if (!["pdf", "docx"].includes(ext ?? "")) {
        initialItems.push({
          id: `item-${i}-${Date.now()}`,
          name: f.name,
          size: sizeStr,
          status: "error",
          error: "Unsupported format (must be .pdf or .docx)",
        });
      } else if (f.size > 10 * 1024 * 1024) {
        initialItems.push({
          id: `item-${i}-${Date.now()}`,
          name: f.name,
          size: sizeStr,
          status: "error",
          error: "File exceeds 10MB limit",
        });
      } else {
        validFiles.push(f);
        initialItems.push({
          id: `item-${i}-${Date.now()}`,
          name: f.name,
          size: sizeStr,
          status: "processing",
        });
      }
    }

    if (validFiles.length === 0) {
      setBatchItems(initialItems);
      setError("No valid PDF or DOCX files found in selection.");
      setState("error");
      return;
    }

    setBatchItems(initialItems);
    setError("");
    setState("batch_uploading");
    setProgress(15);

    // Progress animation while backend is batch processing
    const progressTimer = setInterval(() => {
      setProgress((p) => {
        if (p >= 85) return p;
        return p + Math.floor(Math.random() * 8) + 4;
      });
    }, 400);

    try {
      const res = await uploadBatchResumes(validFiles);
      clearInterval(progressTimer);
      setProgress(100);

      // Merge results back to batchItems
      const resultMap = new Map<string, any>();
      (res.resumes || []).forEach((r: any) => {
        resultMap.set(r.filename.toLowerCase(), r);
      });
      const errorMap = new Map<string, string>();
      (res.errors || []).forEach((e: any) => {
        errorMap.set(e.filename.toLowerCase(), e.error);
      });

      const updated = initialItems.map((item) => {
        const lowerName = item.name.toLowerCase();
        if (resultMap.has(lowerName)) {
          const r = resultMap.get(lowerName);
          return {
            ...item,
            status: "complete" as const,
            atsScore: r.atsScore,
            jobMatchScore: r.jobMatchScore,
            skillsCount: r.skillsCount,
          };
        }
        if (errorMap.has(lowerName)) {
          return {
            ...item,
            status: "error" as const,
            error: errorMap.get(lowerName),
          };
        }
        return item;
      });

      setBatchItems(updated);

      // Calculate summary statistics
      const successes = updated.filter((x) => x.status === "complete");
      const totalScore = successes.reduce((acc, x) => acc + (x.atsScore || 0), 0);
      const avg = successes.length > 0 ? Math.round(totalScore / successes.length) : 0;
      let topScore = 0;
      let topCand = "";
      successes.forEach((x) => {
        if ((x.atsScore || 0) > topScore) {
          topScore = x.atsScore || 0;
          topCand = x.name.replace(/_resume\.pdf$/i, "").replace(/_/g, " ");
        }
      });

      setBatchStats({
        total: updated.length,
        successful: successes.length,
        avgAts: avg,
        topScore,
        topCandidate: topCand || "Candidate",
      });

      setState("batch_complete");
    } catch (err: any) {
      clearInterval(progressTimer);
      setError(err.message || "Failed to process multiple resumes.");
      setState("error");
    }
  };

  const handleSample = async () => {
    setFile({ name: "Marcus_Vance_Resume.pdf", size: "245 KB" });
    setError("");
    setState("uploading");
    setProgress(30);
    setCurrentStep(0);
    setCompletedSteps([]);

    try {
      const stepTimer = setInterval(() => {
        setCurrentStep((s) => {
          const next = Math.min(s + 1, processingSteps.length - 1);
          setCompletedSteps((prev) => [...prev, s]);
          setProgress(Math.round(((next + 1) / processingSteps.length) * 90));
          return next;
        });
      }, 350);

      await useSampleResume();
      clearInterval(stepTimer);

      setCompletedSteps(processingSteps.map((_, i) => i));
      setProgress(100);
      setState("complete");
    } catch (err: any) {
      setError(err.message || "Failed to load sample resume.");
      setState("error");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setState("idle");
    const rawFiles = Array.from(e.dataTransfer.files || []);
    if (rawFiles.length === 1) {
      handleSingleFile(rawFiles[0]);
    } else if (rawFiles.length > 1) {
      handleBatchFiles(rawFiles);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = Array.from(e.target.files || []);
    if (rawFiles.length === 1) {
      handleSingleFile(rawFiles[0]);
    } else if (rawFiles.length > 1) {
      handleBatchFiles(rawFiles);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const reset = () => {
    setState("idle");
    setProgress(0);
    setCurrentStep(0);
    setCompletedSteps([]);
    setFile(null);
    setBatchItems([]);
    setError("");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl text-foreground mb-1">Upload Resume</h2>
          <p className="text-sm text-muted-foreground">
            Upload single or multiple PDF/DOCX resumes. Our AI parses, scores, and indexes candidates simultaneously.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate("history")}
            icon={<Users size={14} />}
          >
            Candidate History
          </Button>
        </div>
      </div>

      {/* IDLE / DRAGGING / ERROR STATE */}
      {(state === "idle" || state === "dragging" || state === "error") && (
        <div className="space-y-4">
          {/* Drop zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setState("dragging");
            }}
            onDragLeave={() => setState("idle")}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 living-card ${
              state === "dragging"
                ? "border-primary bg-primary/10 scale-[1.01] shadow-xl shadow-primary/20"
                : "border-border hover:border-primary/50 hover:bg-secondary/40"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              multiple
              className="hidden"
              onChange={handleFileInput}
            />

            <div className="flex flex-col items-center gap-3">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-inner group-hover:scale-110"
                style={{
                  backgroundColor:
                    state === "dragging" ? "rgba(59,130,246,0.25)" : "var(--muted)",
                }}
              >
                <Upload
                  size={28}
                  className={state === "dragging" ? "animate-bounce" : ""}
                  style={{
                    color: state === "dragging" ? "#3b82f6" : "var(--muted-foreground)",
                  }}
                />
              </div>

              <div>
                <p className="font-semibold text-foreground text-base mb-1">
                  {state === "dragging" ? "Release to upload resumes" : "Drop resumes here"}
                </p>
                <p className="text-sm text-muted-foreground">
                  or <span className="text-primary font-medium underline">browse files</span> from your computer
                </p>
                <p className="text-xs text-muted-foreground/80 mt-1">
                  Supports selecting and uploading multiple resumes simultaneously
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                <span className="text-xs text-muted-foreground font-mono border border-border rounded-md px-2 py-0.5 bg-background/50">
                  PDF
                </span>
                <span className="text-xs text-muted-foreground font-mono border border-border rounded-md px-2 py-0.5 bg-background/50">
                  DOCX
                </span>
                <span className="text-xs text-primary font-medium border border-primary/30 rounded-md px-2.5 py-0.5 bg-primary/10">
                  ⚡ Multiple Files Supported
                </span>
                <span className="text-xs text-muted-foreground">Max 10MB each</span>
              </div>
            </div>
          </div>

          {state === "error" && (
            <div className="flex items-start gap-2.5 text-rose-400 text-sm bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 animate-fade-in">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">{error}</p>
                {batchItems.length > 0 && (
                  <ul className="mt-1.5 space-y-1 text-xs opacity-90">
                    {batchItems
                      .filter((i) => i.status === "error")
                      .map((i) => (
                        <li key={i.name}>
                          • {i.name}: {i.error}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Try with sample */}
          <div className="flex items-center justify-center">
            <button
              onClick={handleSample}
              className="text-xs text-primary hover:underline interactive-tap transition-all hover:scale-105"
            >
              Or try with sample resume →
            </button>
          </div>
        </div>
      )}

      {/* SINGLE FILE: UPLOADING / PROCESSING */}
      {(state === "uploading" || state === "processing") && (
        <Card className="relative overflow-hidden border-primary/30 shadow-xl shadow-primary/10">
          {/* Animated Laser Scanning Beam */}
          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-scan-beam shadow-[0_0_15px_rgba(59,130,246,0.9)] pointer-events-none z-10" />

          <CardBody className="space-y-5 relative z-0">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10 animate-breathe">
                <FileText size={20} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{file?.name}</p>
                <p className="text-xs text-muted-foreground">{file?.size}</p>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-medium text-foreground">
                  {state === "uploading" ? "Uploading..." : "Analyzing resume structure & skills..."}
                </p>
                <span className="font-mono text-xs text-primary font-semibold">{progress}%</span>
              </div>
              <ProgressBar value={progress} color="#3b82f6" height="h-2" animated />
            </div>

            {state === "processing" && (
              <div className="space-y-2">
                {processingSteps.map((step, i) => {
                  const isComplete = completedSteps.includes(i);
                  const isCurrent = currentStep === i && !isComplete;
                  return (
                    <div
                      key={step.id}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                        isCurrent ? "bg-primary/8 border border-primary/20" : ""
                      }`}
                    >
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all"
                        style={{
                          backgroundColor: isComplete
                            ? step.color
                            : isCurrent
                            ? `${step.color}25`
                            : "var(--muted)",
                          border: isCurrent ? `1px solid ${step.color}` : "none",
                        }}
                      >
                        {isComplete ? (
                          <CheckCircle2 size={12} className="text-white" />
                        ) : isCurrent ? (
                          <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke={step.color}
                              strokeWidth="4"
                            />
                            <path
                              fill={step.color}
                              d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"
                            />
                          </svg>
                        ) : null}
                      </div>
                      <span
                        className="text-xs transition-colors"
                        style={{
                          color: isComplete
                            ? "var(--foreground)"
                            : isCurrent
                            ? step.color
                            : "var(--muted-foreground)",
                        }}
                      >
                        {step.label}
                      </span>
                      {isComplete && (
                        <span className="ml-auto text-xs font-mono text-emerald-400">done</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* SINGLE FILE: COMPLETE */}
      {state === "complete" && (
        <Card className="animate-fade-in">
          <CardBody className="text-center py-10">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
              <CheckCircle2 size={32} className="text-emerald-400" />
            </div>
            <h3 className="font-serif text-2xl text-foreground mb-2">Analysis Complete</h3>
            <p className="text-sm text-muted-foreground mb-1">{file?.name}</p>

            <div className="flex justify-center gap-6 my-6">
              <div className="text-center">
                <p className="font-mono text-3xl font-semibold text-primary">
                  {resumeData.atsScore}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">ATS Score</p>
              </div>
              <div className="w-px bg-border" />
              <div className="text-center">
                <p className="font-mono text-3xl font-semibold text-emerald-400">
                  {technicalSkills.length + softSkills.length}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Skills Found</p>
              </div>
              <div className="w-px bg-border" />
              <div className="text-center">
                <p className="font-mono text-3xl font-semibold text-amber-400">
                  {missingSkills.length}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Missing Skills</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="primary"
                size="md"
                onClick={() => onNavigate("analysis")}
                icon={<Zap size={15} />}
              >
                View Analysis Results
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => onNavigate("dashboard")}
              >
                Go to Dashboard
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => onNavigate("history")}
                icon={<Users size={14} />}
              >
                Candidate History
              </Button>
              <Button variant="ghost" size="md" onClick={reset}>
                Upload Another
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* MULTI-FILE: BATCH UPLOADING / PROCESSING */}
      {state === "batch_uploading" && (
        <Card className="relative overflow-hidden border-primary/30 shadow-xl shadow-primary/10 animate-fade-in">
          {/* Animated Laser Scanning Beam */}
          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-scan-beam shadow-[0_0_15px_rgba(59,130,246,0.9)] pointer-events-none z-10" />

          <CardBody className="space-y-5 relative z-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/15 animate-breathe">
                  <Layers size={22} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-base">
                    Batch Uploading & Analyzing {batchItems.length} Resumes
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Parsing sections, indexing canonical skills, and calculating ATS scores in parallel...
                  </p>
                </div>
              </div>
              <span className="font-mono text-sm text-primary font-bold">{progress}%</span>
            </div>

            <div>
              <ProgressBar value={progress} color="#3b82f6" height="h-2.5" animated />
            </div>

            {/* Scrollable file queue */}
            <div className="rounded-xl border border-border/70 divide-y divide-border/50 max-h-72 overflow-y-auto bg-card/60">
              {batchItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-3">
                    <span className="font-mono text-xs text-muted-foreground/60 w-5">
                      {idx + 1}.
                    </span>
                    <FileText size={16} className="text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground">{item.size}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.status === "processing" ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-primary font-medium bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                        <svg className="animate-spin w-2.5 h-2.5" viewBox="0 0 24 24" fill="none">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"
                          />
                        </svg>
                        Parsing...
                      </span>
                    ) : item.status === "complete" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        <CheckCircle2 size={11} />
                        Done
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-rose-400 font-medium bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
                        <AlertCircle size={11} />
                        Failed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* MULTI-FILE: BATCH COMPLETE */}
      {state === "batch_complete" && (
        <Card className="animate-fade-in border-emerald-500/30 shadow-xl shadow-emerald-500/10">
          <CardBody className="py-8 px-6 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-3 animate-pulse-glow">
                <CheckCircle2 size={32} className="text-emerald-400" />
              </div>
              <h3 className="font-serif text-2xl text-foreground mb-1">
                Successfully Uploaded & Analyzed {batchStats.successful} Resumes
              </h3>
              <p className="text-sm text-muted-foreground">
                All candidates have been parsed, scored, and indexed into your active candidate pool.
              </p>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-card border border-border text-center">
                <p className="text-xs text-muted-foreground uppercase font-mono tracking-wider mb-1">
                  Resumes Added
                </p>
                <p className="text-2xl font-bold font-mono text-primary">
                  {batchStats.successful}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  of {batchStats.total} submitted
                </p>
              </div>

              <div className="p-4 rounded-xl bg-card border border-border text-center">
                <p className="text-xs text-muted-foreground uppercase font-mono tracking-wider mb-1">
                  Average ATS
                </p>
                <p className="text-2xl font-bold font-mono text-emerald-400">
                  {batchStats.avgAts}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Cohort ATS score</p>
              </div>

              <div className="p-4 rounded-xl bg-card border border-border text-center">
                <p className="text-xs text-muted-foreground uppercase font-mono tracking-wider mb-1">
                  Top Score
                </p>
                <p className="text-2xl font-bold font-mono text-blue-400">
                  {batchStats.topScore}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                  {batchStats.topCandidate || "Leader"}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-card border border-border text-center">
                <p className="text-xs text-muted-foreground uppercase font-mono tracking-wider mb-1">
                  Ready For
                </p>
                <p className="text-2xl font-bold font-mono text-amber-400">Compare</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Multi-candidate match</p>
              </div>
            </div>

            {/* Quick candidate list */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Processed Candidates ({batchItems.filter((i) => i.status === "complete").length})
                </p>
                <span className="text-xs text-muted-foreground">Showing uploaded batch</span>
              </div>
              <div className="rounded-xl border border-border divide-y divide-border/60 max-h-64 overflow-y-auto bg-card/50">
                {batchItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-3">
                      <FileText size={16} className="text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {item.skillsCount ? `${item.skillsCount} skills identified` : item.size}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {item.atsScore ? (
                        <span
                          className={`font-mono text-xs font-semibold px-2 py-0.5 rounded-md ${
                            item.atsScore >= 85
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : item.atsScore >= 70
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          ATS {item.atsScore}
                        </span>
                      ) : null}

                      {item.status === "complete" ? (
                        <CheckCircle2 size={16} className="text-emerald-400" />
                      ) : (
                        <AlertCircle size={16} className="text-rose-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => onNavigate("history")}
                icon={<Users size={16} />}
              >
                View in Candidate History ({batchStats.successful})
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => onNavigate("compare")}
                icon={<BarChart3 size={16} />}
              >
                Compare Candidates
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => onNavigate("dashboard")}
              >
                Dashboard
              </Button>
              <Button variant="ghost" size="md" onClick={reset}>
                Upload More
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Tips */}
      {(state === "idle" || state === "error") && (
        <Card className="mt-4">
          <CardHeader>
            <h3 className="text-sm font-medium text-foreground">Tips for best results</h3>
          </CardHeader>
          <CardBody className="grid sm:grid-cols-2 gap-3 pt-0">
            {[
              { icon: "📄", tip: "Use clean, single-column PDF resumes for standard ATS text parsing." },
              { icon: "🗂️", tip: "You can drag and drop multiple resumes (e.g., all 20 test resumes) at once." },
              { icon: "📋", tip: "Include clear section headings: Skills, Experience, Education, Projects." },
              { icon: "⚖️", tip: "After uploading multiple resumes, compare them side-by-side on the Compare page." },
            ].map((t) => (
              <div key={t.tip} className="flex items-start gap-2.5">
                <span className="text-sm shrink-0">{t.icon}</span>
                <p className="text-xs text-muted-foreground leading-relaxed">{t.tip}</p>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      {/* Supported formats */}
      {(state === "idle" || state === "error") && (
        <div
          className="mt-4 rounded-xl border border-border p-4"
          style={{ backgroundColor: "var(--card)" }}
        >
          <div className="flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={13} className="text-emerald-400" />
              PDF (recommended)
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={13} className="text-emerald-400" />
              DOCX files
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={13} className="text-emerald-400" />
              Batch upload (up to 50 files)
            </div>
            <div className="flex items-center gap-2">
              <X size={13} className="text-rose-400" />
              JPG / PNG (not supported)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
