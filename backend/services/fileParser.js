import { createRequire } from "node:module";
import sharp from "sharp";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");
const { pdfToPng } = require("pdf-to-png-converter");

/** Groq: base64-encoded image must be ≤ 4MB per image (see console.groq.com/docs/vision). */
const GROQ_MAX_B64_CHARS = 4 * 1024 * 1024;

/**
 * Resize + JPEG so each page stays under Groq’s per-image base64 limit.
 * @param {Buffer} inputBuffer — raw image bytes (PNG/JPEG/etc.)
 */
async function encodeImageForGroq(inputBuffer) {
  let width = 1400;
  let quality = 82;
  for (let attempt = 0; attempt < 14; attempt++) {
    const out = await sharp(inputBuffer)
      .rotate()
      .resize(width, 2000, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();
    const b64 = out.toString("base64");
    if (b64.length <= GROQ_MAX_B64_CHARS) {
      return { base64: b64, mimeType: "image/jpeg" };
    }
    if (quality > 52) quality -= 6;
    else width = Math.round(width * 0.82);
  }
  throw new Error(
    "A resume page is still too large after compression (API limit 4MB per image). " +
      "Try a shorter resume, fewer pages, or upload a JPEG/PNG export instead."
  );
}

/**
 * Converts an uploaded resume to vision-ready images (base64 + MIME for Groq).
 * Supports PDF, DOC, DOCX, and raster images (PNG/JPEG/WebP) for scanned resumes.
 *
 * @param {Express.Multer.File} file
 * @returns {Promise<{ images: Array<{ base64: string, mimeType: string }>, format: string, pageCount: number }>}
 */
export const parseFile = async (file) => {
  const ext = file.originalname.split(".").pop().toLowerCase();

  if (ext === "pdf") {
    return await parsePDF(file.buffer);
  }

  if (ext === "docx" || ext === "doc") {
    return await parseDOCX(file.buffer);
  }

  if (["png", "jpg", "jpeg", "webp"].includes(ext)) {
    return await parseRasterImage(file.buffer, ext);
  }

  throw new Error(`Unsupported file extension: .${ext}`);
};

/* ── PDF (no GraphicsMagick — uses pdf.js via pdf-to-png-converter) ── */
const parsePDF = async (buffer) => {
  const safeMsg = (err) => (err && typeof err.message === "string" ? err.message : String(err));

  try {
    const pdfMeta = await pdfParse(buffer);
    const pageCount = pdfMeta.numpages || 0;

    if (pageCount === 0) {
      throw new Error("PDF appears to be empty or corrupted.");
    }

    if (pageCount > 5) {
      throw new Error("Resume is too long. Maximum 5 pages allowed.");
    }

    const pagesToProcess = Array.from({ length: pageCount }, (_, i) => i + 1);
    const pngPages = await pdfToPng(buffer, {
      returnPageContent: true,
      viewportScale: 1.6,
      pagesToProcess,
      verbosityLevel: 0,
    });

    const images = [];
    for (const page of pngPages) {
      if (!page.content?.length) {
        throw new Error(`Failed to render PDF page ${page.pageNumber}.`);
      }
      images.push(await encodeImageForGroq(page.content));
    }

    console.log(`  Rendered ${pageCount} PDF page(s) → JPEG for Groq`);
    return { images, format: "pdf", pageCount };
  } catch (err) {
    const msg = safeMsg(err);
    if (msg.includes("empty") || msg.includes("corrupted")) {
      throw err instanceof Error ? err : new Error(msg);
    }
    throw new Error(
      `Failed to parse PDF: ${msg}. If this keeps happening, export as PNG or JPEG and upload that instead.`
    );
  }
};

/* ── Scanned image (PNG / JPEG / WebP) ── */
const parseRasterImage = async (buffer, formatLabel) => {
  try {
    const encoded = await encodeImageForGroq(buffer);
    console.log(`  Raster (.${formatLabel}) → JPEG for Groq (${(encoded.base64.length / 1024).toFixed(1)} KB base64)`);
    return {
      images: [encoded],
      format: formatLabel,
      pageCount: 1,
    };
  } catch (err) {
    throw new Error(`Could not read image file: ${err.message}`);
  }
};

/* ── DOCX / DOC ── */
const parseDOCX = async (buffer) => {
  try {
    // For DOCX files, we'll use sharp to convert to PNG
    // Note: This requires the document to be renderable by sharp
    // For better DOCX support, consider using libreoffice in production

    // Attempt to convert using sharp (works for some formats)
    // For full DOCX support, you'd need to convert via LibreOffice first
    const image = await sharp(buffer)
      .resize(1200, 1600, { fit: "inside", withoutEnlargement: true })
      .png()
      .toBuffer();

    const encoded = await encodeImageForGroq(image);
    console.log(`  Converted DOCX to 1 image (Groq-sized JPEG)`);
    return { images: [encoded], format: "docx", pageCount: 1 };
  } catch (err) {
    // If sharp fails, DOCX files need LibreOffice conversion
    throw new Error(
      "DOCX conversion failed. For best results, please convert your DOCX to PDF first, " +
      "or ensure LibreOffice is installed for full DOCX support."
    );
  }
};
