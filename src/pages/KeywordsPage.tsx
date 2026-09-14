import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { CheckCircle2, AlertTriangle, Search } from "lucide-react";
import { Card, CardBody, CardHeader, Badge } from "../components/ui";
import { useApp } from "../context/AppContext";

const categories = ["All", "skill", "action", "technical", "descriptor"];

export default function KeywordsPage() {
  const { keywords } = useApp();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = keywords.filter(
    (k) =>
      (filter === "All" || k.category === filter) &&
      k.word.toLowerCase().includes(search.toLowerCase())
  );

  const present = keywords.filter((k) => k.frequency > 0 && k.inJD);
  const missing = keywords.filter((k) => k.frequency === 0 && k.inJD);
  const extra = keywords.filter((k) => k.frequency > 0 && !k.inJD);

  const barData = keywords
    .filter((k) => k.inJD)
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10)
    .map((k) => ({
      name: k.word,
      frequency: k.frequency,
      color: k.frequency === 0 ? "#f43f5e" : k.frequency < 3 ? "#f59e0b" : "#10b981",
    }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="rounded-lg border border-border px-3 py-2 text-xs shadow-lg" style={{ backgroundColor: "var(--card)" }}>
          <p className="text-muted-foreground mb-0.5">{label}</p>
          <p className="font-mono font-semibold text-foreground">Appears {payload[0].value}× in resume</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <div>
        <h2 className="font-serif text-2xl text-foreground mb-0.5">Keyword Analysis</h2>
        <p className="text-sm text-muted-foreground">
          Keywords from the job description and how well they appear in your resume
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardBody>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Matched Keywords</p>
            <p className="font-mono text-2xl font-semibold text-emerald-400">{present.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">present in resume</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Missing Keywords</p>
            <p className="font-mono text-2xl font-semibold text-rose-400">{missing.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">not in resume</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Extra Keywords</p>
            <p className="font-mono text-2xl font-semibold text-sky-400">{extra.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">not required, but present</p>
          </CardBody>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-foreground">JD Keyword Frequency in Resume</h3>
          <p className="text-xs text-muted-foreground mt-0.5">How many times each required keyword appears in your resume</p>
        </CardHeader>
        <CardBody>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barSize={22} margin={{ left: -15, right: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="frequency" radius={[4, 4, 0, 0]}>
                {barData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="w-2 h-2 rounded bg-emerald-400" /> Strong (3+)
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="w-2 h-2 rounded bg-amber-400" /> Weak (1–2)
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="w-2 h-2 rounded bg-rose-400" /> Missing (0)
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-foreground">All Keywords</h3>
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-2 border border-border rounded-md px-3 py-1.5"
              style={{ backgroundColor: "var(--muted)" }}
            >
              <Search size={13} className="text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-xs text-foreground outline-none w-28 placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex gap-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all capitalize ${
                    filter === cat ? "bg-primary text-white" : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-2.5 text-muted-foreground font-medium">Keyword</th>
                <th className="text-left px-5 py-2.5 text-muted-foreground font-medium">Category</th>
                <th className="text-center px-5 py-2.5 text-muted-foreground font-medium">In JD</th>
                <th className="text-center px-5 py-2.5 text-muted-foreground font-medium">Resume Count</th>
                <th className="text-left px-5 py-2.5 text-muted-foreground font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((kw) => {
                const status =
                  !kw.inJD
                    ? { label: "Extra", color: "#38bdf8", bg: "rgba(56,189,248,0.08)", border: "rgba(56,189,248,0.2)" }
                    : kw.frequency >= 3
                    ? { label: "Strong", color: "#10b981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)" }
                    : kw.frequency > 0
                    ? { label: "Weak", color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)" }
                    : { label: "Missing", color: "#f43f5e", bg: "rgba(244,63,94,0.08)", border: "rgba(244,63,94,0.2)" };

                return (
                  <tr key={kw.word} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-2.5">
                      <span className="font-mono font-medium text-foreground">{kw.word}</span>
                    </td>
                    <td className="px-5 py-2.5">
                      <span className="capitalize text-muted-foreground">{kw.category}</span>
                    </td>
                    <td className="px-5 py-2.5 text-center">
                      {kw.inJD ? (
                        <CheckCircle2 size={13} className="text-emerald-400 mx-auto" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-5 py-2.5 text-center">
                      <span className="font-mono">{kw.frequency === 0 ? "—" : kw.frequency}</span>
                    </td>
                    <td className="px-5 py-2.5">
                      <span
                        className="px-2 py-0.5 rounded text-xs font-medium border"
                        style={{ color: status.color, backgroundColor: status.bg, borderColor: status.border }}
                      >
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Keyword recommendations */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-foreground">Keyword Recommendations</h3>
        </CardHeader>
        <CardBody className="space-y-2.5">
          {[
            {
              action: "Add",
              keyword: "microservices",
              reason: 'Mentioned in JD: "experience building microservices". Use it in your Stripe or CloudPulse descriptions.',
            },
            {
              action: "Add",
              keyword: "scalable",
              reason: 'The JD uses "scalable systems". Add this adjective to relevant project descriptions.',
            },
            {
              action: "Strengthen",
              keyword: "Docker",
              reason: 'Currently appears only twice. Mention Docker more prominently in CloudPulse project — it\'s in the tech stack.',
            },
            {
              action: "Add",
              keyword: "AWS",
              reason: "AWS is required but absent. Consider adding even basic AWS service exposure if you have it.",
            },
          ].map((rec, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg p-3" style={{ backgroundColor: "var(--muted)" }}>
              <span
                className="text-xs px-2 py-0.5 rounded font-mono font-semibold shrink-0 mt-0.5"
                style={{
                  backgroundColor: rec.action === "Add" ? "rgba(99,102,241,0.15)" : "rgba(245,158,11,0.15)",
                  color: rec.action === "Add" ? "#818cf8" : "#f59e0b",
                }}
              >
                {rec.action}
              </span>
              <div>
                <span className="font-mono text-xs font-semibold text-foreground mr-2">{rec.keyword}</span>
                <span className="text-xs text-muted-foreground">{rec.reason}</span>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
