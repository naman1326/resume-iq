const PILL_STYLES = {
  matched: { bg: "#dcfce7", color: "#15803d", border: "#bbf7d0" },
  missing: { bg: "#fee2e2", color: "#b91c1c", border: "#fecaca" },
  bonus:   { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" }
};

const Pill = ({ text, type }) => {
  const s = PILL_STYLES[type];
  return (
    <span style={{
      display: "inline-block", padding: "5px 14px", borderRadius: 99,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      fontSize: 13, fontWeight: 600, margin: "4px"
    }}>
      {text}
    </span>
  );
};

export default Pill;
