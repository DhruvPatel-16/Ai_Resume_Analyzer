import React, { useState } from "react";
import Layout, { type Page } from "./components/Layout";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import UploadPage from "./pages/UploadPage";
import AnalysisPage from "./pages/AnalysisPage";
import ATSPage from "./pages/ATSPage";
import SkillsPage from "./pages/SkillsPage";
import KeywordsPage from "./pages/KeywordsPage";
import JobMatcherPage from "./pages/JobMatcherPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import ImprovementPage from "./pages/ImprovementPage";
import HistoryPage from "./pages/HistoryPage";
import ComparePage from "./pages/ComparePage";

import { AppProvider, useApp } from "./context/AppContext";

type AppRoute = "landing" | "login" | "register" | "app";

function MainApp() {
  const [route, setRoute] = useState<AppRoute>("landing");
  const [activePage, setActivePage] = useState<Page>("dashboard");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const { logout, isAuthenticated } = useApp();

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const handleAuth = () => {
    setRoute("app");
    setActivePage("dashboard");
  };

  const handleLogout = () => {
    logout();
    setRoute("landing");
  };

  const navigate = (page: string) => {
    setActivePage(page as Page);
  };

  if (route === "landing") {
    return (
      <LandingPage
        onGetStarted={() => setRoute(isAuthenticated ? "app" : "register")}
        onLogin={() => setRoute("login")}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  if (route === "login") {
    return (
      <AuthPage
        mode="login"
        onAuth={handleAuth}
        onBack={() => setRoute("landing")}
        onSwitchMode={(m) => setRoute(m)}
      />
    );
  }

  if (route === "register") {
    return (
      <AuthPage
        mode="register"
        onAuth={handleAuth}
        onBack={() => setRoute("landing")}
        onSwitchMode={(m) => setRoute(m)}
      />
    );
  }

  const pageContent: Record<Page, React.ReactNode> = {
    dashboard: <DashboardPage onNavigate={navigate} />,
    upload: <UploadPage onNavigate={navigate} />,
    analysis: <AnalysisPage />,
    ats: <ATSPage />,
    skills: <SkillsPage />,
    keywords: <KeywordsPage />,
    "job-matcher": <JobMatcherPage />,
    recommendations: <RecommendationsPage />,
    improvement: <ImprovementPage />,
    history: <HistoryPage onNavigate={navigate} />,
    compare: <ComparePage onNavigate={navigate} />,
  };

  return (
    <Layout
      activePage={activePage}
      onNavigate={(page) => setActivePage(page)}
      theme={theme}
      onToggleTheme={toggleTheme}
      onLogout={handleLogout}
    >
      {pageContent[activePage]}
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
