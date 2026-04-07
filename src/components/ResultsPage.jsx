import { useState, useCallback } from "react";
import { getFilteredResources, RESOURCE_TYPES } from "../data/resources";
import ResourceCard from "./ResourceCard";
import FeedbackForm from "./FeedbackForm";
import { loadSaved } from "./SavedResourcesPage";

function Section({ emoji, title, resources, defaultOpen, onSaveChange }) {
  const [open, setOpen] = useState(defaultOpen || false);

  return (
    <div style={{
      background: "white", borderRadius: "16px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.07)", marginBottom: "16px", overflow: "hidden",
    }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 20px", cursor: "pointer", userSelect: "none",
          transition: "background 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "var(--soft-gray)"}
        onMouseLeave={e => e.currentTarget.style.background = "white"}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span>{emoji}</span>
          <span style={{ fontSize: "16px", fontWeight: 600, color: "var(--navy)" }}>{title}</span>
          <span style={{
            background: "var(--teal-pale)", color: "var(--teal)",
            borderRadius: "12px", padding: "2px 10px",
            fontSize: "13px", fontWeight: 600,
          }}>
            {resources.length}
          </span>
        </div>
        <span style={{
          color: "var(--mid-gray)", fontSize: "20px",
          transition: "transform 0.3s",
          display: "inline-block",
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
        }}>⌄</span>
      </div>

      {open && (
        <div style={{
          borderTop: "1px solid #f0f0ec",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}>
          {resources.length === 0 ? (
            <p style={{ fontSize: "14px", color: "var(--mid-gray)", textAlign: "center", padding: "12px 0" }}>
              No resources found for this filter.
            </p>
          ) : (
            resources.map(r => <ResourceCard key={r.id} resource={r} onSaveChange={onSaveChange} />)
          )}
        </div>
      )}
    </div>
  );
}

export default function ResultsPage({ profile, onBack, onAbout, onViewSaved }) {
  const [typeFilter, setTypeFilter] = useState("all");
  const [showFeedback, setShowFeedback] = useState(false);
  const [savedCount, setSavedCount] = useState(() => loadSaved().length);

  const handleSaveChange = useCallback(() => {
    setSavedCount(loadSaved().length);
  }, []);

  const { national: rawNational, stateSpecific: rawState, cancerSpecific: rawCancer, total } =
    getFilteredResources(profile.cancerType, profile.state, typeFilter);

  // Apply admin overrides and removals
  const removed = JSON.parse(localStorage.getItem("cancercompass_removed") || "[]");
  const overrides = JSON.parse(localStorage.getItem("cancercompass_resource_overrides") || "{}");
  const applyOverrides = (arr) => arr
    .filter(r => !removed.includes(r.id))
    .map(r => ({ ...r, ...(overrides[r.id] || {}) }));
  const national = applyOverrides(rawNational);
  const stateSpecific = applyOverrides(rawState);
  const cancerSpecific = applyOverrides(rawCancer);

  return (
    <div style={{ paddingBottom: "40px" }}>
      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, var(--navy) 0%, var(--teal) 100%)",
        padding: "28px 24px",
        color: "white",
      }}>
        <div style={{ fontFamily: "'Lora', serif", fontSize: "20px", fontWeight: 600, marginBottom: "6px" }}>
          {profile.cancerType} resources in {profile.state}
        </div>
        <div style={{ fontSize: "14px", opacity: 0.8 }}>
          {total} program{total !== 1 ? "s" : ""} found for you
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{
        background: "var(--warning-bg)",
        borderBottom: "1px solid #f0d8b0",
        padding: "10px 24px",
        fontSize: "12px",
        color: "#7a5a20",
        lineHeight: 1.5,
        display: "flex",
        alignItems: "flex-start",
        gap: "8px",
      }}>
        <span style={{ flexShrink: 0 }}>⚠️</span>
        <span>We work hard to keep this tool as helpful and up to date as possible. New programs, grants, and resources are added regularly, and existing information is reviewed and updated often. We encourage you to check back from time to time, as new help may become available. However, things can change — links may stop working or new help may appear. If you notice a broken link, outdated information, or know of a resource that could help other cancer patients, please use the "Send Feedback" button to let us know. Your feedback helps us improve this tool and support more people.</span>
      </div>

      {/* Filter bar */}
      <div style={{
        background: "white", borderBottom: "1px solid #eee",
        padding: "14px 20px", display: "flex", alignItems: "center", gap: "12px",
      }}>
        <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--mid-gray)", whiteSpace: "nowrap" }}>
          Filter by:
        </label>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          style={{ flex: 1, maxWidth: "240px", padding: "8px 12px", fontSize: "13px", borderRadius: "8px" }}
        >
          {RESOURCE_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Results */}
      <div style={{ padding: "20px 16px", maxWidth: "720px", margin: "0 auto" }}>

        {total === 0 ? (
          <div style={{
            background: "white", borderRadius: "16px", padding: "40px 24px",
            textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
          }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔍</div>
            <h3 style={{ fontFamily: "'Lora', serif", color: "var(--navy)", marginBottom: "8px" }}>
              No results for this filter
            </h3>
            <p style={{ fontSize: "14px", color: "var(--mid-gray)" }}>
              Try selecting "All Types of Help" to see all available programs.
            </p>
          </div>
        ) : (
          <>
            <p style={{ textAlign: "center", fontSize: "13px", color: "#5a5a55", margin: "0 0 16px" }}>
              👇 Tap any section below to see matching programs.
            </p>
            {national.length > 0 && (
              <Section emoji="🏛️" title="National Programs" resources={national} onSaveChange={handleSaveChange} />
            )}
            {stateSpecific.length > 0 && (
              <Section emoji="🗺️" title={`${profile.state} Programs`} resources={stateSpecific} onSaveChange={handleSaveChange} />
            )}
            {cancerSpecific.length > 0 && (
              <Section emoji="💊" title={`${profile.cancerType} Programs`} resources={cancerSpecific} onSaveChange={handleSaveChange} />
            )}
          </>
        )}

        {/* Footer actions */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: "12px", marginTop: "24px",
        }}>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button className="btn-outline" onClick={() => setShowFeedback(true)}>
              💬 Send Feedback
            </button>
            {savedCount > 0 && (
              <button
                onClick={onViewSaved}
                style={{
                  background: "var(--teal)", color: "white", border: "none",
                  borderRadius: "10px", padding: "11px 20px",
                  fontFamily: "'DM Sans', sans-serif", fontSize: "14px",
                  fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                  display: "flex", alignItems: "center", gap: "8px",
                }}
              >
                🔖 My Saved Resources
                <span style={{
                  background: "rgba(255,255,255,0.25)", borderRadius: "12px",
                  padding: "1px 8px", fontSize: "12px",
                }}>
                  {savedCount}
                </span>
              </button>
            )}
          </div>
          <button className="btn-ghost" onClick={onBack}>
            ← Edit My Profile
          </button>
        </div>
      </div>

      {showFeedback && <FeedbackForm onClose={() => setShowFeedback(false)} />}

      <footer className="cc-footer">
        <strong>CancerCompass</strong><br />
        CancerCompass is a free public resource created and maintained by an individual volunteer who lost his wife of 47 years to cancer and would like to help as many cancer patients as possible. It is not a medical organization, licensed healthcare provider, or legal entity. The information provided is for general informational purposes only and does not constitute medical, legal, or financial advice. We do not verify the current status of individual programs before each visit — always contact organizations directly to confirm availability and eligibility. CancerCompass is not responsible for the accuracy, completeness, or availability of any listed resource. Use of this site is at your own risk. We do not endorse, recommend, or have any affiliation with the organizations listed.<br /><br />
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={onAbout} style={{
            background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.4)",
            borderRadius: "8px", color: "white",
            fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 600,
            cursor: "pointer", marginTop: "14px", padding: "8px 18px",
          }}>
            ℹ️ About CancerCompass
          </button>
          <button onClick={() => setShowFeedback(true)} style={{
            background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.4)",
            borderRadius: "8px", color: "white",
            fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 600,
            cursor: "pointer", marginTop: "14px", padding: "8px 18px",
          }}>
            💬 Send Feedback
          </button>
        </div>
      </footer>
    </div>
  );
}
