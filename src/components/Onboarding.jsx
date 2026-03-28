import { useState } from "react";

const screens = [
  {
    icon: "🧭",
    title: "Welcome to CancerCompass",
    body: "We help cancer patients and caregivers find grants, financial help, and support programs — filtered just for you. Free, private, and easy to use.",
    btn: "Get Started",
  },
  {
    icon: "🔒",
    title: "Your Privacy Comes First",
    body: "Your information never leaves your device. No account needed. No data shared. Ever. Saving your profile is optional — it just makes future lookups faster.",
    btn: "Next",
  },
  {
    icon: "💙",
    title: "How It Works",
    body: "Tell us your cancer type and state. We'll show you national and local resources that match — reviewed, up to date, and written in plain English.",
    btn: "Let's Find Resources",
  },
];

export default function Onboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const current = screens[step];

  function next() {
    if (step < screens.length - 1) setStep(step + 1);
    else onDone();
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(145deg, #1a3a4a 0%, #2a7c7c 60%, #3a9a6a 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
    }}>
      <div className="fade-up" style={{
        background: "white",
        borderRadius: "24px",
        padding: "48px 40px",
        maxWidth: "460px",
        width: "100%",
        textAlign: "center",
        boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
        position: "relative",
      }}>
        <button
          onClick={onDone}
          style={{
            position: "absolute", top: "20px", right: "24px",
            background: "none", border: "none", color: "var(--mid-gray)",
            fontFamily: "'DM Sans', sans-serif", fontSize: "14px",
            cursor: "pointer", padding: "4px 8px",
          }}
        >
          Skip →
        </button>

        <div style={{ fontSize: "52px", marginBottom: "24px" }}>{current.icon}</div>

        {/* Dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "28px" }}>
          {screens.map((_, i) => (
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
          fontFamily: "'Lora', serif",
          fontSize: "26px",
          fontWeight: 600,
          color: "var(--navy)",
          marginBottom: "16px",
          lineHeight: 1.3,
        }}>
          {current.title}
        </h2>

        <p style={{
          fontSize: "16px",
          color: "#5a5a55",
          lineHeight: 1.65,
          marginBottom: "36px",
        }}>
          {current.body}
        </p>

        <button className="btn-primary" onClick={next}>
          {current.btn}
        </button>
      </div>
    </div>
  );
}
