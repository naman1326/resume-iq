import express from "express";
import multer  from "multer";
import { parseFile }     from "../services/fileParser.js";
import { analyzeResume } from "../services/aiAnalyzer.js";
import { validateFile, rateLimit } from "../middleware/validate.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});

router.post(
  "/analyze",
  rateLimit,
  upload.single("resume"),
  validateFile,
  async (req, res) => {
    const startTime = Date.now();

    try {
      console.log(`\n📄 Received: ${req.file.originalname} (${(req.file.size / 1024).toFixed(1)} KB)`);

      console.log("⚙️  Parsing file...");
      const resumeText = await parseFile(req.file);
      console.log(`✅ Parsed ${resumeText.length} characters`);

      console.log("🤖 Sending to Groq (Llama 3.3)...");
      const analysis = await analyzeResume(resumeText);
      console.log(`✅ Analysis complete — Overall score: ${analysis.overallScore}`);

      const processingTimeMs = Date.now() - startTime;
      console.log(`⏱️  Total time: ${processingTimeMs}ms\n`);

      res.json({
        success: true,
        data: {
          ...analysis,
          resumeText, // send raw text so frontend can render preview
        },
        meta: {
          filename:        req.file.originalname,
          fileSizeKB:      Math.round(req.file.size / 1024),
          parsedChars:     resumeText.length,
          processingTimeMs,
        },
      });

    } catch (err) {
      console.error("❌ Analysis failed:", err.message);
      const status =
        err.message.includes("API key")     ? 401 :
        err.message.includes("too large")   ? 413 :
        err.message.includes("Unsupported") ? 400 : 500;
      res.status(status).json({ success: false, error: err.message });
    }
  }
);

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Resume Analyser API is working",
    groqKey: process.env.GROQ_API_KEY ? "✅ Set" : "❌ Missing",
  });
});

export default router;
