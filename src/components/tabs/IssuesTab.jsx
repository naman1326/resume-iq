import { AlertCircle, Info, ArrowUpRight } from "lucide-react";

const iconMap = {
  error: { icon: AlertCircle, color: "#dc2626", bg: "#fee2e2", label: "Error"   },
  warn:  { icon: AlertCircle, color: "#d97706", bg: "#fef3c7", label: "Warning" },
  info:  { icon: Info,        color: "#2563eb", bg: "#eff6ff", label: "Tip"     }
};

const IssuesTab = ({ data }) => {
  const counts = { error: 0, warn: 0, info: 0 };
  data.issues.forEach((i) => counts[i.type]++);

  return (
    <div>
      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
        {[
          ["error","#fee2e2","#dc2626"],
          ["warn", "#fef3c7","#d97706"],
          ["info", "#eff6ff","#2563eb"]
        ].map(([t,bg,c]) => (
          <div key={t} style={{ background: bg, borderRadius: 16, padding: "20px 24px",
            border: `1px solid ${c}22` }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 28,
              fontWeight: 800, color: c }}>{counts[t]}</div>
            <div style={{ fontSize: 13, color: c, fontWeight: 600, textTransform: "capitalize" }}>
              {iconMap[t].label}s
            </div>
          </div>
        ))}
      </div>

      {/* Issues list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {data.issues.map((issue, i) => {
          const m = iconMap[issue.type];
          const Icon = m.icon;
          return (
            <div key={i} style={{
              background: "var(--card-bg)", borderRadius: 16, padding: "18px 20px",
              boxShadow: "var(--card-shadow)", display: "flex",
              alignItems: "center", gap: 14, borderLeft: `4px solid ${m.color}`
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: m.bg,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={18} color={m.color} />
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: m.color,
                  letterSpacing: 1, display: "block", marginBottom: 2 }}>
                  {m.label.toUpperCase()}
                </span>
                <p style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 500 }}>
                  {issue.text}
                </p>
              </div>
              <ArrowUpRight size={16} color="var(--icon-color)" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IssuesTab;
