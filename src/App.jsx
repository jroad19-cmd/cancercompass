import { useState, useEffect } from "react";
import "./App.css";
import Onboarding from "./components/Onboarding";
import LookupForm from "./components/LookupForm";
import ResultsPage from "./components/ResultsPage";
import AdminPage from "./components/AdminPage";
import SavedResourcesPage from "./components/SavedResourcesPage";
import { getActiveProfile, profileLabel } from "./components/ProfileManager";

const ONBOARD_KEY = "cancercompass_onboarded";
const ADMIN_PATH  = "/admin";

const aboutScreens = [
  {
    icon: "🧭",
    title: "Welcome to CancerCompass",
    body: "We help cancer patients and caregivers find grants, financial help, and support programs — filtered just for you. Free, private, and easy to use.",
  },
  {
    icon: "🔒",
    title: "Your Privacy Comes First",
    body: "Your information never leaves your device. No account needed. No data shared. Ever. Saving your profile is optional — it just makes future lookups faster.",
  },
  {
    icon: "💙",
    title: "How It Works",
    body: "Tell us your cancer type and state. We'll show you national and local resources that match — reviewed, up to date, and written in plain English.",
  },
];

function AboutModal({ onClose }) {
  const [step, setStep] = useState(0);
  const current = aboutScreens[step];

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      zIndex: 400, display: "flex", alignItems: "center",
      justifyContent: "center", padding: "24px",
    }}>
      <div style={{
        background: "white", borderRadius: "24px", padding: "48px 40px",
        maxWidth: "460px", width: "100%", textAlign: "center",
        boxShadow: "0 24px 64px rgba(0,0,0,0.2)", position: "relative",
        animation: "fadeUp 0.3s ease",
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: "20px", right: "24px",
          background: "none", border: "none", color: "var(--mid-gray)",
          fontFamily: "'DM Sans', sans-serif", fontSize: "14px",
          cursor: "pointer", padding: "4px 8px",
        }}>
          Close ✕
        </button>

        <div style={{ fontSize: "52px", marginBottom: "24px" }}>{current.icon}</div>

        {/* Dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "28px" }}>
          {aboutScreens.map((_, i) => (
            <div key={i} style={{
              height: "8px",
              width: i === step ? "24px" : "8px",
              borderRadius: i === step ? "4px" : "50%",
              background: i === step ? "var(--teal)" : "#ddd",
              transition: "all 0.3s",
            }} />
          ))}
        </div>

        <h2 style={{
          fontFamily: "'Lora', serif", fontSize: "24px", fontWeight: 600,
          color: "var(--navy)", marginBottom: "16px", lineHeight: 1.3,
        }}>
          {current.title}
        </h2>

        <p style={{
          fontSize: "16px", color: "#5a5a55",
          lineHeight: 1.65, marginBottom: "36px",
        }}>
          {current.body}
        </p>

        <div style={{ display: "flex", gap: "10px" }}>
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} className="btn-ghost" style={{ flex: 1 }}>
              ← Back
            </button>
          )}
          {step < aboutScreens.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} className="btn-primary" style={{ flex: 1 }}>
              Next
            </button>
          ) : (
            <button onClick={onClose} className="btn-primary" style={{ flex: 1 }}>
              Got it
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const isAdmin = window.location.pathname === ADMIN_PATH;

  const [onboarded,     setOnboarded]     = useState(() => !!localStorage.getItem(ONBOARD_KEY));
  const [screen,        setScreen]        = useState("lookup");
  const [profile,       setProfile]       = useState(null);
  const [headerProfile, setHeaderProfile] = useState(getActiveProfile());
  const [showAbout,     setShowAbout]     = useState(false);

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

  function handleViewSaved() {
    setScreen("saved");
    window.scrollTo(0, 0);
  }

  function handleBackToResults() {
    setScreen("results");
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
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={() => setShowAbout(true)}
            title="About CancerCompass"
            style={{
              background: "var(--teal-pale)", border: "1.5px solid var(--teal)",
              borderRadius: "8px", padding: "6px 12px",
              display: "flex", alignItems: "center", gap: "6px",
              cursor: "pointer", fontSize: "13px", color: "var(--teal)",
              fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.2s", flexShrink: 0, whiteSpace: "nowrap",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--teal)"; e.currentTarget.style.color = "white"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--teal-pale)"; e.currentTarget.style.color = "var(--teal)"; }}
          >
            ℹ️ About
          </button>
          <div
            className="cc-profile-chip"
            onClick={handleBack}
            title="Edit profile"
          >
            <span>👤</span>
            <span>{profileLabel(headerProfile)}</span>
          </div>
        </div>
      </header>

      {screen === "lookup" && (
        <LookupForm onResults={handleResults} onAbout={() => setShowAbout(true)} />
      )}

      {screen === "results" && profile && (
        <ResultsPage
          profile={profile}
          onBack={handleBack}
          onAbout={() => setShowAbout(true)}
          onViewSaved={handleViewSaved}
        />
      )}

      {screen === "saved" && (
        <SavedResourcesPage onBack={handleBackToResults} />
      )}

      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
    </>
  );
}
