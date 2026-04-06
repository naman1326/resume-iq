import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

const buildVisionPrompt = () => `
You are a World-Class Resume Analyst and Career Coach with expertise in visual design, layout, and ATS compatibility.
Your goal is to provide a deep, high-fidelity analysis of the provided resume.

--- ANALYSIS INSTRUCTIONS ---
1. CROSS-REFERENCE: Use the provided "DOCUMENT TEXT LAYER" for 100% accurate extraction of contact info, links (LinkedIn, GitHub, Portfolio), and specific technical keywords. The image(s) are for analyzing layout, hierarchy, and visual polish.
2. BE CRITICAL: Avoid score inflation. A "good" resume is 70-80. A "perfect" resume is 90+. 
3. LINK DETECTION: Ensure you extract ALL URLs present in the text layer. If a link is present but doesn't work or is poorly formatted, mark it as an issue.
4. ATS CHECKLIST: Evaluate if the design is modern but ATS-friendly. Note that our system handles columns and tables, so ONLY penalize if the visual hierarchy is confusing or fonts are unreadable.

--- JSON SCHEMA ---
{
  "name": "Full name from resume",
  "role": "Current or target role",
  "overallScore": 0-100,
  "atsScore": 0-100,
  "readabilityScore": 0-100,
  "impactScore": 0-100,
  "sections": {
    "contact":      0-100,
    "summary":      0-100,
    "experience":   0-100,
    "skills":       0-100,
    "education":    0-100,
    "achievements": 0-100
  },
  "radarData": [
    { "subject": "ATS Match",  "A": 0-100 },
    { "subject": "Keywords",   "A": 0-100 },
    { "subject": "Formatting", "A": 0-100 },
    { "subject": "Impact",     "A": 0-100 },
    { "subject": "Clarity",    "A": 0-100 },
    { "subject": "Length",     "A": 0-100 }
  ],
  "skills": {
    "matched": ["tech1", "tech2"],
    "missing": ["suggested_tech1"],
    "bonus":   ["extra_value_skill"]
  },
  "issues": [
    {
      "type": "error|warn|info",
      "text": "Detailed explanation of the issue",
      "quote": "EXACT text string from the resume for highlighting",
      "page": 1
    }
  ],
  "suggestions": [
    { "tag": "HIGH|MED|LOW", "title": "Short title", "body": "Detailed actionable fix", "page": 1 }
  ]
}

IMPORTANT: Output ONLY raw JSON. No markdown.`;

const validateResponse = (data, pageCount = 1) => {
  const required = ["name", "overallScore", "atsScore", "sections", "issues", "suggestions"];
  required.forEach(k => { if (!(k in data)) throw new Error(`Missing field: ${k}`); });
  const clamp = (v) => Math.max(0, Math.min(100, Math.round(Number(v) || 0)));
  data.overallScore = clamp(data.overallScore);
  data.atsScore = clamp(data.atsScore);
  data.issues = (data.issues || []).map(i => ({ 
    ...i, 
    page: Math.min(Math.max(1, i.page || 1), pageCount),
    quote: i.quote || "" 
  }));
  data.suggestions = (data.suggestions || []).map(s => ({
    ...s,
    page: Math.min(Math.max(1, s.page || 1), pageCount)
  }));
};

const buildJDMatchPrompt = (jdText) => `
You are a Senior Technical Recruiter. Perform a surgical match analysis.

--- JOB DESCRIPTION ---
${jdText}

--- INSTRUCTIONS ---
1. Identify the CORE 5 requirements from the JD.
2. Search the resume's text layer and images for specific evidence of these requirements.
3. If the candidate has the skill but not enough YEARS of experience as requested, score the Technical Match high but the Experience Match lower.
4. Provide highly specific adjustments like "Rewrite your 'Senior Developer' bullet #3 to include 'Kubernetes cluster management' to match the JD's focus."

Return ONLY JSON:
{
  "matchScore": 0-100,
  "explanation": "Detailed 3-4 sentence analysis",
  "analysis": {
    "technicalMatch": 0-100,
    "experienceMatch": 0-100,
    "educationMatch": 0-100,
    "softSkillsMatch": 0-100
  },
  "keywords": { "matched": [], "missing": [], "bonus": [] },
  "adjustments": [
    { "title": "...", "suggestion": "...", "location": "...", "priority": "HIGH|MED|LOW" }
  ]
}`;

