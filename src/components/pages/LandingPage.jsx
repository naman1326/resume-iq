import { useState, useEffect, useRef } from "react";
import {
  Zap, ArrowRight, CheckCircle, Star, Upload,
  BarChart2, Shield, Layers, ChevronDown, Menu, X,
  TrendingUp, FileText, Award, Users, Clock, Sparkles
} from "lucide-react";

/* ── Animated counter ── */
const Counter = ({ target, suffix = "", duration = 1800 }) => {
  const [val, setVal] = useState(0);
  const ref = useRef();
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let start = null;
      const step = (ts) => {
        if (!start) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        setVal(Math.floor(ease * target));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
};

/* ── Fade-in on scroll ── */
const FadeIn = ({ children, delay = 0, style = {} }) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef();
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(28px)",
      transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      ...style
    }}>
      {children}
    </div>
  );
};

/* ════════ NAVBAR ════════ */
const Navbar = ({ onGetStarted }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      padding: "0 48px", height: 68,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: scrolled ? "rgba(5,8,15,0.92)" : "transparent",
      backdropFilter: scrolled ? "blur(16px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
      transition: "all 0.4s ease"
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 9,
          background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <Zap size={17} color="#fff" />
        </div>
        <span style={{
          fontFamily: "'Syne',sans-serif", fontWeight: 800,
          fontSize: 19, color: "#fff", letterSpacing: -.5
        }}>Resume Analyser</span>
      </div>

      {/* Desktop links */}
      <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
        {["Features","How It Works","Pricing","FAQ"].map(l => (
          <a key={l} href={`#${l.toLowerCase().replace(/ /g,"-")}`} style={{
            color: "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: 500,
            textDecoration: "none", transition: "color .2s"
          }}
            onMouseEnter={e => e.target.style.color="#fff"}
            onMouseLeave={e => e.target.style.color="rgba(255,255,255,0.6)"}
          >{l}</a>
        ))}
      </div>

      {/* CTA */}
      <button onClick={onGetStarted} style={{
        padding: "9px 22px", borderRadius: 10, border: "none",
        background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
        color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
        boxShadow: "0 4px 16px rgba(99,102,241,.4)"
      }}>
        Get Started Free
      </button>
    </nav>
  );
};

