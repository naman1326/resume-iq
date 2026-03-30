import { useEffect, useRef } from "react";

/**
 * Confetti burst — fires when `trigger` turns true.
 * Auto-cleans up after animation completes.
 */
const Confetti = ({ trigger }) => {
  const canvasRef = useRef();

  useEffect(() => {
    if (!trigger) return;

    const canvas  = canvasRef.current;
    const ctx     = canvas.getContext("2d");
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const COLORS = [
      "#6366f1","#8b5cf6","#10b981","#f59e0b",
      "#ef4444","#ec4899","#06b6d4","#a78bfa"
    ];

    const pieces = Array.from({ length: 160 }, () => ({
      x:       Math.random() * canvas.width,
      y:       -20 - Math.random() * 200,
      w:       6  + Math.random() * 8,
      h:       10 + Math.random() * 10,
      color:   COLORS[Math.floor(Math.random() * COLORS.length)],
      rot:     Math.random() * Math.PI * 2,
      rotV:    (Math.random() - 0.5) * 0.18,
      vx:      (Math.random() - 0.5) * 3.5,
      vy:      2.5 + Math.random() * 4,
      opacity: 1,
      shape:   Math.random() > 0.5 ? "rect" : "circle",
    }));

    let frame;
    let elapsed = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      elapsed++;

      let alive = false;
      pieces.forEach((p) => {
        p.x   += p.vx;
        p.y   += p.vy;
        p.rot += p.rotV;
        p.vy  += 0.06; // gravity
        if (elapsed > 80) p.opacity = Math.max(0, p.opacity - 0.012);

        if (p.y < canvas.height + 40 && p.opacity > 0) alive = true;

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;

        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
        ctx.restore();
      });

      if (alive) frame = requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [trigger]);

  if (!trigger) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        pointerEvents: "none", width: "100%", height: "100%"
      }}
    />
  );
};

export default Confetti;
