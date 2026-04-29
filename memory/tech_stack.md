---
name: Technology Stack & Dependencies
description: Complete tech stack details for Resume Analyser project
type: reference
---

## Frontend (React + Vite)
- **react**: ^19.2.0
- **react-dom**: ^19.2.0
- **vite**: ^7.3.1
- **@vitejs/plugin-react**: ^5.1.1
- **lucide-react**: ^0.577.0 (icons)
- **recharts**: ^3.7.0 (charts: Radar, Bar)
- **eslint**: ^9.39.1

## Backend (Express.js)
- **express**: ^4.19.2
- **cors**: ^2.8.5
- **dotenv**: ^16.4.5
- **multer**: ^1.4.5-lts.1 (file uploads)
- **pdf2pic**: latest (PDF to PNG conversion)
- **sharp**: latest (image processing)
- **groq-sdk**: ^0.37.0 (AI API - Vision)
- **@google/generative-ai**: ^0.21.0 (available but not currently used)
- **nodemon**: ^3.1.4 (dev)

## AI/LLM
- **Provider**: Groq API
- **Model**: llama-3.3-70b-versatile
- **Response format**: JSON object with strict schema
- **Temperature**: 0.2 (low temperature for consistent scoring)

## Environment Variables
- **PORT**: Backend port (default: 3001)
- **FRONTEND_URL**: CORS origin (default: http://localhost:5173)
- **GROQ_API_KEY**: Required for AI analysis
- **VITE_API_URL**: Frontend API endpoint

**Why:** Knowing the exact stack helps with dependency management and troubleshooting.

**How to apply:** Reference these versions when debugging compatibility issues or adding new packages.