/* ════════ HERO ════════ */
const Hero = ({ onGetStarted }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const fn = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", fn);
    return () => window.removeEventListener("mousemove", fn);
  }, []);

  return (
    <section style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
      background: "#05080f", padding: "120px 24px 80px"
    }}>
      {/* Animated gradient orbs */}
      <div style={{
        position: "absolute", width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)",
        top: "10%", left: "50%", transform: "translateX(-50%)",
        filter: "blur(40px)", pointerEvents: "none"
      }} />
      <div style={{
        position: "absolute", width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
        bottom: "10%", right: "10%", filter: "blur(60px)", pointerEvents: "none",
        transform: `translate(${(mousePos.x - window.innerWidth/2) * 0.02}px, ${(mousePos.y - window.innerHeight/2) * 0.02}px)`,
        transition: "transform 0.8s ease"
      }} />
      <div style={{
        position: "absolute", width: 300, height: 300, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)",
        top: "30%", left: "5%", filter: "blur(50px)", pointerEvents: "none"
      }} />

      {/* Grid texture */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px"
      }} />

      {/* Badge */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "7px 18px", borderRadius: 99,
        border: "1px solid rgba(99,102,241,0.4)",
        background: "rgba(99,102,241,0.1)",
        marginBottom: 32, animation: "fadeSlideDown 0.8s ease forwards"
      }}>
        <Sparkles size={13} color="#a5b4fc" />
        <span style={{ fontSize: 12, fontWeight: 600, color: "#a5b4fc", letterSpacing: 1 }}>
          AI-POWERED RESUME INTELLIGENCE
        </span>
      </div>

      {/* Headline */}
      <h1 style={{
        fontFamily: "'Syne',sans-serif", fontWeight: 800, textAlign: "center",
        fontSize: "clamp(42px, 7vw, 88px)", lineHeight: 1.05,
        letterSpacing: -3, maxWidth: 880, marginBottom: 28,
        animation: "fadeSlideDown 0.9s ease 0.1s both"
      }}>
        <span style={{ color: "#fff" }}>Your Resume,</span>
        <br />
        <span style={{
          background: "linear-gradient(135deg, #818cf8, #c084fc, #f472b6)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
        }}>Brutally Honest</span>
        <br />
        <span style={{ color: "#fff" }}>Feedback.</span>
      </h1>

      {/* Subheadline */}
      <p style={{
        color: "rgba(255,255,255,0.5)", fontSize: 18, maxWidth: 520,
        textAlign: "center", lineHeight: 1.7, marginBottom: 48,
        animation: "fadeSlideDown 1s ease 0.2s both"
      }}>
        Get an ATS score, skills gap analysis, and AI-generated suggestions
        that help you land more interviews — in under 30 seconds.
      </p>

      {/* CTAs */}
      <div style={{
        display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center",
        animation: "fadeSlideDown 1s ease 0.3s both"
      }}>
        <button onClick={onGetStarted} style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "16px 32px", borderRadius: 14, border: "none",
          background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
          color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer",
          boxShadow: "0 8px 32px rgba(99,102,241,.45)",
          transition: "transform .2s, box-shadow .2s"
        }}
          onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 12px 40px rgba(99,102,241,.6)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 8px 32px rgba(99,102,241,.45)"; }}
        >
          <Upload size={18} /> Analyse My Resume
          <ArrowRight size={16} />
        </button>
        <button style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "16px 28px", borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(255,255,255,0.04)",
          color: "rgba(255,255,255,0.7)", fontWeight: 600, fontSize: 15, cursor: "pointer",
          transition: "all .2s"
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.3)"; e.currentTarget.style.color="#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.12)"; e.currentTarget.style.color="rgba(255,255,255,0.7)"; }}
          onClick={onGetStarted}
        >
          View Demo
        </button>
      </div>

      {/* Trust line */}
      <p style={{
        marginTop: 32, color: "rgba(255,255,255,0.3)", fontSize: 13,
        animation: "fadeSlideDown 1s ease 0.4s both"
      }}>
        No account required · Free to use · Takes 30 seconds
      </p>

      {/* Scroll indicator */}
      <div style={{
        position: "absolute", bottom: 36, left: "50%", transform: "translateX(-50%)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
        animation: "bounce 2s infinite"
      }}>
        <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, letterSpacing: 2 }}>SCROLL</span>
        <ChevronDown size={16} color="rgba(255,255,255,0.25)" />
      </div>
    </section>
  );
};

