const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx"];
const MAX_SIZE_MB = 5;

/**
 * Validates uploaded file — type, extension, and size.
 * Attaches error to req.fileError if invalid.
 */
export const validateFile = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: "No file uploaded. Please attach a PDF or Word document.",
    });
  }

  const ext = req.file.originalname.split(".").pop().toLowerCase();
  const sizeInMB = req.file.size / (1024 * 1024);

  // Check extension
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return res.status(400).json({
      success: false,
      error: `Unsupported file type ".${ext}". Please upload a PDF, DOC, or DOCX file.`,
    });
  }

  // Check size
  if (sizeInMB > MAX_SIZE_MB) {
    return res.status(400).json({
      success: false,
      error: `File too large (${sizeInMB.toFixed(1)} MB). Maximum allowed size is ${MAX_SIZE_MB} MB.`,
    });
  }

  // Check buffer exists
  if (!req.file.buffer || req.file.buffer.length === 0) {
    return res.status(400).json({
      success: false,
      error: "File appears to be empty. Please upload a valid resume.",
    });
  }

  next();
};

/**
 * Rate limiting — simple in-memory store.
 * Max 10 requests per IP per 15 minutes.
 */
const requestLog = new Map();
const WINDOW_MS  = 15 * 60 * 1000; // 15 min
const MAX_REQS   = 10;

export const rateLimit = (req, res, next) => {
  const ip  = req.ip || req.connection.remoteAddress;
  const now = Date.now();

  if (!requestLog.has(ip)) {
    requestLog.set(ip, []);
  }

  // Remove old entries outside the window
  const timestamps = requestLog.get(ip).filter((t) => now - t < WINDOW_MS);
  timestamps.push(now);
  requestLog.set(ip, timestamps);

  if (timestamps.length > MAX_REQS) {
    const resetIn = Math.ceil((timestamps[0] + WINDOW_MS - now) / 1000 / 60);
    return res.status(429).json({
      success: false,
      error: `Too many requests. Please wait ${resetIn} minute(s) before trying again.`,
    });
  }

  next();
};
