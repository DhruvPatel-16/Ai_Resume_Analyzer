# AI Resume Analyzer & Matcher

Full-stack production application for ATS resume evaluation, semantic job description matching, and candidate recommendation engineering.

## Architecture

- **Frontend**: React 19, TypeScript 5.7, Vite 8, Tailwind CSS v4, Recharts, Lucide Icons.
- **Backend**: FastAPI, Python 3.14+, SQLAlchemy ORM, SQLite / PostgreSQL.
- **NLP / ML**: PyMuPDF (`fitz`), `python-docx`, `scikit-learn` (TF-IDF Cosine Similarity), regex entity extraction.
- **AI**: LLM API integration with robust deterministic rule-based fallback.

## Running the Application

### Backend Service
```bash
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation available at: `http://127.0.0.1:8000/docs`

### Frontend Client
```bash
npm run dev
```
Development preview running at: `http://localhost:8443` (or configured port)

### Running Automated Tests
```bash
python -m pytest backend/tests -v
```

## Project Directory Layout

- `src/` - React frontend application
  - `components/` - Atomic UI components, layout shell, cards, charts, and buttons
  - `context/` - Global application state and real backend API synchronization (`AppContext.tsx`)
  - `services/` - Strongly-typed Axios/Fetch HTTP client layer (`api.ts`)
  - `pages/` - Dashboard, Upload, Analysis, Job Match, Improvement, and Auth views
- `backend/` - FastAPI backend application
  - `app/api/` - RESTful route handlers (`resumes`, `jobs`, `improvements`, `dashboard`, `auth`)
  - `app/core/` - Application configuration and JWT security settings
  - `app/db/` - SQLAlchemy models and SQLite/PostgreSQL engine connection
  - `app/parsers/` - PyMuPDF and python-docx text & metadata extractors
  - `app/nlp/` - Text cleaning, section segmentation, entity extraction, and 500+ canonical skill dictionary
  - `app/scoring/` - 6-category weighted ATS scoring engine
  - `app/matching/` - TF-IDF semantic similarity and candidate gap matcher
  - `app/ai/` - Grounded recommendation generator and LLM client
  - `tests/` - Pytest test suite covering parsers, scoring, matching, and API endpoints
