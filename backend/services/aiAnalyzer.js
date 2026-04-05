import Groq from "groq-sdk";

const buildVisionPrompt = () => `
You are an expert resume analyst and career coach with expertise in visual design, layout, and ATS compatibility.

Analyse the resume image(s) below and return ONLY a valid JSON object.
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
      "quote": "Copy the EXACT text from the resume that has this issue. If the issue is about visual formatting/layout with no specific text, use empty string.",
      "page": <integer: 1-based page index in the image set where this issue is most visible; use 1 for single-page or whole-document issues>
    }
  ],
  "suggestions": [
    { "tag": "HIGH", "title": "Short title", "body": "Detailed actionable suggestion 2-3 sentences", "page": <integer 1-based: which page this applies to most> },
    { "tag": "MED",  "title": "Short title", "body": "Detailed actionable suggestion 2-3 sentences", "page": <integer> },
    { "tag": "LOW",  "title": "Short title", "body": "Detailed actionable suggestion 2-3 sentences", "page": <integer> }
  ]
}

SCORING RULES (IMPORTANT):
- Use the FULL 0-100 range; do not cluster around 70-85.
- Scores MUST differ meaningfully between resumes based on evidence in the image.
- Base the final scores on the rubric below. If a resume is missing key info, deduct aggressively.
- Prefer precision over politeness: if it's weak, score it low.
- Use integers only.

RUBRIC (anchor your scoring to these bands):
1) CONTACT (0-100)
   - 0-20: No clear contact details (email/phone/location) or unreadable
   - 40-60: Some present but missing key items (location/links) or inconsistent formatting
   - 80-100: Clean, complete (email, phone, city/country, LinkedIn/portfolio if relevant)

2) SUMMARY (0-100)
   - 0-20: Missing OR generic ("hard-working team player") with no specifics
   - 40-60: Exists but light on scope, domain, measurable outcomes
   - 80-100: Clear target role + strengths + domain + quantified impact or credible proof

3) EXPERIENCE (0-100)
   - 0-20: Missing OR responsibilities only, no outcomes
   - 40-60: Some outcomes but vague, few metrics, unclear scope/tech
   - 80-100: Strong action+impact bullets, quantified, scope clear, progression demonstrated

4) SKILLS (0-100)
   - 0-20: Missing OR very thin/unstructured
   - 40-60: Present but not tailored; mixes tools with soft skills; no grouping
   - 80-100: Grouped, role-relevant, matches experience claims, avoids keyword stuffing

5) EDUCATION (0-100)
   - 0-20: Missing when expected OR unclear institution/dates
   - 40-60: Present but incomplete (no dates/degree/major) or oddly formatted
   - 80-100: Complete, concise, relevant highlights only

6) ACHIEVEMENTS (0-100)
   - 0-20: None and no measurable wins elsewhere
   - 40-60: Some wins but weak specificity
   - 80-100: Clear awards/recognition/projects with measurable results

DERIVED SCORES:
- atsScore: Estimate how well this resume would pass an ATS for the MOST LIKELY target role inferred from the resume. Consider keyword alignment, sectioning, dates, parsing friendliness, consistency, AND visual layout (ATS-unfriendly designs like two-column layouts, graphics, icons, progress bars should be penalized).
- readabilityScore: Clarity, structure, scannability, formatting consistency, length appropriateness, AND visual hierarchy (font sizes, spacing, white space, contrast).
- impactScore: Strength of outcomes, metrics, scope, leadership, and evidence of value created.
- overallScore: Weighted average (approx): experience 35%, skills 15%, ats 20%, readability 15%, impact 15%. If experience is missing/weak, overall must drop substantially.

VISUAL/DESIGN EVALUATION (NEW - analyze what you see in the image):
- Evaluate typography choices (font selection, sizes, consistency)
- Assess layout quality (alignment, spacing, white space usage)
- Check for ATS-hostile elements: two-column layouts, graphics, icons, progress bars, tables, text in images
- Evaluate visual hierarchy (is the most important info most prominent?)
- Assess color usage (professional vs distracting)
- Check density (too much text crammed together vs well-spaced)
- Note any design choices that hurt readability or ATS parsing

CONSISTENCY CHECKS (avoid inflated scores):
- If there are NO numbers/metrics anywhere in experience/projects, cap impactScore at 65 unless role truly doesn't use metrics (rare).
- If experience section is missing, overallScore must be <= 45.
- If resume is extremely short (< ~1500 chars equivalent) and lacks depth, cap overallScore at 60.
- If resume has clear red flags (typos, broken grammar, contradictory dates), deduct 10-30 points across relevant categories.
- If resume uses two-column layout, reduce atsScore by 15-25 points (most ATS parsers struggle with columns).
- If resume uses graphics/icons/progress bars for skills, reduce atsScore by 10-20 points.

IMPORTANT for "page" fields (images are sent in order — page 1 is the first image):
- For each issue and suggestion, set "page" to the 1-based index of the image where the problem or fix is most relevant (1 = first page). If unsure, use 1. For multi-page resumes, put contact/header issues on page 1, later sections on later pages when visible there.

IMPORTANT for issues:
- The "quote" field must be copied EXACTLY from the resume text word for word
- It should be the specific sentence, bullet point, or phrase that has the problem
- This is used to highlight that exact line in the resume preview
- Keep the quote short — just the problematic part, not entire paragraphs
- If it is a general issue (like missing LinkedIn or poor layout), use empty string "" for quote
- Include visual/design issues: "Two-column layout may confuse ATS parsers", "Skill progress bars are not ATS-friendly", etc.

ISSUES + SUGGESTIONS QUALITY BAR:
- Provide 6-12 issues total. Mix of error/warn/info. Avoid generic advice.
- Every issue MUST be tied to a specific weakness visible in the resume. Use "quote" whenever possible.
- Include at least 2-3 visual/design-related issues if applicable.
- Provide 6-10 suggestions. Make them highly actionable and tailored to the inferred target role.
- Use the resume's own phrasing and facts; do NOT invent employers, degrees, certifications, or metrics. If metrics are missing, suggest adding them (do NOT fabricate).

Analyze the resume image(s) below:`;

