import { useState } from "react";
import { resources as allResources, TYPE_LABELS } from "../data/resources";

const REVIEWED_KEY  = "cancercompass_reviewed_dates";
const OVERRIDES_KEY = "cancercompass_resource_overrides";

function loadReviewedDates() {
  try { return JSON.parse(localStorage.getItem(REVIEWED_KEY) || "{}"); }
  catch { return {}; }
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
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

function reviewStatus(dateStr) {
  const days = daysSince(dateStr);
  if (days < 60) return { label: "✅ Up to date", color: "#27ae60", bg: "#e8fdf0" };
  if (days < 90) return { label: "🟡 Due soon",   color: "#d4821a", bg: "#fef5e7" };
  return             { label: "🔴 Overdue",     color: "#cc3333", bg: "#fde8e8" };
}

function formatDate(str) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function loadOverrides() {
  try { return JSON.parse(localStorage.getItem(OVERRIDES_KEY) || "{}"); }
  catch { return {}; }
}

// ── PRINT MODAL ──────────────────────────────────────────────────────────────
function PrintModal({ onClose }) {
  const [mode, setMode] = useState("az");

  function getGrouped() {
    const sorted = [...allResources].sort((a, b) => a.name.localeCompare(b.name));
    if (mode === "az") return [{ title: "All Resources (A–Z)", items: sorted }];
    if (mode === "cancer") {
      const groups = {};
      sorted.forEach(r => {
        const types = r.cancerTypes.length > 0 ? r.cancerTypes : ["National / All Cancer Types"];
        types.forEach(t => { if (!groups[t]) groups[t] = []; groups[t].push(r); });
      });
      return Object.keys(groups).sort().map(k => ({ title: k, items: groups[k] }));
    }
    if (mode === "state") {
      const groups = {};
      sorted.forEach(r => {
        const states = r.states.length > 0 ? r.states : ["National (All States)"];
        states.forEach(s => { if (!groups[s]) groups[s] = []; groups[s].push(r); });
      });
      return Object.keys(groups).sort().map(k => ({ title: k, items: groups[k] }));
    }
    return [];
  }

  function doPrint() {
    const groups = getGrouped();
    const html = `<!DOCTYPE html>
<html>
<head>
<title>CancerHelpFinder — Resource Directory</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 11px; margin: 20px; color: #222; }
  h1 { font-size: 18px; color: #1a3a5c; margin-bottom: 4px; }
  .subtitle { font-size: 11px; color: #666; margin-bottom: 20px; }
  h2 { font-size: 13px; color: #1a3a5c; border-bottom: 1.5px solid #1a3a5c; padding-bottom: 4px; margin-top: 24px; margin-bottom: 10px; }
  .resource { margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #eee; page-break-inside: avoid; }
  .resource-name { font-weight: bold; font-size: 12px; margin-bottom: 2px; }
  .resource-url a { color: #0077cc; text-decoration: none; font-size: 10px; }
  .resource-phone { color: #555; font-size: 10px; }
  .resource-desc { color: #444; margin-top: 2px; font-size: 10px; line-height: 1.4; }
  .resource-qualifies { color: #666; font-size: 10px; font-style: italic; }
  @media print { body { margin: 10px; } }
</style>
</head>
<body>
<h1>🎗️ CancerHelpFinder — Resource Directory</h1>
<div class="subtitle">cancerhelpfinder.org · Free resource for cancer patients · Generated ${new Date().toLocaleDateString()}</div>
${groups.map(g => `
<h2>${g.title} (${g.items.length})</h2>
${g.items.map(r => `
<div class="resource">
  <div class="resource-name">${r.name}</div>
  <div class="resource-url"><a href="${r.url}" target="_blank">${r.url}</a></div>
  ${r.phone ? `<div class="resource-phone">📞 ${r.phone}</div>` : ""}
  ${r.description ? `<div class="resource-desc">${r.description}</div>` : ""}
  ${r.qualifies ? `<div class="resource-qualifies">Who qualifies: ${r.qualifies}</div>` : ""}
</div>`).join("")}
`).join("")}
</body>
</html>`;
    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 500);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ background: "white", borderRadius: "20px", padding: "28px", maxWidth: "420px", width: "100%" }}>
        <h3 style={{ fontFamily: "'Lora', serif", fontSize: "18px", color: "var(--navy)", marginBottom: "8px" }}>Print / Save as PDF</h3>
        <p style={{ fontSize: "13px", color: "var(--mid-gray)", marginBottom: "20px" }}>
          Choose how to organize the resource directory. All {allResources.length} resources will be included with clickable links.
        </p>
        {[
          { key: "az",     label: "📋 A–Z",             desc: "All resources sorted alphabetically" },
          { key: "cancer", label: "🎗️ By Cancer Type",  desc: "Grouped by cancer type, then A–Z" },
          { key: "state",  label: "🗺️ By State",        desc: "Grouped by state, then A–Z" },
        ].map(opt => (
          <div key={opt.key} onClick={() => setMode(opt.key)} style={{
            border: `2px solid ${mode === opt.key ? "var(--teal)" : "#e8e8e4"}`,
            borderRadius: "10px", padding: "12px 16px", marginBottom: "10px",
            cursor: "pointer", background: mode === opt.key ? "var(--teal-pale)" : "white",
          }}>
            <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--navy)" }}>{opt.label}</div>
            <div style={{ fontSize: "12px", color: "var(--mid-gray)" }}>{opt.desc}</div>
          </div>
        ))}
        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <button onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
          <button onClick={doPrint} className="btn-find" style={{ flex: 2 }}>🖨️ Open Print Preview</button>
        </div>
        <p style={{ fontSize: "11px", color: "var(--mid-gray)", marginTop: "10px", textAlign: "center" }}>
          In the print dialog, choose "Save as PDF" to create a PDF with clickable links.
        </p>
      </div>
    </div>
  );
}

