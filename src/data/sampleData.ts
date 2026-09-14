export const currentUser = {
  name: "Marcus Vance",
  email: "marcus.vance@email.com",
  avatar: "MV",
  plan: "Pro",
};

export const resumeData = {
  filename: "Marcus_Vance_Resume.pdf",
  uploadedAt: "Sep 12, 2026",
  atsScore: 84,
  jobMatchScore: 81,
  sections: {
    contact: true,
    summary: true,
    education: true,
    experience: true,
    projects: true,
    skills: true,
    certifications: false,
  },
  personal: {
    name: "Marcus Vance",
    email: "marcus.vance@email.com",
    phone: "+1 (415) 555-0192",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/marcusvance",
    github: "github.com/marcusvance",
  },
  education: [
    {
      degree: "B.S. Computer Science",
      institution: "University of Washington",
      year: "2024",
      gpa: "3.82",
    },
  ],
  experience: [
    {
      company: "Stripe",
      role: "Software Engineer Intern",
      duration: "Jun 2025 – Aug 2025",
      technologies: ["Python", "Go", "PostgreSQL", "Redis"],
      bullets: [
        "Engineered internal deployment orchestration tooling that cut pipeline turnaround from 40m to 28m across 3 core squads",
        "Implemented high-performance Redis caching layer for merchant balance queries, reducing p95 latency by 32%",
        "Contributed to payment reconciliation batch ledger processing over 10K+ daily settlement events with PostgreSQL",
      ],
    },
    {
      company: "Figma",
      role: "Frontend Engineer Intern",
      duration: "Jan 2025 – May 2025",
      technologies: ["React", "TypeScript", "WebSockets"],
      bullets: [
        "Built collaborative multiplayer canvas sync components utilizing WebSockets and optimistic UI state reconciliation",
        "Profiled WebGL viewport rendering pipeline, reducing frame drops by 45% during intense multi-cursor editing",
        "Built modular component library tokens and UI primitives adopted across 3 engineering teams",
      ],
    },
  ],
  projects: [
    {
      name: "CloudPulse",
      description: "High-throughput telemetry ingestion engine and real-time observability pipeline for distributed services",
      technologies: ["React", "FastAPI", "PostgreSQL", "Docker"],
      outcome: "800+ active instances, featured on Hacker News Show HN",
    },
    {
      name: "PR-Sentinel",
      description: "Automated code review bot and AST security linter for GitHub pull request inspection",
      technologies: ["Python", "OpenAI API", "GitHub Actions", "Node.js"],
      outcome: "1.2K GitHub stars, 45+ contributors",
    },
    {
      name: "DataViz Dashboard",
      description: "Interactive business analytics dashboard with drag-and-drop dynamic query visualizer",
      technologies: ["React", "D3.js", "TypeScript", "Recharts"],
      outcome: "Deployed internally across 2 partner organizations",
    },
  ],
};

export const technicalSkills = [
  { name: "Python", level: 95, category: "Programming" },
  { name: "React", level: 92, category: "Frontend" },
  { name: "TypeScript", level: 88, category: "Programming" },
  { name: "PostgreSQL", level: 85, category: "Database" },
  { name: "Node.js", level: 82, category: "Backend" },
  { name: "FastAPI", level: 80, category: "Backend" },
  { name: "SQL", level: 87, category: "Database" },
  { name: "Git", level: 93, category: "DevOps" },
  { name: "Docker", level: 55, category: "DevOps" },
  { name: "Java", level: 72, category: "Programming" },
  { name: "Go", level: 68, category: "Programming" },
  { name: "Redis", level: 65, category: "Database" },
];

export const softSkills = [
  { name: "Communication", level: 88 },
  { name: "Problem Solving", level: 94 },
  { name: "Team Collaboration", level: 90 },
  { name: "Adaptability", level: 85 },
  { name: "Leadership", level: 78 },
];

export const missingSkills = [
  { name: "AWS", priority: "high", reason: "Required in 87% of target job descriptions" },
  { name: "Kubernetes", priority: "high", reason: "Mentioned 3× in target job description" },
  { name: "Terraform", priority: "medium", reason: "Increasingly common in infrastructure automation roles" },
  { name: "GraphQL", priority: "medium", reason: "Listed as preferred in target JD" },
  { name: "Jenkins", priority: "low", reason: "Legacy CI/CD tool, GitHub Actions is widely accepted" },
  { name: "Kafka", priority: "low", reason: "Beneficial for event-driven distributed architectures" },
];

