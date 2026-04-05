---
name: AI Prompt Design & Scoring Rubric
description: Details on the AI prompt engineering for resume analysis with scoring rubrics
type: reference
---

## Prompt Location
`backend/services/aiAnalyzer.js:buildVisionPrompt()` — Vision-based analysis with image understanding

## Response Schema (Required JSON)
```json
{
  "name": "string",
  "role": "string",
  "overallScore": 0-100,
  "atsScore": 0-100,
  "readabilityScore": 0-100,
  "impactScore": 0-100,
  "sections": {
    "contact": 0-100,
    "summary": 0-100,
    "experience": 0-100,
    "skills": 0-100,
    "education": 0-100,
    "achievements": 0-100
  },
  "radarData": [{ "subject": "string", "A": 0-100 }],
  "skills": {
    "matched": ["string"],
    "missing": ["string"],
    "bonus": ["string"]
  },
  "issues": [{ "type": "error|warn|info", "text": "string", "quote": "string" }],
  "suggestions": [{ "tag": "HIGH|MED|LOW", "title": "string", "body": "string" }]
}
```

## Scoring Rubrics

### Contact (0-100)
- 0-20: No clear contact details or unreadable
- 40-60: Some present but missing key items
- 80-100: Complete (email, phone, city, LinkedIn/portfolio)

### Summary (0-100)
- 0-20: Missing or generic ("hard-working team player")
- 40-60: Exists but light on scope/metrics
- 80-100: Clear target role + strengths + quantified impact

### Experience (0-100)
- 0-20: Missing or responsibilities only
- 40-60: Some outcomes but vague
- 80-100: Strong action+impact bullets with metrics

### Skills (0-100)
- 0-20: Missing or thin/unstructured
- 40-60: Present but not tailored
- 80-100: Grouped, role-relevant, no keyword stuffing

### Education (0-100)
- 0-20: Missing when expected
- 40-60: Present but incomplete
- 80-100: Complete, concise, relevant

### Achievements (0-100)
- 0-20: None and no measurable wins
- 40-60: Some wins but weak specificity
- 80-100: Clear awards/recognition with metrics

## Derived Scores
- **overallScore**: Weighted avg (experience 35%, skills 15%, ats 20%, readability 15%, impact 15%)
- **ATS Score**: Based on keyword alignment, sectioning, parsing friendliness
- **Readability Score**: Clarity, scannability, formatting consistency
- **Impact Score**: Metrics, scope, leadership, value created

## Consistency Checks (Anti-Inflation)
- No numbers/metrics in experience → cap impactScore at 65
- Missing experience section → overallScore <= 45
- Resume <1500 chars with no depth → overallScore <= 60
- Typos/broken grammar → deduct 10-30 points

## Issues Design
- 6-12 issues total (mix of error/warn/info)
- "quote" field must be EXACT text from resume (for highlighting)
- Use empty string "" for general issues (e.g., "missing LinkedIn")

## Suggestions Design
- 6-10 suggestions, prioritized (HIGH/MED/LOW)
- Actionable and tailored to inferred target role
- Never fabricate facts — suggest adding missing info, don't invent it

## Why
Understanding the prompt design is critical for modifying scoring behavior or fixing AI response issues.

## How to apply
When debugging AI responses, check if the issue is in the prompt (buildPrompt), validation (validateResponse), or Groq API. The rubrics define expected scoring behavior.
