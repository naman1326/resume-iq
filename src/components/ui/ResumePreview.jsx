import { useState } from "react";
import { FileText, X, Eye, EyeOff, AlertCircle, Info, Image, Lightbulb } from "lucide-react";
import { scoreColor } from "../../data/mockData";

/* ── Issue styles ── */
const issueStyle = {
  error: { icon: AlertCircle, color: "#dc2626", bg: "#fff5f5", border: "#fecaca", highlight: "#fee2e2" },
  warn:  { icon: AlertCircle, color: "#d97706", bg: "#fffbeb", border: "#fde68a", highlight: "#fef9c3" },
  info:  { icon: Info,        color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe", highlight: "#dbeafe" },
};

/* ── Find issues that match a given line ── */
const getLineIssues = (line, issues) => {
  if (!line || !line.trim()) return [];
  return issues.filter(issue => {
    if (!issue.quote || issue.quote.trim() === "") return false;
    const lineLower  = line.toLowerCase().trim();
    const quoteLower = issue.quote.toLowerCase().trim();
    // Match if the line contains the quote or the quote contains most of the line
    return lineLower.includes(quoteLower) ||
           quoteLower.includes(lineLower) ||
           similarity(lineLower, quoteLower) > 0.75;
  });
};

/* ── Simple similarity check (Jaccard on words) ── */
const similarity = (a, b) => {
  const setA = new Set(a.split(/\s+/));
  const setB = new Set(b.split(/\s+/));
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
};

/* ── Parse raw resume text into lines with section detection ── */
const SECTION_KEYWORDS = [
  "summary", "professional summary", "profile", "objective",
  "experience", "work experience", "employment", "work history",
  "skills", "technical skills", "core competencies", "technologies",
  "education", "academic", "qualifications",
  "achievements", "awards", "certifications", "projects", "accomplishments",
  "contact", "personal details",
];

const isHeading = (line) => {
  if (!line || line.trim().length === 0) return false;
  const t = line.trim();
  if (t === t.toUpperCase() && t.length > 2 && t.length < 60) return true;
  if (SECTION_KEYWORDS.some(k => t.toLowerCase().replace(/[^a-z ]/g,"") === k)) return true;
  return false;
};

const normPage = (p, fallback = 1) => {
  const n = Number(p);
  if (Number.isNaN(n) || n < 1) return fallback;
  return n;
};

/* ── Compact overlays on scanned pages (vision) ── */
const VisionOverlayIssue = ({ issue }) => {
  const s = issueStyle[issue.type] || issueStyle.info;
  const Icon = s.icon;
  return (
    <div style={{
      display: "flex", gap: 8, alignItems: "flex-start",
      padding: "8px 10px", borderRadius: 8,
      background: "rgba(255,255,255,0.97)",
      border: `1px solid ${s.border}`,
      borderLeft: `3px solid ${s.color}`,
      boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
    }}>
      <Icon size={14} color={s.color} style={{ flexShrink: 0, marginTop: 1 }} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.4, color: s.color, marginBottom: 3 }}>
          {(issue.type || "info").toUpperCase()}
        </div>
        <div style={{ fontSize: 12, color: "#1e293b", lineHeight: 1.45 }}>{issue.text}</div>
        {issue.quote ? (
          <div style={{
            fontSize: 11, color: "#64748b", marginTop: 5, lineHeight: 1.4,
            borderLeft: "2px solid #e2e8f0", paddingLeft: 8, fontStyle: "italic",
          }}>
            “{issue.quote}”
          </div>
        ) : null}
      </div>
    </div>
  );
};