export const atsBreakdown = [
  { category: "Skills Match", score: 85, weight: 30, color: "#3b82f6" },
  { category: "Keywords", score: 78, weight: 20, color: "#10b981" },
  { category: "Experience Relevance", score: 88, weight: 20, color: "#38bdf8" },
  { category: "Education", score: 95, weight: 10, color: "#0ea5e9" },
  { category: "Resume Structure", score: 92, weight: 10, color: "#f59e0b" },
  { category: "Achievements", score: 72, weight: 10, color: "#f43f5e" },
];

export const keywords = [
  { word: "Python", frequency: 8, inJD: true, category: "skill" },
  { word: "React", frequency: 6, inJD: true, category: "skill" },
  { word: "API", frequency: 5, inJD: true, category: "technical" },
  { word: "PostgreSQL", frequency: 4, inJD: true, category: "skill" },
  { word: "TypeScript", frequency: 4, inJD: false, category: "skill" },
  { word: "Docker", frequency: 2, inJD: true, category: "skill" },
  { word: "AWS", frequency: 0, inJD: true, category: "skill" },
  { word: "Kubernetes", frequency: 0, inJD: true, category: "skill" },
  { word: "performance", frequency: 3, inJD: true, category: "action" },
  { word: "deployed", frequency: 2, inJD: false, category: "action" },
  { word: "developed", frequency: 5, inJD: false, category: "action" },
  { word: "optimized", frequency: 3, inJD: true, category: "action" },
  { word: "implemented", frequency: 4, inJD: false, category: "action" },
  { word: "scalable", frequency: 1, inJD: true, category: "descriptor" },
  { word: "microservices", frequency: 0, inJD: true, category: "technical" },
  { word: "CI/CD", frequency: 1, inJD: true, category: "technical" },
];

export const jobDescription = {
  title: "Senior Backend Engineer",
  company: "Stripe",
  location: "San Francisco, CA (Hybrid)",
  type: "Full-time",
  posted: "Sep 10, 2026",
  description: `We are looking for a Senior Backend Engineer to join our infrastructure team. You will design and build highly scalable backend systems that power payments for millions of businesses globally.

Requirements:
- 3+ years Python or Go backend development
- Strong SQL and PostgreSQL experience
- Docker and Kubernetes for containerization
- AWS cloud infrastructure
- REST API design and development
- CI/CD pipelines
- Strong computer science fundamentals

Nice to have:
- Kafka or message queue experience
- GraphQL
- Terraform / Infrastructure as Code`,
  matchedSkills: ["Python", "PostgreSQL", "SQL", "REST API", "Git", "Go"],
  partialSkills: ["Docker"],
  missingSkills: ["AWS", "Kubernetes", "Terraform", "Kafka"],
  matchScore: 81,
  skillScore: 85,
  semanticScore: 83,
  experienceScore: 88,
  educationScore: 95,
  keywordScore: 78,
};

export const recommendations = [
  {
    id: 1,
    type: "skill-gap",
    priority: "high",
    title: "Add AWS cloud infrastructure experience",
    description: "AWS appears as a required skill in the target job description but is not demonstrated in your resume. Consider highlighting cloud deployment projects using EC2, S3, or ECS.",
    reason: "AWS is required in 87% of senior backend engineering roles across target platforms.",
    effort: "2–4 weeks",
    impact: "+8 match score points",
    resources: ["AWS Cloud Practitioner learning path", "AWS Free Tier project architecture", "Deploy CloudPulse on AWS ECS / Fargate"],
  },
  {
    id: 2,
    type: "skill-gap",
    priority: "high",
    title: "Demonstrate Kubernetes orchestration proficiency",
    description: "Kubernetes is mentioned 3× in the job description. Your Docker foundation provides a clean ramp — expand it to include K8s pod configurations and deployment manifests.",
    reason: "Kubernetes is listed as a primary operational requirement for backend microservices at scale.",
    effort: "3–5 weeks",
    impact: "+6 match score points",
    resources: ["Kubernetes interactive tutorials", "Containerize and deploy CloudPulse manifests", "Local k8s testing with Minikube / Kind"],
  },
  {
    id: 3,
    type: "content",
    priority: "medium",
    title: "Quantify CloudPulse project throughput metrics",
    description: 'Your CloudPulse project states "800+ active instances" which demonstrates traction. Add explicit throughput metrics: ingestion events/sec, p99 API response times, or cluster uptime percentages.',
    reason: "Verifiable engineering metrics reinforce ATS scoring and give technical hiring managers hard evaluation criteria.",
    effort: "30 minutes",
    impact: "+4 ATS score points",
    resources: [],
  },
  {
    id: 4,
    type: "structure",
    priority: "medium",
    title: "Include a focused professional summary section",
    description: "A 2–3 sentence executive summary immediately after contact info establishes domain depth and helps ATS parsers quickly catalog your core competencies.",
    reason: "Professional summaries improve role classification accuracy in recruitment filtering software.",
    effort: "20 minutes",
    impact: "+3 ATS score points",
    resources: [],
  },
  {
    id: 5,
    type: "skill-gap",
    priority: "low",
    title: "Elevate CI/CD pipeline automation details",
    description: "You have GitHub Actions listed under your PR-Sentinel project. Highlight this prominently in your skills summary and outline the exact automated testing stages implemented.",
    reason: "CI/CD pipeline governance is specified in the job posting and your practical exposure is currently understated.",
    effort: "15 minutes",
    impact: "+2 match score points",
    resources: [],
  },
];

