export default function AboutPage({ onBack, onShowOnboarding }) {
  return (
    <div style={{ paddingBottom: "60px" }}>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, var(--navy) 0%, var(--teal) 100%)",
        padding: "48px 24px 40px",
        color: "white",
        textAlign: "center",
      }}>
        <div style={{ fontSize: "52px", marginBottom: "14px" }}>🧭</div>
        <div style={{ fontFamily: "'Lora', serif", fontSize: "28px", fontWeight: 600, marginBottom: "8px" }}>
          Cancer<span style={{ color: "#7ed6c8" }}>Compass</span>
        </div>
        <div style={{ fontSize: "15px", opacity: 0.8, letterSpacing: "0.02em" }}>
          Free. Private. Built with love.
        </div>
      </div>

      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "36px 20px 0" }}>

        {/* Story */}
        <section style={{ marginBottom: "32px" }}>
          <h2 style={{
            fontFamily: "'Lora', serif", fontSize: "21px",
            color: "var(--navy)", marginBottom: "14px",
          }}>
            Our Story
          </h2>
          <p style={{ fontSize: "15px", color: "#3a3a35", lineHeight: 1.8, margin: 0 }}>
            CancerCompass was built by a volunteer who lost his wife of 47 years to cancer. After watching her struggle to find financial help and support programs during treatment, he built this tool so no other patient or family would have to face that search alone. It is free, maintained by one person, and built entirely out of love.
          </p>
        </section>

        {/* Mission */}
        <section style={{
          background: "var(--teal-pale)",
          borderLeft: "4px solid var(--teal)",
          borderRadius: "0 12px 12px 0",
          padding: "20px 24px",
          marginBottom: "32px",
        }}>
          <h2 style={{
            fontFamily: "'Lora', serif", fontSize: "18px",
            color: "var(--navy)", marginBottom: "10px",
          }}>
            Our Mission
          </h2>
          <p style={{ fontSize: "15px", color: "#3a3a35", lineHeight: 1.75, margin: 0 }}>
            Our mission is simple — help every cancer patient and caregiver find the financial help and support they need, as fast as possible, in plain English.
          </p>
        </section>

        {/* Privacy */}
        <section style={{
          background: "#f0f8f6",
          border: "1.5px solid #c8e8e4",
          borderRadius: "12px",
          padding: "20px 24px",
          marginBottom: "40px",
        }}>
          <h2 style={{
            fontFamily: "'Lora', serif", fontSize: "18px",
            color: "var(--navy)", marginBottom: "10px",
          }}>
            🔒 Your Privacy
          </h2>
          <p style={{ fontSize: "15px", color: "#3a3a35", lineHeight: 1.75, margin: 0 }}>
            Your health information never leaves your device. CancerCompass does not store, share, or sell any personal information. We use Google Analytics to count anonymous visits so we can improve the tool — no personal details are included.
          </p>
        </section>

        {/* Tour button */}
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <button
            onClick={onShowOnboarding}
            className="btn-primary"
            style={{ fontSize: "15px", padding: "14px 32px" }}
          >
            🧭 About CancerCompass
          </button>
          <p style={{ fontSize: "13px", color: "var(--mid-gray)", marginTop: "10px" }}>
            See a quick walkthrough of how CancerCompass works.
          </p>
        </div>

        {/* Back */}
        <div style={{ textAlign: "center", paddingBottom: "16px" }}>
          <button className="btn-ghost" onClick={onBack}>
            ← Back to Search
          </button>
        </div>

      </div>
    </div>
  );
}
