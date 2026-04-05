---
name: Resume Analyser - Project Overview
description: AI-powered resume analysis web app with React frontend and Node.js backend using Groq/Gemini AI
type: project
---

**Resume Analyser** is an AI-powered resume analysis web application that provides ATS scoring, skills gap analysis, and actionable feedback.

**Architecture:**
- **Frontend**: React 19 + Vite, deployed on localhost:5173
- **Backend**: Express.js API on localhost:3001 (configurable via PORT)
- **AI Provider**: Groq API (Llama 3.2 90B Vision) for resume analysis via images
- **File processing**: pdf2pic + sharp for PDF/DOCX to PNG conversion, then vision analysis

**Key Features:**
- Drag-and-drop resume upload (PDF/DOC/DOCX, max 5MB)
- **Vision-based AI analysis** - Converts resumes to images for layout-aware scoring
- AI-powered analysis returning JSON with scores, issues, suggestions
- Dashboard with Overview, ATS, Skills, Issues, and Suggestions tabs
- Dark/Light theme toggle
- Score history tracking (localStorage)
- JD Matcher for job description comparison
- Demo mode with mock data for testing

**Scoring System:**
- Overall Score (weighted: experience 35%, skills 15%, ATS 20%, readability 15%, impact 15%)
- ATS Score, Readability Score, Impact Score (0-100 scale)
- Section scores: Contact, Summary, Experience, Skills, Education, Achievements
- Radar data: ATS Match, Keywords, Formatting, Impact, Clarity, Length

**Why:** This context helps understand the full stack structure and AI integration for future development work.

**How to apply:** When working on features, remember the frontend expects analysis data in the mockAnalysis schema format. Backend routes are under /api/*