export const bulletImprovements = [
  {
    section: "Stripe Internship",
    original: "Built internal developer tools reducing deployment time by 30%",
    improved: "Engineered internal deployment orchestration tooling that cut pipeline turnaround from 40 minutes to 28 minutes, adopted by 3 core engineering squads.",
    explanation: "Provides concrete before/after operational figures, clarifies squad adoption, and establishes architectural impact.",
  },
  {
    section: "Figma Internship",
    original: "Optimized canvas rendering pipeline reducing frame drops by 45%",
    improved: "Profiled WebGL viewport rendering pipeline, reducing frame drops by 45% during intense multi-cursor collaborative editing sessions.",
    explanation: "Connects technical rendering optimization directly to user-facing collaborative workflow stability.",
  },
  {
    section: "CloudPulse Project",
    original: "800+ active instances, featured in Hacker News Show HN",
    improved: "Architected CloudPulse, an asynchronous telemetry ingestion engine processing 800+ active agent streams with under 15ms ingestion latency, featured on Hacker News.",
    explanation: "Embeds clear throughput and latency characteristics into a cohesive technical summary.",
  },
  {
    section: "PR-Sentinel Bot",
    original: "Automated code review tool using GPT-4 for PR analysis",
    improved: "Developed PR-Sentinel, an open-source static analysis and code review bot integrating AST heuristics and LLM evaluations, garnering 1.2K GitHub stars and 45 contributors.",
    explanation: "Distinguishes between raw AST rule execution and LLM triage, highlighting open-source community adoption.",
  },
];

export const resumeHistory = [
  {
    id: "sample-v1",
    filename: "Marcus_Vance_Resume_v1.pdf",
    uploadedAt: "Sep 08, 2026",
    atsScore: 68,
    jobMatch: 62,
    skills: 14,
  },
  {
    id: "sample-v2",
    filename: "Marcus_Vance_Resume_v2.pdf",
    uploadedAt: "Sep 10, 2026",
    atsScore: 76,
    jobMatch: 73,
    skills: 16,
  },
  {
    id: "sample-v3",
    filename: "Marcus_Vance_Resume_v3.pdf",
    uploadedAt: "Sep 11, 2026",
    atsScore: 80,
    jobMatch: 77,
    skills: 18,
  },
  {
    id: "sample-v4",
    filename: "Marcus_Vance_Resume.pdf",
    uploadedAt: "Sep 12, 2026",
    atsScore: 84,
    jobMatch: 81,
    skills: 20,
    active: true,
  },
];

export const multiJobComparison = [
  { role: "Senior Backend Engineer", company: "Stripe", match: 81, color: "#3b82f6" },
  { role: "Python Developer", company: "Anthropic", match: 88, color: "#10b981" },
  { role: "Full Stack Engineer", company: "Notion", match: 79, color: "#38bdf8" },
  { role: "Software Engineer II", company: "Airbnb", match: 85, color: "#0ea5e9" },
  { role: "Data Engineer", company: "Databricks", match: 64, color: "#f59e0b" },
  { role: "DevOps Engineer", company: "HashiCorp", match: 52, color: "#f43f5e" },
];

export const scoreHistory = [
  { version: "v1", ats: 68, match: 62 },
  { version: "v2", ats: 76, match: 73 },
  { version: "v3", ats: 80, match: 77 },
  { version: "v4", ats: 84, match: 81 },
];

export const skillRoadmap = [
  {
    month: "Month 1",
    focus: "Docker Orchestration",
    skills: ["Docker Compose", "Multi-stage builds", "Container networking"],
    status: "in-progress",
  },
  {
    month: "Month 2",
    focus: "AWS Cloud Infrastructure",
    skills: ["EC2 & S3", "IAM Policies & RBAC", "ECS Fargate"],
    status: "upcoming",
  },
  {
    month: "Month 3",
    focus: "Kubernetes Systems",
    skills: ["Pods & Deployments", "Services & Ingress", "Helm Packaging"],
    status: "upcoming",
  },
  {
    month: "Month 4",
    focus: "Infrastructure as Code",
    skills: ["Terraform State & Modules", "CloudWatch / Grafana", "CI/CD Automation"],
    status: "upcoming",
  },
];
