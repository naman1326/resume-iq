import { useState } from "react";
import { Target, ChevronDown, ChevronUp, Zap, X, CheckCircle, AlertCircle, Loader2, Sparkles, MapPin } from "lucide-react";

/*
 * Dev (`npm run dev`): always use same-origin `/api` so Vite’s proxy talks to the backend.
 */
const API_BASE = import.meta.env.DEV
  ? ""
  : (import.meta.env.VITE_API_URL ?? "http://localhost:3001");

const JDMatcher = ({ file }) => {
  const [open,     setOpen]     = useState(false);
  const [jdText,   setJdText]   = useState("");
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState(null);
  const [error,    setError]    = useState(null);

  const analyze = async () => {
    if (!jdText.trim() || !file) return;
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("jdText", jdText);

      const url = `${API_BASE}/api/match`;
      const res = await fetch(url, { method: "POST", body: formData });
      const json = await res.json();

      if (!json.success) throw new Error(json.error || "Matching failed");
      setResult(json.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setJdText(""); setResult(null); setError(null); };

  const matchScore = result?.matchScore || 0;

  return (
    <div style={{
      background: "var(--card-bg)", borderRadius: 24,
      border: "1px solid var(--border)",
      boxShadow: "var(--card-shadow)", padding: 32, minHeight: "calc(100vh - 200px)"
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 32, paddingBottom: 24, borderBottom: "1px solid var(--border)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: "rgba(99,102,241,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Target size={24} color="#6366f1" />
          </div>
          <div>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800,
              fontSize: 22, color: "var(--text-primary)" }}>
              AI Job Matcher
            </h2>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 2 }}>
              Paste a specific job description to analyze how well your resume aligns with the role.
            </p>
          </div>
        </div>
        {result && (
          <div style={{
            padding: "8px 20px", borderRadius: 99,
            background: matchScore >= 75 ? "#dcfce7" : matchScore >= 50 ? "#fef3c7" : "#fee2e2",
            color:      matchScore >= 75 ? "#15803d" : matchScore >= 50 ? "#d97706" : "#dc2626",
            fontSize: 14, fontWeight: 800, display: "flex", alignItems: "center", gap: 8
          }}>
            <Sparkles size={16} /> {matchScore}% Match
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ width: "100%", maxWidth: 800, margin: "0 auto" }}>
        {!result ? (
          /* Input state */
          <div>
            <div style={{
              background: "rgba(99,102,241,0.05)", padding: 20,
              borderRadius: 16, border: "1px solid rgba(99,102,241,0.1)",
              marginBottom: 24
            }}>
              <p style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.6 }}>
                Our AI-powered model will analyze your resume's visual layout and semantic content
                against the job requirements below to identify hidden keyword gaps and
                tailoring opportunities.
              </p>
            </div>

            <label style={{ display: "block", fontWeight: 700, fontSize: 14, color: "var(--text-primary)", marginBottom: 10 }}>
              Job Description
            </label>
            <textarea
              value={jdText}
              onChange={e => setJdText(e.target.value)}
              placeholder="Paste the full job description here…&#10;&#10;e.g. We are looking for a Senior Frontend Developer with 5+ years of experience in React, TypeScript, and CSS-in-JS..."
              style={{
                width: "100%", minHeight: 280, padding: "18px 20px",
                borderRadius: 16, border: "1.5px solid var(--border)",
                background: "var(--main-bg)", color: "var(--text-primary)",
                fontSize: 14, lineHeight: 1.7, resize: "vertical",
                fontFamily: "'DM Sans',sans-serif", outline: "none",
                transition: "border-color .2s", marginBottom: 20
              }}
              disabled={loading}
            />
            
            {error && (
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: 14, borderRadius: 12, background: "#fff5f5",
                border: "1px solid #fecaca", marginBottom: 20
              }}>
                <AlertCircle size={16} color="#dc2626" />
                <p style={{ color: "#dc2626", fontSize: 13, fontWeight: 600 }}>{error}</p>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <button onClick={analyze} disabled={loading || !jdText.trim() || !file} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "14px 32px", borderRadius: 12, border: "none",
                background: (jdText.trim() && file)
                  ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
                  : "var(--progress-bg)",
                color: (jdText.trim() && file) ? "#fff" : "var(--text-disabled)",
                fontWeight: 700, fontSize: 15, cursor: (jdText.trim() && file) ? "pointer" : "default",
                transition: "all .2s", boxShadow: (jdText.trim() && file) ? "0 4px 16px rgba(99,102,241,.35)" : "none"
              }}>
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
                {loading ? "Analyzing Alignment..." : "Match My Resume"}
              </button>
              {!file && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#ef4444" }}>
                  <AlertCircle size={16} />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Upload a real resume first</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Results state */
          <div>
            {/* Explanation */}
            <div style={{
              background: "rgba(99,102,241,0.05)", padding: 24,
              borderRadius: 16, marginBottom: 32, border: "1px solid rgba(99,102,241,0.1)"
            }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <Sparkles size={20} color="#6366f1" style={{ marginTop: 2, flexShrink: 0 }} />
                <p style={{ fontSize: 15, color: "var(--text-primary)", lineHeight: 1.6, fontWeight: 500 }}>
                  {result.explanation}
                </p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 32 }}>
              {/* Score breakdown */}
              <div>
                <h3 style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)", marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 }}>Alignment Score</h3>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginBottom: 12 }}>
                  <span style={{
                    fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 42, lineHeight: 1,
                    color: matchScore >= 75 ? "#10b981" : matchScore >= 50 ? "#f59e0b" : "#ef4444"
                  }}>{matchScore}%</span>
                  <span style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 600, marginBottom: 6 }}>Keyword Match</span>
                </div>
                <div style={{ height: 12, background: "var(--progress-bg)", borderRadius: 99 }}>
                  <div style={{
                    height: "100%", borderRadius: 99,
                    width: `${matchScore}%`,
                    background: `linear-gradient(90deg, ${matchScore >= 75 ? "#10b981" : matchScore >= 50 ? "#f59e0b" : "#ef4444"}, #6366f1)`,
                    transition: "width 1s cubic-bezier(.4,0,.2,1)"
                  }} />
                </div>
              </div>

              {/* Keywords summary */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 12, color: "#10b981", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Top Matched Keywords</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {result.keywords.matched.slice(0, 8).map(k => (
                      <span key={k} style={{ padding: "4px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: "#dcfce7", color: "#15803d" }}>{k}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 12, color: "#ef4444", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Missing High-Priority Keywords</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {result.keywords.missing.slice(0, 8).map(k => (
                      <span key={k} style={{ padding: "4px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: "#fee2e2", color: "#b91c1c" }}>{k}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Adjustments */}
            <div style={{ marginBottom: 40 }}>
              <h3 style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)", marginBottom: 20, textTransform: "uppercase", letterSpacing: 1 }}>Required Tailoring</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {result.adjustments?.map((adj, i) => (
                  <div key={i} style={{ padding: 20, borderRadius: 16, border: "1.5px solid var(--border)", background: "var(--card-bg)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{adj.title}</span>
                      <span style={{ fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 6, background: adj.priority === "HIGH" ? "#fee2e2" : "var(--icon-bg)", color: adj.priority === "HIGH" ? "#ef4444" : "var(--text-muted)" }}>{adj.priority} PRIORITY</span>
                    </div>
                    <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 14 }}>{adj.suggestion}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6366f1", fontWeight: 700 }}>
                      <MapPin size={14} /> Location: {adj.location}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={reset} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "12px 24px", borderRadius: 12,
              border: "1.5px solid var(--border)", background: "var(--card-bg)",
              color: "var(--text-primary)", fontSize: 14, fontWeight: 700, cursor: "pointer",
              transition: "all .2s"
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#6366f1"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
            >
              <X size={16} /> Analyze Another Role
            </button>
          </div>
        )}
      </div>
      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default JDMatcher;