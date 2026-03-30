import { useState, useEffect } from "react";
import { scoreColor } from "../../data/mockData";

const ScoreRing = ({ score, size = 140, stroke = 10 }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const [anim, setAnim] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnim(score), 400);
    return () => clearTimeout(t);
  }, [score]);

  const offset = circ - (anim / 100) * circ;
  const color = scoreColor(score);

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke="var(--ring-bg)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeDasharray={circ}
        strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }} />
    </svg>
  );
};

export default ScoreRing;