const VisionOverlaySuggestion = ({ suggestion }) => {
  const tag = String(suggestion.tag || "MED").toUpperCase();
  const palette =
    tag === "HIGH" ? { c: "#b91c1c", bg: "#fef2f2", b: "#fecaca" }
    : tag === "LOW" ? { c: "#1d4ed8", bg: "#eff6ff", b: "#bfdbfe" }
    : { c: "#b45309", bg: "#fffbeb", b: "#fde68a" };
  return (
    <div style={{
      padding: "8px 10px", borderRadius: 8,
      background: palette.bg,
      border: `1px solid ${palette.b}`,
      borderLeft: `3px solid ${palette.c}`,
      boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
        <Lightbulb size={13} color={palette.c} />
        <span style={{ fontSize: 10, fontWeight: 800, color: palette.c }}>{tag}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{suggestion.title}</span>
      </div>
      <p style={{ fontSize: 11, color: "#475569", lineHeight: 1.45, margin: 0 }}>{suggestion.body}</p>
    </div>
  );
};

/* ── Annotation card ── */
const AnnotationCard = ({ issue }) => {
  const s    = issueStyle[issue.type] || issueStyle.info;
  const Icon = s.icon;
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 8,
      margin: "4px 0 4px 12px", padding: "8px 12px", borderRadius: 8,
      background: s.bg, border: `1px solid ${s.border}`,
      borderLeft: `3px solid ${s.color}`
    }}>
      <Icon size={13} color={s.color} style={{ flexShrink: 0, marginTop: 2 }} />
      <span style={{ fontSize: 12, color: "#374151", lineHeight: 1.6 }}>
        {issue.text}
      </span>
    </div>
  );
};