const validateResponse = (data, pageCount = 1) => {
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
  const pc = Math.max(1, Math.min(50, Math.round(Number(pageCount) || 1)));
  const clampPage = (p) => {
    const n = Math.round(Number(p));
    if (Number.isNaN(n) || n < 1) return 1;
    return Math.min(n, pc);
  };

  data.overallScore     = clamp(data.overallScore);
  data.atsScore         = clamp(data.atsScore);
  data.readabilityScore = clamp(data.readabilityScore);
  data.impactScore      = clamp(data.impactScore);
  Object.keys(data.sections).forEach((k) => { data.sections[k] = clamp(data.sections[k]); });
  data.radarData = data.radarData.map((r) => ({ subject: r.subject, A: clamp(r.A) }));
  data.issues = data.issues.map((i) => ({
    ...i,
    quote: i.quote || "",
    page: clampPage(i.page),
  }));
  data.suggestions = (data.suggestions || []).map((s) => ({
    ...s,
    page: clampPage(s.page),
  }));
};

const buildJDMatchPrompt = (jdText) => `
You are an expert technical recruiter and ATS specialist.
Analyze the provided resume image(s) against this Job Description:

--- JOB DESCRIPTION ---
${jdText}
---

Return ONLY a valid JSON object with this structure:
{
  "matchScore": <integer 0-100>,
  "explanation": "1-2 sentence summary of the fit",
  "keywords": {
    "matched": ["skill1", "skill2"],
    "missing": ["skill1", "skill2"]
  },
  "adjustments": [
    {
      "title": "Short title of adjustment",
      "suggestion": "Specific instructions on what to add/change",
      "location": "Which section (Experience, Skills, Summary) to modify",
      "priority": "HIGH|MED|LOW"
    }
  ]
}

Rules:
1. Be realistic. If the resume is for a junior and the JD is for a lead, the score should reflect that.
2. Suggestions must be actionable (e.g., "Add 'Kubernetes' to your TechCorp experience bullets").
3. No markdown or extra text.`;

export const matchJobDescription = async (resumeData, jdText) => {
  if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY missing.");
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const toDataUrl = (img) => {
    const mime = img.mimeType || "image/png";
    return { type: "image_url", image_url: { url: `data:${mime};base64,${img.base64}` } };
  };

  const imageContent = resumeData.images.map(img => toDataUrl(img));
  const model = process.env.GROQ_VISION_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct";

  const response = await groq.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: "You are a precise resume-to-JD matching engine. Output ONLY valid JSON."
      },
      {
        role: "user",
        content: [
          { type: "text", text: buildJDMatchPrompt(jdText) },
          ...imageContent
        ]
      }
    ],
    temperature: 0.1,
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0]?.message?.content || "{}");
};

export const analyzeResume = async (resumeData) => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set in environment variables.");
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const toDataUrl = (img) => {
    if (typeof img === "string") {
      return { type: "image_url", image_url: { url: `data:image/png;base64,${img}` } };
    }
    const mime = img.mimeType || "image/png";
    return {
      type: "image_url",
      image_url: { url: `data:${mime};base64,${img.base64}` },
    };
  };

  const imageContent = resumeData.images.map((img) => toDataUrl(img));

  let rawText = "";
  try {
    const model =
      process.env.GROQ_VISION_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct";

    const response = await groq.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content:
            "You are a strict, evidence-based resume scoring engine with expertise in visual design and ATS compatibility. Output ONLY a valid JSON object (no markdown, no code fences, no extra text). Follow the user's schema exactly. Use the full 0-100 scoring range and avoid score clustering by anchoring to the provided rubric. Never invent facts; if something is missing, penalize and recommend what to add. Evaluate both content AND visual presentation."
        },
        {
          role: "user",
          content: [
            { type: "text", text: buildVisionPrompt() },
            ...imageContent
          ]
        }
      ],
      temperature: 0.2,
      max_completion_tokens: 4096,
      response_format: { type: "json_object" },
    });

    rawText = response.choices[0]?.message?.content || "";
    const parsed = JSON.parse(rawText);
    validateResponse(parsed, resumeData.pageCount || 1);
    return parsed;
  } catch (err) {
    if (err.message.includes("GROQ_API_KEY")) throw err;
    if (err instanceof SyntaxError) {
      console.error("Raw Groq response (invalid JSON):", rawText?.slice?.(0, 2000) || rawText);
      throw new Error("AI returned invalid JSON. Please try again.");
    }
    const apiMsg =
      err?.response?.data?.error?.message ||
      err?.error?.message ||
      err?.message ||
      String(err);
    throw new Error(`Groq error: ${apiMsg}`);
  }
};

