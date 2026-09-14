# Resume Generation & Assets

This folder contains the complete toolchain and source files used to generate Dhruv's ATS-optimized 1-page resume.

---

## 📁 Folder Contents

- **`Dhruv_Resume.pdf`**: The production-ready, ATS-compliant 1-page PDF resume.
- **`generate_resume.py`**: Automated Python generation script built with `reportlab` (vector layout, strict line leading, ATS heading hierarchy).
- **`dhruv_resume_preview.png`**: High-resolution rendered preview of the resume.

---

## 🚀 How to Customize & Regenerate

If you ever want to update your phone number, email, links, or add new projects:

1. Open `generate_resume.py`.
2. Edit the contact strings, skills, or bullet points.
3. Run the generator script in your terminal:
   ```bash
   python Resume/generate_resume.py
   ```
   This will automatically recompile `Dhruv_Resume.pdf` and update `dhruv_resume_preview.png`.

---

## 📊 ATS Performance Benchmark

Evaluated using the local **AI Resume Analyzer** engine:

- **ATS Score**: `85 / 100`
- **Technical Skills Recognized**: `33`
- **Page Count**: Exactly `1 page` (standard industry length)
- **Section Detection**: `100%` (Contact Info, Professional Summary, Technical Skills, Work Experience, Technical Projects, Education)
