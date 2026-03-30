import { useState, useEffect } from "react";
import { X, ArrowRight, Lightbulb } from "lucide-react";

const TOUR_KEY = "resume_analyser_tour_done";

const steps = [
  {
    target: "nav-overview",
    title: "Overview",
    body: "See your overall score, radar chart of all skill dimensions, and score trend over time.",
    position: "right"
  },
  {
    target: "nav-ats",
    title: "ATS Check",
    body: "Find out if your resume passes Applicant Tracking System filters before a human sees it.",
    position: "right"
  },
  {
    target: "nav-skills",
    title: "Skills Gap",
    body: "See matched, missing, and bonus keywords compared to your target role's job descriptions.",
    position: "right"
  },
  {
    target: "nav-issues",
    title: "Issues",
    body: "Errors, warnings, and tips are colour-coded by severity so you know what to fix first.",
    position: "right"
  },
  {
    target: "nav-suggest",
    title: "Suggestions",
    body: "AI-generated, prioritised suggestions. Each one tells you exactly what to change and why.",
    position: "right"
  },
];

const Tooltip = ({ step, index, total, onNext, onSkip }) => {
  const el = document.getElementById(step.target);
  if (!el) return null;

  const rect = el.getBoundingClientRect();
  const top  = rect.top + rect.height / 2 - 80;
  const left = rect.right + 16;

  return (
    <>
      {/* Backdrop */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 998,
        background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)"
      }} onClick={onSkip} />

      {/* Highlight ring around target */}
      <div style={{
        position: "fixed", zIndex: 999,
        top: rect.top - 4, left: rect.left - 4,
        width: rect.width + 8, height: rect.height + 8,
        borderRadius: 12, border: "2px solid #6366f1",
        boxShadow: "0 0 0 4px rgba(99,102,241,0.2)",
        pointerEvents: "none"
      }} />

      {/* Tooltip box */}
      <div style={{
        position: "fixed", zIndex: 1000,
        top, left,
        width: 280, background: "#0f172a",
        border: "1px solid rgba(99,102,241,0.4)",
        borderRadius: 16, padding: 20,
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        animation: "tooltipIn 0.25s ease"
      }}>
        {/* Arrow */}
        <div style={{
          position: "absolute", left: -8, top: 22,
          width: 0, height: 0,
          borderTop: "8px solid transparent",
          borderBottom: "8px solid transparent",
          borderRight: "8px solid rgba(99,102,241,0.4)"
        }} />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center",
          justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: "rgba(99,102,241,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Lightbulb size={14} color="#818cf8" />
            </div>
            <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700,
              fontSize: 14, color: "#fff" }}>{step.title}</span>
          </div>
          <button onClick={onSkip} style={{
            background: "none", border: "none", cursor: "pointer", color: "#64748b", padding: 2
          }}>
            <X size={14} />
          </button>
        </div>

        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13,
          lineHeight: 1.65, marginBottom: 16 }}>{step.body}</p>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: "#475569" }}>
            {index + 1} of {total}
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={onSkip} style={{
              padding: "6px 12px", borderRadius: 8, border: "1px solid #1e293b",
              background: "transparent", color: "#64748b",
              fontSize: 12, fontWeight: 600, cursor: "pointer"
            }}>Skip</button>
            <button onClick={onNext} style={{
              padding: "6px 14px", borderRadius: 8, border: "none",
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 5
            }}>
              {index === total - 1 ? "Done" : "Next"}
              {index < total - 1 && <ArrowRight size={11} />}
            </button>
          </div>
        </div>

        {/* Progress dots */}
        <div style={{ display: "flex", gap: 5, justifyContent: "center", marginTop: 14 }}>
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} style={{
              width: i === index ? 18 : 6, height: 6, borderRadius: 99,
              background: i === index ? "#6366f1" : "#1e293b",
              transition: "all .3s"
            }} />
          ))}
        </div>
      </div>
    </>
  );
};

const OnboardingTour = ({ onDone }) => {
  const [step, setStep] = useState(0);

  const finish = () => {
    localStorage.setItem(TOUR_KEY, "true");
    onDone();
  };

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else finish();
  };

  return (
    <>
      <style>{`
        @keyframes tooltipIn {
          from { opacity: 0; transform: translateX(-10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
      <Tooltip
        step={steps[step]}
        index={step}
        total={steps.length}
        onNext={next}
        onSkip={finish}
      />
    </>
  );
};

export { TOUR_KEY };
export default OnboardingTour;
