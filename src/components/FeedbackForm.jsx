import { useState } from "react";

const FEEDBACK_KEY = "cancercompass_feedback";
const FORMSPREE_URL = "https://formspree.io/f/mqegqydg";

export function loadFeedback() {
  try {
    const raw = localStorage.getItem(FEEDBACK_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export default function FeedbackForm({ onClose }) {
  const [form, setForm] = useState({
    type: "",
    resourceName: "",
    description: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending,   setSending]   = useState(false);

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.type || !form.description) return;
    setSending(true);

    // Save locally
    const existing = loadFeedback();
    const entry = {
      ...form,
      submittedAt: new Date().toISOString(),
      status: "pending",
      id: "f_" + Math.random().toString(36).slice(2, 10),
    };
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify([...existing, entry]));

    // Send to Formspree (email notification)
    try {
      await fetch(FORMSPREE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          feedbackType:  form.type,
          resourceName:  form.resourceName || "N/A",
          description:   form.description,
          submittedAt:   new Date().toLocaleString(),
        }),
      });
    } catch (err) {
      // Still show success — local save worked even if email failed
      console.error("Formspree error:", err);
    }

    setSending(false);
    setSubmitted(true);
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
      zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px", overflowY: "auto",
    }}>
      <div style={{
        background: "white", borderRadius: "20px", padding: "32px 28px",
        maxWidth: "480px", width: "100%", maxHeight: "90vh", overflowY: "auto",
      }}>
        {submitted ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🙏</div>
            <h3 style={{ fontFamily: "'Lora', serif", fontSize: "22px", color: "var(--navy)", marginBottom: "10px" }}>
              Thank you!
            </h3>
            <p style={{ fontSize: "15px", color: "#5a5a55", lineHeight: 1.6, marginBottom: "24px" }}>
              Your feedback has been received and will be reviewed. Every message helps make CancerCompass better for everyone.
            </p>
            <button className="btn-primary" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <h3 style={{ fontFamily: "'Lora', serif", fontSize: "20px", color: "var(--navy)" }}>
                Send Feedback
              </h3>
              <button onClick={onClose} style={{
                background: "none", border: "none", fontSize: "20px",
                cursor: "pointer", color: "var(--mid-gray)",
              }}>✕</button>
            </div>

            <p style={{ fontSize: "14px", color: "#5a5a55", marginBottom: "22px", lineHeight: 1.5 }}>
              Found an error? Have a suggestion? Want to recommend a resource? We'd love to hear from you.
            </p>

            <div className="field-group">
              <div className="field-label">
                <span className="required-star">✦</span> What type of feedback?
              </div>
              <select value={form.type} onChange={e => set("type", e.target.value)}>
                <option value="">Select type...</option>
                <option value="error">🔴 Report an Error</option>
                <option value="resource">➕ Suggest a Resource</option>
                <option value="improvement">💡 Suggest an Improvement</option>
                <option value="other">💬 Other</option>
              </select>
            </div>

            {form.type === "error" && (
              <div className="field-group">
                <div className="field-label">
                  Which resource has the error?
                  <span className="optional-tag" style={{ marginLeft: "6px" }}>(optional)</span>
                </div>
                <input
                  type="text"
                  value={form.resourceName}
                  onChange={e => set("resourceName", e.target.value)}
                  placeholder="e.g. Susan G. Komen Foundation"
                />
              </div>
            )}

            {form.type === "resource" && (
              <div className="field-group">
                <div className="field-label">
                  Resource or organization name
                  <span className="optional-tag" style={{ marginLeft: "6px" }}>(optional)</span>
                </div>
                <input
                  type="text"
                  value={form.resourceName}
                  onChange={e => set("resourceName", e.target.value)}
                  placeholder="e.g. American Cancer Society"
                />
              </div>
            )}

            <div className="field-group">
              <div className="field-label">
                <span className="required-star">✦</span> Tell us more
              </div>
              <textarea
                value={form.description}
                onChange={e => set("description", e.target.value)}
                placeholder={
                  form.type === "error"       ? "What's wrong? (e.g. broken link, wrong phone number, outdated info)" :
                  form.type === "resource"    ? "Tell us about this resource — website, who it helps, type of support..." :
                  form.type === "improvement" ? "What would make CancerCompass more helpful?" :
                  "Tell us what's on your mind..."
                }
                style={{ minHeight: "100px" }}
              />
            </div>

            {(!form.type || !form.description) && (
              <p style={{ fontSize: "13px", color: "var(--mid-gray)", marginBottom: "12px" }}>
                * Feedback type and description are required.
              </p>
            )}

            <button
              className="btn-find"
              onClick={handleSubmit}
              disabled={!form.type || !form.description || sending}
              style={{ opacity: (!form.type || !form.description || sending) ? 0.5 : 1 }}
            >
              {sending ? "Sending..." : "Send Feedback"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
