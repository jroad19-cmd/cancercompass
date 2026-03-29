import { useState, useEffect } from "react";
import { TYPE_LABELS } from "../data/resources";
import { isSaved, saveResource, unsaveResource } from "./SavedResourcesPage";

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function ResourceCard({ resource, onSaveChange }) {
  const [bookmarked, setBookmarked] = useState(false);
  const [toast, setToast]           = useState(null);

  useEffect(() => {
    setBookmarked(isSaved(resource.id));
  }, [resource.id]);

  function toggleBookmark() {
    if (bookmarked) {
      unsaveResource(resource.id);
      setBookmarked(false);
      showToast("removed");
    } else {
      saveResource(resource);
      setBookmarked(true);
      showToast("saved");
    }
    if (onSaveChange) onSaveChange();
  }

  function showToast(type) {
    setToast(type);
    setTimeout(() => setToast(null), 2000);
  }

  const typeInfo = TYPE_LABELS[resource.type] || { label: resource.type, className: "tag-financial" };

  return (
    <div style={{ position: "relative" }}>
      {toast && (
        <div style={{
          position: "absolute", top: "-12px", right: "0",
          background: toast === "saved" ? "var(--teal)" : "#888",
          color: "white", borderRadius: "8px", padding: "6px 14px",
          fontSize: "13px", fontWeight: 600, zIndex: 10,
          animation: "fadeUp 0.2s ease", whiteSpace: "nowrap",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}>
          {toast === "saved" ? "✓ Saved to your list" : "Removed from your list"}
        </div>
      )}

      <div style={{
        border: `1.5px solid ${bookmarked ? "var(--teal)" : "#e8e8e4"}`,
        borderRadius: "12px", padding: "18px", background: "white",
        transition: "all 0.2s",
        boxShadow: bookmarked ? "0 2px 12px rgba(42,124,124,0.12)" : "none",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "8px" }}>
          <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--navy)", lineHeight: 1.3 }}>
            {resource.name}
          </div>
          <button
            onClick={toggleBookmark}
            title={bookmarked ? "Remove bookmark" : "Save this resource"}
            style={{
              background: bookmarked ? "var(--teal-pale)" : "none",
              border: bookmarked ? "1px solid #c5e0e0" : "none",
              borderRadius: "8px", cursor: "pointer", fontSize: "18px",
              padding: bookmarked ? "4px 8px" : "0", flexShrink: 0,
              color: bookmarked ? "var(--teal)" : "#ccc",
              transition: "all 0.2s", display: "flex", alignItems: "center", gap: "4px",
            }}
          >
            🔖 {bookmarked && <span style={{ fontSize: "12px", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>Saved</span>}
          </button>
        </div>

        <span className={`type-tag ${typeInfo.className}`}>{typeInfo.label}</span>

        <p style={{ fontSize: "14px", color: "#5a5a55", lineHeight: 1.55, marginBottom: "10px" }}>
          {resource.description}
        </p>

        <p style={{ fontSize: "13px", color: "var(--mid-gray)", marginBottom: "14px" }}>
          <strong style={{ color: "var(--dark)" }}>Who qualifies: </strong>
          {resource.qualifies}
        </p>

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
          <a href={resource.url} target="_blank" rel="noopener noreferrer" className="btn-apply">
            Learn More / Apply →
          </a>
        </div>
      </div>
    </div>
  );
}
