import OverviewTab from "../tabs/OverviewTab";
import ATSTab from "../tabs/ATSTab";
import SkillsTab from "../tabs/SkillsTab";
import IssuesTab from "../tabs/IssuesTab";
import SuggestionsTab from "../tabs/SuggestionsTab";

const FullReport = ({ data }) => {
  return (
    <div className="full-report-print" data-theme="light" style={{ padding: "40px", background: "#fff", color: "#000" }}>
      <div style={{ textAlign: "center", marginBottom: "40px", borderBottom: "2px solid #6366f1", paddingBottom: "20px" }}>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "36px", fontWeight: 800, margin: 0 }}>Resume Analysis Report</h1>
        <p style={{ fontSize: "18px", color: "#666" }}>Detailed breakdown for {data.name}</p>
        <p style={{ fontSize: "14px", color: "#999" }}>Generated on {new Date().toLocaleDateString()}</p>
      </div>

      <section style={{ marginBottom: "50px" }}>
        <h2 style={{ fontFamily: "'Syne',sans-serif", borderLeft: "4px solid #6366f1", paddingLeft: "15px", marginBottom: "20px" }}>Overview</h2>
        <OverviewTab data={data} skipAnimation={true} />
      </section>

      <div style={{ pageBreakBefore: "always" }}></div>

      <section style={{ marginBottom: "50px" }}>
        <h2 style={{ fontFamily: "'Syne',sans-serif", borderLeft: "4px solid #6366f1", paddingLeft: "15px", marginBottom: "20px" }}>ATS Analysis</h2>
        <ATSTab data={data} skipAnimation={true} />
      </section>

      <div style={{ pageBreakBefore: "always" }}></div>

      <section style={{ marginBottom: "50px" }}>
        <h2 style={{ fontFamily: "'Syne',sans-serif", borderLeft: "4px solid #6366f1", paddingLeft: "15px", marginBottom: "20px" }}>Skills & Keywords</h2>
        <SkillsTab data={data} />
      </section>

      <div style={{ pageBreakBefore: "always" }}></div>

      <section style={{ marginBottom: "50px" }}>
        <h2 style={{ fontFamily: "'Syne',sans-serif", borderLeft: "4px solid #6366f1", paddingLeft: "15px", marginBottom: "20px" }}>Identified Issues</h2>
        <IssuesTab data={data} />
      </section>

      <div style={{ pageBreakBefore: "always" }}></div>

      <section style={{ marginBottom: "50px" }}>
        <h2 style={{ fontFamily: "'Syne',sans-serif", borderLeft: "4px solid #6366f1", paddingLeft: "15px", marginBottom: "20px" }}>Actionable Suggestions</h2>
        <SuggestionsTab data={data} />
      </section>

      <style>{`
        @page {
          margin: 0;
        }
        @media screen {
          .full-report-print {
            position: absolute;
            top: -9999px;
            left: -9999px;
            width: 1024px;
            visibility: hidden;
            pointer-events: none;
          }
        }
        @media print {
          .full-report-print {
            position: relative !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            display: block !important;
            visibility: visible !important;
            padding: 20mm !important; /* Proper margin for physical paper */
          }
          .no-print { display: none !important; }
          body { 
            background: white !important; 
            margin: 0 !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default FullReport;