/* ════════ STATS ════════ */
const Stats = () => {
  const stats = [
    { value: 50000,  suffix: "+", label: "Resumes Analysed"    },
    { value: 94,     suffix: "%", label: "ATS Accuracy Rate"   },
    { value: 3,      suffix: "x", label: "More Interview Calls" },
    { value: 30,     suffix: "s", label: "Average Scan Time"   },
  ];

  return (
    <section style={{
      background: "#08091a",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      padding: "48px 24px"
    }}>
      <div style={{
        maxWidth: 900, margin: "0 auto",
        display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 0
      }}>
        {stats.map(({ value, suffix, label }, i) => (
          <FadeIn key={i} delay={i * 80}>
            <div style={{
              textAlign: "center", padding: "16px 0",
              borderRight: i < 3 ? "1px solid rgba(255,255,255,0.08)" : "none"
            }}>
              <div style={{
                fontFamily: "'Syne',sans-serif", fontWeight: 800,
                fontSize: 42, color: "#818cf8", lineHeight: 1
              }}>
                <Counter target={value} suffix={suffix} />
              </div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13,
                fontWeight: 500, marginTop: 8 }}>{label}</div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
};

/* ════════ HOW IT WORKS ════════ */
const HowItWorks = ({ onGetStarted }) => {
  const steps = [
    {
      num: "01", icon: Upload, title: "Upload Your Resume",
      body: "Drop your PDF or Word file. Our parser extracts text, structure, formatting — everything an ATS would see.",
      color: "#6366f1"
    },
    {
      num: "02", icon: BarChart2, title: "AI Scans & Scores",
      body: "Our model runs ATS simulation, keyword analysis, readability scoring, and impact assessment simultaneously.",
      color: "#8b5cf6"
    },
    {
      num: "03", icon: Layers, title: "Get Actionable Fixes",
      body: "Receive prioritised suggestions — not vague tips. Specific rewrites, missing keywords, and formatting fixes.",
      color: "#a78bfa"
    },
  ];

  return (
    <section id="how-it-works" style={{
      background: "#05080f", padding: "100px 24px"
    }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <span style={{
              fontSize: 12, fontWeight: 700, letterSpacing: 3,
              color: "#6366f1", display: "block", marginBottom: 16
            }}>HOW IT WORKS</span>
            <h2 style={{
              fontFamily: "'Syne',sans-serif", fontWeight: 800,
              fontSize: "clamp(32px,5vw,52px)", color: "#fff",
              letterSpacing: -2, lineHeight: 1.1
            }}>
              From upload to insight<br />
              <span style={{ color: "rgba(255,255,255,0.3)" }}>in three steps.</span>
            </h2>
          </div>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
          {steps.map(({ num, icon: Icon, title, body, color }, i) => (
            <FadeIn key={i} delay={i * 120}>
              <div style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 20, padding: 32, position: "relative",
                transition: "all .3s", cursor: "default"
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(99,102,241,0.06)";
                  e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)";
                  e.currentTarget.style.transform = "translateY(-4px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <span style={{
                  position: "absolute", top: 24, right: 28,
                  fontFamily: "'Syne',sans-serif", fontWeight: 800,
                  fontSize: 48, color: "rgba(255,255,255,0.04)", lineHeight: 1
                }}>{num}</span>
                <div style={{
                  width: 48, height: 48, borderRadius: 13,
                  background: `${color}22`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 20
                }}>
                  <Icon size={22} color={color} />
                </div>
                <h3 style={{
                  fontFamily: "'Syne',sans-serif", fontWeight: 700,
                  fontSize: 18, color: "#fff", marginBottom: 12
                }}>{title}</h3>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, lineHeight: 1.7 }}>
                  {body}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ════════ FEATURES ════════ */
const Features = () => {
  const features = [
    {
      icon: Shield, color: "#6366f1",
      title: "ATS Simulation",
      body: "We replicate what Applicant Tracking Systems actually look for — not what people think they look for."
    },
    {
      icon: TrendingUp, color: "#10b981",
      title: "Impact Scoring",
      body: "Every bullet point is scored for impact language, quantifiable results, and action verb strength."
    },
    {
      icon: FileText, color: "#f59e0b",
      title: "Skills Gap Analysis",
      body: "Matched against 10,000+ real job descriptions to surface missing keywords for your target role."
    },
    {
      icon: BarChart2, color: "#8b5cf6",
      title: "Section-by-Section Breakdown",
      body: "Contact, summary, experience, education — each section scored independently with specific fixes."
    },
    {
      icon: Award, color: "#ec4899",
      title: "Prioritised Suggestions",
      body: "HIGH / MED / LOW priority tags so you know exactly where to spend your time first."
    },
    {
      icon: Clock, color: "#06b6d4",
      title: "30-Second Results",
      body: "Full analysis delivered in under 30 seconds. No waiting, no email, no account needed."
    },
  ];

  return (
    <section id="features" style={{ background: "#08091a", padding: "100px 24px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <span style={{
              fontSize: 12, fontWeight: 700, letterSpacing: 3,
              color: "#6366f1", display: "block", marginBottom: 16
            }}>FEATURES</span>
            <h2 style={{
              fontFamily: "'Syne',sans-serif", fontWeight: 800,
              fontSize: "clamp(32px,5vw,52px)", color: "#fff",
              letterSpacing: -2, lineHeight: 1.1
            }}>
              Everything your resume<br />
              <span style={{ color: "rgba(255,255,255,0.3)" }}>needs to compete.</span>
            </h2>
          </div>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
          {features.map(({ icon: Icon, color, title, body }, i) => (
            <FadeIn key={i} delay={i * 80}>
              <div style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 18, padding: "28px 26px",
                transition: "all .3s"
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = `${color}08`;
                  e.currentTarget.style.borderColor = `${color}30`;
                  e.currentTarget.style.transform = "translateY(-3px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 11,
                  background: `${color}18`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 18
                }}>
                  <Icon size={20} color={color} />
                </div>
                <h3 style={{
                  fontFamily: "'Syne',sans-serif", fontWeight: 700,
                  fontSize: 16, color: "#fff", marginBottom: 10
                }}>{title}</h3>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13.5, lineHeight: 1.7 }}>
                  {body}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ════════ TESTIMONIALS ════════ */
const Testimonials = () => {
  const testimonials = [
    {
      name: "Priya Sharma", role: "Software Engineer @ Google",
      avatar: "PS", color: "#6366f1",
      text: "I applied to 40 jobs with my old resume and got zero callbacks. After fixing the issues Resume Analyser flagged, I had 3 interviews in the first week."
    },
    {
      name: "James Okafor", role: "Product Manager @ Stripe",
      avatar: "JO", color: "#10b981",
      text: "The ATS checklist alone saved me. I had no idea my two-column layout was getting rejected before a human ever read it. Fixed it in 20 minutes."
    },
    {
      name: "Aisha Malik", role: "Data Scientist @ Microsoft",
      avatar: "AM", color: "#f59e0b",
      text: "Best free resume tool I've used. The skills gap analysis showed me exactly which keywords I was missing for ML roles. Incredibly specific and useful."
    },
    {
      name: "Carlos Rivera", role: "UX Designer @ Airbnb",
      avatar: "CR", color: "#ec4899",
      text: "Went from a 61 to a 89 overall score in two hours. The suggestions are incredibly specific — not generic advice like 'use action verbs'."
    },
    {
      name: "Sophie Chen", role: "Frontend Dev @ Vercel",
      avatar: "SC", color: "#8b5cf6",
      text: "I was skeptical about an AI tool but the accuracy is impressive. It caught a weak summary, missing LinkedIn link, and 4 vague bullet points I had missed."
    },
    {
      name: "Rahul Nair", role: "Backend Engineer @ Atlassian",
      avatar: "RN", color: "#06b6d4",
      text: "The impact scoring is what sets this apart. It doesn't just say 'quantify your achievements' — it tells you exactly which bullets need numbers and why."
    },
  ];

  return (
    <section style={{ background: "#05080f", padding: "100px 24px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 16 }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} fill="#f59e0b" color="#f59e0b" />
              ))}
            </div>
            <span style={{
              fontSize: 12, fontWeight: 700, letterSpacing: 3,
              color: "#6366f1", display: "block", marginBottom: 16
            }}>TESTIMONIALS</span>
            <h2 style={{
              fontFamily: "'Syne',sans-serif", fontWeight: 800,
              fontSize: "clamp(32px,5vw,52px)", color: "#fff",
              letterSpacing: -2, lineHeight: 1.1
            }}>
              Real results from<br />
              <span style={{ color: "rgba(255,255,255,0.3)" }}>real job seekers.</span>
            </h2>
          </div>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
          {testimonials.map(({ name, role, avatar, color, text }, i) => (
            <FadeIn key={i} delay={i * 80}>
              <div style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 18, padding: 28
              }}>
                <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={13} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
                <p style={{
                  color: "rgba(255,255,255,0.6)", fontSize: 14,
                  lineHeight: 1.75, marginBottom: 24
                }}>"{text}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: `${color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 800, color: color
                  }}>{avatar}</div>
                  <div>
                    <p style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{name}</p>
                    <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>{role}</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ════════ PRICING ════════ */
const Pricing = ({ onGetStarted }) => {
  const plans = [
    {
      name: "Free", price: "0", period: "forever",
      color: "#64748b", highlight: false,
      features: [
        "1 resume scan per day",
        "Overall ATS score",
        "Basic issue detection",
        "Skills gap overview",
      ],
      cta: "Get Started Free"
    },
    {
      name: "Pro", price: "9", period: "per month",
      color: "#6366f1", highlight: true,
      features: [
        "Unlimited resume scans",
        "Full ATS simulation",
        "Section-by-section scoring",
        "AI rewrite suggestions",
        "JD keyword matcher",
        "PDF export report",
        "Score history tracking",
      ],
      cta: "Start Pro — $9/mo"
    },
    {
      name: "Team", price: "29", period: "per month",
      color: "#8b5cf6", highlight: false,
      features: [
        "Everything in Pro",
        "Up to 10 team members",
        "Bulk resume analysis",
        "Recruiter dashboard",
        "API access",
        "Priority support",
      ],
      cta: "Start Team Plan"
    },
  ];

  return (
    <section id="pricing" style={{ background: "#08091a", padding: "100px 24px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <span style={{
              fontSize: 12, fontWeight: 700, letterSpacing: 3,
              color: "#6366f1", display: "block", marginBottom: 16
            }}>PRICING</span>
            <h2 style={{
              fontFamily: "'Syne',sans-serif", fontWeight: 800,
              fontSize: "clamp(32px,5vw,52px)", color: "#fff",
              letterSpacing: -2, lineHeight: 1.1
            }}>
              Start free.<br />
              <span style={{ color: "rgba(255,255,255,0.3)" }}>Upgrade when you're ready.</span>
            </h2>
          </div>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, alignItems: "start" }}>
          {plans.map(({ name, price, period, color, highlight, features, cta }, i) => (
            <FadeIn key={i} delay={i * 100}>
              <div style={{
                background: highlight ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.03)",
                border: highlight ? "1.5px solid rgba(99,102,241,0.5)" : "1px solid rgba(255,255,255,0.07)",
                borderRadius: 20, padding: 32,
                position: "relative", transform: highlight ? "scale(1.03)" : "scale(1)"
              }}>
                {highlight && (
                  <div style={{
                    position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                    color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: 1,
                    padding: "4px 16px", borderRadius: 99
                  }}>MOST POPULAR</div>
                )}

                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13,
                  fontWeight: 600, letterSpacing: 1, marginBottom: 12 }}>{name.toUpperCase()}</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 20 }}>$</span>
                  <span style={{
                    fontFamily: "'Syne',sans-serif", fontWeight: 800,
                    fontSize: 52, color: "#fff", lineHeight: 1
                  }}>{price}</span>
                </div>
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13,
                  marginBottom: 28 }}>{period}</p>

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)",
                  paddingTop: 24, marginBottom: 28 }}>
                  {features.map((f, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "center",
                      gap: 10, marginBottom: 12 }}>
                      <CheckCircle size={15} color={color} style={{ flexShrink: 0 }} />
                      <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 14 }}>{f}</span>
                    </div>
                  ))}
                </div>

                <button onClick={onGetStarted} style={{
                  width: "100%", padding: "13px 0", borderRadius: 12, border: "none",
                  background: highlight
                    ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
                    : "rgba(255,255,255,0.07)",
                  color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
                  transition: "all .2s"
                }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                >
                  {cta}
                </button>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ════════ FAQ ════════ */
const FAQ = () => {
  const [open, setOpen] = useState(null);
  const faqs = [
    {
      q: "Is my resume data safe?",
      a: "Your resume is processed in memory and never stored on our servers. We don't retain any personal data after the analysis is complete."
    },
    {
      q: "What file formats are supported?",
      a: "We support PDF, DOC, and DOCX files up to 5MB. PDF is recommended as it's the most ATS-friendly format."
    },
    {
      q: "How accurate is the ATS scoring?",
      a: "Our model is trained on data from 50,000+ real job applications and achieves 94% accuracy against major ATS platforms like Workday, Greenhouse, and Lever."
    },
    {
      q: "Do I need to create an account?",
      a: "No account is needed for the free tier. Simply upload your resume and get instant results. An account is required only for Pro features like history tracking."
    },
    {
      q: "Can I tailor the analysis to a specific job?",
      a: "Yes — in the Pro plan you can paste a job description and the analysis will match your resume specifically against that JD's keywords and requirements."
    },
  ];

  return (
    <section id="faq" style={{ background: "#05080f", padding: "100px 24px" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <span style={{
              fontSize: 12, fontWeight: 700, letterSpacing: 3,
              color: "#6366f1", display: "block", marginBottom: 16
            }}>FAQ</span>
            <h2 style={{
              fontFamily: "'Syne',sans-serif", fontWeight: 800,
              fontSize: "clamp(28px,4vw,44px)", color: "#fff",
              letterSpacing: -1.5, lineHeight: 1.1
            }}>Common questions.</h2>
          </div>
        </FadeIn>

        {faqs.map(({ q, a }, i) => (
          <FadeIn key={i} delay={i * 60}>
            <div style={{
              borderBottom: "1px solid rgba(255,255,255,0.07)",
              padding: "24px 0", cursor: "pointer"
            }} onClick={() => setOpen(open === i ? null : i)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>{q}</p>
                <ChevronDown size={18} color="rgba(255,255,255,0.4)"
                  style={{ transform: open === i ? "rotate(180deg)" : "rotate(0)",
                    transition: "transform .3s", flexShrink: 0, marginLeft: 16 }} />
              </div>
              {open === i && (
                <p style={{
                  color: "rgba(255,255,255,0.45)", fontSize: 14,
                  lineHeight: 1.75, marginTop: 16, paddingRight: 32
                }}>{a}</p>
              )}
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
};

/* ════════ FINAL CTA ════════ */
const FinalCTA = ({ onGetStarted }) => (
  <section style={{ background: "#08091a", padding: "100px 24px" }}>
    <FadeIn>
      <div style={{
        maxWidth: 800, margin: "0 auto", textAlign: "center",
        background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))",
        border: "1px solid rgba(99,102,241,0.25)",
        borderRadius: 28, padding: "72px 48px", position: "relative", overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)",
          top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          filter: "blur(60px)", pointerEvents: "none"
        }} />

        <Users size={40} color="#6366f1" style={{ marginBottom: 24 }} />
        <h2 style={{
          fontFamily: "'Syne',sans-serif", fontWeight: 800,
          fontSize: "clamp(28px,5vw,48px)", color: "#fff",
          letterSpacing: -2, lineHeight: 1.1, marginBottom: 20
        }}>
          Ready to get more<br />interviews?
        </h2>
        <p style={{
          color: "rgba(255,255,255,0.45)", fontSize: 16, lineHeight: 1.7,
          maxWidth: 440, margin: "0 auto 40px"
        }}>
          Join 50,000+ job seekers who have used Resume Analyser
          to land roles at top companies.
        </p>
        <button onClick={onGetStarted} style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          padding: "16px 36px", borderRadius: 14, border: "none",
          background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
          color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer",
          boxShadow: "0 8px 32px rgba(99,102,241,.45)",
          transition: "transform .2s, box-shadow .2s"
        }}
          onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 12px 40px rgba(99,102,241,.6)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 8px 32px rgba(99,102,241,.45)"; }}
        >
          <Upload size={18} /> Analyse My Resume Free
          <ArrowRight size={16} />
        </button>
        <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, marginTop: 20 }}>
          No account required · Free forever · 30-second results
        </p>
      </div>
    </FadeIn>
  </section>
);

/* ════════ FOOTER ════════ */
const Footer = () => (
  <footer style={{
    background: "#05080f",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    padding: "40px 48px"
  }}>
    <div style={{
      maxWidth: 1080, margin: "0 auto",
      display: "flex", justifyContent: "space-between",
      alignItems: "center", flexWrap: "wrap", gap: 20
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 7,
          background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <Zap size={14} color="#fff" />
        </div>
        <span style={{
          fontFamily: "'Syne',sans-serif", fontWeight: 800,
          color: "#fff", fontSize: 15
        }}>Resume Analyser</span>
      </div>
      <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 13 }}>
        © 2026 Resume Analyser. Built to get you hired.
      </p>
      <div style={{ display: "flex", gap: 24 }}>
        {["Privacy","Terms","Contact"].map(l => (
          <a key={l} href="#" style={{
            color: "rgba(255,255,255,0.3)", fontSize: 13,
            textDecoration: "none", transition: "color .2s"
          }}
            onMouseEnter={e => e.target.style.color = "rgba(255,255,255,0.7)"}
            onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.3)"}
          >{l}</a>
        ))}
      </div>
    </div>
  </footer>
);

/* ════════ ROOT ════════ */
const LandingPage = ({ onGetStarted }) => (
  <div style={{ fontFamily: "'DM Sans',sans-serif" }}>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
      @keyframes fadeSlideDown {
        from { opacity: 0; transform: translateY(-20px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes bounce {
        0%, 100% { transform: translateX(-50%) translateY(0); }
        50%       { transform: translateX(-50%) translateY(8px); }
      }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }
      ::-webkit-scrollbar { width: 5px; }
      ::-webkit-scrollbar-track { background: #05080f; }
      ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 99px; }
    `}</style>

    <Navbar onGetStarted={onGetStarted} />
    <Hero onGetStarted={onGetStarted} />
    <Stats />
    <HowItWorks onGetStarted={onGetStarted} />
    <Features />
    <Testimonials />
    <Pricing onGetStarted={onGetStarted} />
    <FAQ />
    <FinalCTA onGetStarted={onGetStarted} />
    <Footer />
  </div>
);

export default LandingPage;
