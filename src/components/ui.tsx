import React, { useEffect, useState } from "react";

/**
 * AnimatedNumber smoothly interpolates a number from 0 to its target value.
 * Handles pure numbers or numbers with suffixes like "%" or "+".
 */
export function AnimatedNumber({
  value,
  duration = 750,
  prefix = "",
  suffix = "",
}: {
  value: number | string;
  duration?: number;
  prefix?: string;
  suffix?: string;
}) {
  // Parse numeric portion and any embedded suffix if passed as string (e.g. "84%")
  let targetNum = 0;
  let autoSuffix = suffix;

  if (typeof value === "number") {
    targetNum = value;
  } else if (typeof value === "string") {
    const match = value.match(/^([+-]?\d+(?:\.\d+)?)(.*)$/);
    if (match) {
      targetNum = parseFloat(match[1]);
      if (!suffix && match[2]) autoSuffix = match[2];
    }
  }

  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (isNaN(targetNum) || targetNum === 0) {
      setDisplay(targetNum || 0);
      return;
    }
    const startTime = performance.now();
    let animId: number;

    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Cubic ease-out curve
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(targetNum * ease));

      if (progress < 1) {
        animId = requestAnimationFrame(update);
      }
    };

    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [targetNum, duration]);

  if (typeof value === "string" && isNaN(targetNum)) {
    return <>{value}</>;
  }

  return (
    <>
      {prefix}
      {display}
      {autoSuffix}
    </>
  );
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  living?: boolean;
  stagger?: 1 | 2 | 3 | 4 | 5 | 6;
}

export function Card({
  children,
  className = "",
  onClick,
  hover = true,
  living = true,
  stagger,
}: CardProps) {
  const staggerClass = stagger ? `animate-fade-in-up stagger-${stagger}` : "";
  const hoverClass = hover && living ? "living-card cursor-pointer" : hover ? "hover:border-primary/40 transition-colors" : "";

  return (
    <div
      onClick={onClick}
      className={`bg-card border border-border rounded-lg ${hoverClass} ${staggerClass} ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`px-5 py-4 border-b border-border ${className}`}>{children}</div>;
}

export function CardBody({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "danger" | "info" | "muted";
  size?: "sm" | "md";
}

export function Badge({ children, variant = "default", size = "sm" }: BadgeProps) {
  const variantClasses: Record<string, string> = {
    default: "bg-primary/15 text-primary border border-primary/25 hover:border-primary/50",
    primary: "bg-primary/15 text-primary border border-primary/25 hover:border-primary/50",
    secondary: "bg-secondary text-secondary-foreground border border-border",
    success: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:border-emerald-500/50",
    warning: "bg-amber-500/15 text-amber-400 border border-amber-500/25 hover:border-amber-500/50",
    danger: "bg-rose-500/15 text-rose-400 border border-rose-500/25 hover:border-rose-500/50",
    info: "bg-sky-500/15 text-sky-400 border border-sky-500/25 hover:border-sky-500/50",
    muted: "bg-muted text-muted-foreground border border-border",
  };
  const sizeClasses = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded font-mono font-medium transition-all duration-200 ${variantClasses[variant]} ${sizeClasses}`}
    >
      {children}
    </span>
  );
}

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  variant?: "primary" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md" | "lg";
  className?: string;
  height?: string;
  animated?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  color,
  variant,
  size,
  className = "",
  height,
  animated = true,
}: ProgressBarProps) {
  const variantColors: Record<string, string> = {
    primary: "var(--primary)",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#f43f5e",
    info: "#38bdf8",
  };
  const sizeHeights: Record<string, string> = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  };
  const effectiveColor = color || (variant ? variantColors[variant] : "#3b82f6");
  const effectiveHeight = height || (size ? sizeHeights[size] : "h-1.5");
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const hasExplicitWidth = /\b(w-\S+|flex-\S+|max-w-\S+|min-w-\S+)/.test(className);
  const defaultWidth = hasExplicitWidth ? "" : "w-full";
  return (
    <div className={`${defaultWidth} bg-secondary rounded-full overflow-hidden relative ${effectiveHeight} ${className}`}>
      <div
        className={`h-full rounded-full relative overflow-hidden ${animated ? "transition-all duration-700 ease-out" : ""}`}
        style={{ width: `${pct}%`, backgroundColor: effectiveColor }}
      >
        {animated && (
          <div
            className="absolute inset-0 opacity-40 bg-gradient-to-r from-transparent via-white to-transparent"
            style={{
              animation: "sweepShine 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            }}
          />
        )}
      </div>
    </div>
  );
}

interface CircularScoreProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  sublabel?: string;
}

