import { useState, useEffect, useRef } from "react";

/**
 * AnimatedNumber
 * Counts up from 0 to `value` when it enters the viewport.
 * Props:
 *   value    — target number
 *   suffix   — string appended after number (e.g. "%", "/100")
 *   duration — animation duration in ms (default 1400)
 *   decimals — decimal places (default 0)
 */
const AnimatedNumber = ({ value, suffix = "", duration = 1400, decimals = 0, skipAnimation = false }) => {
  const [display, setDisplay] = useState(skipAnimation ? value : 0);
  const [started, setStarted]  = useState(skipAnimation);
  const ref = useRef();

  // Trigger on intersection
  useEffect(() => {
    if (skipAnimation) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  // Animate count
  useEffect(() => {
    if (!started) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(parseFloat((eased * value).toFixed(decimals)));
      if (progress < 1) requestAnimationFrame(step);
      else setDisplay(value);
    };
    requestAnimationFrame(step);
  }, [started, value, duration, decimals]);

  return (
    <span ref={ref}>
      {decimals > 0 ? display.toFixed(decimals) : Math.floor(display)}
      {suffix}
    </span>
  );
};

export default AnimatedNumber;
