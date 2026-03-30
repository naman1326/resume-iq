import { useState, useEffect } from "react";
import { History, Trash2, TrendingUp, TrendingDown, Minus, ChevronRight } from "lucide-react";

const HISTORY_KEY = "resume_analyser_history";
const MAX_ENTRIES = 10;

/* ── helpers ── */
export const saveToHistory = (analysis) => {
  try {
    const existing = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    const entry = {
      id: Date.now(),
      date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      name: analysis.name,
      role: analysis.role,
      overallScore: analysis.overallScore,
      atsScore: analysis.atsScore,
      readabilityScore: analysis.readabilityScore,
      impactScore: analysis.impactScore,
    };
    const updated = [entry, ...existing].slice(0, MAX_ENTRIES);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Could not save history:", e);
  }
};

export const clearHistory = () => localStorage.removeItem(HISTORY_KEY);

const scoreColor = (s) => s >= 80 ? "#10b981" : s >= 60 ? "#f59e0b" : "#ef4444";

const TrendIcon = ({ current, previous }) => {
  if (!previous) return null;
  const diff = current - previous;
  if (diff > 0)  return <TrendingUp  size={13} color="#10b981" />;
  if (diff < 0)  return <TrendingDown size={13} color="#ef4444" />;
  return <Minus size={13} color="#64748b" />;
};

/* ── Main panel ── */
const ScoreHistory = ({ currentScore }) => {
  const [entries, setEntries] = useState([]);
  const [open, setOpen]       = useState(false);

  const load = () => {
    try {
      setEntries(JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"));
    } catch { setEntries([]); }
  };

  useEffect(() => { load(); }, [open]);

  const handleClear = () => {
    clearHistory();
    setEntries([]);
  };

  return (
    <>
      {/* Trigger button */}
      <button onClick={() => setOpen(true)} style={{
        display: "flex", alignItems: "center", gap: 7,
        padding: "10px 16px", borderRadius: 12,
        border: "1.5px solid var(--border)",
        background: "var(--card-bg)", cursor: "pointer",
        color: "var(--text-muted)", fontWeight: 600, fontSize: 13,
        boxShadow: "var(--card-shadow)", position: "relative"
      }}>
        <History size={14} />
        History
        {entries.length > 0 && (
          <span style={{
            background: "#6366f1", color: "#fff",
            fontSize: 10, fontWeight: 800,
            width: 17, height: 17, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>{entries.length}</span>
        )}
      </button>

      {/* Slide-over panel */}
      {open && (
        <>
          {/* Backdrop */}
          <div onClick={() => setOpen(false)} style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)"
          }} />

          {/* Panel */}
          <div style={{
            position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 201,
            width: 380, background: "var(--card-bg)",
            borderLeft: "1px solid var(--border)",
            display: "flex", flexDirection: "column",
            boxShadow: "-20px 0 60px rgba(0,0,0,0.2)",
            animation: "slideInRight 0.3s ease"
          }}>
            {/* Header */}
            <div style={{
              padding: "24px 24px 20px",
              borderBottom: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "space-between"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "rgba(99,102,241,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <History size={17} color="#6366f1" />
                </div>
                <div>
                  <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700,
                    fontSize: 16, color: "var(--text-primary)" }}>Scan History</h3>
                  <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    Last {MAX_ENTRIES} analyses
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {entries.length > 0 && (
                  <button onClick={handleClear} style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "6px 12px", borderRadius: 8,
                    border: "1px solid var(--border)", background: "transparent",
                    color: "#ef4444", fontSize: 12, fontWeight: 600, cursor: "pointer"
                  }}>
                    <Trash2 size={12} /> Clear
                  </button>
                )}
                <button onClick={() => setOpen(false)} style={{
                  padding: "6px 12px", borderRadius: 8,
                  border: "1px solid var(--border)", background: "transparent",
                  color: "var(--text-muted)", fontSize: 12, fontWeight: 600, cursor: "pointer"
                }}>Close</button>
              </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
              {entries.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px" }}>
                  <History size={40} color="var(--text-disabled)" style={{ marginBottom: 16 }} />
                  <p style={{ color: "var(--text-muted)", fontSize: 14, fontWeight: 600 }}>
                    No scans yet
                  </p>
                  <p style={{ color: "var(--text-disabled)", fontSize: 13, marginTop: 6 }}>
                    Your past analyses will appear here
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {entries.map((entry, i) => {
                    const prev = entries[i + 1];
                    const diff = prev ? entry.overallScore - prev.overallScore : null;
                    return (
                      <div key={entry.id} style={{
                        background: i === 0 ? "rgba(99,102,241,0.06)" : "var(--main-bg)",
                        border: `1px solid ${i === 0 ? "rgba(99,102,241,0.2)" : "var(--border)"}`,
                        borderRadius: 14, padding: "16px 18px",
                        transition: "all .2s"
                      }}>
                        {/* Top row */}
                        <div style={{ display: "flex", justifyContent: "space-between",
                          alignItems: "flex-start", marginBottom: 10 }}>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <p style={{ fontWeight: 700, fontSize: 14,
                                color: "var(--text-primary)" }}>{entry.name}</p>
                              {i === 0 && (
                                <span style={{ background: "#6366f1", color: "#fff",
                                  fontSize: 9, fontWeight: 700, padding: "2px 7px",
                                  borderRadius: 99, letterSpacing: 1 }}>LATEST</span>
                              )}
                            </div>
                            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                              {entry.role}
                            </p>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
                              <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800,
                                fontSize: 22, color: scoreColor(entry.overallScore) }}>
                                {entry.overallScore}
                              </span>
                              <TrendIcon current={entry.overallScore} previous={prev?.overallScore} />
                            </div>
                            {diff !== null && (
                              <p style={{ fontSize: 11, color: diff >= 0 ? "#10b981" : "#ef4444" }}>
                                {diff >= 0 ? "+" : ""}{diff} pts
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Mini scores row */}
                        <div style={{ display: "flex", gap: 6 }}>
                          {[
                            { label: "ATS",  value: entry.atsScore          },
                            { label: "Read", value: entry.readabilityScore  },
                            { label: "Impact",value: entry.impactScore      },
                          ].map(({ label, value }) => (
                            <div key={label} style={{
                              flex: 1, background: "var(--card-bg)",
                              border: "1px solid var(--border)",
                              borderRadius: 8, padding: "6px 8px", textAlign: "center"
                            }}>
                              <div style={{ fontSize: 13, fontWeight: 700,
                                color: scoreColor(value) }}>{value}</div>
                              <div style={{ fontSize: 10, color: "var(--text-disabled)",
                                fontWeight: 600 }}>{label}</div>
                            </div>
                          ))}
                        </div>

                        {/* Date */}
                        <p style={{ fontSize: 11, color: "var(--text-disabled)",
                          marginTop: 10 }}>{entry.date} · {entry.time}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default ScoreHistory;
