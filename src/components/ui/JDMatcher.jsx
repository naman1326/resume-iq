import { useState } from "react";
import { Target, ChevronDown, ChevronUp, Zap, X, CheckCircle, AlertCircle } from "lucide-react";

/* Sample JD keyword data — replace with real AI extraction later */
const extractKeywords = (text) => {
  const common = [
    "React","TypeScript","JavaScript","Node.js","REST APIs","GraphQL",
    "Docker","AWS","CI/CD","Jest","PostgreSQL","MongoDB","Redis",
    "Agile","Scrum","Git","Python","Kubernetes","Microservices",
    "Figma","Next.js","Tailwind","Redux","Testing","Leadership"
  ];
  const lower = text.toLowerCase();
  return common.filter(k => lower.includes(k.toLowerCase()));
};

const resumeSkills = ["React","TypeScript","Node.js","REST APIs","Git","Agile","Figma","Python","PostgreSQL"];

const JDMatcher = () => {
  const [open,     setOpen]     = useState(false);
  const [jdText,   setJdText]   = useState("");
  const [analyzed, setAnalyzed] = useState(false);
  const [jdKws,    setJdKws]    = useState([]);

  const analyze = () => {
    if (!jdText.trim()) return;
    setJdKws(extractKeywords(jdText));
    setAnalyzed(true);
  };

  const reset = () => { setJdText(""); setAnalyzed(false); setJdKws([]); };

  const matched  = jdKws.filter(k => resumeSkills.includes(k));
  const missing  = jdKws.filter(k => !resumeSkills.includes(k));
  const matchPct = jdKws.length ? Math.round((matched.length / jdKws.length) * 100) : 0;

  return (
    <div style={{
      background: "var(--card-bg)", borderRadius: 20,
      border: "1px solid var(--border)",
      boxShadow: "var(--card-shadow)", marginBottom: 24, overflow: "hidden"
    }}>
      {/* Header / toggle */}
      <button onClick={() => setOpen(o => !o)} style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 24px", background: "transparent", border: "none", cursor: "pointer"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "rgba(99,102,241,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Target size={17} color="#6366f1" />
          </div>
          <div style={{ textAlign: "left" }}>
            <p style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700,
              fontSize: 15, color: "var(--text-primary)" }}>
              Job Description Matcher
            </p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 1 }}>
              {analyzed
                ? `${matchPct}% match · ${missing.length} keywords missing`
                : "Paste a JD to see how well your resume matches"}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {analyzed && (
            <div style={{
              padding: "4px 12px", borderRadius: 99,
              background: matchPct >= 70 ? "#dcfce7" : matchPct >= 40 ? "#fef3c7" : "#fee2e2",
              color:      matchPct >= 70 ? "#15803d" : matchPct >= 40 ? "#d97706" : "#dc2626",
              fontSize: 12, fontWeight: 700
            }}>
              {matchPct}% Match
            </div>
          )}
          {open
            ? <ChevronUp  size={18} color="var(--text-muted)" />
            : <ChevronDown size={18} color="var(--text-muted)" />}
        </div>
      </button>

      {/* Body */}
      {open && (
        <div style={{ padding: "0 24px 24px", borderTop: "1px solid var(--border)" }}>

          {!analyzed ? (
            /* Input state */
            <div style={{ paddingTop: 20 }}>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>
                Paste the full job description below. We'll extract keywords and compare them
                against your resume to show you exactly what's missing.
              </p>
              <textarea
                value={jdText}
                onChange={e => setJdText(e.target.value)}
                placeholder="Paste job description here…&#10;&#10;e.g. We are looking for a Senior Frontend Developer with experience in React, TypeScript, GraphQL, Docker..."
                style={{
                  width: "100%", minHeight: 160, padding: "14px 16px",
                  borderRadius: 12, border: "1.5px solid var(--border)",
                  background: "var(--main-bg)", color: "var(--text-primary)",
                  fontSize: 13, lineHeight: 1.65, resize: "vertical",
                  fontFamily: "'DM Sans',sans-serif", outline: "none",
                  transition: "border-color .2s"
                }}
                onFocus={e  => e.target.style.borderColor = "#6366f1"}
                onBlur={e   => e.target.style.borderColor = "var(--border)"}
              />
              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <button onClick={analyze} disabled={!jdText.trim()} style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "11px 22px", borderRadius: 11, border: "none",
                  background: jdText.trim()
                    ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
                    : "var(--progress-bg)",
                  color: jdText.trim() ? "#fff" : "var(--text-disabled)",
                  fontWeight: 700, fontSize: 13, cursor: jdText.trim() ? "pointer" : "default",
                  transition: "all .2s"
                }}>
                  <Zap size={14} /> Analyse Match
                </button>
              </div>
            </div>
          ) : (
            /* Results state */
            <div style={{ paddingTop: 20 }}>
              {/* Score bar */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between",
                  alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>
                    Keyword Match Score
                  </span>
                  <span style={{
                    fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22,
                    color: matchPct >= 70 ? "#10b981" : matchPct >= 40 ? "#f59e0b" : "#ef4444"
                  }}>{matchPct}%</span>
                </div>
                <div style={{ height: 10, background: "var(--progress-bg)", borderRadius: 99 }}>
                  <div style={{
                    height: "100%", borderRadius: 99,
                    width: `${matchPct}%`,
                    background: matchPct >= 70 ? "#10b981" : matchPct >= 40 ? "#f59e0b" : "#ef4444",
                    transition: "width 1s cubic-bezier(.4,0,.2,1)"
                  }} />
                </div>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>
                  Based on {jdKws.length} keywords extracted from the job description
                </p>
              </div>

              {/* Matched */}
              {matched.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                    <CheckCircle size={14} color="#10b981" />
                    <p style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)" }}>
                      Matched ({matched.length})
                    </p>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {matched.map(k => (
                      <span key={k} style={{
                        padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600,
                        background: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0"
                      }}>{k}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing */}
              {missing.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                    <AlertCircle size={14} color="#dc2626" />
                    <p style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)" }}>
                      Missing Keywords ({missing.length})
                    </p>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {missing.map(k => (
                      <span key={k} style={{
                        padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600,
                        background: "#fee2e2", color: "#b91c1c", border: "1px solid #fecaca"
                      }}>{k}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tip */}
              <div style={{
                background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.2)",
                borderRadius: 12, padding: "12px 16px", marginBottom: 16
              }}>
                <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.65 }}>
                  💡 <strong style={{ color: "var(--text-primary)" }}>Tip:</strong> Add the missing
                  keywords naturally into your experience or skills section to increase your
                  match score and pass ATS filters for this specific role.
                </p>
              </div>

              <button onClick={reset} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "9px 18px", borderRadius: 10,
                border: "1.5px solid var(--border)", background: "transparent",
                color: "var(--text-muted)", fontSize: 13, fontWeight: 600, cursor: "pointer"
              }}>
                <X size={13} /> Try Different JD
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JDMatcher;
