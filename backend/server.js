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

/* ── 404 handler ── */
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

/* ── Global error handler ── */
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, error: "Internal server error" });
});

/* ── Start ── */
app.listen(PORT, () => {
  console.log(`\n🚀 Resume Analyser API running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🔑 Groq key: ${process.env.GROQ_API_KEY ? "✅ Loaded" : "❌ Missing — check .env"}\n`);
});
