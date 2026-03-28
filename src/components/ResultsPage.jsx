import { useState } from "react";
import { getFilteredResources, RESOURCE_TYPES } from "../data/resources";
import ResourceCard from "./ResourceCard";
import SuggestForm from "./SuggestForm";

function Section({ emoji, title, resources, defaultOpen }) {
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
            resources.map(r => <ResourceCard key={r.id} resource={r} />)
          )}
        </div>
      )}
    </div>
  );
}

export default function ResultsPage({ profile, onBack }) {
  const [typeFilter, setTypeFilter] = useState("all");
  const [showSuggest, setShowSuggest] = useState(false);

  const { national, stateSpecific, cancerSpecific, total } =
    getFilteredResources(profile.cancerType, profile.state, typeFilter);

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
        CancerCompass provides this as a free public service. We do not endorse these organizations. Always verify details directly before applying.
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
            {national.length > 0 && (
              <Section emoji="🏛️" title="National Programs" resources={national} />
            )}
            {stateSpecific.length > 0 && (
              <Section emoji="🗺️" title={`${profile.state} Programs`} resources={stateSpecific} />
            )}
            {cancerSpecific.length > 0 && (
              <Section emoji="💊" title={`${profile.cancerType} Programs`} resources={cancerSpecific} />
            )}
          </>
        )}

        {/* Footer actions */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: "12px", marginTop: "24px",
        }}>
          <button className="btn-outline" onClick={() => setShowSuggest(true)}>
            + Suggest a Resource
          </button>
          <button className="btn-ghost" onClick={onBack}>
            ← Edit My Profile
          </button>
        </div>
      </div>

      {showSuggest && <SuggestForm onClose={() => setShowSuggest(false)} />}

      <footer className="cc-footer">
        <strong>CancerCompass</strong><br />
        We do not endorse, recommend, or have any affiliation with the organizations listed.<br />
        Always verify details directly with the organization before applying.
      </footer>
    </div>
  );
}
