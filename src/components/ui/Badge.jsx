const BADGE_STYLES = {
  HIGH: { bg: "#fee2e2", color: "#dc2626" },
  MED:  { bg: "#fef3c7", color: "#d97706" },
  LOW:  { bg: "#dcfce7", color: "#16a34a" }
};

const Badge = ({ type }) => {
  const s = BADGE_STYLES[type] || BADGE_STYLES.LOW;
  return (
    <span style={{
      background: s.bg, color: s.color,
      fontSize: 10, fontWeight: 700,
      padding: "2px 8px", borderRadius: 99, letterSpacing: 1
    }}>
      {type}
    </span>
  );
};

export default Badge;
