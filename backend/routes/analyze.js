import express from "express";
import multer  from "multer";
import { parseFile }     from "../services/fileParser.js";
import { analyzeResume, matchJobDescription } from "../services/aiAnalyzer.js";
import { validateFile, rateLimit } from "../middleware/validate.js";

const router = express.Router();

const MAX_BYTES = 15 * 1024 * 1024;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: 1 },
});

const uploadResume = (req, res, next) => {
  upload.single("resume")(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
          success: false,
          error: `File too large. Maximum size is ${Math.round(MAX_BYTES / (1024 * 1024))} MB.`,
        });
      }
      return res.status(400).json({ success: false, error: err.message || "Upload failed." });
    }
    next();
  });
};

router.post(
  "/match",
  rateLimit,
  uploadResume, // Reuse same upload logic for resume context
  async (req, res) => {
    try {
      const { jdText } = req.body;
      if (!jdText) return res.status(400).json({ success: false, error: "JD text is required." });

      const resumeData = await parseFile(req.file);
      const match = await matchJobDescription(resumeData, jdText);

      res.json({ success: true, data: match });
    } catch (err) {
      console.error("❌ JD Match failed:", err.message);
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

router.post(
  "/analyze",
  rateLimit,
  uploadResume,
  validateFile,
  async (req, res) => {
    const startTime = Date.now();

    try {
      console.log(`\n📄 Received: ${req.file.originalname} (${(req.file.size / 1024).toFixed(1)} KB)`);

      console.log("⚙️  Converting to images...");
      const resumeData = await parseFile(req.file);
      console.log(`✅ Converted ${resumeData.pageCount} page(s) to ${resumeData.format} images`);

      console.log("🤖 Sending to Groq Vision...");
      const analysis = await analyzeResume(resumeData);
      console.log(`✅ Analysis complete — Overall score: ${analysis.overallScore}`);

      const processingTimeMs = Date.now() - startTime;
      console.log(`⏱️  Total time: ${processingTimeMs}ms\n`);

      res.json({
        success: true,
        data: {
          ...analysis,
          resumeText: `[Vision analysis - ${resumeData.pageCount} page(s) analyzed]`,
          /* Same JPEGs sent to Groq (after resize/compression) — for UI preview */
          previewImages: resumeData.images.map((img) => ({
            mimeType: img.mimeType || "image/jpeg",
            base64: img.base64,
          })),
        },
        meta: {
          filename:        req.file.originalname,
          fileSizeKB:      Math.round(req.file.size / 1024),
          pageCount:       resumeData.pageCount,
          format:          resumeData.format,
          processingTimeMs,
        },
      });

    } catch (err) {
      console.error("❌ Analysis failed:", err.message);
      const status =
        err.message.includes("API key")     ? 401 :
        err.message.includes("too large")   ? 413 :
        err.message.includes("Unsupported") ? 400 : 500;
      res.status(status).json({
        success: false,
        error: err.message || "An unexpected error occurred during analysis.",
      });
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
