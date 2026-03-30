import { Award, Zap } from "lucide-react";
import Badge from "../ui/Badge";

const SuggestionsTab = ({ data }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    {/* Banner */}
    <div style={{
      background: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
      borderRadius: 16, padding: "18px 24px",
      display: "flex", alignItems: "center", gap: 12,
      border: "1px solid #bbf7d0", marginBottom: 8
    }}>
      <Award size={22} color="#16a34a" />
      <div>
        <p style={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>
          {data.suggestions.length} AI-generated suggestions ready
        </p>
        <p style={{ fontSize: 13, color: "#64748b" }}>
          Implementing all suggestions could raise your score by ~18 points.
        </p>
      </div>
    </div>

    {/* Cards */}
    {data.suggestions.map((s, i) => (
      <div key={i} style={{ background: "var(--card-bg)", borderRadius: 20,
        padding: 28, boxShadow: "var(--card-shadow)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <Badge type={s.tag} />
          <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700,
            fontSize: 16, color: "var(--text-primary)" }}>{s.title}</h3>
        </div>
        <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7 }}>{s.body}</p>
        <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
          <button style={{
            padding: "8px 18px", borderRadius: 10, border: "none",
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6
          }}>
            <Zap size={13} /> Apply Fix
          </button>
          <button style={{
            padding: "8px 18px", borderRadius: 10,
            border: "1.5px solid var(--border)", background: "transparent",
            color: "var(--text-muted)", fontWeight: 600, fontSize: 13, cursor: "pointer"
          }}>
            Learn More
          </button>
        </div>
      </div>
    ))}
  </div>
);

export default SuggestionsTab;
