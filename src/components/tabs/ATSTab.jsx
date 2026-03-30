import { CheckCircle, X } from "lucide-react";
import ScoreRing from "../ui/ScoreRing";
import { scoreColor } from "../../data/mockData";

const checks = [
  { label: "File Format",        pass: true,  note: "PDF is ATS-compatible"               },
  { label: "Standard Headings",  pass: true,  note: "All section headers recognized"       },
  { label: "Contact Information",pass: false, note: "LinkedIn URL missing"                 },
  { label: "Date Formatting",    pass: true,  note: "Consistent MM/YYYY format"            },
  { label: "Readable Fonts",     pass: true,  note: "No custom/image fonts detected"       },
  { label: "No Tables/Columns",  pass: false, note: "2-column layout may break parsing"   },
  { label: "Action Verb Usage",  pass: false, note: "4 bullets start with weak verbs"      },
  { label: "Keyword Density",    pass: true,  note: "Good keyword distribution"            },
];

const ATSTab = ({ data }) => {
  const sectionScores = Object.entries(data.sections);

  return (
    <div>
      {/* ATS Score card */}
      <div style={{
        background: "var(--card-bg)", borderRadius: 20, padding: "28px 32px",
        boxShadow: "var(--card-shadow)", marginBottom: 24,
        display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ position: "relative", display: "inline-block" }}>
            <ScoreRing score={data.atsScore} size={110} stroke={9} />
            <div style={{ position: "absolute", inset: 0, display: "flex",
              flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800,
                fontSize: 26, color: "var(--text-primary)" }}>{data.atsScore}</span>
              <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>/100</span>
            </div>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 6, fontWeight: 600 }}>ATS SCORE</p>
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800,
            fontSize: 18, color: "var(--text-primary)", marginBottom: 8 }}>
            ATS Compatibility Analysis
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.6, maxWidth: 480 }}>
            Your resume passes most ATS filters but has a few structural issues that may
            cause parsing errors. Fix the flagged items to improve your score to 90+.
          </p>
        </div>
      </div>

      {/* Checklist */}
      <div style={{ background: "var(--card-bg)", borderRadius: 20,
        padding: 28, boxShadow: "var(--card-shadow)", marginBottom: 24 }}>
        <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700,
          fontSize: 15, marginBottom: 20, color: "var(--text-primary)" }}>ATS Checklist</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {checks.map((c, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 12,
              padding: "14px 16px", borderRadius: 12,
              background: c.pass ? "#f0fdf4" : "#fff5f5",
              border: `1px solid ${c.pass ? "#bbf7d0" : "#fecaca"}`
            }}>
              <div style={{ flexShrink: 0, marginTop: 1 }}>
                {c.pass
                  ? <CheckCircle size={16} color="#16a34a" />
                  : <X size={16} color="#dc2626" />}
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{c.label}</p>
                <p style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{c.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section scores */}
      <div style={{ background: "var(--card-bg)", borderRadius: 20,
        padding: 28, boxShadow: "var(--card-shadow)" }}>
        <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700,
          fontSize: 15, marginBottom: 20, color: "var(--text-primary)" }}>Section-by-Section Score</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {sectionScores.map(([sec, score]) => (
            <div key={sec}>
              <div style={{ display: "flex", justifyContent: "space-between",
                marginBottom: 6, alignItems: "center" }}>
                <span style={{ fontWeight: 600, fontSize: 13,
                  color: "var(--text-primary)", textTransform: "capitalize" }}>{sec}</span>
                <span style={{ fontWeight: 700, fontSize: 13,
                  color: scoreColor(score) }}>{score}%</span>
              </div>
              <div style={{ height: 8, background: "var(--progress-bg)", borderRadius: 99 }}>
                <div style={{
                  height: "100%", width: `${score}%`,
                  background: `linear-gradient(90deg,${scoreColor(score)}80,${scoreColor(score)})`,
                  borderRadius: 99, transition: "width 1.2s cubic-bezier(.4,0,.2,1)"
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ATSTab;
