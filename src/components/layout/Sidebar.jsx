import { useState } from "react";
import {
  BarChart2, Shield, Code, AlertCircle, Layers,
  Zap, ChevronRight, RefreshCw, Sun, Moon, Menu, X
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import useMediaQuery from "../../hooks/useMediaQuery";

export const navItems = [
  { id: "overview", icon: BarChart2,   label: "Overview"    },
  { id: "ats",      icon: Shield,      label: "ATS Check"   },
  { id: "skills",   icon: Code,        label: "Skills Gap"  },
  { id: "matcher",  icon: Zap,         label: "Job Matcher" },
  { id: "issues",   icon: AlertCircle, label: "Issues"      },
  { id: "suggest",  icon: Layers,      label: "Suggestions" },
];

const NavContent = ({ active, setActive, onReset, onClose, dark, toggle }) => (
  <div style={{
    width: "100%", height: "100%",
    display: "flex", flexDirection: "column", padding: "28px 16px"
  }}>
    <div style={{
      display: "flex", alignItems: "center",
      justifyContent: "space-between", marginBottom: 40, paddingLeft: 8
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <Zap size={16} color="#fff" />
        </div>
        <span style={{
          fontFamily: "'Syne',sans-serif", fontWeight: 800,
          fontSize: 16, letterSpacing: -.5, color: "var(--sidebar-text)"
        }}>Resume Analyser</span>
      </div>
      {onClose && (
        <button onClick={onClose} style={{
          background: "none", border: "none", cursor: "pointer", color: "#64748b", padding: 4
        }}>
          <X size={20} />
        </button>
      )}
    </div>

    <nav style={{ flex: 1 }}>
      {navItems.map(({ id, icon: Icon, label }) => (
        <button key={id} id={`nav-${id}`}
          onClick={() => { setActive(id); onClose?.(); }}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10,
            padding: "11px 14px", borderRadius: 10, marginBottom: 4,
            border: "none", cursor: "pointer", textAlign: "left",
            fontWeight: 600, fontSize: 14, fontFamily: "'DM Sans',sans-serif",
            transition: "all .2s",
            background: active === id ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "transparent",
            color: active === id ? "#fff" : "var(--sidebar-muted)"
          }}>
          <Icon size={17} />
          {label}
          {active === id && <ChevronRight size={14} style={{ marginLeft: "auto" }} />}
        </button>
      ))}
    </nav>

    <button onClick={toggle} style={{
      display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
      borderRadius: 10, border: "1px solid var(--border-subtle)",
      background: "var(--toggle-bg)", cursor: "pointer",
      color: "var(--sidebar-muted)", fontWeight: 600, fontSize: 13,
      fontFamily: "'DM Sans',sans-serif", marginBottom: 8, transition: "all .2s"
    }}>
      {dark ? <Sun size={14} /> : <Moon size={14} />}
      {dark ? "Light Mode" : "Dark Mode"}
    </button>

    <button onClick={() => { onReset(); onClose?.(); }} style={{
      display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
      borderRadius: 10, border: "1px solid var(--border-subtle)",
      background: "transparent", cursor: "pointer",
      color: "var(--sidebar-muted)", fontWeight: 600, fontSize: 13,
      fontFamily: "'DM Sans',sans-serif"
    }}>
      <RefreshCw size={14} /> Analyse New
    </button>
  </div>
);

const Sidebar = ({ active, setActive, onReset }) => {
  const { dark, toggle } = useTheme();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (!isMobile) {
    return (
      <aside style={{
        width: 220, height: "100vh", flexShrink: 0,
        background: "var(--sidebar-bg)", borderRight: "1px solid var(--border)",
        position: "sticky", top: 0
      }}>
        <NavContent active={active} setActive={setActive} onReset={onReset} dark={dark} toggle={toggle} />
      </aside>
    );
  }

  return (
    <>
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 150,
        height: 56, background: "var(--sidebar-bg)", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Zap size={14} color="#fff" />
          </div>
          <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 15, color: "var(--sidebar-text)" }}>
            Resume Analyser
          </span>
        </div>
        <button onClick={() => setDrawerOpen(true)} style={{
          background: "none", border: "1px solid var(--border-subtle)",
          borderRadius: 8, padding: 7, cursor: "pointer", color: "#94a3b8"
        }}>
          <Menu size={18} />
        </button>
      </div>

      {drawerOpen && (
        <>
          <div onClick={() => setDrawerOpen(false)} style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)"
          }} />
          <div style={{
            position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 201,
            width: 260, background: "var(--sidebar-bg)", borderRight: "1px solid var(--border)",
            animation: "slideInLeft 0.28s ease"
          }}>
            <NavContent active={active} setActive={setActive} onReset={onReset}
              dark={dark} toggle={toggle} onClose={() => setDrawerOpen(false)} />
          </div>
        </>
      )}

      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
