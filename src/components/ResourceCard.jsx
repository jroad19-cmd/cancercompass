import { useState } from "react";
import { TYPE_LABELS } from "../data/resources";

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function ResourceCard({ resource }) {
  const [bookmarked, setBookmarked] = useState(false);
  const typeInfo = TYPE_LABELS[resource.type] || { label: resource.type, className: "tag-financial" };

  return (
    <div style={{
      border: "1.5px solid #e8e8e4",
      borderRadius: "12px",
      padding: "18px",
      background: "white",
      transition: "all 0.2s",
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = "var(--teal)";
      e.currentTarget.style.boxShadow = "0 4px 16px rgba(42,124,124,0.1)";
      e.currentTarget.style.transform = "translateY(-1px)";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = "#e8e8e4";
      e.currentTarget.style.boxShadow = "none";
      e.currentTarget.style.transform = "none";
    }}>

      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "8px" }}>
        <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--navy)", lineHeight: 1.3 }}>
          {resource.name}
        </div>
        <button
          onClick={() => setBookmarked(b => !b)}
          title={bookmarked ? "Remove bookmark" : "Save this resource"}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: "20px", padding: "0", flexShrink: 0,
            color: bookmarked ? "var(--teal)" : "#ccc",
            transition: "color 0.2s, transform 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.2)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          🔖
        </button>
      </div>

      {/* Type tag */}
      <span className={`type-tag ${typeInfo.className}`}>{typeInfo.label}</span>

      {/* Description */}
      <p style={{ fontSize: "14px", color: "#5a5a55", lineHeight: 1.55, marginBottom: "10px" }}>
        {resource.description}
      </p>

      {/* Who qualifies */}
      <p style={{ fontSize: "13px", color: "var(--mid-gray)", marginBottom: "14px" }}>
        <strong style={{ color: "var(--dark)" }}>Who qualifies: </strong>
        {resource.qualifies}
      </p>

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
          {resource.lastReviewed && (
            <span style={{ fontSize: "12px", color: "var(--mid-gray)", display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ color: "var(--green)" }}>✓</span>
              Reviewed {formatDate(resource.lastReviewed)}
            </span>
          )}
          {resource.phone && (
            <span style={{ fontSize: "13px", color: "var(--teal)", fontWeight: 500 }}>
              📞 {resource.phone}
            </span>
          )}
        </div>
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-apply"
        >
          Learn More / Apply →
        </a>
      </div>
    </div>
  );
}
