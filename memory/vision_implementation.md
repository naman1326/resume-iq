---
name: Vision-Based Resume Analysis Implementation
description: Technical details on the PDF-to-image conversion and Groq Vision API integration
type: reference
---

## Overview
The system now converts resumes to images before sending to Groq's Vision API instead of extracting raw text. This preserves:
- Visual layout and formatting
- Typography choices (fonts, sizes, weights)
- White space and spacing
- Two-column layouts (detected as ATS-hostile)
- Graphics, icons, progress bars (detected as ATS-hostile)
- Visual hierarchy

## File Conversion Flow

```
Upload (PDF/DOCX)
      ↓
pdf2pic / sharp
      ↓
Base64 PNG images (1-5 pages)
      ↓
Groq Vision API (llama-3.2-90b-vision-preview)
      ↓
JSON analysis with visual feedback
```

## Key Files Changed

### backend/services/fileParser.js
- **Old**: Extracted text using pdf-parse, mammoth
- **New**: Converts to PNG images using pdf2pic + sharp
- **Output**: `{ images: string[], format: string, pageCount: number }`
- **Settings**: 300 DPI, 1200x1600 max dimensions

### backend/services/aiAnalyzer.js
- **Model**: Changed from `llama-3.3-70b-versatile` to `llama-3.2-90b-vision-preview`
- **Input**: Base64 images instead of text
- **Prompt**: Enhanced with visual/design evaluation criteria
- **Max tokens**: 4096 (increased from 2048)

### backend/routes/analyze.js
- Logs page count instead of character count
- Returns `pageCount` and `format` in meta

### src/components/ui/ResumePreview.jsx
- Detects vision analysis via `resumeText.includes("[Vision analysis")`
- Shows "Vision-Based Analysis" message instead of line-by-line preview
- Explains why text preview isn't available

### src/components/pages/UploadPage.jsx
- Updated loading steps to include "Converting document to images"
- Shows "Analysing your resume with Vision AI..." during processing

## System Requirements

### GraphicsMagick (Required)
The `pdf2pic` library requires GraphicsMagick or ImageMagick:

**Windows:**
```bash
choco install graphicsmagick
```

**macOS:**
```bash
brew install graphicsmagick
```

**Linux:**
```bash
sudo apt-get install graphicsmagick
```

Verify: `gm -version`

## Image Limits
- Max 5 pages per resume
- 4MB max per image (base64)
- 33 megapixels max resolution
- Output: PNG format

## ATS-Hostile Elements Detected
The vision model now penalizes:
- Two-column layouts (-15-25 ATS points)
- Skill progress bars / graphics (-10-20 ATS points)
- Icons and decorative elements
- Text embedded in images
- Complex tables

## Why Vision Over Text Extraction?

| Aspect | Text Parsing | Vision |
|--------|-------------|--------|
| Layout detection | ❌ Lost | ✅ Preserved |
| Typography analysis | ❌ Lost | ✅ Preserved |
| White space evaluation | ❌ Lost | ✅ Preserved |
| Two-column detection | ❌ Impossible | ✅ Accurate |
| ATS-hostile elements | ❌ Invisible | ✅ Detected |
| Processing speed | Faster | Slightly slower |
| Token usage | Lower | Higher |

## Future Enhancements
- Multi-page resume support (send all pages as images)
- Side-by-side original image + annotations
- Screenshot capability for sharing results
