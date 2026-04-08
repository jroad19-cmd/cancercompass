export default function TermsPage({ onBack }) {
  const sectionStyle = { marginBottom: "28px" };
  const headingStyle = {
    fontFamily: "'Lora', serif", fontSize: "18px",
    color: "var(--navy)", marginBottom: "10px",
  };
  const bodyStyle = {
    fontSize: "15px", color: "#3a3a35", lineHeight: 1.75, margin: 0,
  };

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
        <div style={{ fontSize: "17px", opacity: 0.85, marginTop: "6px" }}>
          Terms of Use
        </div>
      </div>

      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "36px 20px 0" }}>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>No Medical, Legal, or Financial Advice</h2>
          <p style={bodyStyle}>
            CancerCompass provides general information only. Nothing on this site constitutes medical, legal, or financial advice. Always consult qualified professionals and contact organizations directly to confirm availability and eligibility.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>No Warranty on Accuracy</h2>
          <p style={bodyStyle}>
            We work hard to keep information current but cannot guarantee that all program details, links, or eligibility requirements are accurate or up to date. Programs change, close, or move without notice.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>External Links</h2>
          <p style={bodyStyle}>
            CancerCompass links to third-party websites we do not control. We are not responsible for the content, availability, or accuracy of those sites.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>Limitation of Liability</h2>
          <p style={bodyStyle}>
            CancerCompass is a free volunteer-run tool. To the fullest extent permitted by law, the creator is not liable for any damages arising from use of or reliance on this site.
          </p>
        </section>

        <section style={{
          ...sectionStyle,
          background: "#f0f8f6",
          border: "1.5px solid #c8e8e4",
          borderRadius: "12px",
          padding: "20px 24px",
        }}>
          <h2 style={headingStyle}>🔒 Privacy</h2>
          <p style={bodyStyle}>
            Your health information never leaves your device. We use Google Analytics to count anonymous visits only. No personal information is collected or shared.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>Changes to These Terms</h2>
          <p style={bodyStyle}>
            These terms may be updated at any time. Continued use of the site constitutes acceptance.
          </p>
        </section>

        <section style={{ ...sectionStyle, marginBottom: "40px" }}>
          <h2 style={headingStyle}>Contact</h2>
          <p style={bodyStyle}>
            You can reach us via the <strong>Send Feedback</strong> button on any page.
          </p>
        </section>

        <div style={{ textAlign: "center", paddingBottom: "16px" }}>
          <button className="btn-ghost" onClick={onBack}>
            ← Back to Search
          </button>
        </div>

      </div>
    </div>
  );
}
