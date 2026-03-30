import { useState, useRef } from "react";
import { Upload, CheckCircle, X, Zap, AlertCircle, Sun, Moon, PlayCircle } from "lucide-react";
import ScoreRing from "../ui/ScoreRing";
import { useTheme } from "../../context/ThemeContext";
import { mockAnalysis } from "../../data/mockData";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const STEPS = [
  "Parsing document structure",
  "Running ATS simulation",
  "Scoring sections",
  "Generating insights",
];

const UploadPage = ({ onAnalyze }) => {
  const [dragging, setDragging] = useState(false);
  const [file,     setFile]     = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [progress, setProgress] = useState(0);
  const [error,    setError]    = useState(null);
  const inputRef = useRef();
  const { dark, toggle } = useTheme();

  const handleFile = (f) => {
    if (f) { setFile(f); setError(null); }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  /* ── Load demo instantly — no API call ── */
  const loadDemo = () => {
    setLoading(true);
    setProgress(0);
    let p = 0;
    const iv = setInterval(() => {
      p += 12 + Math.random() * 10;
      if (p < 95) setProgress(Math.round(p));
    }, 200);
    setTimeout(() => {
      clearInterval(iv);
      setProgress(100);
      setTimeout(() => onAnalyze(mockAnalysis), 400);
    }, 1800);
  };

  /* ── Real resume — sends to backend API ── */
  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setProgress(0);

    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 8;
      if (p < 85) setProgress(Math.round(p));
    }, 300);

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const res  = await fetch(`${API_URL}/api/analyze`, { method: "POST", body: formData });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Analysis failed. Please try again.");
      }

      clearInterval(iv);
      setProgress(100);
      setTimeout(() => onAnalyze(json.data), 500);

    } catch (err) {
      clearInterval(iv);
      setLoading(false);
      setProgress(0);
      setError(err.message);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "40px 20px",
      background: "var(--upload-bg)", transition: "background .3s"
    }}>
      {/* Theme toggle */}
      <button onClick={toggle} style={{
        position: "fixed", top: 20, right: 24,
        display: "flex", alignItems: "center", gap: 6,
        padding: "8px 16px", borderRadius: 99,
        border: "1.5px solid var(--border)", background: "var(--card-bg)",
        color: "var(--text-muted)", cursor: "pointer", fontWeight: 600, fontSize: 13,
        boxShadow: "0 2px 12px rgba(0,0,0,.07)"
      }}>
        {dark ? <Sun size={14} /> : <Moon size={14} />}
        {dark ? "Light" : "Dark"}
      </button>

      {/* Logo */}
      <div style={{ marginBottom: 48, textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10,
          justifyContent: "center", marginBottom: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Zap size={22} color="#fff" />
          </div>
          <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 26,
            fontWeight: 800, letterSpacing: -1, color: "var(--text-primary)" }}>
            Resume Analyser
          </span>
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: 15, maxWidth: 400, margin: "0 auto" }}>
          AI-powered resume analysis. Get a detailed score, ATS feedback,
          and actionable suggestions in seconds.
        </p>
      </div>

      {/* Card */}
      <div style={{
        width: "100%", maxWidth: 560, borderRadius: 24, padding: 40,
        background: "var(--card-bg)", boxShadow: "var(--card-shadow)"
      }}>
        {!loading ? (
          <>
            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current.click()}
              style={{
                border: `2px dashed ${dragging ? "#6366f1" : file ? "#10b981" : "var(--border)"}`,
                borderRadius: 16, padding: "48px 24px", textAlign: "center",
                cursor: "pointer", transition: "all .25s",
                background: dragging ? "#f5f3ff" : file ? "#f0fdf4" : "var(--dropzone-bg)"
              }}
            >
              <input ref={inputRef} type="file" accept=".pdf,.doc,.docx"
                style={{ display: "none" }}
                onChange={(e) => handleFile(e.target.files[0])} />

              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: file ? "#dcfce7" : "var(--icon-bg)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px"
              }}>
                {file
                  ? <CheckCircle size={32} color="#10b981" />
                  : <Upload size={32} color="var(--icon-color)" />}
              </div>

              {file ? (
                <>
                  <p style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
                    {file.name}
                  </p>
                  <p style={{ color: "#10b981", fontSize: 13 }}>
                    {(file.size / 1024).toFixed(1)} KB — Ready to analyse
                  </p>
                </>
              ) : (
                <>
                  <p style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
                    Drop your resume here
                  </p>
                  <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
                    PDF, DOC, DOCX — up to 5 MB
                  </p>
                </>
              )}
            </div>

            {/* Error */}
            {error && (
              <div style={{
                display: "flex", alignItems: "flex-start", gap: 10,
                marginTop: 14, padding: "12px 16px", borderRadius: 12,
                background: "#fff5f5", border: "1px solid #fecaca"
              }}>
                <AlertCircle size={16} color="#dc2626" style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 13, color: "#dc2626", lineHeight: 1.5 }}>{error}</p>
              </div>
            )}

            {/* Action buttons */}
            {file ? (
              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                <button onClick={() => { setFile(null); setError(null); }} style={{
                  flex: 1, padding: "12px 0", border: "1.5px solid var(--border)",
                  borderRadius: 12, background: "transparent", cursor: "pointer",
                  color: "var(--text-muted)", fontWeight: 600, fontSize: 14,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                }}>
                  <X size={15} /> Remove
                </button>
                <button onClick={analyze} style={{
                  flex: 2, padding: "12px 0", border: "none", borderRadius: 12,
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  cursor: "pointer", color: "#fff", fontWeight: 700, fontSize: 15,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: "0 4px 20px rgba(99,102,241,.35)"
                }}>
                  <Zap size={16} /> Analyse Resume
                </button>
              </div>
            ) : (
              /* Demo button — only shown when no file selected */
              <button onClick={loadDemo} style={{
                width: "100%", marginTop: 14, padding: "13px 0",
                border: "1.5px solid var(--border)", borderRadius: 12,
                background: "transparent", cursor: "pointer",
                color: "var(--text-muted)", fontWeight: 600, fontSize: 14,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all .2s"
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "#6366f1";
                  e.currentTarget.style.color = "#6366f1";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.color = "var(--text-muted)";
                }}
              >
                <PlayCircle size={16} /> View Demo Results
              </button>
            )}

            {/* Stats */}
            <div style={{ display: "flex", marginTop: 32,
              borderTop: "1px solid var(--border)", paddingTop: 24 }}>
              {[["50K+","Resumes Analysed"],["94%","Accuracy Rate"],["2s","Average Time"]].map(([v,l], i) => (
                <div key={i} style={{
                  flex: 1, textAlign: "center",
                  borderRight: i < 2 ? "1px solid var(--border)" : "none"
                }}>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20,
                    fontWeight: 800, color: "#6366f1" }}>{v}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Loading */
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ position: "relative", width: 100, height: 100, margin: "0 auto 24px" }}>
              <ScoreRing score={progress} size={100} stroke={8} />
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 18, color: "#6366f1"
              }}>
                {progress}%
              </div>
            </div>
            <p style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
              {file ? "Analysing your resume..." : "Loading demo results..."}
            </p>
            {STEPS.map((step, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 8, justifyContent: "center",
                color: progress > i * 25 ? "#10b981" : "var(--text-disabled)",
                fontSize: 13, marginBottom: 4, transition: "color .4s"
              }}>
                <CheckCircle size={14} /> {step}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPage;
