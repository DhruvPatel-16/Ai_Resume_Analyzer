# AI Resume Analyzer & Job Matcher

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.0+-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB.svg?logo=python&logoColor=white)](https://www.python.org)
[![Tests](https://img.shields.io/badge/pytest-17%20passed-brightgreen.svg?logo=pytest&logoColor=white)](https://docs.pytest.org)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

An end-to-end, production-grade intelligence platform that evaluates candidate resumes against applicant tracking system (ATS) criteria, performs deep semantic job description matching, and generates actionable, grounded engineering recommendations.

---

## Key Features

- **Multi-Format Ingestion**: Robust parsing for `.pdf` (via PyMuPDF / `pypdfium2` fallback) and `.docx` (via `python-docx`) extracting raw text, layout blocks, tables, and page metadata.
- **Explainable ATS Scoring**: Transparent scoring across 6 weighted categories:
  - Skills Match (30%)
  - Keyword Density & Action Verbs (20%)
  - Experience Relevance & Depth (20%)
  - Education Credentials (10%)
  - Document Structure & Sectioning (10%)
  - Measurable Impact & Quantified Achievements (10%)
- **500+ Skill Ontology**: Categorized into Programming, Frontend, Backend, Database, Cloud & DevOps, AI/ML, and Core Soft Skills with canonical name normalization (e.g. `k8s` &rarr; `Kubernetes`, `postgres` &rarr; `PostgreSQL`).
- **Semantic Job Matching**: TF-IDF vectorization and cosine similarity combined with weighted skill intersection to evaluate fit against targeted job descriptions.
- **Grounded Resume Optimization**: Action-verb rewrite engine that refactors weak bullet points without hallucinating unverified numbers or false credentials.
- **Live Interactive Dashboard**: Responsive React 19 UI with radar analysis, keyword frequency tags, skill gap roadmaps, and multi-job comparison charts.

---

## System Architecture

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
In a **new / second terminal window**, navigate to the project directory:

```bash
# 1. Install frontend packages
npm install

# 2. Start the Vite development preview server
npm run dev
```

> **Frontend is running!**
> - Web Application: [http://localhost:8443](http://localhost:8443) (or the port displayed in your terminal)
> - The frontend automatically proxies `/api/*` calls directly to the FastAPI server at `http://127.0.0.1:8000`.

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

### Method 3: Generating Your Own ATS Resume

You can compile and customize the included 1-page ATS-optimized resume:

```bash
python Resume/generate_resume.py
```
This generates `Dhruv_Resume.pdf` and a high-resolution preview image directly in the `Resume/` folder.

---

## Automated Test Suite

The backend includes comprehensive test coverage across parsers, tokenizers, skill normalizers, scoring heuristics, and API routes.

```bash
python -m pytest backend/tests -v
```

```
collected 17 items

backend/tests/test_api.py::test_health_endpoint PASSED                   [  5%]
backend/tests/test_api.py::test_auth_registration_and_login PASSED       [ 11%]
backend/tests/test_api.py::test_seed_sample_resume PASSED                [ 17%]
backend/tests/test_api.py::test_job_match_endpoint PASSED                [ 23%]
backend/tests/test_api.py::test_bullet_improver_endpoint PASSED          [ 29%]
backend/tests/test_ats_scorer.py::test_ats_scoring_formula_and_weights PASSED [ 35%]
backend/tests/test_matcher.py::test_analyze_job_description PASSED       [ 41%]
backend/tests/test_matcher.py::test_match_resume_with_job PASSED         [ 47%]
backend/tests/test_matcher.py::test_semantic_similarity PASSED           [ 52%]
backend/tests/test_parsers.py::test_pdf_extraction_success PASSED        [ 58%]
backend/tests/test_parsers.py::test_pdf_extraction_invalid_signature PASSED [ 64%]
backend/tests/test_parsers.py::test_pdf_extraction_empty PASSED          [ 70%]
backend/tests/test_parsers.py::test_docx_extraction_success PASSED       [ 76%]
backend/tests/test_parsers.py::test_docx_extraction_invalid_signature PASSED [ 82%]
backend/tests/test_skills.py::test_normalize_skill_name PASSED           [ 88%]
backend/tests/test_skills.py::test_extract_skills_canonical_and_categorized PASSED [ 94%]
backend/tests/test_skills.py::test_extract_skills_proficiency_weighting PASSED [100%]

======================== 17 passed in 1.78s ========================
```

To verify production frontend compilation:

```bash
npm run build
```

---

## API Reference Summary

| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Healthcheck and service availability status |
| `POST` | `/api/auth/register` | Register a new user account with hashed credentials |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT bearer token |
| `POST` | `/api/resumes/upload` | Upload `.pdf` or `.docx` for end-to-end extraction and scoring |
| `POST` | `/api/resumes/sample` | Instant benchmark run using a pre-configured sample resume |
| `GET` | `/api/resumes` | Retrieve candidate upload history and score progression |
| `POST` | `/api/matches` | Compare resume against specific job requirements |
| `POST` | `/api/improve/bullet` | Rewrite and elevate individual resume bullet points |
| `GET` | `/api/dashboard` | Aggregated candidate metrics, charts, and activity data |

---

## License

Distributed under the MIT License. See `LICENSE` for more information.
