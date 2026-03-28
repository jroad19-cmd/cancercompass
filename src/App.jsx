import { useState, useEffect } from "react";
import "./App.css";
import Onboarding from "./components/Onboarding";
import LookupForm from "./components/LookupForm";
import ResultsPage from "./components/ResultsPage";
import AdminPage from "./components/AdminPage";
import { getActiveProfile, profileLabel } from "./components/ProfileManager";

const ONBOARD_KEY = "cancercompass_onboarded";
// Change this to your preferred secret path, e.g. "/admin-xyz123"
const ADMIN_PATH  = "/admin";

export default function App() {
  const isAdmin = window.location.pathname === ADMIN_PATH;

  const [onboarded, setOnboarded]   = useState(() => !!localStorage.getItem(ONBOARD_KEY));
  const [screen,    setScreen]      = useState("lookup"); // lookup | results
  const [profile,   setProfile]     = useState(null);
  const [headerProfile, setHeaderProfile] = useState(getActiveProfile());

  useEffect(() => {
    setHeaderProfile(getActiveProfile());
  }, [screen]);

  function handleOnboardDone() {
    localStorage.setItem(ONBOARD_KEY, "1");
    setOnboarded(true);
  }

  function handleResults(formData) {
    setProfile(formData);
    setScreen("results");
    window.scrollTo(0, 0);
  }

  function handleBack() {
    setScreen("lookup");
    window.scrollTo(0, 0);
  }

  // ── Admin route ──
  if (isAdmin) {
    return (
      <>
        <header className="cc-header">
          <button className="cc-logo" onClick={() => window.location.href = "/"}>
            <div className="cc-logo-icon">🧭</div>
            <span className="cc-logo-text">Cancer<span>Compass</span></span>
          </button>
          <span style={{ fontSize: "13px", color: "var(--mid-gray)", fontWeight: 500 }}>Admin</span>
        </header>
        <AdminPage />
      </>
    );
  }

  // ── Onboarding ──
  if (!onboarded) {
    return <Onboarding onDone={handleOnboardDone} />;
  }

  // ── Main app ──
  return (
    <>
      <header className="cc-header">
        <button className="cc-logo" onClick={handleBack} style={{ background: "none", border: "none" }}>
          <div className="cc-logo-icon">🧭</div>
          <span className="cc-logo-text">Cancer<span>Compass</span></span>
        </button>
        <div
          className="cc-profile-chip"
          onClick={handleBack}
          title="Edit profile"
        >
          <span>👤</span>
          <span>{profileLabel(headerProfile)}</span>
        </div>
      </header>

      {screen === "lookup" && (
        <LookupForm onResults={handleResults} />
      )}

      {screen === "results" && profile && (
        <ResultsPage profile={profile} onBack={handleBack} />
      )}
    </>
  );
}
