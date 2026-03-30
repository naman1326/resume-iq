import { useState, useEffect } from "react";
import { Download, BookOpen } from "lucide-react";
import Sidebar, { navItems }        from "../layout/Sidebar";
import OverviewTab                  from "../tabs/OverviewTab";
import ATSTab                       from "../tabs/ATSTab";
import SkillsTab                    from "../tabs/SkillsTab";
import IssuesTab                    from "../tabs/IssuesTab";
import SuggestionsTab               from "../tabs/SuggestionsTab";
import OnboardingTour, { TOUR_KEY } from "../ui/OnboardingTour";
import ScoreHistory, { saveToHistory } from "../ui/ScoreHistory";
import Confetti                     from "../ui/Confetti";
import ResumePreview                from "../ui/ResumePreview";
import JDMatcher                    from "../ui/JDMatcher";
import { mockAnalysis }             from "../../data/mockData";
import useMediaQuery                from "../../hooks/useMediaQuery";

/**
 * Dashboard receives `analysis` from App.jsx (real AI data).
 * Falls back to mockAnalysis if null (e.g. direct navigation in dev).
 */
const Dashboard = ({ analysis, onReset }) => {
  const data = analysis || mockAnalysis;

  const [tab,      setTab]      = useState("overview");
  const [showTour, setShowTour] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Save to history on mount
  useEffect(() => { saveToHistory(data); }, []);

  // First-visit tour
  useEffect(() => {
    if (!localStorage.getItem(TOUR_KEY)) {
      const t = setTimeout(() => setShowTour(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  // Confetti if score >= 85
  useEffect(() => {
    if (data.overallScore >= 85) {
      const t = setTimeout(() => {
        setConfetti(true);
        setTimeout(() => setConfetti(false), 4500);
      }, 900);
      return () => clearTimeout(t);
    }
  }, [data.overallScore]);

  const tabContent = {
    overview: <OverviewTab    data={data} />,
    ats:      <ATSTab         data={data} />,
    skills:   <SkillsTab      data={data} />,
    issues:   <IssuesTab      data={data} />,
    suggest:  <SuggestionsTab data={data} />,
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'DM Sans',sans-serif" }}>
      <Sidebar active={tab} setActive={setTab} onReset={onReset} />

      <main style={{
        flex: 1, background: "var(--main-bg)",
        padding: isMobile ? "76px 16px 32px" : "36px 40px",
        overflowY: "auto", minHeight: "100vh", transition: "background .3s"
      }}>
        {/* ── Top Bar ── */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12
        }}>
          <div>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800,
              fontSize: isMobile ? 20 : 24, color: "var(--text-primary)", marginBottom: 2 }}>
              {navItems.find(n => n.id === tab)?.label}
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
              {analysis ? `Analysed: ${data.name}` : "Demo mode — upload a real resume to get started"}
              {" · "}
              {new Date().toLocaleDateString("en-GB", {
                day: "numeric", month: "short", year: "numeric"
              })}
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <ScoreHistory currentScore={data.overallScore} />
            <ResumePreview data={data} />
            <button onClick={() => window.print()} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "10px 18px", borderRadius: 12,
              border: "1.5px solid var(--border)", background: "var(--card-bg)",
              cursor: "pointer", color: "var(--text-primary)",
              fontWeight: 600, fontSize: 13, boxShadow: "var(--card-shadow)"
            }}>
              <Download size={14} /> Export PDF
            </button>
            <button style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "10px 18px", borderRadius: 12, border: "none",
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              cursor: "pointer", color: "#fff", fontWeight: 600, fontSize: 13,
              boxShadow: "0 4px 16px rgba(99,102,241,.3)"
            }}>
              <BookOpen size={14} /> Full Report
            </button>
          </div>
        </div>

        {/* ── JD Matcher ── */}
        <JDMatcher />

        {/* ── Tab Content ── */}
        {tabContent[tab]}
      </main>

      <Confetti trigger={confetti} />
      {showTour && <OnboardingTour onDone={() => setShowTour(false)} />}

      <style>{`
        @media print {
          aside, button { display: none !important; }
          main { padding: 0 !important; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
