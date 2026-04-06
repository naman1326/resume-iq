import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join }  from "path";
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, ".env") });
import express    from "express";
import cors       from "cors";
import analyzeRoute from "./routes/analyze.js";

const app  = express();
const PORT = process.env.PORT || 3001;

/* ── Middleware ── */
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
}));

app.use(express.json());

/* ── Routes ── */
app.use("/api", analyzeRoute);

/* ── Health check ── */
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Resume Analyser API is running" });
});

app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "Resume Analyser API",
    health: "/health",
    analyze: "POST /api/analyze",
  });
});

/* ── 404 handler ── */
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

/* ── Global error handler ── */
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: err?.message || "Internal server error",
  });
});

/* ── Start ── */
const server = app.listen(PORT, () => {
  const provider = (process.env.AI_PROVIDER || "groq").toLowerCase();
  console.log(`\n🚀 Resume Analyser API running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🤖 Active Provider: ${provider === "gemini" ? "💎 Gemini" : "🦁 Groq"}`);
  console.log(`🔑 Groq Key:   ${process.env.GROQ_API_KEY ? "✅ Loaded" : "❌ Missing"}`);
  console.log(`🔑 Gemini Key: ${process.env.GEMINI_API_KEY ? "✅ Loaded" : "❌ Missing"}\n`);
});

/* Vision + PDF conversion can take several minutes */
server.timeout = 300000;
server.keepAliveTimeout = 120000;
server.headersTimeout = 125000;