// ── MANAGE TAB ───────────────────────────────────────────────────────────────
function ManageTab() {
  const [overrides, setOverrides]         = useState(() => loadOverrides());
  const [editing, setEditing]             = useState(null);
  const [editForm, setEditForm]           = useState({});
  const [removeConfirm, setRemoveConfirm] = useState(null);
  const [removed, setRemoved]             = useState(() => {
    try { return JSON.parse(localStorage.getItem("cancercompass_removed") || "[]"); }
    catch { return []; }
  });
  const [exportMsg, setExportMsg] = useState("");
  const [showPrint, setShowPrint] = useState(false);

  const visible = [...allResources]
    .filter(r => !removed.includes(r.id))
    .sort((a, b) => {
      const aName = (overrides[a.id]?.name || a.name).toLowerCase();
      const bName = (overrides[b.id]?.name || b.name).toLowerCase();
      return aName.localeCompare(bName);
    });

  function startEdit(r) {
    const effective = { ...r, ...(overrides[r.id] || {}) };
    setEditForm({ name: effective.name, url: effective.url, phone: effective.phone || "", description: effective.description, qualifies: effective.qualifies });
    setEditing(r.id);
  }

  function saveEdit() {
    const updated = { ...overrides, [editing]: { ...editForm } };
    localStorage.setItem(OVERRIDES_KEY, JSON.stringify(updated));
    setOverrides(updated);
    setEditing(null);
  }

  function doRemove(id) {
    const updated = [...removed, id];
    localStorage.setItem("cancercompass_removed", JSON.stringify(updated));
    setRemoved(updated);
    setRemoveConfirm(null);
  }

  function exportOverrides() {
    const data = localStorage.getItem(OVERRIDES_KEY);
    if (!data || data === "{}") {
      setExportMsg("No pending fixes to export.");
      setTimeout(() => setExportMsg(""), 3000);
      return;
    }
    navigator.clipboard.writeText(data).then(() => {
      setExportMsg("✅ Copied! Paste to Claude to make fixes permanent for all users.");
      setTimeout(() => setExportMsg(""), 5000);
    }).catch(() => {
      setExportMsg("❌ Copy failed — try again.");
      setTimeout(() => setExportMsg(""), 3000);
    });
  }

  return (
    <div>
      {/* Top bar */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center", marginBottom: "16px" }}>
        <p style={{ fontSize: "14px", color: "var(--mid-gray)", margin: 0, flex: 1 }}>
          {visible.length} resources · sorted A–Z
        </p>
        <button onClick={() => setShowPrint(true)} style={{
          background: "var(--navy)", color: "white", border: "none",
          borderRadius: "8px", padding: "8px 16px",
          fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 600, cursor: "pointer",
        }}>🖨️ Print / PDF</button>
        <button onClick={exportOverrides} style={{
          background: "var(--teal)", color: "white", border: "none",
          borderRadius: "8px", padding: "8px 16px",
          fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 600, cursor: "pointer",
        }}>📋 Export Fixes</button>
      </div>

      {/* Reminder banner */}
      <div style={{
        background: "#fef5e7", border: "1.5px solid #f0d8b0",
        borderRadius: "10px", padding: "12px 16px", marginBottom: "16px",
        fontSize: "13px", color: "#7a5a20",
      }}>
        💡 <strong>Reminder:</strong> Edits made here are temporary and visible only to you. To make changes permanent: open the Node.js command prompt, type <strong>cd C:\Users\jroad\OneDrive\Desktop\Github\cancercompass</strong> and press Enter, then type <strong>claude</strong> and press Enter. Then describe your changes and Claude Code will update the files directly.
      </div>

      {exportMsg && (
        <div style={{
          background: exportMsg.startsWith("✅") ? "#e8fdf0" : "#fde8e8",
          border: `1.5px solid ${exportMsg.startsWith("✅") ? "#27ae60" : "#cc3333"}`,
          borderRadius: "10px", padding: "10px 16px", marginBottom: "12px",
          fontSize: "13px", fontWeight: 600,
          color: exportMsg.startsWith("✅") ? "#27ae60" : "#cc3333",
        }}>
          {exportMsg}
        </div>
      )}

      {visible.map(r => {
        const effective = { ...r, ...(overrides[r.id] || {}) };
        const typeInfo = TYPE_LABELS[effective.type] || { label: effective.type };
        return (
          <div key={r.id} style={{
            border: "1.5px solid #e8e8e4", borderRadius: "10px",
            padding: "14px 18px", marginBottom: "8px", background: "white",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--navy)", marginBottom: "3px" }}>{effective.name}</div>
                <div style={{ fontSize: "12px", color: "var(--mid-gray)", marginBottom: "2px" }}>
                  {typeInfo.label} · {effective.states.length === 0 ? "National" : effective.states.join(", ")}
                </div>
                <div style={{ fontSize: "12px", color: "var(--teal)", wordBreak: "break-all" }}>{effective.url}</div>
              </div>
              <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                <button onClick={() => startEdit(r)} style={{
                  background: "var(--teal-pale)", color: "var(--teal)", border: "none",
                  borderRadius: "8px", padding: "7px 14px",
                  fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 600, cursor: "pointer",
                }}>Edit</button>
                <button onClick={() => setRemoveConfirm(r.id)} style={{
                  background: "#fde8e8", color: "#cc3333", border: "none",
                  borderRadius: "8px", padding: "7px 14px",
                  fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 600, cursor: "pointer",
                }}>Remove</button>
              </div>
            </div>
          </div>
        );
      })}

      {showPrint && <PrintModal onClose={() => setShowPrint(false)} />}

      {editing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div style={{ background: "white", borderRadius: "20px", padding: "28px", maxWidth: "520px", width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ fontFamily: "'Lora', serif", fontSize: "18px", color: "var(--navy)", marginBottom: "20px" }}>Edit Resource</h3>
            {[
              { label: "Name", field: "name" },
              { label: "Website URL", field: "url" },
              { label: "Phone", field: "phone" },
            ].map(({ label, field }) => (
              <div className="field-group" key={field}>
                <div className="field-label">{label}</div>
                <input type="text" value={editForm[field] || ""} onChange={e => setEditForm(f => ({ ...f, [field]: e.target.value }))} />
              </div>
            ))}
            <div className="field-group">
              <div className="field-label">Description</div>
              <textarea value={editForm.description || ""} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} style={{ minHeight: "80px" }} />
            </div>
            <div className="field-group">
              <div className="field-label">Who Qualifies</div>
              <textarea value={editForm.qualifies || ""} onChange={e => setEditForm(f => ({ ...f, qualifies: e.target.value }))} style={{ minHeight: "60px" }} />
            </div>
            <div style={{
              background: "#fef5e7", border: "1px solid #f0d8b0",
              borderRadius: "8px", padding: "10px 14px", marginBottom: "16px",
              fontSize: "12px", color: "#7a5a20",
            }}>
              ⚠️ This edit is temporary. Use <strong>Export Fixes</strong> after saving to make it permanent for all users.
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setEditing(null)} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button onClick={saveEdit} className="btn-primary" style={{ flex: 1 }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {removeConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "28px", maxWidth: "360px", width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>⚠️</div>
            <h3 style={{ fontFamily: "'Lora', serif", fontSize: "18px", color: "var(--navy)", marginBottom: "10px" }}>Remove this resource?</h3>
            <p style={{ fontSize: "14px", color: "#5a5a55", marginBottom: "20px" }}>This will immediately remove it for all users.</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setRemoveConfirm(null)} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button onClick={() => doRemove(removeConfirm)} style={{
                flex: 1, background: "#cc3333", color: "white", border: "none",
                borderRadius: "10px", padding: "12px",
                fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 600, cursor: "pointer",
              }}>Yes, Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MAIN ADMIN PAGE ──────────────────────────────────────────────────────────
export default function AdminPage() {
  const [tab, setTab] = useState("rechecks");
  const [reviewedDates, setReviewedDates] = useState(() => loadReviewedDates());

  const overdue = allResources.filter(r => daysSince(r.lastReviewed) >= 60);

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "24px 16px 60px" }}>
      <h1 style={{ fontFamily: "'Lora', serif", fontSize: "26px", color: "var(--navy)", marginBottom: "6px" }}>
        🔐 Admin Dashboard
      </h1>
      <p style={{ fontSize: "14px", color: "var(--mid-gray)", marginBottom: "24px" }}>
        Private area — CancerCompass resource management
      </p>

      {overdue.length > 0 && (
        <div style={{
          background: "#fef5e7", border: "1.5px solid #f0d8b0",
          borderRadius: "12px", padding: "16px 20px", marginBottom: "20px",
        }}>
          <div style={{ fontWeight: 600, color: "#7a5a20", marginBottom: "6px" }}>⚠️ Action needed</div>
          <div style={{ fontSize: "14px", color: "#7a5a20" }}>• {overdue.length} resource{overdue.length > 1 ? "s" : ""} need a re-check</div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "24px", borderBottom: "2px solid #eee" }}>
        {[
          { key: "rechecks", label: "Re-check Resources" },
          { key: "manage",   label: "Manage Resources" },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            background: "none", border: "none", padding: "10px 16px",
            fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 600, cursor: "pointer",
            borderBottom: tab === t.key ? "2px solid var(--teal)" : "2px solid transparent",
            color: tab === t.key ? "var(--teal)" : "var(--mid-gray)",
            marginBottom: "-2px", transition: "color 0.2s",
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Re-check Tab */}
      {tab === "rechecks" && (
        <div>
          <div style={{
            background: "#fde8e8", border: "1.5px solid #f5c0c0",
            borderRadius: "10px", padding: "12px 16px", marginBottom: "16px",
            fontSize: "13px", color: "#cc3333",
          }}>
            ⚠️ <strong>Important:</strong> URL edits made in Manage Resources are temporary and only visible to you — they will not affect other users. After fixing URLs, go to <strong>Manage Resources → Export Fixes</strong> and paste the result to Claude to make changes permanent for everyone.
          </div>
          <p style={{ fontSize: "14px", color: "var(--mid-gray)", marginBottom: "16px" }}>
            Resources listed from most overdue to most recent. Click <strong>Visit →</strong> to check the link, then click <strong>✓ Mark as Reviewed</strong>. If a link is broken, go to the Manage Resources tab to update or remove it.
          </p>
          {(() => {
            const overrides = loadOverrides();
            const removed = (() => { try { return JSON.parse(localStorage.getItem("cancercompass_removed") || "[]"); } catch { return []; } })();
            return [...allResources]
              .filter(r => !removed.includes(r.id))
              .map(r => ({ ...r, ...(overrides[r.id] || {}) }))
              .sort((a, b) => daysSince(getEffectiveDate(b, reviewedDates)) - daysSince(getEffectiveDate(a, reviewedDates)))
              .map(r => {
                const effectiveDate = getEffectiveDate(r, reviewedDates);
                const status = reviewStatus(effectiveDate);
                return (
                  <div key={r.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    flexWrap: "wrap", gap: "12px",
                    border: `1.5px solid ${status.label.includes("Up to date") ? "#d0ead0" : "#e8e8e4"}`,
                    borderRadius: "10px", padding: "14px 18px", marginBottom: "8px", background: "white",
                  }}>
                    <div style={{ flex: 1, minWidth: "200px" }}>
                      <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--navy)", marginBottom: "4px" }}>{r.name}</div>
                      <div style={{ fontSize: "12px", color: "var(--mid-gray)" }}>Last reviewed: {formatDate(effectiveDate)}</div>
                    </div>
                    <span style={{
                      background: status.bg, color: status.color,
                      borderRadius: "8px", padding: "4px 12px", fontSize: "12px", fontWeight: 600, whiteSpace: "nowrap",
                    }}>
                      {status.label}
                    </span>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                      <a href={r.url} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: "13px", color: "var(--teal)", textDecoration: "underline", whiteSpace: "nowrap" }}>
                        Visit →
                      </a>
                      <button
                        onClick={() => { const updated = saveReviewedDate(r.id); setReviewedDates({ ...updated }); }}
                        style={{
                          background: "var(--teal)", color: "white", border: "none",
                          borderRadius: "8px", padding: "6px 14px",
                          fontFamily: "'DM Sans', sans-serif", fontSize: "12px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
                        }}
                      >
                        ✓ Mark as Reviewed
                      </button>
                    </div>
                  </div>
                );
              });
          })()}
        </div>
      )}

      {tab === "manage" && <ManageTab />}
    </div>
  );
}
