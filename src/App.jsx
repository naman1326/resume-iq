import { useState } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import LandingPage from "./components/pages/LandingPage";
import UploadPage  from "./components/pages/UploadPage";
import Dashboard   from "./components/pages/Dashboard";

const App = () => {
  const [screen,   setScreen]   = useState("landing");
  const [analysis, setAnalysis] = useState(null); // real AI data lives here

  const handleAnalyze = (data) => {
    setAnalysis(data);   // store real AI response
    setScreen("dashboard");
  };

  const handleReset = () => {
    setAnalysis(null);
    setScreen("landing");
  };

  return (
    <ThemeProvider>
      {screen === "landing"   && <LandingPage onGetStarted={() => setScreen("upload")} />}
      {screen === "upload"    && <UploadPage  onAnalyze={handleAnalyze} />}
      {screen === "dashboard" && <Dashboard   analysis={analysis} onReset={handleReset} />}
    </ThemeProvider>
  );
};

export default App;
