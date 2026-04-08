import { useState, useEffect } from "react";
import { TYPE_LABELS } from "../data/resources";

const SAVED_KEY = "cancercompass_saved_resources";

export function loadSaved() {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveResource(resource) {
  const saved = loadSaved();
  if (!saved.find(r => r.id === resource.id)) {
    localStorage.setItem(SAVED_KEY, JSON.stringify([...saved, resource]));
  }
}

export function unsaveResource(id) {
  const saved = loadSaved().filter(r => r.id !== id);
  localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
}

export function isSaved(id) {
  return loadSaved().some(r => r.id === id);
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function SavedResourcesPage({ onBack, onTerms }) {
  const [saved, setSaved] = useState([]);
  const [removeConfirm, setRemoveConfirm] = useState(null);

  useEffect(() => {
    setSaved(loadSaved());
  }, []);

  function handleRemove(id) {
    unsaveResource(id);
    setSaved(loadSaved());
    setRemoveConfirm(null);
  }

  return (
    <div style={{ paddingBottom: "40px" }}>
      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, var(--navy) 0%, var(--teal) 100%)",
        padding: "28px 24px",
        color: "white",
      }}>
        <div style={{ fontFamily: "'Lora', serif", fontSize: "20px", fontWeight: 600, marginBottom: "6px" }}>
          🔖 My Saved Resources
        </div>
        <div style={{ fontSize: "14px", opacity: 0.8 }}>
          {saved.length} resource{saved.length !== 1 ? "s" : ""} saved on this device
        </div>
      </div>

      <div style={{ padding: "20px 16px", maxWidth: "720px", margin: "0 auto" }}>

        {/* Empty state */}
        {saved.length === 0 ? (
          <div style={{
            background: "white", borderRadius: "16px", padding: "48px 24px",
            textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔖</div>
            <h3 style={{ fontFamily: "'Lora', serif", color: "var(--navy)", marginBottom: "10px" }}>
              No saved resources yet
            </h3>
            <p style={{ fontSize: "14px", color: "var(--mid-gray)", marginBottom: "24px", lineHeight: 1.6 }}>
              When you find a resource that looks helpful, tap the bookmark icon to save it here for easy access later.
            </p>
            <button className="btn-primary" style={{ maxWidth: "240px", margin: "0 auto" }} onClick={onBack}>
              Find Resources
            </button>
          </div>
        ) : (
          <>
            <p style={{ fontSize: "13px", color: "var(--mid-gray)", marginBottom: "16px" }}>
              Saved resources are stored on this device only and will remain until you remove them.
            </p>

            {saved.map(r => {
              const typeInfo = TYPE_LABELS[r.type] || { label: r.type, className: "tag-financial" };
              return (
                <div key={r.id} style={{
                  border: "1.5px solid #e8e8e4", borderRadius: "12px",
                  padding: "18px", background: "white", marginBottom: "12px",
                  transition: "all 0.2s",
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "8px" }}>
                    <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--navy)", lineHeight: 1.3 }}>
                      {r.name}
                    </div>
                    <button
                      onClick={() => setRemoveConfirm(r.id)}
                      title="Remove bookmark"
                      style={{
                        background: "none", border: "none", cursor: "pointer",
                        fontSize: "18px", padding: "0", flexShrink: 0, color: "var(--teal)",
                        transition: "transform 0.2s",
                      }}
                    >
                      🔖
                    </button>
                  </div>

                  <span className={`type-tag ${typeInfo.className}`}>{typeInfo.label}</span>

                  <p style={{ fontSize: "14px", color: "#5a5a55", lineHeight: 1.55, marginBottom: "10px" }}>
                    {r.description}
                  </p>

                  <p style={{ fontSize: "13px", color: "var(--mid-gray)", marginBottom: "12px" }}>
                    <strong style={{ color: "var(--dark)" }}>Who qualifies: </strong>{r.qualifies}
                  </p>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
                      {r.lastReviewed && (
                        <span style={{ fontSize: "12px", color: "var(--mid-gray)", display: "flex", alignItems: "center", gap: "4px" }}>
                          <span style={{ color: "var(--green)" }}>✓</span>
                          Reviewed {formatDate(r.lastReviewed)}
                        </span>
                      )}
                      {r.phone && (
                        <span style={{ fontSize: "13px", color: "var(--teal)", fontWeight: 500 }}>
                          📞 {r.phone}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => window.open(r.url, "_blank", "noopener,noreferrer")}
                      className="btn-apply"
                    >
                      Learn More / Apply ↗
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        )}

        <div style={{ marginTop: "24px" }}>
          <button className="btn-ghost" onClick={onBack}>← Back to Results</button>
        </div>
      </div>

      {/* Remove confirmation modal */}
      {removeConfirm && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
          zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
        }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "28px", maxWidth: "360px", width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>🔖</div>
            <h3 style={{ fontFamily: "'Lora', serif", fontSize: "18px", color: "var(--navy)", marginBottom: "10px" }}>
              Remove this resource?
            </h3>
            <p style={{ fontSize: "14px", color: "#5a5a55", marginBottom: "20px" }}>
              It will be removed from your saved list. You can always save it again from the results page.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setRemoveConfirm(null)} className="btn-ghost" style={{ flex: 1 }}>Keep It</button>
              <button onClick={() => handleRemove(removeConfirm)} style={{
                flex: 1, background: "#cc3333", color: "white", border: "none",
                borderRadius: "10px", padding: "12px",
                fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 600, cursor: "pointer",
              }}>Remove</button>
            </div>
          </div>
        </div>
      )}

      <footer className="cc-footer">
        <strong>CancerCompass</strong><br />
        CancerCompass is a free public resource created and maintained by an individual volunteer who lost his wife of 47 years to cancer and would like to help as many cancer patients as possible. It is not a medical organization, licensed healthcare provider, or legal entity. The information provided is for general informational purposes only and does not constitute medical, legal, or financial advice. Always contact organizations directly to confirm availability and eligibility. We do not endorse, recommend, or have any affiliation with the organizations listed.
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={onTerms} style={{
            background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.4)",
            borderRadius: "8px", color: "white",
            fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 600,
            cursor: "pointer", marginTop: "14px", padding: "8px 18px",
          }}>
            📄 Terms of Use
          </button>
        </div>
      </footer>
    </div>
  );
}
