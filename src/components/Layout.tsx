import React, { useState } from "react";
import {
  LayoutDashboard,
  Upload,
  Zap,
  Target,
  Cpu,
  Lightbulb,
  FileEdit,
  History,
  Search,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Bell,
  LogOut,
  User,
  Settings,
  Sparkles,
  KeyRound,
  GitCompare,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { LiveStatusBadge } from "./ui";

export type Page =
  | "dashboard"
  | "upload"
  | "analysis"
  | "ats"
  | "skills"
  | "keywords"
  | "job-matcher"
  | "recommendations"
  | "improvement"
  | "history"
  | "compare";

interface LayoutProps {
  children: React.ReactNode;
  activePage: Page;
  onNavigate: (page: Page) => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  onLogout: () => void;
}

const navItems: { id: Page; label: string; icon: React.ReactNode; badge?: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
  { id: "upload", label: "Upload Resume", icon: <Upload size={16} /> },
  { id: "analysis", label: "Analysis Results", icon: <Zap size={16} /> },
  { id: "ats", label: "ATS Analysis", icon: <Target size={16} /> },
  { id: "skills", label: "Skills", icon: <Cpu size={16} /> },
  { id: "keywords", label: "Keywords", icon: <KeyRound size={16} /> },
  { id: "job-matcher", label: "Job Matcher", icon: <Search size={16} /> },
  { id: "recommendations", label: "AI Recommendations", icon: <Lightbulb size={16} />, badge: "5" },
  { id: "improvement", label: "Resume Improvement", icon: <FileEdit size={16} /> },
  { id: "history", label: "History", icon: <History size={16} /> },
  { id: "compare", label: "Compare", icon: <GitCompare size={16} /> },
];

export default function Layout({ children, activePage, onNavigate, theme, onToggleTheme, onLogout }: LayoutProps) {
  const { currentUser, resumeData } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <div className={`min-h-screen flex relative overflow-hidden ${theme}`} style={{ backgroundColor: "var(--background)" }}>
      {/* Ambient living background motion orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/10 blur-[110px] animate-ambient-1" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full bg-emerald-500/8 blur-[120px] animate-ambient-2" />
        <div className="absolute -bottom-32 left-1/3 w-80 h-80 rounded-full bg-sky-500/8 blur-[100px] animate-ambient-1" />
      </div>

      {/* Sidebar */}
      <aside
        className="shrink-0 flex flex-col border-r border-border transition-all duration-300 relative z-10"
        style={{
          width: collapsed ? 56 : 220,
          backgroundColor: "var(--card)",
        }}
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-3.5 border-b border-border gap-2.5 shrink-0 group cursor-pointer" onClick={() => onNavigate("dashboard")}>
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0 shadow-md shadow-primary/20 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-6">
            <Sparkles size={14} className="text-white" />
          </div>
          {!collapsed && (
            <span className="font-semibold text-sm text-foreground whitespace-nowrap tracking-tight">ResumeAI</span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-left text-sm transition-all relative interactive-tap ${
                activePage === item.id ? "sidebar-item-active" : "sidebar-item"
              }`}
            >
              <span className="shrink-0 transition-transform duration-200">{item.icon}</span>
              {!collapsed && (
                <>
                  <span className="flex-1 truncate text-xs">{item.label}</span>
                  {item.badge && (
                    <span className="bg-primary/20 text-indigo-300 text-xs rounded-full w-4 h-4 flex items-center justify-center font-mono text-[10px]">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              {collapsed && item.badge && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              )}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-t border-border p-2 space-y-1 shrink-0">
          <button
            onClick={onToggleTheme}
            title="Toggle theme"
            className="sidebar-item w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm interactive-tap"
          >
            <span className="shrink-0 transition-transform duration-300 hover:rotate-45">
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </span>
            {!collapsed && <span className="text-xs">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
          </button>

          {/* User */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="sidebar-item w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md interactive-tap"
            >
              <div className="w-6 h-6 rounded-full bg-primary/30 flex items-center justify-center shrink-0 ring-1 ring-primary/40">
                <span className="text-[10px] font-semibold text-indigo-300">{currentUser.avatar}</span>
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs text-foreground font-medium truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{currentUser.plan} plan</p>
                </div>
              )}
            </button>
            {showUserMenu && !collapsed && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-card border border-border rounded-lg shadow-xl overflow-hidden z-50 animate-fade-in-up">
                <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                  <User size={13} /> Profile
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                  <Settings size={13} /> Settings
                </button>
                <div className="border-t border-border" />
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut size={13} /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute bottom-20 -right-3 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110 z-10 shadow-md"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* Topbar */}
        <header
          className="h-14 shrink-0 flex items-center justify-between px-5 border-b border-border backdrop-blur-md"
          style={{ backgroundColor: "rgba(var(--card), 0.9)" }}
        >
          <div>
            <h1 className="text-sm font-semibold text-foreground">
              {navItems.find((n) => n.id === activePage)?.label ?? "Dashboard"}
            </h1>
            <p className="text-xs text-muted-foreground">{resumeData.filename} · ATS Score {resumeData.atsScore}</p>
          </div>
          <div className="flex items-center gap-3">
            <LiveStatusBadge text="Engine Active" variant="emerald" />
            <button className="relative p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-all duration-150 interactive-tap">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
            </button>
          </div>
        </header>

        {/* Page content with smooth animated entrance */}
        <main className="flex-1 overflow-y-auto" style={{ backgroundColor: "var(--background)" }}>
          <div key={activePage} className="animate-fade-in-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
