import React, { useState } from "react";
import { Sparkles, Eye, EyeOff, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "../components/ui";
import { useApp } from "../context/AppContext";

interface AuthPageProps {
  mode: "login" | "register";
  onAuth: () => void;
  onBack: () => void;
  onSwitchMode: (mode: "login" | "register") => void;
}

export default function AuthPage({ mode, onAuth, onBack, onSwitchMode }: AuthPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const { login, register } = useApp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "register" && form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        await register(form.name, form.email, form.password);
      } else {
        await login(form.email, form.password);
      }
      onAuth();
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = (() => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 6) return { label: "Weak", color: "#f43f5e", width: "30%" };
    if (p.length < 10) return { label: "Fair", color: "#f59e0b", width: "60%" };
    return { label: "Strong", color: "#10b981", width: "100%" };
  })();

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: "var(--background)" }}
    >
      {/* Left panel */}
      <div
        className="hidden lg:flex flex-col w-[440px] shrink-0 p-10 border-r border-border"
        style={{ backgroundColor: "var(--card)" }}
      >
        <div className="flex items-center gap-2 mb-12">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
          <span className="font-semibold text-sm text-foreground">ResumeAI</span>
        </div>

        <div className="flex-1">
          <h2 className="font-serif text-3xl text-foreground mb-3">
            {mode === "login" ? "Welcome back." : "Start analyzing."}
          </h2>
          <p className="text-muted-foreground text-sm mb-10">
            {mode === "login"
              ? "Sign in to access your resume analyses, job matches, and AI recommendations."
              : "Create your account and upload your first resume in under 2 minutes."}
          </p>

          <div className="space-y-4">
            {[
              { icon: "✓", color: "#10b981", text: "ATS score with 6-category breakdown" },
              { icon: "✓", color: "#10b981", text: "Job match scoring with semantic analysis" },
              { icon: "✓", color: "#10b981", text: "Skill gap analysis with priority ranking" },
              { icon: "✓", color: "#10b981", text: "AI-powered bullet point improvements" },
              { icon: "✓", color: "#10b981", text: "Resume version history & comparison" },
            ].map((item) => (
              <div key={item.text} className="flex items-start gap-2.5">
                <CheckCircle2 size={15} style={{ color: item.color }} className="mt-0.5 shrink-0" />
                <span className="text-sm text-muted-foreground">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 rounded-lg border border-border p-4" style={{ backgroundColor: "var(--muted)" }}>
          <div className="flex gap-0.5 mb-2">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-amber-400 text-xs">★</span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground italic">
            "Went from 40+ applications with no responses to 3 interviews in one week after using ResumeAI."
          </p>
          <p className="text-xs text-foreground font-medium mt-2">— Sarah K., Frontend Developer</p>
        </div>
      </div>

      {/* Right panel – form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft size={13} />
            Back to home
          </button>

          <div className="mb-7">
            <h1 className="font-serif text-2xl text-foreground mb-1">
              {mode === "login" ? "Sign in" : "Create account"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {mode === "login" ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => onSwitchMode(mode === "login" ? "register" : "login")}
                className="text-primary hover:underline"
              >
                {mode === "login" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 rounded-md px-3 py-2.5 mb-4">
              <AlertCircle size={13} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Full name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Marcus Vance"
                  className="w-full px-3.5 py-2.5 rounded-md border border-border text-sm focus:outline-none focus:border-primary transition-colors"
                  style={{ backgroundColor: "var(--card)", color: "var(--foreground)" }}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="marcus@example.com"
                className="w-full px-3.5 py-2.5 rounded-md border border-border text-sm focus:outline-none focus:border-primary transition-colors"
                style={{ backgroundColor: "var(--card)", color: "var(--foreground)" }}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="At least 8 characters"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-md border border-border text-sm focus:outline-none focus:border-primary transition-colors"
                  style={{ backgroundColor: "var(--card)", color: "var(--foreground)" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {mode === "register" && passwordStrength && (
                <div className="mt-1.5">
                  <div className="h-1 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: passwordStrength.width, backgroundColor: passwordStrength.color }}
                    />
                  </div>
                  <p className="text-[11px] mt-0.5" style={{ color: passwordStrength.color }}>
                    {passwordStrength.label} password
                  </p>
                </div>
              )}
            </div>

            {mode === "register" && (
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Confirm password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  placeholder="Repeat password"
                  className="w-full px-3.5 py-2.5 rounded-md border border-border text-sm focus:outline-none focus:border-primary transition-colors"
                  style={{ backgroundColor: "var(--card)", color: "var(--foreground)" }}
                />
              </div>
            )}

            {mode === "login" && (
              <div className="flex justify-end">
                <button type="button" className="text-xs text-primary hover:underline">
                  Forgot password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                  </svg>
                  {mode === "login" ? "Signing in..." : "Creating account..."}
                </span>
              ) : (
                mode === "login" ? "Sign in" : "Create account"
              )}
            </Button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            onClick={onAuth}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-md border border-border text-sm text-muted-foreground hover:border-primary/30 hover:text-foreground transition-all"
            style={{ backgroundColor: "var(--card)" }}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {mode === "register" && (
            <p className="text-[11px] text-muted-foreground text-center mt-4 leading-relaxed">
              By creating an account, you agree to our{" "}
              <a href="#" className="text-primary hover:underline">Terms of Service</a>{" "}
              and{" "}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