/* ════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════ */
const ResumePreview = ({ data }) => {
  const [open,            setOpen]            = useState(false);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [activeSection,   setActiveSection]   = useState(null);

  const issues        = data?.issues    || [];
  const sectionScores = data?.sections  || {};
  const filename      = data?.name ? `${data.name}'s Resume` : "Uploaded Resume";

  // Vision path: Groq analyzed images; optional previewImages = same JPEGs sent to the API
  const isVisionAnalysis = data?.resumeText?.includes("[Vision analysis");
  const previewImages =
    Array.isArray(data?.previewImages) && data.previewImages.length > 0
      ? data.previewImages
      : [];

  // Split resume text into lines (only if we have actual text)
  const lines = isVisionAnalysis
    ? []
    : (data?.resumeText || "")
        .split("\n")
        .map(l => l.trim())
        .filter(Boolean);

  // Issues WITH a quote (inline)
  const inlineIssues  = issues.filter(i => i.quote && i.quote.trim() !== "");
  // Issues WITHOUT a quote (general — shown at bottom)
  const generalIssues = issues.filter(i => !i.quote || i.quote.trim() === "");

  // Track which inline issues have already been rendered
  const renderedIssueIds = new Set();

  const errors   = issues.filter(i => i.type === "error");
  const warnings = issues.filter(i => i.type === "warn");
  const tips     = issues.filter(i => i.type === "info");
  const suggestions = data?.suggestions || [];

  const issuesForVisionPage = (idx) => {
    const n = idx + 1;
    return issues.filter((i) => normPage(i.page, 1) === n);
  };
  const suggestionsForVisionPage = (idx) => {
    const n = idx + 1;
    return suggestions.filter((s) => normPage(s.page, 1) === n);
  };

  return (
    <>
      {/* Trigger */}
      <button onClick={() => setOpen(true)} style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "10px 18px", borderRadius: 12,
        border: "1.5px solid var(--border)", background: "var(--card-bg)",
        cursor: "pointer", color: "var(--text-primary)",
        fontWeight: 600, fontSize: 13, boxShadow: "var(--card-shadow)"
      }}>
        <Eye size={14} /> Preview Resume
      </button>

      {/* Modal */}
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{
            position: "fixed", inset: 0, zIndex: 300,
            background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)"
          }} />

          <div style={{
            position: "fixed", inset: "24px", zIndex: 301,
            display: "flex", gap: 16, maxWidth: 1100,
            margin: "24px auto", animation: "scaleIn 0.25s ease"
          }}>

            {/* ── Left: Resume ── */}
            <div style={{
              flex: 1, background: "#fff", borderRadius: 20,
              overflow: "hidden", display: "flex", flexDirection: "column",
              boxShadow: "0 24px 80px rgba(0,0,0,0.3)"
            }}>
              {/* Header */}
              <div style={{
                padding: "14px 20px", background: "#f8fafc",
                borderBottom: "1px solid #e2e8f0",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                flexShrink: 0
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <FileText size={15} color="#6366f1" />
                  <span style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>
                    {filename}
                  </span>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>— Annotated View</span>
                </div>
                <button onClick={() => setShowAnnotations(a => !a)} style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "5px 12px", borderRadius: 8,
                  border: "1px solid #e2e8f0", background: "transparent",
                  color: "#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer"
                }}>
                  {showAnnotations ? <EyeOff size={12}/> : <Eye size={12}/>}
                  {showAnnotations ? "Hide" : "Show"} Annotations
                </button>
              </div>

              {/* Resume body — scanned pages, line-by-line text, or vision message */}
              <div style={{ flex: 1, overflowY: "auto", padding: "32px 36px" }}>
                {isVisionAnalysis && previewImages.length > 0 ? (
                  <div>
                    <p style={{
                      fontSize: 12, color: "#64748b", marginBottom: 20, lineHeight: 1.5,
                      padding: "10px 14px", borderRadius: 10, background: "#f1f5f9",
                      border: "1px solid #e2e8f0"
                    }}>
                      Same JPEGs sent to the model. Errors, warnings, and suggestions are overlaid at the bottom of each page (by AI-assigned page). Toggle “Annotations” in the header to hide overlays.
                    </p>
                    {previewImages.map((page, idx) => {
                      const mime = page.mimeType || "image/jpeg";
                      const src = `data:${mime};base64,${page.base64}`;
                      const pageIssues = showAnnotations ? issuesForVisionPage(idx) : [];
                      const pageSuggestions = showAnnotations ? suggestionsForVisionPage(idx) : [];
                      const hasOverlay = pageIssues.length > 0 || pageSuggestions.length > 0;
                      return (
                        <div
                          key={idx}
                          style={{
                            marginBottom: idx < previewImages.length - 1 ? 24 : 0,
                            borderRadius: 12,
                            overflow: "hidden",
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 4px 24px rgba(15,23,42,0.08)",
                            background: "#fff",
                          }}
                        >
                          <div style={{
                            padding: "8px 14px", fontSize: 11, fontWeight: 700,
                            letterSpacing: 0.5, color: "#64748b",
                            background: "#f8fafc", borderBottom: "1px solid #e2e8f0",
                            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
                          }}>
                            <span>Page {idx + 1} of {previewImages.length}</span>
                            {showAnnotations && hasOverlay && (
                              <span style={{ fontSize: 10, fontWeight: 600, color: "#6366f1" }}>
                                {pageIssues.length} issue{pageIssues.length !== 1 ? "s" : ""}
                                {pageSuggestions.length > 0
                                  ? ` · ${pageSuggestions.length} suggestion${pageSuggestions.length !== 1 ? "s" : ""}`
                                  : ""}
                              </span>
                            )}
                          </div>
                          <div style={{ position: "relative", lineHeight: 0 }}>
                            <img
                              src={src}
                              alt={`Resume page ${idx + 1}`}
                              style={{
                                width: "100%",
                                height: "auto",
                                display: "block",
                              }}
                            />
                            {showAnnotations && hasOverlay && (
                              <div style={{
                                position: "absolute",
                                left: 0,
                                right: 0,
                                bottom: 0,
                                maxHeight: "56%",
                                overflowY: "auto",
                                padding: "12px 8px 10px",
                                background: "linear-gradient(to top, rgba(15,23,42,0.96) 0%, rgba(15,23,42,0.72) 45%, rgba(15,23,42,0.2) 85%, transparent 100%)",
                                display: "flex",
                                flexDirection: "column",
                                gap: 8,
                              }}>
                                {pageIssues.length > 0 && (
                                  <div style={{
                                    fontSize: 10, fontWeight: 800, letterSpacing: 1.2,
                                    color: "rgba(255,255,255,0.88)",
                                  }}>
                                    ISSUES
                                  </div>
                                )}
                                {pageIssues.map((issue, j) => (
                                  <VisionOverlayIssue key={`issue-${idx}-${j}`} issue={issue} />
                                ))}
                                {pageSuggestions.length > 0 && (
                                  <div style={{
                                    fontSize: 10, fontWeight: 800, letterSpacing: 1.2,
                                    color: "rgba(255,255,255,0.88)",
                                    marginTop: pageIssues.length ? 2 : 0,
                                  }}>
                                    FIXES & SUGGESTIONS
                                  </div>
                                )}
                                {pageSuggestions.map((s, j) => (
                                  <VisionOverlaySuggestion key={`sug-${idx}-${j}`} suggestion={s} />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : isVisionAnalysis ? (
                  <div style={{ textAlign: "center", padding: "60px 20px" }}>
                    <div style={{
                      width: 80, height: 80, borderRadius: 20,
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      margin: "0 auto 24px"
                    }}>
                      <Image size={40} color="#fff" />
                    </div>
                    <h3 style={{
                      fontFamily: "'Syne',sans-serif", fontWeight: 700,
                      fontSize: 18, color: "#0f172a", marginBottom: 8
                    }}>
                      Vision-Based Analysis
                    </h3>
                    <p style={{ color: "#64748b", fontSize: 14, maxWidth: 400, margin: "0 auto 16px", lineHeight: 1.6 }}>
                      Your resume was analyzed as an image to preserve formatting, layout, and visual design cues. This ensures accurate detection of ATS-hostile elements and visual hierarchy issues.
                    </p>
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      padding: "8px 16px", borderRadius: 99,
                      background: "#f1f5f9", fontSize: 12, color: "#64748b",
                      fontWeight: 600
                    }}>
                      <Info size={14} />
                      No preview images in this response
                    </div>
                  </div>
                ) : lines.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 20px" }}>
                    <FileText size={40} color="#cbd5e1" style={{ marginBottom: 16 }} />
                    <p style={{ color: "#64748b", fontSize: 14 }}>
                      No resume text available. Upload a resume to see it here.
                    </p>
                  </div>
                ) : (
                  <>
                    {lines.map((line, idx) => {
                      const heading    = isHeading(line);
                      const lineIssues = showAnnotations
                        ? getLineIssues(line, inlineIssues).filter(issue => {
                            // Only render each issue once at its first matching line
                            const key = issue.quote + issue.text;
                            if (renderedIssueIds.has(key)) return false;
                            renderedIssueIds.add(key);
                            return true;
                          })
                        : [];

                      const hasIssue   = lineIssues.length > 0;
                      const issueType  = hasIssue ? lineIssues[0].type : null;
                      const hlStyle    = hasIssue ? issueStyle[issueType] : null;

                      return (
                        <div key={idx} style={{ marginBottom: heading ? 8 : 2 }}>
                          {/* The resume line */}
                          <div style={{
                            fontSize:      heading ? 11 : 13,
                            fontWeight:    heading ? 800 : 400,
                            letterSpacing: heading ? 2 : 0,
                            color:         heading ? "#0f172a" : "#334155",
                            fontFamily:    heading ? "'Syne',sans-serif" : "inherit",
                            lineHeight: 1.65,
                            padding: hasIssue ? "2px 6px" : "1px 0",
                            borderRadius: hasIssue ? 4 : 0,
                            background: hasIssue && showAnnotations
                              ? hlStyle.highlight
                              : "transparent",
                            transition: "background .2s",
                          }}>
                            {line}
                          </div>

                          {/* Inline annotation cards right below the matched line */}
                          {lineIssues.map((issue, i) => (
                            <AnnotationCard key={i} issue={issue} />
                          ))}
                        </div>
                      );
                    })}

                    {/* General issues (no specific line) at the bottom */}
                    {showAnnotations && generalIssues.length > 0 && (
                      <div style={{ marginTop: 32 }}>
                        <div style={{
                          display: "flex", alignItems: "center", gap: 12, marginBottom: 16
                        }}>
                          <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
                          <span style={{
                            fontSize: 11, fontWeight: 800, letterSpacing: 2,
                            color: "#6366f1", whiteSpace: "nowrap"
                          }}>GENERAL FEEDBACK</span>
                          <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
                        </div>
                        {generalIssues.map((issue, i) => (
                          <AnnotationCard key={i} issue={issue} />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* ── Right: Scores panel ── */}
            <div style={{ width: 300, display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Close */}
              <button onClick={() => setOpen(false)} style={{
                alignSelf: "flex-end", width: 36, height: 36, borderRadius: 10,
                background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
                cursor: "pointer", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <X size={16} />
              </button>

              <div style={{
                background: "var(--card-bg)", borderRadius: 18, padding: 20,
                boxShadow: "var(--card-shadow)", flex: 1, overflowY: "auto"
              }}>
                <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700,
                  fontSize: 14, color: "var(--text-primary)", marginBottom: 16 }}>
                  Section Scores
                </h3>

                {Object.entries(sectionScores).map(([key, score]) => (
                  <div key={key} style={{
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px", borderRadius: 10, marginBottom: 6,
                    background: "var(--main-bg)", border: "1px solid var(--border)"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%",
                        background: scoreColor(score) }} />
                      <span style={{ fontSize: 13, fontWeight: 600,
                        color: "var(--text-primary)", textTransform: "capitalize" }}>
                        {key}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 60, height: 5,
                        background: "var(--progress-bg)", borderRadius: 99 }}>
                        <div style={{ height: "100%", width: `${score}%`,
                          background: scoreColor(score), borderRadius: 99 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700,
                        color: scoreColor(score), width: 28, textAlign: "right" }}>
                        {score}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Overall */}
                {data?.overallScore && (
                  <div style={{
                    marginTop: 16, padding: "14px 16px", borderRadius: 12,
                    background: "linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.1))",
                    border: "1px solid rgba(99,102,241,0.2)"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                        Overall Score
                      </span>
                      <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800,
                        fontSize: 22, color: scoreColor(data.overallScore) }}>
                        {data.overallScore}
                      </span>
                    </div>
                  </div>
                )}

                {/* Issue counts */}
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)",
                    letterSpacing: 1, marginBottom: 10 }}>ISSUES FOUND</p>
                  {[
                    { label: "Errors",   items: errors,   color: "#dc2626", bg: "#fee2e2" },
                    { label: "Warnings", items: warnings, color: "#d97706", bg: "#fef3c7" },
                    { label: "Tips",     items: tips,     color: "#2563eb", bg: "#eff6ff" },
                  ].map(({ label, items, color, bg }) => (
                    <div key={label} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      marginBottom: 8, padding: "8px 12px", borderRadius: 8, background: bg
                    }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color }}>{label}</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color }}>{items.length}</span>
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)",
                    letterSpacing: 1, marginBottom: 10 }}>HIGHLIGHT LEGEND</p>
                  {[
                    { bg: "#fee2e2", border: "#fecaca", label: "Error — fix immediately"    },
                    { bg: "#fef9c3", border: "#fde68a", label: "Warning — recommended fix"  },
                    { bg: "#dbeafe", border: "#bfdbfe", label: "Tip — optional improvement" },
                  ].map(({ bg, border, label }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center",
                      gap: 8, marginBottom: 7 }}>
                      <div style={{ width: 16, height: 12, borderRadius: 3,
                        background: bg, border: `1px solid ${border}` }} />
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</span>
                    </div>
                  ))}
                </div>

                <p style={{ fontSize: 11, color: "var(--text-disabled)", marginTop: 12, lineHeight: 1.6 }}>
                  {previewImages.length > 0
                    ? "Issue quotes refer to text visible in the scanned preview on the left."
                    : "Highlighted lines in the resume show exactly where each issue is."}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
};

export default ResumePreview;
