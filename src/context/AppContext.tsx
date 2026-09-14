import React, { createContext, useContext, useState, useEffect } from "react";
import { api, setToken } from "../services/api";
import * as sample from "../data/sampleData";

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  plan: string;
}

interface AppContextType {
  currentUser: UserProfile;
  resumeData: typeof sample.resumeData;
  technicalSkills: typeof sample.technicalSkills;
  softSkills: typeof sample.softSkills;
  missingSkills: typeof sample.missingSkills;
  atsBreakdown: typeof sample.atsBreakdown;
  qualityChecks?: any[];
  highReasons?: string[];
  improvementReasons?: string[];
  keywords: typeof sample.keywords;
  jobDescription: typeof sample.jobDescription;
  multiJobComparison: typeof sample.multiJobComparison;
  recommendations: typeof sample.recommendations;
  skillRoadmap: typeof sample.skillRoadmap;
  bulletImprovements: typeof sample.bulletImprovements;
  resumeHistory: typeof sample.resumeHistory;
  scoreHistory: typeof sample.scoreHistory;
  isAuthenticated: boolean;
  isRealData: boolean;
  loading: boolean;
  error: string | null;

  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
  uploadResume: (file: File) => Promise<void>;
  useSampleResume: () => Promise<void>;
  analyzeJobMatch: (title: string, description: string, company?: string) => Promise<void>;
  improveBullet: (bullet: string) => Promise<{ original: string; improved: string; explanation: string }>;
  deleteResume: (id: string) => Promise<void>;
  downloadResume: (id: string, filename?: string) => Promise<void>;
  previewResume: (id: string) => Promise<void>;
  refreshHistory: () => Promise<void>;
  selectedCompareIds: string[];
  setSelectedCompareIds: React.Dispatch<React.SetStateAction<string[]>>;
  compareResumes: (ids: string[]) => Promise<any>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(sample.currentUser);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isRealData, setIsRealData] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Resume State
  const [resumeData, setResumeData] = useState(sample.resumeData);
  const [technicalSkills, setTechnicalSkills] = useState(sample.technicalSkills);
  const [softSkills, setSoftSkills] = useState(sample.softSkills);
  const [missingSkills, setMissingSkills] = useState(sample.missingSkills);
  const [atsBreakdown, setAtsBreakdown] = useState(sample.atsBreakdown);
  const [qualityChecks, setQualityChecks] = useState<any[] | undefined>(undefined);
  const [highReasons, setHighReasons] = useState<string[] | undefined>(undefined);
  const [improvementReasons, setImprovementReasons] = useState<string[] | undefined>(undefined);
  const [keywords, setKeywords] = useState(sample.keywords);
  const [jobDescription, setJobDescription] = useState(sample.jobDescription);
  const [multiJobComparison, setMultiJobComparison] = useState(sample.multiJobComparison);
  const [recommendations, setRecommendations] = useState(sample.recommendations);
  const [skillRoadmap, setSkillRoadmap] = useState(sample.skillRoadmap);
  const [bulletImprovements, setBulletImprovements] = useState(sample.bulletImprovements);
  const [resumeHistory, setResumeHistory] = useState(sample.resumeHistory);
  const [scoreHistory, setScoreHistory] = useState(sample.scoreHistory);
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);

  // Check existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const user = await api.auth.me();
        if (user) {
          setCurrentUser({
            name: user.name,
            email: user.email,
            avatar: user.name.slice(0, 2).toUpperCase(),
            plan: "Pro",
          });
          setIsAuthenticated(true);
        }
      } catch {
        // Token invalid or backend offline, fall back to guest
      }

      // Check if backend has recent active resume & sync history
      try {
        const [dash, list] = await Promise.all([
          api.dashboard.get().catch(() => null),
          api.resumes.list().catch(() => []),
        ]);
        if (dash && dash.hasResume && dash.activeAnalysis) {
          applyAnalysisData(dash.activeAnalysis);
          if (dash.scoreHistory && dash.scoreHistory.length > 0) {
            setScoreHistory(dash.scoreHistory);
          }
        }
        if (list && list.length > 0) {
          setResumeHistory(list);
        }
      } catch {
        // Backend not ready yet or offline
      }
    };

    checkSession();
  }, []);

  const applyAnalysisData = (data: any) => {
    setIsRealData(true);
    if (data.personal) {
      setResumeData({
        filename: data.filename || "resume.pdf",
        uploadedAt: data.uploadedAt || "Today",
        atsScore: data.atsScore ?? 80,
        jobMatchScore: data.jobMatchScore ?? 75,
        sections: data.sections || sample.resumeData.sections,
        personal: {
          name: data.personal.name || "Candidate",
          email: data.personal.email || "",
          phone: data.personal.phone || "",
          location: data.personal.location || "",
          linkedin: data.personal.linkedin || "",
          github: data.personal.github || "",
        },
        education: data.education || sample.resumeData.education,
        experience: data.experience || sample.resumeData.experience,
        projects: data.projects || sample.resumeData.projects,
      });
    }

    if (data.technicalSkills) setTechnicalSkills(data.technicalSkills);
    if (data.softSkills) setSoftSkills(data.softSkills);
    if (data.missingSkills) setMissingSkills(data.missingSkills);
    if (data.atsBreakdown) setAtsBreakdown(data.atsBreakdown);
    if (data.qualityChecks) setQualityChecks(data.qualityChecks);
    if (data.highReasons) setHighReasons(data.highReasons);
    if (data.improvementReasons) setImprovementReasons(data.improvementReasons);
    if (data.recommendations) setRecommendations(data.recommendations);
    if (data.skillRoadmap) setSkillRoadmap(data.skillRoadmap);
    if (data.keywords && data.keywords.length > 0) setKeywords(data.keywords);

    // Refresh history list
    api.resumes.list().then((list) => {
      if (list && list.length > 0) {
        setResumeHistory(list);
      }
    }).catch(() => {});
  };

  const login = async (email: string, pass: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.auth.login({ email, password: pass });
      setToken(res.access_token);
      setCurrentUser({
        name: res.user.name,
        email: res.user.email,
        avatar: res.user.name.slice(0, 2).toUpperCase(),
        plan: "Pro",
      });
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message || "Failed to sign in.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, pass: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.auth.register({ name, email, password: pass });
      setToken(res.access_token);
      setCurrentUser({
        name: res.user.name,
        email: res.user.email,
        avatar: res.user.name.slice(0, 2).toUpperCase(),
        plan: "Pro",
      });
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message || "Failed to create account.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setIsAuthenticated(false);
    setCurrentUser(sample.currentUser);
  };

  const uploadResume = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const analysis = await api.resumes.upload(file);
      applyAnalysisData(analysis);
    } catch (err: any) {
      setError(err.message || "Failed to upload and analyze resume.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const useSampleResume = async () => {
    setLoading(true);
    setError(null);
    try {
      const analysis = await api.resumes.sample();
      applyAnalysisData(analysis);
    } catch (err: any) {
      setError(err.message || "Failed to load sample resume.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const analyzeJobMatch = async (title: string, description: string, company?: string) => {
    setLoading(true);
    setError(null);
    try {
      const match = await api.jobs.match({
        title,
        description,
        company,
      });

      setJobDescription({
        title: match.title,
        company: match.company,
        location: "Remote / Hybrid",
        type: "Full-time",
        posted: "Recent",
        description: match.description,
        matchedSkills: match.matchedSkills,
        partialSkills: match.partialSkills,
        missingSkills: match.missingSkills.map((m: any) => m.name || m),
        matchScore: match.matchScore,
        skillScore: match.skillScore,
        semanticScore: match.semanticScore,
        experienceScore: match.experienceScore,
        educationScore: match.educationScore,
        keywordScore: match.keywordScore,
      });

      if (match.multiJobComparison) setMultiJobComparison(match.multiJobComparison);
      if (match.recommendations) setRecommendations(match.recommendations);
      if (match.skillRoadmap) setSkillRoadmap(match.skillRoadmap);
      if (match.keywords && match.keywords.length > 0) setKeywords(match.keywords);
    } catch (err: any) {
      setError(err.message || "Failed to match resume with job description.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const improveBullet = async (bullet: string) => {
    return await api.improve.bullet(bullet);
  };

  const deleteResume = async (id: string) => {
    try {
      await api.resumes.delete(id);
      setResumeHistory((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      console.error("Failed to delete resume", err);
    }
  };

  const refreshHistory = async () => {
    try {
      const list = await api.resumes.list();
      if (list && list.length > 0) {
        setResumeHistory(list);
      }
    } catch (err: any) {
      console.error("Failed to refresh resume history", err);
    }
  };

  const downloadResume = async (id: string, filename?: string) => {
    await api.resumes.download(id, filename);
  };

  const previewResume = async (id: string) => {
    await api.resumes.preview(id);
  };

  const compareResumes = async (ids: string[]) => {
    return await api.resumes.compare(ids);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        resumeData,
        technicalSkills,
        softSkills,
        missingSkills,
        atsBreakdown,
        qualityChecks,
        highReasons,
        improvementReasons,
        keywords,
        jobDescription,
        multiJobComparison,
        recommendations,
        skillRoadmap,
        bulletImprovements,
        resumeHistory,
        scoreHistory,
        isAuthenticated,
        isRealData,
        loading,
        error,
        login,
        register,
        logout,
        uploadResume,
        useSampleResume,
        analyzeJobMatch,
        improveBullet,
        deleteResume,
        downloadResume,
        previewResume,
        refreshHistory,
        selectedCompareIds,
        setSelectedCompareIds,
        compareResumes,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
