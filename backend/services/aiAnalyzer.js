import Groq from "groq-sdk";

const buildPrompt = (resumeText) => `
You are an expert resume analyst and career coach.
Analyse the resume below and return ONLY a valid JSON object.
No markdown, no explanation, no extra text. Just raw JSON.

The JSON must follow this EXACT structure:
{
  "name": "Full name from resume",
  "role": "Most recent job title or target role",
  "overallScore": <integer 0-100>,
  "atsScore": <integer 0-100>,
  "readabilityScore": <integer 0-100>,
  "impactScore": <integer 0-100>,
  "sections": {
    "contact":      <integer 0-100>,
    "summary":      <integer 0-100>,
    "experience":   <integer 0-100>,
    "skills":       <integer 0-100>,
    "education":    <integer 0-100>,
    "achievements": <integer 0-100>
  },
  "radarData": [
    { "subject": "ATS Match",  "A": <integer 0-100> },
    { "subject": "Keywords",   "A": <integer 0-100> },
    { "subject": "Formatting", "A": <integer 0-100> },
    { "subject": "Impact",     "A": <integer 0-100> },
    { "subject": "Clarity",    "A": <integer 0-100> },
    { "subject": "Length",     "A": <integer 0-100> }
  ],
  "skills": {
    "matched": ["skill1", "skill2"],
    "missing": ["skill1", "skill2"],
    "bonus":   ["skill1", "skill2"]
  },
  "issues": [
    {
      "type": "error|warn|info",
      "text": "Explanation of the issue and how to fix it",
      "quote": "Copy the EXACT line or phrase from the resume that has this issue. Must be copied verbatim from the resume text. If the issue is general with no specific line, use empty string."
    }
  ],
  "suggestions": [
    { "tag": "HIGH", "title": "Short title", "body": "Detailed actionable suggestion 2-3 sentences" },
    { "tag": "MED",  "title": "Short title", "body": "Detailed actionable suggestion 2-3 sentences" },
    { "tag": "LOW",  "title": "Short title", "body": "Detailed actionable suggestion 2-3 sentences" }
  ]
}

IMPORTANT for issues:
- The "quote" field must be copied EXACTLY from the resume text word for word
- It should be the specific sentence, bullet point, or phrase that has the problem
- This is used to highlight that exact line in the resume preview
- Keep the quote short — just the problematic part, not entire paragraphs
- If it is a general issue (like missing LinkedIn) use empty string "" for quote

Resume text:
---
${resumeText}
---
`;

const validateResponse = (data) => {
  const required = [
    "name", "role", "overallScore", "atsScore",
    "readabilityScore", "impactScore", "sections",
    "radarData", "skills", "issues", "suggestions"
  ];
  const missing = required.filter((k) => !(k in data));
  if (missing.length > 0) {
    throw new Error(`AI response missing fields: ${missing.join(", ")}. Please try again.`);
  }
  const clamp = (v) => Math.max(0, Math.min(100, Math.round(Number(v) || 0)));
  data.overallScore     = clamp(data.overallScore);
  data.atsScore         = clamp(data.atsScore);
  data.readabilityScore = clamp(data.readabilityScore);
  data.impactScore      = clamp(data.impactScore);
  Object.keys(data.sections).forEach((k) => { data.sections[k] = clamp(data.sections[k]); });
  data.radarData = data.radarData.map((r) => ({ subject: r.subject, A: clamp(r.A) }));
  // Ensure every issue has a quote field
  data.issues = data.issues.map(i => ({ ...i, quote: i.quote || "" }));
};

export const analyzeResume = async (resumeText) => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set in environment variables.");
  }
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  let rawText = "";
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are a professional resume analyst. Always respond with valid JSON only. No markdown, no code fences, no explanation. Just the JSON object."
        },
        {
          role: "user",
          content: buildPrompt(resumeText)
        }
      ],
      temperature: 0.2,
      max_tokens: 2048,
      response_format: { type: "json_object" }
    });
    rawText = response.choices[0].message.content;
    const parsed = JSON.parse(rawText);
    validateResponse(parsed);
    return parsed;
  } catch (err) {
    if (err.message.includes("GROQ_API_KEY")) throw err;
    if (err instanceof SyntaxError) {
      console.error("Raw Groq response:", rawText);
      throw new Error("AI returned invalid JSON. Please try again.");
    }
    throw new Error(`Groq error: ${err.message}`);
  }
};
