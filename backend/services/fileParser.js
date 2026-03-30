import pdfParse from "pdf-parse";
import mammoth  from "mammoth";

/**
 * Extracts plain text from an uploaded resume file.
 * Supports PDF, DOC, DOCX.
 *
 * @param {Express.Multer.File} file - The multer file object (buffer in memory)
 * @returns {Promise<string>} - Raw extracted text
 */
export const parseFile = async (file) => {
  const ext = file.originalname.split(".").pop().toLowerCase();

  if (ext === "pdf") {
    return await parsePDF(file.buffer);
  }

  if (ext === "docx" || ext === "doc") {
    return await parseDOCX(file.buffer);
  }

  throw new Error(`Unsupported file extension: .${ext}`);
};

/* ── PDF ── */
const parsePDF = async (buffer) => {
  try {
    const data = await pdfParse(buffer);
    const text = data.text?.trim();

    if (!text || text.length < 50) {
      throw new Error(
        "Could not extract enough text from the PDF. " +
        "Make sure it's a text-based PDF and not a scanned image."
      );
    }

    return cleanText(text);
  } catch (err) {
    if (err.message.includes("Could not extract")) throw err;
    throw new Error("Failed to parse PDF. The file may be corrupted or password-protected.");
  }
};

/* ── DOCX / DOC ── */
const parseDOCX = async (buffer) => {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const text   = result.value?.trim();

    if (!text || text.length < 50) {
      throw new Error(
        "Could not extract enough text from the Word document. " +
        "Please ensure the document contains readable text."
      );
    }

    return cleanText(text);
  } catch (err) {
    if (err.message.includes("Could not extract")) throw err;
    throw new Error("Failed to parse Word document. The file may be corrupted.");
  }
};

/* ── Clean up extracted text ── */
const cleanText = (text) => {
  return text
    .replace(/\r\n/g, "\n")           // normalize line endings
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")       // collapse excessive blank lines
    .replace(/[ \t]{2,}/g, " ")       // collapse multiple spaces/tabs
    .replace(/[^\x20-\x7E\n]/g, " ")  // remove non-printable characters
    .trim();
};
