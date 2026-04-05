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
              AI Job Matcher <span style={{ fontSize: 10, background: "#6366f1", color: "#fff", padding: "2px 6px", borderRadius: 4, marginLeft: 6 }}>PRO</span>
            </p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 1 }}>
              {result
                ? `${matchScore}% match · ${result.keywords?.missing?.length || 0} gaps detected`
                : "Paste a specific JD for deep AI alignment analysis"}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {result && (
            <div style={{
              padding: "4px 12px", borderRadius: 99,
              background: matchScore >= 75 ? "#dcfce7" : matchScore >= 50 ? "#fef3c7" : "#fee2e2",
              color:      matchScore >= 75 ? "#15803d" : matchScore >= 50 ? "#d97706" : "#dc2626",
              fontSize: 12, fontWeight: 700
            }}>
              {matchScore}% Match
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

          {!result ? (
            /* Input state */
            <div style={{ paddingTop: 20 }}>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>
                Paste the full job description below. Groq AI will analyze your resume's visual content
                against these requirements to find hidden gaps.
              </p>
              <textarea
                value={jdText}
                onChange={e => setJdText(e.target.value)}
                placeholder="Paste job description here…&#10;&#10;e.g. We are looking for a Senior Frontend Developer..."
                style={{
                  width: "100%", minHeight: 160, padding: "14px 16px",
                  borderRadius: 12, border: "1.5px solid var(--border)",
                  background: "var(--main-bg)", color: "var(--text-primary)",
                  fontSize: 13, lineHeight: 1.65, resize: "vertical",
                  fontFamily: "'DM Sans',sans-serif", outline: "none",
                  transition: "border-color .2s"
                }}
                disabled={loading}
              />
              {error && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 8 }}>{error}</p>}
              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <button onClick={analyze} disabled={loading || !jdText.trim() || !file} style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "11px 22px", borderRadius: 11, border: "none",
                  background: (jdText.trim() && file)
                    ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
                    : "var(--progress-bg)",
                  color: (jdText.trim() && file) ? "#fff" : "var(--text-disabled)",
                  fontWeight: 700, fontSize: 13, cursor: (jdText.trim() && file) ? "pointer" : "default",
                  transition: "all .2s"
                }}>
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                  {loading ? "AI is matching..." : "Analyze Match"}
                </button>
                {!file && (
                  <p style={{ fontSize: 11, color: "#ef4444", display: "flex", alignItems: "center", gap: 4 }}>
                    <AlertCircle size={12} /> Upload a real resume first
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* Results state */
            <div style={{ paddingTop: 20 }}>
              {/* Explanation */}
              <div style={{ background: "rgba(99,102,241,0.05)", padding: 16, borderRadius: 12, marginBottom: 20, border: "1px solid rgba(99,102,241,0.1)" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <Sparkles size={16} color="#6366f1" style={{ marginTop: 2 }} />
                  <p style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.5 }}>
                    {result.explanation}
                  </p>
                </div>
              </div>

              {/* Score bar */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between",
                  alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>
                    AI Match Accuracy
                  </span>
                  <span style={{
                    fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22,
                    color: matchScore >= 75 ? "#10b981" : matchScore >= 50 ? "#f59e0b" : "#ef4444"
                  }}>{matchScore}%</span>
                </div>
                <div style={{ height: 10, background: "var(--progress-bg)", borderRadius: 99 }}>
                  <div style={{
                    height: "100%", borderRadius: 99,
                    width: `${matchScore}%`,
                    background: `linear-gradient(90deg, ${matchScore >= 75 ? "#10b981" : matchScore >= 50 ? "#f59e0b" : "#ef4444"}, #6366f1)`,
                    transition: "width 1s cubic-bezier(.4,0,.2,1)"
                  }} />
                </div>
              </div>

              {/* Keywords */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 12, color: "#10b981", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Matched</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {result.keywords.matched.map(k => (
                      <span key={k} style={{ padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: "#dcfce7", color: "#15803d" }}>{k}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 12, color: "#ef4444", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Gaps</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {result.keywords.missing.map(k => (
                      <span key={k} style={{ padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: "#fee2e2", color: "#b91c1c" }}>{k}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Adjustments */}
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontWeight: 700, fontSize: 12, color: "var(--text-muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Tailoring Suggestions</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {result.adjustments?.map((adj, i) => (
                    <div key={i} style={{ padding: 14, borderRadius: 12, border: "1px solid var(--border)", background: "var(--card-bg)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{adj.title}</span>
                        <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 6px", borderRadius: 4, background: adj.priority === "HIGH" ? "#fee2e2" : "#f1f5f9", color: adj.priority === "HIGH" ? "#ef4444" : "#64748b" }}>{adj.priority}</span>
                      </div>
                      <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 8 }}>{adj.suggestion}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#6366f1", fontWeight: 600 }}>
                        <MapPin size={12} /> {adj.location}
                      </div>
                    </div>
                  ))}
                </div>
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
      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default JDMatcher;