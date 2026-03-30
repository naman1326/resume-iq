import Pill from "../ui/Pill";

const skillGroups = [
  {
    title: "✅ Matched Skills",
    sub: "Found in your resume",
    type: "matched",
    key: "matched"
  },
  {
    title: "❌ Missing Keywords",
    sub: "Common in job descriptions you're targeting",
    type: "missing",
    key: "missing"
  },
  {
    title: "⭐ Bonus Skills",
    sub: "Great differentiators — keep them!",
    type: "bonus",
    key: "bonus"
  }
];

const SkillsTab = ({ data }) => {
  const total = data.skills.matched.length + data.skills.missing.length + data.skills.bonus.length;
  const matchedPct = Math.round((data.skills.matched.length / total) * 100);
  const missingPct = Math.round((data.skills.missing.length / total) * 100);
  const bonusPct   = 100 - matchedPct - missingPct;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {skillGroups.map(({ title, sub, type, key }) => (
        <div key={type} style={{ background: "var(--card-bg)", borderRadius: 20,
          padding: 28, boxShadow: "var(--card-shadow)" }}>
          <div style={{ marginBottom: 14 }}>
            <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700,
              fontSize: 15, color: "var(--text-primary)" }}>{title}</h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>{sub}</p>
          </div>
          <div>
            {data.skills[key].map((s) => (
              <Pill key={s} text={s} type={type} />
            ))}
          </div>
        </div>
      ))}

      {/* Coverage bar */}
      <div style={{ background: "var(--card-bg)", borderRadius: 20,
        padding: 28, boxShadow: "var(--card-shadow)" }}>
        <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700,
          fontSize: 15, marginBottom: 16, color: "var(--text-primary)" }}>Keyword Coverage</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ flex: 1, height: 16, background: "var(--progress-bg)",
            borderRadius: 99, overflow: "hidden", display: "flex" }}>
            <div style={{ width: `${matchedPct}%`, background: "#10b981", height: "100%" }} />
            <div style={{ width: `${missingPct}%`, background: "#ef4444", height: "100%" }} />
            <div style={{ width: `${bonusPct}%`,   background: "#6366f1", height: "100%" }} />
          </div>
          <div style={{ display: "flex", gap: 16, flexShrink: 0 }}>
            {[["#10b981","Matched"],["#ef4444","Missing"],["#6366f1","Bonus"]].map(([c,l]) => (
              <div key={l} style={{ display: "flex", alignItems: "center",
                gap: 5, fontSize: 12, color: "var(--text-muted)" }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: c }} />
                {l}
              </div>
            ))}
          </div>
        </div>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 12 }}>
          {matchedPct}% keyword match — add missing skills to push past 80% and unlock more recruiter visibility.
        </p>
      </div>
    </div>
  );
};

export default SkillsTab;
