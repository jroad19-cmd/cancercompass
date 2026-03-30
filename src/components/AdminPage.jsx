import { useState, useEffect } from "react";
import { resources as allResources, TYPE_LABELS, CANCER_TYPES, US_STATES, RESOURCE_TYPES } from "../data/resources";
import { loadFeedback } from "./FeedbackForm";

const REVIEWED_KEY = "cancercompass_reviewed_dates";

function loadReviewedDates() {
  try {
    const raw = localStorage.getItem(REVIEWED_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveReviewedDate(id) {
  const dates = loadReviewedDates();
  dates[id] = new Date().toISOString().split("T")[0];
  localStorage.setItem(REVIEWED_KEY, JSON.stringify(dates));
  return dates;
}

function getEffectiveDate(r, reviewedDates) {
  return reviewedDates[r.id] || r.lastReviewed;
}

function daysSince(dateStr) {
  if (!dateStr) return 999;
  const d = new Date(dateStr);
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
}

function reviewStatus(dateStr) {
  const days = daysSince(dateStr);
  if (days < 60)  return { label: "✅ Up to date",  color: "#27ae60", bg: "#e8fdf0" };
  if (days < 90)  return { label: "🟡 Due soon",    color: "#d4821a", bg: "#fef5e7" };
  return              { label: "🔴 Overdue",      color: "#cc3333", bg: "#fde8e8" };
}

function formatDate(str) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminPage() {
  const [tab, setTab] = useState("submissions");
  const [suggestions, setSuggestions] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [reviewedDates, setReviewedDates] = useState(() => loadReviewedDates());
  const [declineConfirm, setDeclineConfirm] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem(SUGGEST_KEY);
    setSuggestions(raw ? JSON.parse(raw) : []);
    setFeedback(loadFeedback());
  }, []);

  function saveSuggestions(updated) {
    setSuggestions(updated);
    localStorage.setItem(SUGGEST_KEY, JSON.stringify(updated));
  }

  function approveSuggestion(id) {
    saveSuggestions(suggestions.map(s => s.id === id ? { ...s, status: "approved" } : s));
  }

  function declineSuggestion(id) {
    saveSuggestions(suggestions.filter(s => s.id !== id));
    setDeclineConfirm(null);
  }

  const pending      = suggestions.filter(s => s.status === "pending");
  const pendingFeedback = feedback.filter(f => f.status === "pending");
  const overdue      = allResources.filter(r => daysSince(r.lastReviewed) >= 60);
  const showBanner   = pending.length > 0 || overdue.length > 0 || pendingFeedback.length > 0;

  const tabs = [
    { key: "submissions", label: `Resource Submissions${pending.length ? ` (${pending.length})` : ""}` },
    { key: "feedback",    label: `Feedback${pendingFeedback.length ? ` (${pendingFeedback.length})` : ""}` },
    { key: "rechecks",    label: "Re-check Resources" },
    { key: "manage",      label: "Manage Resources" },
  ];

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "24px 16px 60px" }}>
      <h1 style={{ fontFamily: "'Lora', serif", fontSize: "26px", color: "var(--navy)", marginBottom: "6px" }}>
        🔐 Admin Dashboard
      </h1>
      <p style={{ fontSize: "14px", color: "var(--mid-gray)", marginBottom: "24px" }}>
        Private area — CancerCompass resource management
      </p>

      {/* Attention banner */}
      {showBanner && (
        <div style={{
          background: "#fef5e7", border: "1.5px solid #f0d8b0",
          borderRadius: "12px", padding: "16px 20px", marginBottom: "20px",
        }}>
          <div style={{ fontWeight: 600, color: "#7a5a20", marginBottom: "6px" }}>⚠️ Action needed</div>
          {pending.length > 0 && (
            <div style={{ fontSize: "14px", color: "#7a5a20" }}>• {pending.length} resource submission{pending.length > 1 ? "s" : ""} waiting for review</div>
          )}
          {pendingFeedback.length > 0 && (
            <div style={{ fontSize: "14px", color: "#7a5a20" }}>• {pendingFeedback.length} feedback message{pendingFeedback.length > 1 ? "s" : ""} waiting for review</div>
          )}
          {overdue.length > 0 && (
            <div style={{ fontSize: "14px", color: "#7a5a20" }}>• {overdue.length} resource{overdue.length > 1 ? "s" : ""} need a re-check</div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "24px", borderBottom: "2px solid #eee", paddingBottom: "0" }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              background: "none", border: "none", padding: "10px 16px",
              fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 600,
              cursor: "pointer", borderBottom: tab === t.key ? "2px solid var(--teal)" : "2px solid transparent",
              color: tab === t.key ? "var(--teal)" : "var(--mid-gray)",
              marginBottom: "-2px", transition: "color 0.2s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: Submissions ── */}
      {tab === "submissions" && (
        <div>
          {pending.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--mid-gray)" }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>✅</div>
              <p style={{ fontSize: "15px" }}>No submissions waiting for review.</p>
            </div>
          ) : (
            pending.map(s => (
              <div key={s.id} style={{
                border: "1.5px solid #e8e8e4", borderRadius: "12px",
                padding: "18px", marginBottom: "12px", background: "white",
              }}>
                <div style={{ fontWeight: 600, fontSize: "15px", color: "var(--navy)", marginBottom: "6px" }}>{s.name}</div>
                <div style={{ fontSize: "13px", color: "var(--teal)", marginBottom: "4px" }}>🔗 {s.url}</div>
                {s.phone && <div style={{ fontSize: "13px", color: "var(--mid-gray)", marginBottom: "4px" }}>📞 {s.phone}</div>}
                {s.type && <div style={{ fontSize: "13px", color: "var(--mid-gray)", marginBottom: "4px" }}>Type: {s.type}</div>}
                {s.description && <p style={{ fontSize: "14px", color: "#5a5a55", margin: "8px 0" }}>{s.description}</p>}
                {s.notes && <p style={{ fontSize: "13px", color: "var(--mid-gray)", marginBottom: "8px" }}>Notes: {s.notes}</p>}
                <div style={{ fontSize: "12px", color: "var(--mid-gray)", marginBottom: "14px" }}>
                  Submitted {formatDate(s.submittedAt)}
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => approveSuggestion(s.id)}
                    style={{
                      background: "var(--green)", color: "white", border: "none",
                      borderRadius: "8px", padding: "9px 18px", fontFamily: "'DM Sans', sans-serif",
                      fontSize: "13px", fontWeight: 600, cursor: "pointer",
                    }}
                  >✓ Approve</button>
                  <button
                    onClick={() => setDeclineConfirm(s.id)}
                    style={{
                      background: "#fde8e8", color: "#cc3333", border: "none",
                      borderRadius: "8px", padding: "9px 18px", fontFamily: "'DM Sans', sans-serif",
                      fontSize: "13px", fontWeight: 600, cursor: "pointer",
                    }}
                  >✕ Decline</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── TAB 2: Feedback ── */}
      {tab === "feedback" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
            <p style={{ fontSize: "14px", color: "var(--mid-gray)" }}>
              All feedback submitted by users — errors, suggestions, feature requests, and other messages.
            </p>
            {feedback.length > 0 && (
              <button
                onClick={() => {
                  localStorage.removeItem("cancercompass_feedback");
                  setFeedback([]);
                }}
                style={{
                  background: "var(--soft-gray)", border: "none", borderRadius: "8px",
                  padding: "8px 16px", fontFamily: "'DM Sans', sans-serif",
                  fontSize: "13px", fontWeight: 600, cursor: "pointer", color: "var(--mid-gray)",
                  whiteSpace: "nowrap",
                }}
              >
                ✓ Clear All Reviewed
              </button>
            )}
          </div>
          {feedback.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--mid-gray)" }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>💬</div>
              <p style={{ fontSize: "15px" }}>No feedback received yet.</p>
            </div>
          ) : (
            [...feedback].reverse().map(f => {
              const typeColors = {
                error:       { bg: "#fde8e8", color: "#cc3333", label: "🔴 Error Report" },
                resource:    { bg: "var(--teal-pale)", color: "var(--teal)", label: "➕ Resource Suggestion" },
                improvement: { bg: "#fef5e7", color: "#b8690a", label: "💡 Improvement" },
                other:       { bg: "var(--soft-gray)", color: "var(--mid-gray)", label: "💬 Other" },
              };
              const style = typeColors[f.type] || typeColors.other;
              return (
                <div key={f.id} style={{
                  border: "1.5px solid #e8e8e4", borderRadius: "12px",
                  padding: "18px", marginBottom: "12px", background: "white",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
                    <span style={{
                      background: style.bg, color: style.color,
                      borderRadius: "8px", padding: "4px 12px",
                      fontSize: "13px", fontWeight: 600,
                    }}>
                      {style.label}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "12px", color: "var(--mid-gray)" }}>
                        {formatDate(f.submittedAt)}
                      </span>
                      <button
                        onClick={() => {
                          const updated = feedback.filter(item => item.id !== f.id);
                          localStorage.setItem("cancercompass_feedback", JSON.stringify(updated));
                          setFeedback(updated);
                        }}
                        style={{
                          background: "none", border: "none", color: "var(--mid-gray)",
                          fontSize: "13px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        ✕ Dismiss
                      </button>
                    </div>
                  </div>
                  {f.resourceName && (
                    <div style={{ fontSize: "13px", color: "var(--navy)", fontWeight: 600, marginBottom: "6px" }}>
                      Resource: {f.resourceName}
                    </div>
                  )}
                  <p style={{ fontSize: "14px", color: "#5a5a55", lineHeight: 1.6 }}>
                    {f.description}
                  </p>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── TAB 3: Re-checks ── */}
      {tab === "rechecks" && (
        <div>
          <p style={{ fontSize: "14px", color: "var(--mid-gray)", marginBottom: "16px" }}>
            Resources listed from most overdue to most recent. Click <strong>Visit →</strong> to check the link, then click <strong>✓ Mark as Reviewed</strong>. If a link is broken, go to the Manage Resources tab to update or remove it.
          </p>
          {[...allResources]
            .sort((a, b) => daysSince(getEffectiveDate(b, reviewedDates)) - daysSince(getEffectiveDate(a, reviewedDates)))
            .map(r => {
              const effectiveDate = getEffectiveDate(r, reviewedDates);
              const status = reviewStatus(effectiveDate);
              return (
                <div key={r.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  flexWrap: "wrap", gap: "12px",
                  border: `1.5px solid ${status.label.includes("Up to date") ? "#d0ead0" : "#e8e8e4"}`,
                  borderRadius: "10px",
                  padding: "14px 18px", marginBottom: "8px", background: "white",
                }}>
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--navy)", marginBottom: "4px" }}>{r.name}</div>
                    <div style={{ fontSize: "12px", color: "var(--mid-gray)" }}>Last reviewed: {formatDate(effectiveDate)}</div>
                  </div>
                  <span style={{
                    background: status.bg, color: status.color,
                    borderRadius: "8px", padding: "4px 12px", fontSize: "12px", fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}>
                    {status.label}
                  </span>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: "13px", color: "var(--teal)", textDecoration: "underline", whiteSpace: "nowrap" }}
                    >
                      Visit →
                    </a>
                    <button
                      onClick={() => {
                        const updated = saveReviewedDate(r.id);
                        setReviewedDates({ ...updated });
                      }}
                      style={{
                        background: "var(--teal)", color: "white", border: "none",
                        borderRadius: "8px", padding: "6px 14px",
                        fontFamily: "'DM Sans', sans-serif", fontSize: "12px",
                        fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
                      }}
                    >
                      ✓ Mark as Reviewed
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* ── TAB 4: Manage ── */}
      {tab === "manage" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <p style={{ fontSize: "14px", color: "var(--mid-gray)" }}>
              {allResources.length} resources in database
            </p>
            <button className="btn-primary" style={{ width: "auto", padding: "10px 20px", fontSize: "14px" }}>
              + Add New Resource
            </button>
          </div>
          {allResources.map(r => {
            const typeInfo = TYPE_LABELS[r.type] || { label: r.type };
            return (
              <div key={r.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                flexWrap: "wrap", gap: "10px",
                border: "1.5px solid #e8e8e4", borderRadius: "10px",
                padding: "14px 18px", marginBottom: "8px", background: "white",
              }}>
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--navy)", marginBottom: "3px" }}>{r.name}</div>
                  <div style={{ fontSize: "12px", color: "var(--mid-gray)" }}>
                    {typeInfo.label} · {r.states.length === 0 ? "National" : r.states.join(", ")}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button style={{
                    background: "var(--teal-pale)", color: "var(--teal)", border: "none",
                    borderRadius: "8px", padding: "7px 14px",
                    fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 600, cursor: "pointer",
                  }}>Edit</button>
                  <button style={{
                    background: "#fde8e8", color: "#cc3333", border: "none",
                    borderRadius: "8px", padding: "7px 14px",
                    fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 600, cursor: "pointer",
                  }}>Remove</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Decline confirm modal */}
      {declineConfirm && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
          zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
        }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "28px", maxWidth: "360px", width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>⚠️</div>
            <h3 style={{ fontFamily: "'Lora', serif", fontSize: "18px", color: "var(--navy)", marginBottom: "10px" }}>
              Decline this submission?
            </h3>
            <p style={{ fontSize: "14px", color: "#5a5a55", marginBottom: "20px" }}>This cannot be undone.</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setDeclineConfirm(null)} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button onClick={() => declineSuggestion(declineConfirm)} style={{
                flex: 1, background: "#cc3333", color: "white", border: "none",
                borderRadius: "10px", padding: "12px",
                fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 600, cursor: "pointer",
              }}>Yes, Decline</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
