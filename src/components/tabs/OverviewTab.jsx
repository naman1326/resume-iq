import { Star, Shield, Eye, TrendingUp } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis,
  Tooltip, CartesianGrid, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import ScoreRing from "../ui/ScoreRing";
import AnimatedNumber from "../ui/AnimatedNumber";
import { scoreColor } from "../../data/mockData";

const OverviewTab = ({ data }) => {
  const scores = [
    { label: "Overall",     value: data.overallScore,     icon: Star        },
    { label: "ATS Score",   value: data.atsScore,         icon: Shield      },
    { label: "Readability", value: data.readabilityScore, icon: Eye         },
    { label: "Impact",      value: data.impactScore,      icon: TrendingUp  },
  ];

  return (
    <div>
      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg,#1e1b4b 0%,#312e81 100%)",
        borderRadius: 20, padding: "32px 36px", marginBottom: 24,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 24
      }}>
        <div>
          <p style={{ color: "#a5b4fc", fontSize: 12, fontWeight: 600,
            letterSpacing: 2, marginBottom: 6 }}>RESUME OWNER</p>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 28,
            fontWeight: 800, color: "#fff", marginBottom: 4 }}>{data.name}</h2>
          <p style={{ color: "#c7d2fe", fontSize: 15 }}>{data.role}</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ position: "relative", display: "inline-block" }}>
            <ScoreRing score={data.overallScore} size={120} stroke={10} />
            <div style={{ position: "absolute", inset: 0, display: "flex",
              flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800,
                fontSize: 28, color: "#fff" }}><AnimatedNumber value={data.overallScore} /></span>
              <span style={{ fontSize: 11, color: "#a5b4fc", fontWeight: 600 }}>/100</span>
            </div>
          </div>
          <p style={{ color: "#a5b4fc", fontSize: 12, marginTop: 6, fontWeight: 600 }}>OVERALL SCORE</p>
        </div>
      </div>

      {/* Score cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {scores.map(({ label, value, icon: Icon }) => (
          <div key={label} style={{
            background: "var(--card-bg)", borderRadius: 16, padding: "20px 16px",
            boxShadow: "var(--card-shadow)", display: "flex",
            flexDirection: "column", alignItems: "center", textAlign: "center"
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: `${scoreColor(value)}18`,
              display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10
            }}>
              <Icon size={18} color={scoreColor(value)} />
            </div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800,
              fontSize: 26, color: scoreColor(value), lineHeight: 1 }}>
              <AnimatedNumber value={value} />
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, fontWeight: 600 }}>{label}</div>
            <div style={{ width: "100%", height: 4, background: "var(--progress-bg)",
              borderRadius: 99, marginTop: 10 }}>
              <div style={{ height: "100%", width: `${value}%`,
                background: scoreColor(value), borderRadius: 99,
                transition: "width 1.2s cubic-bezier(.4,0,.2,1)" }} />
            </div>
          </div>
        ))}
      </div>

      {/* Radar + Trend */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: "var(--card-bg)", borderRadius: 16,
          padding: 24, boxShadow: "var(--card-shadow)" }}>
          <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700,
            fontSize: 15, marginBottom: 16, color: "var(--text-primary)" }}>Profile Radar</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={data.radarData}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="subject"
                tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
              <PolarRadiusAxis domain={[0,100]} tick={false} axisLine={false} />
              <Radar name="Score" dataKey="A" stroke="#6366f1" fill="#6366f1"
                fillOpacity={0.2} strokeWidth={2} dot={{ r: 4, fill: "#6366f1" }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: "var(--card-bg)", borderRadius: 16,
          padding: 24, boxShadow: "var(--card-shadow)" }}>
          <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700,
            fontSize: 15, marginBottom: 4, color: "var(--text-primary)" }}>Score Breakdown</h3>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>
            All four scores from your analysis
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={[
                { label: "ATS",         score: data.atsScore         || 0 },
                { label: "Readability", score: data.readabilityScore || 0 },
                { label: "Impact",      score: data.impactScore      || 0 },
                { label: "Overall",     score: data.overallScore     || 0 },
              ]}
              barCategoryGap="30%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label"
                tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]}
                tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: "rgba(99,102,241,0.07)" }}
                contentStyle={{
                  borderRadius: 10, border: "1px solid var(--border)",
                  background: "var(--card-bg)", color: "var(--text-primary)", fontSize: 13
                }}
                formatter={(val) => [`${val}/100`, "Score"]}
              />
              <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                {[
                  data.atsScore         || 0,
                  data.readabilityScore || 0,
                  data.impactScore      || 0,
                  data.overallScore     || 0,
                ].map((score, i) => (
                  <Cell key={i} fill={scoreColor(score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
