// API Client for AI Resume Analyzer & Job Matcher

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

function getToken(): string | null {
  try {
    return localStorage.getItem("resume_ai_token");
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem("resume_ai_token", token);
    } else {
      localStorage.removeItem("resume_ai_token");
    }
  } catch (e) {
    console.error("Failed to write token to localStorage", e);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  const headers = new Headers(options.headers || {});
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Only set Content-Type to application/json if body is not FormData
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `Request failed with status ${response.status}`;
    let errorCode = `HTTP_${response.status}`;
    try {
      const errorJson = await response.json();
      if (errorJson.error && errorJson.error.message) {
        errorMsg = errorJson.error.message;
        errorCode = errorJson.error.code || errorCode;
      } else if (errorJson.detail) {
        errorMsg = typeof errorJson.detail === "string" ? errorJson.detail : JSON.stringify(errorJson.detail);
      }
    } catch {
      // response wasn't JSON
    }
    throw new ApiError(errorMsg, response.status, errorCode);
  }

  return response.json();
}

export const api = {
  auth: {
    register: (data: { name: string; email: string; password: string }) =>
      request<{ access_token: string; token_type: string; user: { id: string; name: string; email: string } }>(
        "/auth/register",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      ),
    login: (data: { email: string; password: string }) =>
      request<{ access_token: string; token_type: string; user: { id: string; name: string; email: string } }>(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      ),
    me: () => request<{ id: string; name: string; email: string }>("/auth/me"),
  },

  resumes: {
    upload: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return request<any>("/resumes/upload", {
        method: "POST",
        body: formData,
      });
    },
    uploadBatch: (files: File[]) => {
      const formData = new FormData();
      files.forEach((f) => {
        formData.append("files", f);
      });
      return request<{
        total: number;
        successful: number;
        failed: number;
        resumes: Array<{
          id: string;
          filename: string;
          atsScore: number;
          jobMatchScore: number;
          skillsCount: number;
          name: string;
          downloadUrl: string;
          previewUrl: string;
        }>;
        errors: Array<{ filename: string; error: string }>;
        activeAnalysis: any;
      }>("/resumes/batch-upload", {
        method: "POST",
        body: formData,
      });
    },
    sample: () =>
      request<any>("/resumes/sample", {
        method: "POST",
      }),
    list: () => request<any[]>("/resumes"),
    getAnalysis: (id: string) => request<any>(`/resumes/${id}/analysis`),
    delete: (id: string) =>
      request<{ status: string; id: string }>(`/resumes/${id}`, {
        method: "DELETE",
      }),
    getDownloadUrl: (id: string) => `${API_BASE_URL}/resumes/${id}/download`,
    getPreviewUrl: (id: string) => `${API_BASE_URL}/resumes/${id}/preview`,
    download: async (id: string, fallbackFilename: string = "resume.pdf") => {
      const url = `${API_BASE_URL}/resumes/${id}/download`;
      const token = getToken();
      const headers = new Headers();
      if (token) headers.set("Authorization", `Bearer ${token}`);
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error("Failed to download resume");
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fallbackFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
    },
    preview: async (id: string) => {
      const url = `${API_BASE_URL}/resumes/${id}/preview`;
      const token = getToken();
      const headers = new Headers();
      if (token) headers.set("Authorization", `Bearer ${token}`);
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error("Failed to preview resume");
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60000);
    },
    compare: (resumeIds: string[]) =>
      request<{
        resumes: any[];
        sharedSkills: string[];
        bestAtsId: string;
        bestMatchId: string;
        mostSkillsId: string;
        totalCompared: number;
      }>("/resumes/compare", {
        method: "POST",
        body: JSON.stringify({ resume_ids: resumeIds }),
      }),
  },

  jobs: {
    analyze: (data: { title: string; description: string; company?: string }) =>
      request<any>("/jobs/analyze", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    match: (data: { description: string; title?: string; company?: string; resume_id?: string }) =>
      request<any>("/matches", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  improve: {
    bullet: (bullet: string) =>
      request<{ original: string; improved: string; explanation: string }>("/improve/bullet", {
        method: "POST",
        body: JSON.stringify({ bullet }),
      }),
  },

  dashboard: {
    get: () => request<any>("/dashboard"),
  },
};