export function CircularScore({
  score,
  size = 120,
  strokeWidth = 8,
  color = "#3b82f6",
  label,
  sublabel,
}: CircularScoreProps) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    // Start empty, animate stroke to target on mount
    const timer = setTimeout(() => {
      setOffset(circumference - (score / 100) * circumference);
    }, 50);
    return () => clearTimeout(timer);
  }, [score, circumference]);

  return (
    <div
      className="relative inline-flex items-center justify-center animate-breathe"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="score-ring">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--secondary)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono font-semibold text-foreground tracking-tight" style={{ fontSize: size / 4.8 }}>
          <AnimatedNumber value={score} duration={900} />
        </span>
        {label && (
          <span className="text-muted-foreground mt-0.5 font-medium" style={{ fontSize: size / 10 }}>
            {label}
          </span>
        )}
        {sublabel && (
          <span className="text-muted-foreground font-mono" style={{ fontSize: size / 12 }}>
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  icon?: React.ReactNode;
  fullWidth?: boolean;
  title?: string;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  disabled,
  type = "button",
  icon,
  fullWidth,
  title,
}: ButtonProps) {
  const variantClasses: Record<string, string> = {
    primary: "bg-primary hover:bg-blue-600 text-white shadow-md shadow-primary/20 hover:shadow-primary/40",
    secondary: "bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border hover:border-primary/40",
    outline: "bg-transparent hover:bg-secondary text-foreground border border-border hover:border-primary/40",
    ghost: "hover:bg-secondary text-muted-foreground hover:text-foreground",
    danger: "bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/25 hover:border-rose-500/40",
    success: "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/25 hover:border-emerald-500/40",
  };
  const sizeClasses: Record<string, string> = {
    sm: "text-xs px-3 py-1.5 gap-1.5 rounded",
    md: "text-sm px-4 py-2 gap-2 rounded-md",
    lg: "text-base px-6 py-3 gap-2.5 rounded-lg",
  };
  return (
    <button
      type={type}
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`group inline-flex items-center justify-center font-medium transition-all duration-200 interactive-tap ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? "w-full" : ""} disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {icon && <span className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5">{icon}</span>}
      {children}
    </button>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  color?: string;
  icon?: React.ReactNode;
  trend?: { value: number; label: string };
  stagger?: 1 | 2 | 3 | 4 | 5 | 6;
}

export function StatCard({
  label,
  value,
  sublabel,
  color = "#3b82f6",
  icon,
  trend,
  stagger,
}: StatCardProps) {
  return (
    <Card stagger={stagger} hover living className="group relative overflow-hidden">
      <div
        className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none blur-2xl"
        style={{ backgroundColor: color }}
      />
      <CardBody className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1.5">{label}</p>
          <p className="font-mono text-2xl font-semibold tracking-tight" style={{ color }}>
            <AnimatedNumber value={value} />
          </p>
          {sublabel && <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>}
          {trend && (
            <p className={`text-xs mt-1.5 font-mono flex items-center gap-1 ${trend.value >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              <span>{trend.value >= 0 ? "↑" : "↓"}</span>
              <span>{Math.abs(trend.value)}</span>
              <span className="text-muted-foreground">{trend.label}</span>
            </p>
          )}
        </div>
        {icon && (
          <div
            className="p-2.5 rounded-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-inner"
            style={{ backgroundColor: `${color}18` }}
          >
            <span style={{ color }}>{icon}</span>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export function LiveStatusBadge({
  text = "System Operational",
  variant = "emerald",
}: {
  text?: string;
  variant?: "emerald" | "blue";
}) {
  const isEmerald = variant === "emerald";
  const bg = isEmerald ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/25" : "bg-primary/10 text-primary border-primary/25";
  const dotColor = isEmerald ? "bg-emerald-400" : "bg-primary";

  return (
    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-mono border backdrop-blur-md ${bg}`}>
      <span className="relative flex h-2 w-2">
        <span className={`animate-radar absolute inline-flex h-full w-full rounded-full ${dotColor} opacity-75`} />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`} />
      </span>
      <span>{text}</span>
    </div>
  );
}

export function Divider({ className = "" }: { className?: string }) {
  return <hr className={`border-border ${className}`} />;
}

export function Tag({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium font-mono transition-transform duration-150 hover:scale-105"
      style={{
        backgroundColor: color ? `${color}18` : "var(--secondary)",
        color: color || "var(--muted-foreground)",
        border: `1px solid ${color ? `${color}30` : "var(--border)"}`,
      }}
    >
      {children}
    </span>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`shimmer rounded ${className}`} />;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <div className="text-muted-foreground/40 mb-4 animate-breathe">{icon}</div>
      <h3 className="text-foreground font-medium mb-1">{title}</h3>
      {description && <p className="text-muted-foreground text-sm max-w-xs mb-4">{description}</p>}
      {action}
    </div>
  );
}
