import { createRequire } from "node:module";
import sharp from "sharp";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const { pdfToPng } = require("pdf-to-png-converter");

/** 
 * Max size for base64 encoded images.
 * Gemini handles up to 20MB, but we'll cap at 15MB for stability.
 */
const MAX_B64_SIZE = 15 * 1024 * 1024;

/**
 * Resize + JPEG optimization for high clarity.
 */
async function encodeImage(inputBuffer) {
  let width = 2400; 
  let quality = 90;
  
  for (let attempt = 0; attempt < 10; attempt++) {
    const out = await sharp(inputBuffer)
      .rotate()
      .resize(width, 3200, { fit: "inside", withoutEnlargement: true })
      .sharpen({ sigma: 1, m1: 2, j1: 2 }) 
      .jpeg({ quality, mozjpeg: true, progressive: true })
      .toBuffer();
      
    const b64 = out.toString("base64");
    if (b64.length <= MAX_B64_SIZE) {
      return { base64: b64, mimeType: "image/jpeg" };
    }
    quality -= 10;
    width = Math.round(width * 0.8);
  }
  throw new Error("Failed to compress image while maintaining readability.");
}

/**
 * Converts an uploaded resume to vision-ready images + extracted text.
 */
export const parseFile = async (file) => {
  const ext = file.originalname.split(".").pop().toLowerCase();
  let result;

  if (ext === "pdf") {
    result = await parsePDF(file.buffer);
  } else if (ext === "docx" || ext === "doc") {
    result = await parseDOCX(file.buffer);
  } else if (["png", "jpg", "jpeg", "webp"].includes(ext)) {
    result = await parseRasterImage(file.buffer, ext);
  } else {
    throw new Error(`Unsupported file extension: .${ext}`);
  }

  return { 
    ...result, 
    rawBuffer: file.buffer, 
    mimeType: file.mimetype 
  };
};

/* ── PDF Processing (High Res + Text Extraction) ── */
const parsePDF = async (buffer) => {
  try {
    const pdfMeta = await pdfParse(buffer);
    const fullText = pdfMeta.text || "";
    const pageCount = pdfMeta.numpages || 0;

    if (pageCount === 0) throw new Error("PDF is empty.");
    if (pageCount > 5) throw new Error("Maximum 5 pages allowed.");

    const pagesToProcess = Array.from({ length: pageCount }, (_, i) => i + 1);
    const pngPages = await pdfToPng(buffer, {
      returnPageContent: true,
      viewportScale: 2.5, 
      pagesToProcess,
      verbosityLevel: 0,
    });

    const images = [];
    for (const page of pngPages) {
      images.push(await encodeImage(page.content));
    }

    console.log(`  Rendered ${pageCount} PDF page(s) + Extracted Text`);
    return { images, fullText, format: "pdf", pageCount };
  } catch (err) {
    throw new Error(`PDF parsing failed: ${err.message}`);
  }
};

/* ── Raster Images ── */
const parseRasterImage = async (buffer, formatLabel) => {
  const encoded = await encodeImage(buffer);
  return {
    images: [encoded],
    fullText: "[Scanned Image - No direct text layer]",
    format: formatLabel,
    pageCount: 1,
  };
};

/* ── DOCX ── */
const parseDOCX = async (buffer) => {
  try {
    const { value: fullText } = await mammoth.extractRawText({ buffer });
    
    const image = await sharp(buffer)
      .resize(2000, 2800, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 90 })
      .toBuffer();

    const encoded = await encodeImage(image);
    console.log(`  Extracted DOCX Text + Rendered Preview`);
    return { images: [encoded], fullText, format: "docx", pageCount: 1 };
  } catch (err) {
    throw new Error("DOCX conversion failed. Please use PDF for better visual analysis.");
  }
};
