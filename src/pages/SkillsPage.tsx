import React, { useState } from "react";
import { AlertTriangle, CheckCircle2, Filter } from "lucide-react";
import { Card, CardBody, CardHeader, Badge, ProgressBar, Button } from "../components/ui";
import { useApp } from "../context/AppContext";

const categories = ["All", "Programming", "Frontend", "Backend", "Database", "DevOps", "AI/ML", "Cloud", "Tools"];

const categoryColors: Record<string, string> = {
  Programming: "#6366f1",
  Frontend: "#38bdf8",
  Backend: "#10b981",
  Database: "#8b5cf6",
  DevOps: "#f59e0b",
  "AI/ML": "#ec4899",
  Cloud: "#06b6d4",
  Tools: "#a855f7",
};

export default function SkillsPage() {
  const { technicalSkills, softSkills, missingSkills } = useApp();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const skillsByCategory = categories.slice(1).map((cat) => ({
    category: cat,
    color: categoryColors[cat] ?? "#6366f1",
    skills: technicalSkills.filter((s) => s.category === cat),
  }));

  const filteredSkills =
    selectedCategory === "All"
      ? technicalSkills
      : technicalSkills.filter((s) => s.category === selectedCategory);

  const getLevel = (l: number) =>
    l >= 85 ? "Expert" : l >= 70 ? "Proficient" : l >= 50 ? "Intermediate" : "Beginner";

  const getLevelColor = (l: number) =>
    l >= 85 ? "#10b981" : l >= 70 ? "#6366f1" : l >= 50 ? "#f59e0b" : "#f43f5e";

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <div>
        <h2 className="font-serif text-2xl text-foreground mb-0.5">Skills Analysis</h2>
        <p className="text-sm text-muted-foreground">
          Technical and soft skills extracted from your resume — with gap analysis against your target role
        </p>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Skills", value: technicalSkills.length + softSkills.length, color: "#6366f1" },
          { label: "Technical", value: technicalSkills.length, color: "#38bdf8" },
          { label: "Soft Skills", value: softSkills.length, color: "#8b5cf6" },
          { label: "Missing", value: missingSkills.length, color: "#f59e0b" },
        ].map((s) => (
          <Card key={s.label}>
            <CardBody>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{s.label}</p>
              <p className="font-mono text-2xl font-semibold" style={{ color: s.color }}>{s.value}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={13} className="text-muted-foreground" />
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              selectedCategory === cat
                ? "bg-primary text-white"
                : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Technical skills grid */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Technical Skills</h3>
            <Badge variant="default">{filteredSkills.length} skills</Badge>
          </CardHeader>
          <CardBody className="space-y-3">
            {filteredSkills.map((skill) => (
              <div key={skill.name} className="flex items-center gap-3">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: categoryColors[skill.category] ?? "#6366f1" }}
                />
                <span className="text-sm text-foreground font-mono w-28 shrink-0">{skill.name}</span>
                <div className="flex-1">
                  <ProgressBar value={skill.level} color={getLevelColor(skill.level)} height="h-1.5" animated />
                </div>
                <span className="font-mono text-xs text-muted-foreground w-8 text-right shrink-0">{skill.level}%</span>
                <span
                  className="text-xs shrink-0 w-20 text-right"
                  style={{ color: getLevelColor(skill.level) }}
                >
                  {getLevel(skill.level)}
                </span>
              </div>
            ))}
          </CardBody>
        </Card>

        <div className="space-y-4">
          {/* Soft skills */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-foreground">Soft Skills</h3>
            </CardHeader>
            <CardBody className="space-y-2.5">
              {softSkills.map((skill) => (
                <div key={skill.name} className="flex items-center gap-3">
                  <span className="text-xs text-foreground w-32 shrink-0">{skill.name}</span>
                  <div className="flex-1">
                    <ProgressBar value={skill.level} color="#8b5cf6" height="h-1.5" animated />
                  </div>
                  <span className="font-mono text-xs text-muted-foreground w-8 text-right shrink-0">{skill.level}%</span>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Skills by category */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-foreground">By Category</h3>
            </CardHeader>
            <CardBody className="space-y-3">
              {skillsByCategory
                .filter((c) => c.skills.length > 0)
                .map((cat) => (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-xs font-medium text-foreground">{cat.category}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{cat.skills.length} skills</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {cat.skills.map((s) => (
                        <span
                          key={s.name}
                          className="text-xs px-2 py-0.5 rounded font-mono border"
                          style={{
                            backgroundColor: `${cat.color}12`,
                            color: cat.color,
                            borderColor: `${cat.color}25`,
                          }}
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Missing skills */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-400" />
            <h3 className="text-sm font-semibold text-foreground">Skill Gaps</h3>
          </div>
          <p className="text-xs text-muted-foreground">Required by target role but not found in resume</p>
        </CardHeader>
        <CardBody>
          <div className="grid sm:grid-cols-3 gap-3">
            {missingSkills.map((skill) => (
              <div
                key={skill.name}
                className="rounded-lg border p-3.5 transition-colors hover:border-amber-500/30"
                style={{
                  backgroundColor: "var(--muted)",
                  borderColor:
                    skill.priority === "high"
                      ? "rgba(244,63,94,0.25)"
                      : skill.priority === "medium"
                      ? "rgba(245,158,11,0.25)"
                      : "var(--border)",
                }}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <span className="font-mono text-sm font-semibold text-foreground">{skill.name}</span>
                  <Badge
                    variant={
                      skill.priority === "high" ? "danger" : skill.priority === "medium" ? "warning" : "muted"
                    }
                  >
                    {skill.priority}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{skill.reason}</p>
              </div>
            ))}
          </div>

          {/* Priority legend */}
          <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-rose-400" />
              High priority — required by most target jobs
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              Medium priority — preferred or frequently mentioned
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-muted-foreground" />
              Low priority — nice to have
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Skill roadmap preview */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Learning Roadmap</h3>
          <Badge variant="info">4 months</Badge>
        </CardHeader>
        <CardBody>
          <div className="grid sm:grid-cols-4 gap-3">
            {[
              { month: "Month 1", focus: "Docker Mastery", color: "#6366f1", status: "current" },
              { month: "Month 2", focus: "AWS Foundations", color: "#10b981", status: "upcoming" },
              { month: "Month 3", focus: "Kubernetes", color: "#38bdf8", status: "upcoming" },
              { month: "Month 4", focus: "Terraform / IaC", color: "#8b5cf6", status: "upcoming" },
            ].map((step, i) => (
              <div
                key={i}
                className={`rounded-lg p-3 relative ${step.status === "current" ? "border" : "border border-border"}`}
                style={{
                  backgroundColor: step.status === "current" ? `${step.color}10` : "var(--muted)",
                  borderColor: step.status === "current" ? `${step.color}30` : "var(--border)",
                }}
              >
                {step.status === "current" && (
                  <span className="absolute -top-1.5 left-3 text-[10px] px-1.5 py-0.5 rounded font-mono font-medium" style={{ backgroundColor: step.color, color: "white" }}>
                    In Progress
                  </span>
                )}
                <p className="text-xs text-muted-foreground mb-1">{step.month}</p>
                <p className="text-sm font-medium" style={{ color: step.color }}>{step.focus}</p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
