import { useState } from "react";
import { RESOURCE_TYPES } from "../data/resources";

const SUGGEST_KEY = "cancercompass_suggestions";

export default function SuggestForm({ onClose }) {
  const [form, setForm] = useState({
    name: "", url: "", phone: "", type: "", description: "", notes: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function handleSubmit() {
    if (!form.name || !form.url) return;
    const existing = JSON.parse(localStorage.getItem(SUGGEST_KEY) || "[]");
    const entry = {
      ...form,
      submittedAt: new Date().toISOString(),
      status: "pending",
      id: "s_" + Math.random().toString(36).slice(2, 10),
    };
    localStorage.setItem(SUGGEST_KEY, JSON.stringify([...existing, entry]));
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
        maxWidth: "500px", width: "100%", maxHeight: "90vh", overflowY: "auto",
      }}>
        {submitted ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🙏</div>
            <h3 style={{ fontFamily: "'Lora', serif", fontSize: "22px", color: "var(--navy)", marginBottom: "10px" }}>
              Thank you!
            </h3>
            <p style={{ fontSize: "15px", color: "#5a5a55", lineHeight: 1.6, marginBottom: "24px" }}>
              Your suggestion has been saved for review. If it meets our guidelines, it will be added to CancerCompass.
            </p>
            <button className="btn-primary" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h3 style={{ fontFamily: "'Lora', serif", fontSize: "20px", color: "var(--navy)" }}>
                Suggest a Resource
              </h3>
              <button onClick={onClose} style={{
                background: "none", border: "none", fontSize: "20px",
                cursor: "pointer", color: "var(--mid-gray)",
              }}>✕</button>
            </div>

            <p style={{ fontSize: "14px", color: "#5a5a55", marginBottom: "20px", lineHeight: 1.5 }}>
              Know of a resource that should be listed? Share it below and we'll review it before adding it to CancerCompass.
            </p>

            <div className="field-group">
              <div className="field-label"><span className="required-star">✦</span> Organization name</div>
              <input type="text" value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. American Cancer Society" />
            </div>

            <div className="field-group">
              <div className="field-label"><span className="required-star">✦</span> Website URL</div>
              <input type="text" value={form.url} onChange={e => set("url", e.target.value)} placeholder="https://..." />
            </div>

            <div className="field-group">
              <div className="field-label">Phone number <span className="optional-tag">(optional)</span></div>
              <input type="text" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="1-800-..." />
            </div>

            <div className="field-group">
              <div className="field-label">Type of help <span className="optional-tag">(optional)</span></div>
              <select value={form.type} onChange={e => set("type", e.target.value)}>
                <option value="">Select type...</option>
                {RESOURCE_TYPES.filter(t => t.value !== "all").map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <div className="field-label">Brief description <span className="optional-tag">(optional)</span></div>
              <textarea
                value={form.description}
                onChange={e => set("description", e.target.value)}
                placeholder="What does this organization help with?"
              />
            </div>

            <div className="field-group">
              <div className="field-label">Any other notes <span className="optional-tag">(optional)</span></div>
              <textarea
                value={form.notes}
                onChange={e => set("notes", e.target.value)}
                placeholder="Anything else we should know..."
              />
            </div>

            {(!form.name || !form.url) && (
              <p style={{ fontSize: "13px", color: "var(--mid-gray)", marginBottom: "12px" }}>
                * Organization name and website are required.
              </p>
            )}

            <button
              className="btn-find"
              onClick={handleSubmit}
              disabled={!form.name || !form.url}
              style={{ opacity: (!form.name || !form.url) ? 0.5 : 1 }}
            >
              Submit Suggestion
            </button>
          </>
        )}
      </div>
    </div>
  );
}
