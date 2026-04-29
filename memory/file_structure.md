---
name: File Structure & Architecture
description: Complete file structure and component organization for Resume Analyser
type: reference
---

## Root Level
- `package.json` - Frontend dependencies
- `vite.config.js` - Vite configuration
- `index.html` - Entry HTML
- `.env` - VITE_API_URL=http://localhost:3001

## Backend (`/backend`)
- `server.js` - Express app entry, CORS, routes, error handling
- `package.json` - Backend dependencies
- `.env` - PORT, FRONTEND_URL, GROQ_API_KEY
- `routes/analyze.js` - POST /api/analyze endpoint, multer upload, rate limiting
- `services/aiAnalyzer.js` - Groq AI integration, prompt engineering, JSON validation
- `services/fileParser.js` - PDF/DOCX text extraction
- `middleware/validate.js` - File validation, rate limiting (10 req/15min)

## Frontend (`/src`)
- `main.jsx` - React entry, ThemeProvider wrapper
- `App.jsx` - Router logic (landing → upload → dashboard)
- `index.css` - CSS variables, light/dark themes

### Pages (`/src/components/pages`)
- `LandingPage.jsx` - Marketing page with hero, features, testimonials, pricing
- `UploadPage.jsx` - File upload with drag-drop, loading progress, demo mode
- `Dashboard.jsx` - Main analysis results view with sidebar navigation

### Tabs (`/src/components/tabs`)
- `OverviewTab.jsx` - Hero card, 4 score cards, radar chart, bar chart
- `ATSTab.jsx` - ATS simulation results
- `SkillsTab.jsx` - Matched/missing/bonus skills
- `IssuesTab.jsx` - Error/warn/info list with counts
- `SuggestionsTab.jsx` - Prioritized suggestions (HIGH/MED/LOW)

### UI Components (`/src/components/ui`)
- `ScoreRing.jsx` - Circular progress indicator
- `AnimatedNumber.jsx` - Number counter animation
- `Badge.jsx`, `Pill.jsx` - Small UI elements
- `OnboardingTour.jsx` - First-time user guide
- `ScoreHistory.jsx` - History tracking (localStorage)
- `Confetti.jsx` - Celebration animation (score >= 85)
- `ResumePreview.jsx` - Resume text preview
- `JDMatcher.jsx` - Job description matching

### Layout (`/src/components/layout`)
- `Sidebar.jsx` - Navigation sidebar with navItems

### Context (`/src/context`)
- `ThemeContext.jsx` - Dark/light theme state

### Data (`/src/data`)
- `mockData.js` - Mock analysis data for demo mode

### Hooks (`/src/hooks`)
- `useMediaQuery.js` - Responsive breakpoint hook

**Why:** Understanding the file organization is essential for navigation and making targeted changes.

**How to apply:** Use this map to quickly locate files when implementing features or fixing bugs.
