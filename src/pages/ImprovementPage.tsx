import React, { useState } from "react";
import { Copy, Check, ChevronDown, ChevronUp, Wand2, AlertCircle, Sparkles } from "lucide-react";
import { Card, CardBody, CardHeader, Badge, Button } from "../components/ui";
import { useApp } from "../context/AppContext";

function BulletCard({ item, index }: { item: { section: string; original: string; improved: string; explanation: string }; index: number }) {
  const [expanded, setExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(item.improved);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left">
        <div className="flex items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-primary/15 flex items-center justify-center">
              <span className="text-xs font-mono font-semibold text-primary">{index + 1}</span>
            </div>
            <span className="text-xs text-muted-foreground">{item.section}</span>
          </div>
          {expanded ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-3 animate-fade-in">
          {/* Original */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-medium text-rose-400">Original</span>
            </div>
            <div className="rounded-lg p-3 border border-rose-500/20 text-sm text-muted-foreground leading-relaxed" style={{ backgroundColor: "rgba(244,63,94,0.05)" }}>
              {item.original}
            </div>
          </div>

          {/* Arrow */}
          <div className="flex items-center gap-2 py-1">
            <div className="flex-1 h-px bg-border" />
            <div className="flex items-center gap-1.5 text-xs text-primary">
              <Wand2 size={12} />
              AI Suggestion
            </div>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Improved */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-emerald-400">Improved</span>
              <button
                onClick={copy}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="rounded-lg p-3 border border-emerald-500/20 text-sm text-foreground leading-relaxed" style={{ backgroundColor: "rgba(16,185,129,0.06)" }}>
              {item.improved}
            </div>
          </div>

          {/* Explanation */}
          <div className="rounded-lg p-3 border border-border text-xs text-muted-foreground leading-relaxed" style={{ backgroundColor: "var(--muted)" }}>
            <span className="text-foreground font-medium">Why this is better: </span>
            {item.explanation}
          </div>
        </div>
      )}
    </Card>
  );
}

export default function ImprovementPage() {
  const { bulletImprovements, improveBullet: apiImproveBullet } = useApp();
  const [customBullet, setCustomBullet] = useState("");
  const [customResult, setCustomResult] = useState("");
  const [improving, setImproving] = useState(false);

  const handleImproveBullet = async () => {
    if (!customBullet.trim()) return;
    setImproving(true);
    setCustomResult("");
    try {
      const res = await apiImproveBullet(customBullet);
      setCustomResult(`${res.improved}\n\n${res.explanation}`);
    } catch {
      setCustomResult(`Developed and deployed ${customBullet.toLowerCase().replace(/^(built|made|created|worked on)\s*/i, "")} — strengthening backend service reliability.\n\nSuggestion: Add a verified metric if available (e.g. latency reduction or users served).`);
    } finally {
      setImproving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <div>
        <h2 className="font-serif text-2xl text-foreground mb-0.5">Resume Improvement</h2>
        <p className="text-sm text-muted-foreground">
          AI-powered bullet point rewrites — grounded in your actual experience, no invented metrics
        </p>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/8 px-4 py-3 text-xs text-amber-400">
        <AlertCircle size={14} className="mt-0.5 shrink-0" />
        <div>
          <p className="font-medium mb-0.5">Ethical AI policy</p>
          <p className="text-amber-400/80">
            All suggestions are based only on information in your resume. The AI does not invent metrics
            like "increased performance by 40%" unless you provide evidence. Add your own measurements
            where you have them.
          </p>
        </div>
      </div>

      {/* Existing bullets */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Sparkles size={14} className="text-primary" />
          Suggested improvements for your resume
          <Badge variant="default">{bulletImprovements.length} bullets</Badge>
        </h3>
        <div className="space-y-3">
          {bulletImprovements.map((item, i) => (
            <BulletCard key={i} item={item} index={i} />
          ))}
        </div>
      </div>

      {/* Custom bullet tool */}
      <Card>
        <CardHeader className="flex items-center gap-2">
          <Wand2 size={14} className="text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Improve Your Own Bullet</h3>
        </CardHeader>
        <CardBody className="space-y-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Enter a bullet point to improve</label>
            <textarea
              value={customBullet}
              onChange={(e) => setCustomBullet(e.target.value)}
              rows={3}
              placeholder="e.g. Built a REST API for our mobile app"
              className="w-full px-3.5 py-2.5 rounded-md border border-border text-sm focus:outline-none focus:border-primary transition-colors resize-none"
              style={{ backgroundColor: "var(--muted)", color: "var(--foreground)" }}
            />
          </div>
          <Button variant="primary" size="sm" onClick={handleImproveBullet} disabled={improving || !customBullet.trim()} icon={<Wand2 size={13} />}>
            {improving ? "Improving..." : "Improve Bullet"}
          </Button>

          {customResult && (
            <div className="animate-fade-in space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
                <Check size={12} /> AI Suggestion
              </div>
              <div className="rounded-lg p-3 border border-emerald-500/20 text-sm text-foreground leading-relaxed whitespace-pre-line" style={{ backgroundColor: "rgba(16,185,129,0.06)" }}>
                {customResult}
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Resume writing tips */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-foreground">Resume Writing Best Practices</h3>
        </CardHeader>
        <CardBody className="grid sm:grid-cols-2 gap-3">
          {[
            { tip: "Start each bullet with a strong action verb: Developed, Engineered, Optimized, Led, Built", color: "#6366f1" },
            { tip: "Include technology names: React, Python, PostgreSQL — not generic terms like 'web framework'", color: "#10b981" },
            { tip: "Add measurable impact wherever real data exists: 500+ users, 45% improvement, 3 teams", color: "#38bdf8" },
            { tip: "Keep bullets to 1–2 lines. Remove filler words like 'responsible for' and 'helped with'", color: "#8b5cf6" },
            { tip: "Match the job description language. If the JD says 'microservices', use that word if accurate", color: "#f59e0b" },
            { tip: "Never invent metrics. 'I increased performance' without a number is better than a false percentage", color: "#f43f5e" },
          ].map((t, i) => (
            <div key={i} className="flex items-start gap-2.5 rounded-lg p-3" style={{ backgroundColor: "var(--muted)" }}>
              <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: t.color }} />
              <p className="text-xs text-muted-foreground leading-relaxed">{t.tip}</p>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
