# 🚀 Resume IQ: Vision-Powered AI Resume Analyser

Resume IQ is a high-fidelity resume analysis platform that goes beyond simple keyword matching. By using **Vision AI**, it "sees" your resume exactly how a recruiter does—analyzing layout, visual hierarchy, and formatting alongside technical content to provide a comprehensive "Resume IQ" score.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Node](https://img.shields.io/badge/Node-20+-339933?logo=node.js)
![AI](https://img.shields.io/badge/AI-Groq%20%7C%20Gemini-orange)

---

## ✨ Key Features

- **👁️ Vision-Based Analysis**: Uses Groq (Llama 3.2 90B Vision) or Google Gemini to analyze the actual visual layout of your resume.
- **📊 Detailed Scoring**: Provides an overall Resume IQ score based on five weighted dimensions: Experience, Skills, ATS Compatibility, Readability, and Impact.
- **🎯 JD Matcher**: Compare your resume against a specific job description for "surgical" alignment suggestions.
- **🔍 ATS Simulation**: Identifies formatting issues that might cause rejections in Automated Tracking Systems.
- **💡 Actionable Insights**: Categorized feedback (Errors, Warnings, Info) with exact quotes from your resume for easy fixing.
- **📈 Interactive Dashboard**: Visualizes your profile using Radar Charts (Recharts) and section-by-section breakdowns.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Vanilla CSS (Custom Variable-driven Design System)
- **Charts**: Recharts (Radar, Area, Bar)
- **Icons**: Lucide React
- **Animations**: Custom CSS Transitions & Keyframes

### Backend
- **Runtime**: Node.js & Express
- **AI Processing**: Groq SDK / Google Generative AI
- **Image Processing**: Sharp & pdf-to-png-converter (for document-to-vision conversion)
- **File Parsing**: pdf-parse (Text layer extraction) & Mammoth (DOCX)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v20 or higher)
- A Groq API Key or Google Gemini API Key

### 1. Clone & Install
```bash
# Clone the repository
git clone https://github.com/your-username/resume-iq.git
cd resume-iq

# Install Frontend dependencies
npm install

# Install Backend dependencies
cd backend
npm install
```

### 2. Environment Setup
Create a `.env` file in the `backend/` directory:
```env
PORT=3001
AI_PROVIDER=groq # or gemini
GROQ_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here
FRONTEND_URL=http://localhost:5173
```

### 3. Run the Application
You need to run both the frontend and backend simultaneously:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

---

## 📂 Architecture Overview

```text
├── src/                # React Frontend
│   ├── components/     # UI, Pages, and Dashboard Tabs
│   ├── context/        # Theme & Global State
│   └── hooks/          # Custom React Hooks
├── backend/            # Express.js Server
│   ├── routes/         # API Endpoints (/api/analyze, /api/match)
│   ├── services/       # AI & File Parsing Logic
│   └── middleware/     # Validation & Rate Limiting
└── memory/             # Technical Documentation & Design Specs
```

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is licensed under the MIT License.