const analyzeWithGemini = async (resumeData) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const model = genAI.getGenerativeModel({ model: modelName });

  const combinedPrompt = `DOCUMENT TEXT LAYER:\n${resumeData.fullText}\n\n${buildVisionPrompt()}`;

  let parts = [{ text: combinedPrompt }];
  if (resumeData.format === "pdf" && resumeData.rawBuffer) {
    parts.push({ inlineData: { data: resumeData.rawBuffer.toString("base64"), mimeType: "application/pdf" } });
  } else {
    resumeData.images.forEach(img => {
      parts.push({ inlineData: { data: img.base64, mimeType: "image/jpeg" } });
    });
  }

  const result = await model.generateContent(parts);
  const response = await result.response;
  let text = response.text();
  text = text.replace(/```json\n?|```/g, "").trim();
  const parsed = JSON.parse(text);
  validateResponse(parsed, resumeData.pageCount || 1);
  return parsed;
};

const analyzeWithGroq = async (resumeData, groq) => {
  const toDataUrl = (img) => ({
    type: "image_url",
    image_url: { url: `data:${img.mimeType || "image/png"};base64,${img.base64}` }
  });

  const response = await groq.chat.completions.create({
    model: process.env.GROQ_VISION_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct",
    messages: [
      { role: "system", content: "You are a resume scoring engine. Output ONLY JSON." },
      { 
        role: "user", 
        content: [
          { type: "text", text: `DOCUMENT TEXT LAYER:\n${resumeData.fullText}\n\n${buildVisionPrompt()}` }, 
          ...resumeData.images.map(toDataUrl)
        ] 
      }
    ],
    temperature: 0.2,
    response_format: { type: "json_object" },
  });

  const parsed = JSON.parse(response.choices[0]?.message?.content || "{}");
  validateResponse(parsed, resumeData.pageCount || 1);
  return parsed;
};

const matchWithGemini = async (resumeData, jdText) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const modelName = process.env.GEMINI_MODEL_FLASH || "gemini-2.5-flash";
  const model = genAI.getGenerativeModel({ model: modelName });

  let parts = [{ text: `DOCUMENT TEXT LAYER:\n${resumeData.fullText}\n\n${buildJDMatchPrompt(jdText)}` }];
  if (resumeData.format === "pdf" && resumeData.rawBuffer) {
    parts.push({ inlineData: { data: resumeData.rawBuffer.toString("base64"), mimeType: "application/pdf" } });
  } else {
    resumeData.images.forEach(img => {
      parts.push({ inlineData: { data: img.base64, mimeType: "image/jpeg" } });
    });
  }

  const result = await model.generateContent(parts);
  const text = result.response.text().replace(/```json\n?|```/g, "").trim();
  return JSON.parse(text);
};

const matchWithGroq = async (resumeData, jdText, groq) => {
  const toDataUrl = (img) => ({
    type: "image_url",
    image_url: { url: `data:${img.mimeType || "image/png"};base64,${img.base64}` }
  });

  const response = await groq.chat.completions.create({
    model: process.env.GROQ_VISION_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct",
    messages: [
      { role: "system", content: "You are a JD matching engine. Output ONLY JSON." },
      { 
        role: "user", 
        content: [
          { type: "text", text: `DOCUMENT TEXT LAYER:\n${resumeData.fullText}\n\n${buildJDMatchPrompt(jdText)}` }, 
          ...resumeData.images.map(toDataUrl)
        ] 
      }
    ],
    temperature: 0.1,
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0]?.message?.content || "{}");
};

export const analyzeResume = async (resumeData) => {
  const provider = (process.env.AI_PROVIDER || "groq").toLowerCase();
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  
  if (provider === "gemini") {
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    console.log(`💎 Attempting Gemini Analysis (Model: ${model})...`);
    return await analyzeWithGemini(resumeData);
  }

  const model = process.env.GROQ_VISION_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct";
  console.log(`🦁 Attempting Groq Analysis (Model: ${model})...`);
  return await analyzeWithGroq(resumeData, groq);
};

export const matchJobDescription = async (resumeData, jdText) => {
  const provider = (process.env.AI_PROVIDER || "groq").toLowerCase();
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  if (provider === "gemini") {
    const model = process.env.GEMINI_MODEL_FLASH || "gemini-2.5-flash";
    console.log(`💎 Attempting Gemini JD Match (Model: ${model})...`);
    return await matchWithGemini(resumeData, jdText);
  }

  const model = process.env.GROQ_VISION_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct";
  console.log(`🦁 Attempting Groq JD Match (Model: ${model})...`);
  return await matchWithGroq(resumeData, jdText, groq);
};
