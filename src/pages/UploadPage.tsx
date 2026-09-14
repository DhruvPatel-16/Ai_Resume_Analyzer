import React, { useState, useRef } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, X, FileUp, Cpu, Zap, Target, Lightbulb } from "lucide-react";
import { Card, CardBody, CardHeader, Button, ProgressBar } from "../components/ui";
import { useApp } from "../context/AppContext";

interface UploadPageProps {
  onNavigate: (page: string) => void;
}

type UploadState = "idle" | "dragging" | "uploading" | "processing" | "complete" | "error";

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
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadResume, useSampleResume, resumeData, technicalSkills, softSkills, missingSkills } = useApp();

  const handleFile = async (rawFile: File) => {
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
    const sizeStr = rawFile.size < 1024 * 1024 ? `${(rawFile.size / 1024).toFixed(0)} KB` : `${(rawFile.size / 1024 / 1024).toFixed(1)} MB`;
    setFile({ name: rawFile.name, size: sizeStr });
    setError("");

    // Start upload UI & pipeline animation
    setState("uploading");
    setProgress(20);
    setCurrentStep(0);
    setCompletedSteps([]);

    try {
      // Step animations
      const stepTimer = setInterval(() => {
        setCurrentStep((s) => {
          const next = Math.min(s + 1, processingSteps.length - 1);
          setCompletedSteps((prev) => [...prev, s]);
          setProgress(Math.round(((next + 1) / processingSteps.length) * 90));
          return next;
        });
      }, 400);

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
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const reset = () => {
    setState("idle");
    setProgress(0);
    setCurrentStep(0);
    setCompletedSteps([]);
    setFile(null);
    setError("");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="font-serif text-2xl text-foreground mb-1">Upload Resume</h2>
        <p className="text-sm text-muted-foreground">
          Upload your PDF or DOCX resume. Our AI will analyze it across 6 categories and generate personalized recommendations.
        </p>
      </div>

      {state === "idle" || state === "dragging" || state === "error" ? (
        <div className="space-y-4">
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setState("dragging"); }}
            onDragLeave={() => setState("idle")}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-all duration-300 living-card ${
              state === "dragging"
                ? "border-primary bg-primary/10 scale-[1.01] shadow-lg shadow-primary/20"
                : "border-border hover:border-primary/50 hover:bg-secondary/40"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              className="hidden"
              onChange={handleFileInput}
            />
            <div className="flex flex-col items-center gap-3">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-inner group-hover:scale-110"
                style={{ backgroundColor: state === "dragging" ? "rgba(59,130,246,0.25)" : "var(--muted)" }}
              >
                <Upload size={28} className={state === "dragging" ? "animate-bounce" : ""} style={{ color: state === "dragging" ? "#3b82f6" : "var(--muted-foreground)" }} />
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">
                  {state === "dragging" ? "Release to upload" : "Drop your resume here"}
                </p>
                <p className="text-sm text-muted-foreground">or click to browse files</p>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-muted-foreground font-mono border border-border rounded px-2 py-0.5">PDF</span>
                <span className="text-xs text-muted-foreground font-mono border border-border rounded px-2 py-0.5">DOCX</span>
                <span className="text-xs text-muted-foreground">Max 10MB</span>
              </div>
            </div>
          </div>

          {state === "error" && (
            <div className="flex items-start gap-2.5 text-rose-400 text-sm bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-3 animate-fade-in">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p>{error}</p>
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
      ) : null}

      {/* Uploading / Processing */}
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
                  const isPending = !isComplete && !isCurrent;
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
                          backgroundColor: isComplete ? step.color : isCurrent ? `${step.color}25` : "var(--muted)",
                          border: isCurrent ? `1px solid ${step.color}` : "none",
                        }}
                      >
                        {isComplete ? (
                          <CheckCircle2 size={12} className="text-white" />
                        ) : isCurrent ? (
                          <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke={step.color} strokeWidth="4" />
                            <path fill={step.color} d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                          </svg>
                        ) : null}
                      </div>
                      <span
                        className="text-xs transition-colors"
                        style={{
                          color: isComplete ? "var(--foreground)" : isCurrent ? step.color : "var(--muted-foreground)",
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

      {/* Complete */}
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
                <p className="font-mono text-3xl font-semibold text-primary">{resumeData.atsScore}</p>
                <p className="text-xs text-muted-foreground mt-0.5">ATS Score</p>
              </div>
              <div className="w-px bg-border" />
              <div className="text-center">
                <p className="font-mono text-3xl font-semibold text-emerald-400">{technicalSkills.length + softSkills.length}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Skills Found</p>
              </div>
              <div className="w-px bg-border" />
              <div className="text-center">
                <p className="font-mono text-3xl font-semibold text-amber-400">{missingSkills.length}</p>
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
              <Button variant="secondary" size="md" onClick={() => onNavigate("dashboard")}>
                Go to Dashboard
              </Button>
              <Button variant="ghost" size="md" onClick={reset}>
                Upload Another
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
              { icon: "📄", tip: "Use a clean, single-column PDF for best text extraction." },
              { icon: "🔤", tip: "Ensure your resume text is selectable, not scanned." },
              { icon: "📋", tip: "Include clear section headings: Skills, Experience, Education." },
              { icon: "🔗", tip: "Include your GitHub and LinkedIn URLs for completeness." },
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
        <div className="mt-4 rounded-lg border border-border p-4" style={{ backgroundColor: "var(--card)" }}>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={13} className="text-emerald-400" />
              PDF (recommended)
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={13} className="text-emerald-400" />
              DOCX files
            </div>
            <div className="flex items-center gap-2">
              <X size={13} className="text-rose-400" />
              JPG / PNG (not supported)
            </div>
            <div className="flex items-center gap-2">
              <X size={13} className="text-rose-400" />
              Scanned documents
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
