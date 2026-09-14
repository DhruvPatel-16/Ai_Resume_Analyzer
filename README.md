# AI Resume Analyzer & Job Matcher

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.0+-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB.svg?logo=python&logoColor=white)](https://www.python.org)
[![Tests](https://img.shields.io/badge/pytest-19%20passed-brightgreen.svg?logo=pytest&logoColor=white)](https://docs.pytest.org)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

An end-to-end, production-grade intelligence platform that evaluates candidate resumes against applicant tracking system (ATS) criteria, performs deep semantic job description matching, conducts multi-resume candidate comparisons, and generates actionable, grounded engineering recommendations.

---

## 🌟 Key Features

- **Multi-Format Ingestion**: Robust parsing for `.pdf` (via PyMuPDF / `pypdfium2` fallback) and `.docx` (via `python-docx`) extracting raw text, structured section layout blocks, tables, and page metadata.
- **Explainable 6-Category ATS Scoring Engine**:
  - **Skills Match (30%)**: Extraction and categorization against canonical industry skill maps.
  - **Keyword Density & Action Verbs (20%)**: Measurement of high-impact action verbs and role-specific terminology.
  - **Experience Relevance & Depth (20%)**: Chronology verification and seniority weighting.
  - **Education Credentials (10%)**: Degree, institution, and major detection.
  - **Document Structure & Formatting (10%)**: Standard ATS section headings, contact validation, and layout hygiene.
  - **Measurable Impact & Metrics (10%)**: Detection of quantified achievements, percentages, latencies, and KPIs.
- **500+ Skill Ontology**: Canonical skill normalization across Programming, Frontend, Backend, Databases, Cloud & DevOps, AI/ML, and Core Soft Skills (e.g. `k8s` &rarr; `Kubernetes`, `postgres` &rarr; `PostgreSQL`, `react.js` &rarr; `React`).
- **Semantic Job Matching**: TF-IDF vectorization and cosine similarity combined with weighted skill intersection to evaluate candidate fit against targeted job descriptions.
- **Multi-Candidate Comparison Hub**:
  - Compare multiple resumes side-by-side with comparative metric cards, interactive multi-radar charts, and skill gap matrices.
  - Paginated candidate selector (10 per page) with folding toggles, multi-select checkboxes, and quick preset filters ("Select All", "Top 3").
- **Full Document Lifecycle (Preview, Download & Management)**:
  - **Inline Document Preview**: Stream and review uploaded PDF/DOCX resumes directly within an interactive modal viewer.
  - **Direct Download**: Export original candidate resume files instantly.
  - **Resume History & Pagination**: Strict 10-resumes-per-page pagination with numeric page jumps and dynamic counters.
  - **Single & Bulk Deletion**: Individual delete actions plus a bulk "Delete Selected" control placed conveniently beside Clear All.
  - **Translucent Glassmorphic Confirmation Modal**: Frosted glass dialog with ambient danger glow, candidate preview chips, and safe confirmation handling.
- **Grounded Resume Optimization**: Action-verb bullet rewrite engine that refactors weak bullet points without hallucinating unverified numbers or false credentials.
- **Executive UI/UX & Design System**:
  - **Theme Toggle**: One-click switch between sleek Dark Mode and refined Light Mode docked prominently in the top navigation bar.
  - **Minimalist Sidebar Navigation**: Fixed 100vh height with independent content scrolling, centered account avatar, and borderless arrow toggle button with dynamic 180° animated direction flip.
  - **Living Ambient Aesthetics**: Subtle animated background orbs, high-contrast palette (amber gold `#f59e0b`, emerald `#10b981`, electric blue `#3b82f6`), and translucent chart tooltips (`chart-tooltip-glass`).

---

## 🏗️ System Architecture

```
                       +-------------------------------+
                       |      React 19 Frontend        |
                       | (TypeScript, Vite, Tailwind)  |
                       +---------------+---------------+
                                       |
                                HTTP / JSON (Proxy)
                                       |
                                       v
                       +-------------------------------+
                       |       FastAPI Backend         |
                       |    (REST Endpoints, CORS)     |
                       +---------------+---------------+
                                       |
       +-------------------------------+-------------------------------+
       |                               |                               |
       v                               v                               v
+--------------+               +---------------+               +---------------+
| Doc Parsers  |               |  NLP Pipeline |               | Match & Score |
| (PDF / DOCX) |               | (Cleaner, NER,|               | (ATS Engine,  |
|              |               |  Skill Maps)  |               |  TF-IDF Sim)  |
+--------------+               +---------------+               +---------------+
                                       |
                                       v
                       +-------------------------------+
                       |      SQLite / PostgreSQL      |
                       |   (Resumes, Users, History)   |
                       +-------------------------------+
```

---

## 📁 Project Directory Layout

```
Ai_Resume_Analyzer/
├── backend/                        # FastAPI Python Backend
│   ├── app/
│   │   ├── api/                    # REST API route handlers
│   │   │   └── routes/             # Feature routers (resumes, jobs, improvements, dashboard, auth)
│   │   ├── core/                   # Security, configuration, JWT auth settings
│   │   ├── db/                     # SQLAlchemy models and SQLite/PostgreSQL connection
│   │   ├── parsers/                # PyMuPDF and python-docx text extractors
│   │   ├── nlp/                    # Section segmentation, entity extraction, 500+ skill ontology
│   │   ├── scoring/                # 6-category weighted ATS scoring engine
│   │   ├── matching/               # TF-IDF semantic similarity & job gap matcher
│   │   └── ai/                     # Grounded recommendation generator & bullet improver
│   ├── tests/                      # Pytest automated test suite (19 passing tests)
│   └── requirements.txt            # Python dependencies
├── src/                            # React 19 Frontend
│   ├── components/                 # Atomic UI components
│   │   ├── Layout.tsx              # Application shell with topbar, fixed sidebar, theme toggle
│   │   ├── DeleteResumeModal.tsx   # Translucent frosted glass delete confirmation modal
│   │   └── ui.tsx                  # Buttons, cards, badges, circular score rings, progress bars
│   ├── context/                    # React Context state synchronization
│   │   └── AppContext.tsx          # Central application state, cache, and API synchronization
│   ├── pages/                      # Application views (13 distinct modules)
│   │   ├── DashboardPage.tsx       # Primary analytics overview and candidate health metrics
│   │   ├── UploadPage.tsx          # Drag-and-drop resume ingestion with scan beam animation
│   │   ├── AnalysisPage.tsx        # 6-pillar ATS evaluation and keyword frequency breakdown
│   │   ├── ATSPage.tsx             # Deep ATS category breakdown and scoring formulas
│   │   ├── SkillsPage.tsx          # Categorized skill taxonomy and candidate skill coverage
│   │   ├── KeywordsPage.tsx        # Keyword density, action verbs, and terminology analysis
│   │   ├── JobMatcherPage.tsx      # Semantic JD fit, match score, and missing skill roadmap
│   │   ├── RecommendationsPage.tsx # Grounded optimization tips for score elevation
│   │   ├── ImprovementPage.tsx     # Action-verb bullet point rewriter
│   │   ├── HistoryPage.tsx         # Resume version history (10/page), single & bulk delete
│   │   ├── ComparePage.tsx         # Multi-candidate comparison with charts and 10/page selector
│   │   ├── LandingPage.tsx         # Product landing page with feature showcase
│   │   └── AuthPage.tsx            # User sign-in, registration, and session security
│   ├── services/                   # Typed API service client layer
│   │   └── api.ts                  # Axios / Fetch client for FastAPI REST endpoints
│   ├── index.css                   # Tailwind CSS v4 design system, glassmorphism, animations
│   ├── App.tsx                     # Route management and theme initialization
│   └── main.tsx                    # Application entrypoint
├── Resume/                         # Standalone ATS resume generation script
│   └── generate_resume.py          # Script generating sample 1-page ATS-optimized PDF resume
├── package.json                    # Frontend package dependencies & scripts
├── vite.config.ts                  # Vite configuration with API reverse proxy
└── README.md                       # Comprehensive documentation
```

---

## 🚀 How to Run This Project

### Prerequisites

| Tool | Minimum Version | Check Command |
| :--- | :--- | :--- |
| **Node.js** | `v20.0.0+` | `node -v` |
| **npm** | `v10.0.0+` | `npm -v` |
| **Python** | `v3.11+` | `python --version` |
| **Git** | `v2.40+` | `git --version` |

---

### Method 1: Local Development (Recommended)

#### Step 1: Clone the Repository
```bash
git clone https://github.com/Sigmaboy69/Ai_Resume_Analyzer.git
cd Ai_Resume_Analyzer
```

#### Step 2: Configure Environment Variables
Copy the example environment file to `.env`:
```bash
# On Linux / macOS:
cp .env.example .env

# On Windows (PowerShell):
Copy-Item .env.example .env

# On Windows (Command Prompt):
copy .env.example .env
```

#### Step 3: Start the Backend Service
In your first terminal window:

```bash
# 1. (Optional but recommended) Create and activate a virtual environment
python -m venv .venv

# Activate on Windows (PowerShell):
.venv\Scripts\Activate.ps1
# Or on Linux / macOS:
source .venv/bin/activate

# 2. Install backend dependencies
pip install -r backend/requirements.txt

# 3. Start the FastAPI backend server
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

> **Backend is running!**
> - API Base URL: `http://127.0.0.1:8000`
> - Interactive Swagger Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
> - Health Check: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

#### Step 4: Start the Frontend Client
In a **second terminal window**, navigate to the project root:

```bash
# 1. Install frontend packages
npm install

# 2. Start the Vite development server
npm run dev
```

> **Frontend is running!**
> - Web Application: [http://localhost:8443](http://localhost:8443) (or the port shown in your terminal)
> - The frontend automatically proxies `/api/*` requests directly to the FastAPI server at `http://127.0.0.1:8000`.

---

### Method 2: Running with Docker (One-Command)

If you have Docker and Docker Compose installed:

```bash
# Build and start both backend and frontend containers
docker compose up --build
```

- **Frontend Web UI**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000`
- **API Documentation**: `http://localhost:8000/docs`

To shut down:
```bash
docker compose down
```

---

### Method 3: Generating a Sample ATS Resume

You can compile and customize the included 1-page ATS-optimized resume:

```bash
python Resume/generate_resume.py
```
This generates `Dhruv_Resume.pdf` and a high-resolution preview image directly in the `Resume/` folder.

---

## 🧪 Automated Test Suite

The backend includes comprehensive test coverage across parsers, tokenizers, skill normalizers, scoring heuristics, and API routes.

```bash
python -m pytest backend/tests -v
```

```
collected 19 items

backend/tests/test_api.py::test_health_endpoint PASSED                   [  5%]
backend/tests/test_api.py::test_auth_registration_and_login PASSED       [ 10%]
backend/tests/test_api.py::test_seed_sample_resume PASSED                [ 15%]
backend/tests/test_api.py::test_job_match_endpoint PASSED                [ 21%]
backend/tests/test_api.py::test_bullet_improver_endpoint PASSED          [ 26%]
backend/tests/test_api.py::test_resume_download_and_preview PASSED       [ 31%]
backend/tests/test_api.py::test_compare_multiple_resumes PASSED          [ 36%]
backend/tests/test_ats_scorer.py::test_ats_scoring_formula_and_weights PASSED [ 42%]
backend/tests/test_matcher.py::test_analyze_job_description PASSED       [ 47%]
backend/tests/test_matcher.py::test_match_resume_with_job PASSED         [ 52%]
backend/tests/test_matcher.py::test_semantic_similarity PASSED           [ 57%]
backend/tests/test_parsers.py::test_pdf_extraction_success PASSED        [ 63%]
backend/tests/test_parsers.py::test_pdf_extraction_invalid_signature PASSED [ 68%]
backend/tests/test_parsers.py::test_pdf_extraction_empty PASSED          [ 73%]
backend/tests/test_parsers.py::test_docx_extraction_success PASSED       [ 78%]
backend/tests/test_parsers.py::test_docx_extraction_invalid_signature PASSED [ 84%]
backend/tests/test_skills.py::test_normalize_skill_name PASSED           [ 89%]
backend/tests/test_skills.py::test_extract_skills_canonical_and_categorized PASSED [ 94%]
backend/tests/test_skills.py::test_extract_skills_proficiency_weighting PASSED [100%]

======================== 19 passed in 1.89s ========================
```

To verify production frontend build compilation:

```bash
npm run build
```

---

## 📡 API Reference Summary

| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Healthcheck and service availability status |
| `POST` | `/api/auth/register` | Register a new user account with hashed credentials |
| `POST` | `/api/auth/login` | Authenticate user and issue JWT bearer token |
| `GET` | `/api/auth/me` | Retrieve authenticated user profile information |
| `POST` | `/api/resumes/upload` | Upload `.pdf` or `.docx` for end-to-end extraction and scoring |
| `POST` | `/api/resumes/sample` | Instant benchmark run using a pre-configured sample resume |
| `GET` | `/api/resumes` | Retrieve candidate upload history and score progression |
| `POST` | `/api/resumes/compare` | Multi-resume comparison and gap matrix evaluation |
| `GET` | `/api/resumes/{id}/analysis` | Detailed ATS scoring breakdown for a specific resume |
| `GET` | `/api/resumes/{id}/preview` | Stream resume PDF inline preview directly to the browser |
| `GET` | `/api/resumes/{id}/download` | Download original uploaded resume document |
| `DELETE` | `/api/resumes/{id}` | Permanently delete a resume from evaluation history |
| `POST` | `/api/jobs/analyze` | Parse job description text and extract target skill ontology |
| `POST` | `/api/matches` | Compare resume against specific job requirements via TF-IDF |
| `POST` | `/api/improve/bullet` | Rewrite and elevate individual resume bullet points |
| `GET` | `/api/dashboard` | Aggregated candidate metrics, charts, and activity data |

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
