export const mockAnalysis = {
  name: "Alex Johnson",
  role: "Senior Frontend Developer",
  overallScore: 82,
  atsScore: 74,
  readabilityScore: 91,
  impactScore: 68,
  sections: {
    contact: 100, summary: 85, experience: 88,
    skills: 90, education: 95, achievements: 60
  },
  radarData: [
    { subject: "ATS Match", A: 74 },
    { subject: "Keywords", A: 80 },
    { subject: "Formatting", A: 92 },
    { subject: "Impact", A: 68 },
    { subject: "Clarity", A: 91 },
    { subject: "Length", A: 85 }
  ],
  scoreTimeline: [
    { month: "Jan", score: 55 }, { month: "Feb", score: 60 },
    { month: "Mar", score: 67 }, { month: "Apr", score: 72 },
    { month: "May", score: 78 }, { month: "Jun", score: 82 }
  ],
  skills: {
    matched: ["React", "TypeScript", "Node.js", "REST APIs", "Git", "Agile"],
    missing: ["GraphQL", "Docker", "AWS", "Jest"],
    bonus: ["Figma", "Python", "PostgreSQL"]
  },
  issues: [
    { type: "error", text: "Quantify achievements — use numbers & impact metrics", quote: "Worked on improving the dashboard performance" },
    { type: "error", text: "Missing LinkedIn URL in contact section", quote: "" },
    { type: "warn",  text: "Summary is too short — expand to 3-4 sentences mirroring the job title", quote: "Frontend developer with 5 years of experience building scalable web applications." },
    { type: "warn",  text: "Quantify: how many components? What was the adoption rate?", quote: "Collaborated with design team on component library" },
    { type: "info",  text: "Consider adding a GitHub portfolio link", quote: "" },
    { type: "info",  text: "Tailor skills section to match the job description keywords", quote: "" }
  ],
  resumeText: `Alex Johnson
alex.johnson@email.com • +1 (555) 234-5678 • San Francisco, CA
github.com/alexjohnson

PROFESSIONAL SUMMARY
Frontend developer with 5 years of experience building scalable web applications.

WORK EXPERIENCE
Senior Frontend Developer — TechCorp Inc.
Jan 2021 – Present
• Worked on improving the dashboard performance
• Led migration of legacy codebase to React 18 with TypeScript
• Collaborated with design team on component library
• Reduced build time by 35% through webpack optimisation

Frontend Developer — StartupXYZ
Jun 2018 – Dec 2020
• Built reusable component library used across 3 products
• Integrated REST APIs and managed application state with Redux
• Mentored 2 junior developers on React best practices

SKILLS
React • TypeScript • Node.js • REST APIs • Git • Agile • Figma • Python • PostgreSQL

EDUCATION
B.Sc. Computer Science — University of California, Berkeley
Graduated: May 2018 • GPA: 3.7/4.0

ACHIEVEMENTS
Open source contributor — 200+ GitHub stars on UI toolkit
Hackathon winner — TechCorp Internal Innovation Challenge 2022`,
  suggestions: [
    {
      tag: "HIGH", title: "Add Metrics to Experience",
      body: "Statements like 'Improved performance by 40%' have 3x higher recruiter engagement than vague claims."
    },
    {
      tag: "HIGH", title: "Include Missing Keywords",
      body: "GraphQL and Docker appear in 78% of senior frontend JDs. Add them if you have experience."
    },
    {
      tag: "MED", title: "Expand Your Summary",
      body: "A 3–4 sentence summary that mirrors the job title and key requirements increases ATS match by ~12%."
    },
    {
      tag: "LOW", title: "Reorder Skills Section",
      body: "Place technical skills before soft skills — ATS parsers weight them more heavily."
    }
  ]
};

export const scoreColor = (s) =>
  s >= 80 ? "#10b981" : s >= 60 ? "#f59e0b" : "#ef4444";
