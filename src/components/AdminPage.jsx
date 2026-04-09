import { useState, useRef, useEffect } from "react";
import { resources as allResources, TYPE_LABELS } from "../data/resources";

const REVIEWED_KEY  = "cancercompass_reviewed_dates";
const OVERRIDES_KEY = "cancercompass_resource_overrides";

const CANCER_PREFIX_MAP = {
  "Breast Cancer": "bc",
  "Lung Cancer (Non-Small Cell)": "lc", "Lung Cancer (Small Cell)": "lc",
  "Colon / Colorectal Cancer": "cc",
  "Prostate Cancer": "pc",
  "Leukemia (ALL)": "ll", "Leukemia (AML)": "ll", "Leukemia (CLL)": "ll", "Leukemia (CML)": "ll",
  "Lymphoma (Hodgkin's)": "ll", "Lymphoma (Non-Hodgkin's)": "ll",
  "Multiple Myeloma": "ll", "Blood Cancer (General)": "ll",
  "Pancreatic Cancer": "panc",
  "Ovarian Cancer": "oc",
  "Brain / CNS Cancer": "brain",
  "Melanoma / Skin Cancer": "mel",
  "Sarcoma": "sar",
  "Thyroid Cancer": "thy",
  "Mesothelioma": "meso",
  "Bladder Cancer": "blad",
  "Head & Neck Cancer": "hn",
  "Kidney (Renal) Cancer": "kid",
  "Liver Cancer": "liv",
  "Stomach / Gastric Cancer": "stom",
  "Esophageal Cancer": "eso",
  "Testicular Cancer": "test",
  "Uterine / Endometrial Cancer": "uter",
  "Cervical Cancer": "cer",
  "Other / Rare Cancer (Not Listed)": "rare",
};

function generateNextId(cancerTypes = [], extraResources = []) {
  let prefix = "n";
  if (cancerTypes.length === 1 && CANCER_PREFIX_MAP[cancerTypes[0]]) {
    prefix = CANCER_PREFIX_MAP[cancerTypes[0]];
  }
  const pattern = new RegExp("^" + prefix + "(\\d+)$");
  const nums = [...allResources, ...extraResources]
    .map(r => { const m = r.id.match(pattern); return m ? parseInt(m[1]) : 0; })
    .filter(n => n > 0);
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return prefix + String(next).padStart(3, "0");
}

// ── ADD RESOURCE SECTION ─────────────────────────────────────────────────────
function AddResourceSection({ saveToFile, onAdd, localAdditions }) {
  const [url, setUrl]         = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
  const [preview, setPreview] = useState(null);
  const [savedName, setSavedName] = useState("");
  const previewRef            = useRef(null);

  const VALID_TYPES = ["financial","medication","transportation","housing","nutrition","mental","legal","veterans","pediatric"];

  useEffect(() => {
    if (preview && previewRef.current) {
      previewRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [preview]);

  async function handleExtract() {
    if (!url.trim()) return;
    setLoading(true); setError(""); setPreview(null); setSavedName("");
    try {
      const res = await fetch("/api/extract-resource", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) { setError(json.error || "Extraction failed."); return; }
      const d = json.data;
      const cancerArr = Array.isArray(d.cancerTypes) ? d.cancerTypes : [];
      const statesArr = Array.isArray(d.states) ? d.states : [];
      setPreview({
        id:          generateNextId(cancerArr, localAdditions),
        name:        d.name || "",
        description: d.description || "",
        qualifies:   d.qualifies || "",
        type:        VALID_TYPES.includes(d.type) ? d.type : "financial",
        phone:       d.phone || "",
        url:         url.trim(),
        statesText:  statesArr.join(", "),
        cancerText:  cancerArr.join(", "),
      });
    } catch (e) {
      setError("Network error — make sure ANTHROPIC_API_KEY is set in Vercel environment variables.");
    } finally {
      setLoading(false);
    }
  }

  function handleManual() {
    setError(""); setSavedName("");
    setPreview({
      id: generateNextId([], localAdditions),
      name: "", description: "", qualifies: "",
      type: "financial", phone: "", url: url.trim(),
      statesText: "", cancerText: "",
    });
  }

  function updatePreview(field, value) {
    setPreview(p => {
      const updated = { ...p, [field]: value };
      if (field === "cancerText") {
        const arr = value.split(",").map(s => s.trim()).filter(Boolean);
        updated.id = generateNextId(arr, localAdditions);
      }
      return updated;
    });
  }

  async function handleSave() {
    if (!preview.name || !preview.description) return;
    setSaving(true);
    const today      = new Date().toISOString().split("T")[0];
    const cancerArr  = preview.cancerText.split(",").map(s => s.trim()).filter(Boolean);
    const statesArr  = preview.statesText.split(",").map(s => s.trim()).filter(Boolean);
    const newResource = {
      id:          preview.id,
      name:        preview.name,
      description: preview.description,
      type:        preview.type,
      cancerTypes: cancerArr,
      states:      statesArr,
      qualifies:   preview.qualifies,
      phone:       preview.phone || null,
      url:         preview.url,
      lastReviewed: today,
    };
    const ok = await saveToFile({}, [], [newResource]);
    setSaving(false);
    if (ok) {
      onAdd(newResource);           // update ManageTab list immediately
      setSavedName(preview.name);
      setPreview(null);
      setUrl("");
    }
  }

  const inputStyle = {
    width: "100%", padding: "9px 12px", border: "1.5px solid #e0e0db",
    borderRadius: "8px", fontSize: "13px", fontFamily: "'DM Sans', sans-serif",
    boxSizing: "border-box", outline: "none",
  };
  const labelStyle = { fontSize: "12px", fontWeight: 600, color: "var(--mid-gray)", marginBottom: "4px", display: "block" };

  return (
    <div style={{
      background: "white", border: "1.5px solid #e8e8e4",
      borderRadius: "12px", padding: "20px", marginBottom: "20px",
    }}>
      <h3 style={{ fontFamily: "'Lora', serif", fontSize: "17px", color: "var(--navy)", margin: "0 0 6px" }}>
        ➕ Add New Resource
      </h3>
      <p style={{ fontSize: "13px", color: "var(--mid-gray)", margin: "0 0 14px" }}>
        Paste a URL from any cancer support organization. Claude will auto-fill the details for your review before saving.
      </p>

      {/* URL input row — hidden while preview is open */}
      <div style={{ display: preview ? "none" : "flex", gap: "8px", marginBottom: "10px" }}>
        <input
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleExtract()}
          placeholder="https://example.org/apply"
          style={{ ...inputStyle, flex: 1 }}
        />
        <button
          onClick={handleExtract}
          disabled={loading || !url.trim()}
          style={{
            background: loading || !url.trim() ? "#ccc" : "var(--teal)", color: "white",
            border: "none", borderRadius: "8px", padding: "9px 18px",
            fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 600,
            cursor: loading || !url.trim() ? "not-allowed" : "pointer", whiteSpace: "nowrap",
          }}
        >
          {loading ? "Extracting…" : "Add Resource"}
        </button>
        {!loading && (
          <button onClick={handleManual} style={{
            background: "none", border: "1.5px solid #e0e0db", borderRadius: "8px",
            padding: "9px 14px", fontFamily: "'DM Sans', sans-serif",
            fontSize: "13px", color: "var(--mid-gray)", cursor: "pointer", whiteSpace: "nowrap",
          }}>
            Fill Manually
          </button>
        )}
      </div>

      {loading && (
        <div style={{ fontSize: "13px", color: "var(--teal)", marginBottom: "10px" }}>
          🔍 Claude is reading the page and extracting resource details…
        </div>
      )}

      {error && (
        <div style={{
          background: "#fde8e8", border: "1px solid #f5c0c0", borderRadius: "8px",
          padding: "10px 14px", fontSize: "13px", color: "#cc3333", marginBottom: "10px",
        }}>
          ⚠️ {error}
        </div>
      )}

      {savedName && (
        <div style={{
          background: "#e8fdf0", border: "1.5px solid #27ae60",
          borderRadius: "10px", padding: "14px 16px", marginTop: "10px",
          fontSize: "13px", color: "#1a6a3a", fontWeight: 600,
        }}>
          ✅ Resource added successfully — it now appears in the list below. Changes will go live on the site in 2–3 minutes.
          <button onClick={() => setSavedName("")} style={{
            marginLeft: "12px", background: "none", border: "none",
            fontSize: "12px", color: "#27ae60", cursor: "pointer", textDecoration: "underline",
          }}>Dismiss</button>
        </div>
      )}

      {/* Editable preview card */}
      {preview && (
        <div ref={previewRef} style={{
          background: "var(--soft-gray)", border: "1.5px solid var(--teal)",
          borderRadius: "10px", padding: "16px", marginTop: "10px",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--navy)" }}>
              Review &amp; edit before saving
            </span>
            <span style={{
              background: "var(--teal-pale)", color: "var(--teal)",
              borderRadius: "8px", padding: "3px 10px", fontSize: "12px", fontWeight: 700,
            }}>
              ID: {preview.id}
            </span>
          </div>

          <div style={{ display: "grid", gap: "10px" }}>
            <div>
              <label style={labelStyle}>Name</label>
              <input style={inputStyle} value={preview.name} onChange={e => updatePreview("name", e.target.value)} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label style={labelStyle}>Type</label>
                <select value={preview.type} onChange={e => updatePreview("type", e.target.value)} style={{ ...inputStyle }}>
                  {VALID_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Phone (optional)</label>
                <input style={inputStyle} value={preview.phone} onChange={e => updatePreview("phone", e.target.value)} placeholder="1-800-XXX-XXXX or leave blank" />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Description</label>
              <textarea value={preview.description} onChange={e => updatePreview("description", e.target.value)} style={{ ...inputStyle, minHeight: "70px", resize: "vertical" }} />
            </div>

            <div>
              <label style={labelStyle}>Who Qualifies</label>
              <textarea value={preview.qualifies} onChange={e => updatePreview("qualifies", e.target.value)} style={{ ...inputStyle, minHeight: "50px", resize: "vertical" }} />
            </div>

            <div>
              <label style={labelStyle}>URL</label>
              <input style={inputStyle} value={preview.url} onChange={e => updatePreview("url", e.target.value)} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label style={labelStyle}>Cancer Types (comma-separated, or blank for all)</label>
                <textarea value={preview.cancerText} onChange={e => updatePreview("cancerText", e.target.value)} style={{ ...inputStyle, minHeight: "50px", resize: "vertical", fontSize: "12px" }} placeholder="Breast Cancer, Ovarian Cancer…" />
              </div>
              <div>
                <label style={labelStyle}>States (comma-separated, or blank for national)</label>
                <textarea value={preview.statesText} onChange={e => updatePreview("statesText", e.target.value)} style={{ ...inputStyle, minHeight: "50px", resize: "vertical", fontSize: "12px" }} placeholder="Texas, California…" />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
            <button onClick={() => { setPreview(null); setUrl(""); }} style={{
              background: "none", border: "1.5px solid #e0e0db", borderRadius: "8px",
              padding: "9px 16px", fontFamily: "'DM Sans', sans-serif",
              fontSize: "13px", color: "var(--mid-gray)", cursor: "pointer",
            }}>
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !preview.name || !preview.description}
              style={{
                background: (saving || !preview.name || !preview.description) ? "#ccc" : "var(--navy)",
                color: "white", border: "none", borderRadius: "8px", padding: "9px 20px",
                fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 600,
                cursor: (saving || !preview.name || !preview.description) ? "not-allowed" : "pointer", flex: 1,
              }}
            >
              {saving ? "Saving…" : "💾 Save Permanently"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

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
function PrintModal({ onClose, overrides, removed, localAdditions }) {
  const [mode, setMode] = useState("az");

  // Apply the same overrides + removals + local additions that the Manage tab shows
  const effectiveResources = [...allResources, ...(localAdditions || [])]
    .filter(r => !removed.includes(r.id))
    .map(r => ({ ...r, ...(overrides[r.id] || {}) }));

  function getGrouped() {
    const sorted = [...effectiveResources].sort((a, b) => a.name.localeCompare(b.name));
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
          Choose how to organize the resource directory. All {effectiveResources.length} resources will be included with clickable links.
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

// ── HELP SECTION ─────────────────────────────────────────────────────────────
function HelpSection() {
  const [open, setOpen] = useState(false);

  const sections = [
    {
      heading: "How the admin panel works",
      items: [
        "The resource list below shows all 180+ resources currently live in the app.",
        "Click Edit on any resource to change its name, URL, phone number, description, or eligibility text.",
        "Click Save Changes in the edit window to save that change permanently to the file and deploy it live — no copy/paste needed.",
        "Click Remove to delete a resource permanently for all users.",
        "Changes go live on cancerhelpfinder.org automatically within 2–3 minutes.",
      ],
    },
    {
      heading: "The Print / PDF button",
      items: [
        "The Print / PDF button creates a printable version of all resources — useful for a full review.",
        "The data in the PDF always matches what is currently live in the app.",
        "Use it to spot wrong URLs, outdated phone numbers, or inaccurate descriptions.",
        "If you find something wrong in the PDF, find that resource in the list below and click Edit to fix it.",
      ],
    },
    {
      heading: "Adding new resources",
      items: [
        "Paste a URL into the Add Resource box at the top and click Add Resource — Claude will try to fill in the name, description, eligibility, and other fields automatically.",
        "Review the pre-filled details, make any corrections, then click Save Permanently.",
        "Or click Fill Manually to enter all fields yourself without using AI.",
      ],
    },
    {
      heading: "Keeping data accurate",
      items: [
        "Always use the Edit button to make corrections — it writes directly to the live file.",
        "If a URL looks wrong, verify it in a browser first, then update it using Edit.",
        "Phone numbers, descriptions, and eligibility text can all be updated the same way.",
      ],
    },
    {
      heading: "Working with Claude Code",
      items: [
        "Claude Code is only needed for bulk changes, adding new features, or fixing technical problems.",
        "For routine edits — fixing a URL, updating a phone number, changing a description — use the Edit button here instead.",
        "If Claude Code makes changes to the file, they will automatically appear here within 2–3 minutes after deployment.",
      ],
    },
  ];

  return (
    <div style={{
      border: "1.5px solid #c8e0f4", borderRadius: "12px",
      marginBottom: "24px", overflow: "hidden",
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "#eaf4fd", border: "none", padding: "14px 18px",
          cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <span style={{ fontWeight: 700, fontSize: "14px", color: "#1a4a6e" }}>
          📖 How to use this admin panel
        </span>
        <span style={{ fontSize: "18px", color: "#1a4a6e", lineHeight: 1 }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={{ padding: "18px 20px", background: "white" }}>
          {sections.map(({ heading, items }) => (
            <div key={heading} style={{ marginBottom: "18px" }}>
              <div style={{
                fontWeight: 700, fontSize: "13px", color: "var(--navy)",
                marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.04em",
              }}>
                {heading}
              </div>
              <ul style={{ margin: 0, paddingLeft: "18px" }}>
                {items.map((item, i) => (
                  <li key={i} style={{ fontSize: "13px", color: "#3a3a35", marginBottom: "5px", lineHeight: "1.5" }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── MANAGE TAB ───────────────────────────────────────────────────────────────
function ManageTab({ configOk }) {
  const [overrides, setOverrides]         = useState(() => loadOverrides());
  const [editing, setEditing]             = useState(null);
  const [editForm, setEditForm]           = useState({});
  const [removeConfirm, setRemoveConfirm] = useState(null);
  const [removed, setRemoved]             = useState(() => {
    try { return JSON.parse(localStorage.getItem("cancercompass_removed") || "[]"); }
    catch { return []; }
  });
  const [exportMsg, setExportMsg]           = useState("");
  const [exportContent, setExportContent]   = useState(""); // on-screen display of exported JSON
  const [showPrint, setShowPrint]           = useState(false);
  const [savingToFile, setSavingToFile]     = useState(false);
  const [saveFileMsg, setSaveFileMsg]       = useState("");
  const [localOnlyMsg, setLocalOnlyMsg]     = useState(""); // persistent message when GitHub not configured
  const [localAdditions, setLocalAdditions] = useState([]);

  function handleAdd(resource) {
    setLocalAdditions(prev => [...prev, resource]);
  }

  const visible = [...allResources, ...localAdditions]
    .filter(r => !removed.includes(r.id))
    .sort((a, b) => {
      const aName = (overrides[a.id]?.name || a.name).toLowerCase();
      const bName = (overrides[b.id]?.name || b.name).toLowerCase();
      return aName.localeCompare(bName);
    });

  function startEdit(r) {
    // Always load from the live resources.js value — never from stale overrides
    setEditForm({ name: r.name, url: r.url, phone: r.phone || "", description: r.description, qualifies: r.qualifies });
    setEditing(r.id);
  }

  async function saveToFile(changes, removals, additions = []) {
    setSavingToFile(true);
    setSaveFileMsg("");
    try {
      const secret = process.env.REACT_APP_ADMIN_SECRET || "";
      const res = await fetch("/api/save-resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ changes, removals, additions, secret }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Unknown error");
      setLocalOnlyMsg(""); // clear any previous local-only warning on successful save
      setSaveFileMsg("✅ Saved to file! Vercel is deploying — reload the page in ~2 minutes to see the updated data.");
      setTimeout(() => setSaveFileMsg(""), 15000);
      return true;
    } catch (e) {
      const isConfigError = e.message.includes("env vars must be set") || e.message.includes("GITHUB_TOKEN");
      if (isConfigError) {
        // Persistent — no auto-dismiss
        setLocalOnlyMsg("Your changes are saved locally in this browser only. To make them permanent, use Export Fixes below and paste to Claude Code.");
      } else {
        setSaveFileMsg(`❌ Save failed: ${e.message}`);
        setTimeout(() => setSaveFileMsg(""), 8000);
      }
      return false;
    } finally {
      setSavingToFile(false);
    }
  }

  async function handleSaveAll() {
    let allOverrides = {};
    try { allOverrides = JSON.parse(localStorage.getItem(OVERRIDES_KEY) || "{}"); } catch { /* ignore */ }
    const pending = {};
    for (const [id, fields] of Object.entries(allOverrides)) {
      const base = allResources.find(r => r.id === id);
      if (!base) continue;
      const diff = {};
      for (const [key, val] of Object.entries(fields)) {
        const baseVal = base[key] == null ? "" : String(base[key]);
        const overVal = val == null ? "" : String(val);
        if (overVal !== baseVal) diff[key] = val;
      }
      if (Object.keys(diff).length > 0) pending[id] = diff;
    }
    const currentRemoved = (() => {
      try { return JSON.parse(localStorage.getItem("cancercompass_removed") || "[]"); } catch { return []; }
    })();
    if (Object.keys(pending).length === 0 && currentRemoved.length === 0) {
      setSaveFileMsg("No pending changes to save.");
      setTimeout(() => setSaveFileMsg(""), 3000);
      return;
    }
    await saveToFile(pending, currentRemoved);
  }

  function saveEdit() {
    const updated = { ...overrides, [editing]: { ...editForm } };
    localStorage.setItem(OVERRIDES_KEY, JSON.stringify(updated));
    setOverrides(updated);

    // Diff against base and save to file immediately
    const base = allResources.find(r => r.id === editing);
    if (base) {
      const diff = {};
      for (const [key, val] of Object.entries(editForm)) {
        const baseVal = base[key] == null ? "" : String(base[key]);
        const overVal = val == null ? "" : String(val);
        if (overVal !== baseVal) diff[key] = val;
      }
      if (Object.keys(diff).length > 0) {
        saveToFile({ [editing]: diff }, []);
      }
    }

    setEditing(null);
  }

  function doRemove(id) {
    const updated = [...removed, id];
    localStorage.setItem("cancercompass_removed", JSON.stringify(updated));
    setRemoved(updated);
    setRemoveConfirm(null);
    saveToFile({}, [id]);
  }

  function exportOverrides() {
    let allOverrides = {};
    try { allOverrides = JSON.parse(localStorage.getItem(OVERRIDES_KEY) || "{}"); } catch { /* ignore */ }

    // Only export fields that genuinely differ from the current resources.js value
    const pending = {};
    for (const [id, changes] of Object.entries(allOverrides)) {
      const base = allResources.find(r => r.id === id);
      if (!base) continue;
      const diff = {};
      for (const [key, val] of Object.entries(changes)) {
        const baseVal = base[key] == null ? "" : String(base[key]);
        const overVal = val == null ? "" : String(val);
        if (overVal !== baseVal) diff[key] = val;
      }
      if (Object.keys(diff).length > 0) pending[id] = diff;
    }

    const currentRemoved = (() => { try { return JSON.parse(localStorage.getItem("cancercompass_removed") || "[]"); } catch { return []; } })();

    if (Object.keys(pending).length === 0 && currentRemoved.length === 0 && localAdditions.length === 0) {
      setExportMsg("No pending changes to export.");
      setTimeout(() => setExportMsg(""), 3000);
      return;
    }

    const exportObj = {};
    if (Object.keys(pending).length > 0)  exportObj.edits    = pending;
    if (currentRemoved.length > 0)        exportObj.removals = currentRemoved;
    if (localAdditions.length > 0)        exportObj.additions = localAdditions.map(r => r.id + " — " + r.name);
    const text = JSON.stringify(exportObj, null, 2);

    // Show on screen immediately (regardless of clipboard success)
    setExportContent(text);

    navigator.clipboard.writeText(text).then(() => {
      setExportMsg("✅ Copied to clipboard! Paste this into Claude Code to make changes permanent.");
    }).catch(() => {
      setExportMsg("⚠️ Could not copy automatically — select all text below and copy manually.");
    });
  }

  return (
    <div>
      <HelpSection />
      <AddResourceSection saveToFile={saveToFile} onAdd={handleAdd} localAdditions={localAdditions} />

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
          background: configOk === false ? "#d4780a" : "var(--teal)", color: "white", border: "none",
          borderRadius: "8px", padding: configOk === false ? "10px 20px" : "8px 16px",
          fontFamily: "'DM Sans', sans-serif", fontSize: configOk === false ? "14px" : "13px", fontWeight: 700, cursor: "pointer",
          boxShadow: configOk === false ? "0 2px 8px rgba(212,120,10,0.4)" : "none",
        }}>📋 Export Fixes{configOk === false ? " ← Use This" : ""}</button>
        {configOk !== false && (
          <button onClick={handleSaveAll} disabled={savingToFile} style={{
            background: savingToFile ? "#aaa" : "#1a7a4a", color: "white", border: "none",
            borderRadius: "8px", padding: "8px 16px",
            fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 600,
            cursor: savingToFile ? "not-allowed" : "pointer",
          }}>{savingToFile ? "Saving…" : "💾 Save to File"}</button>
        )}
      </div>

      {/* Persistent local-only warning (shown after a failed save due to missing env vars) */}
      {localOnlyMsg && (
        <div style={{
          background: "#fff3cd", border: "2px solid #e6a817",
          borderRadius: "10px", padding: "14px 18px", marginBottom: "16px",
        }}>
          <div style={{ fontWeight: 700, fontSize: "14px", color: "#7a4a00", marginBottom: "8px" }}>
            ⚠️ {localOnlyMsg}
          </div>
          <button onClick={exportOverrides} style={{
            background: "#d4780a", color: "white", border: "none",
            borderRadius: "8px", padding: "9px 20px",
            fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 700, cursor: "pointer",
          }}>📋 Export Fixes — Copy Changes to Clipboard</button>
        </div>
      )}

      {saveFileMsg && (
        <div style={{
          background: saveFileMsg.startsWith("✅") ? "#e8fdf0" : "#fde8e8",
          border: `1.5px solid ${saveFileMsg.startsWith("✅") ? "#27ae60" : "#cc3333"}`,
          borderRadius: "10px", padding: "10px 16px", marginBottom: "12px",
          fontSize: "13px", fontWeight: 600,
          color: saveFileMsg.startsWith("✅") ? "#27ae60" : "#cc3333",
        }}>
          {saveFileMsg}
        </div>
      )}

      {exportMsg && (
        <div style={{
          background: exportMsg.startsWith("✅") ? "#e8fdf0" : exportMsg.startsWith("⚠️") ? "#fff3cd" : "#fde8e8",
          border: `1.5px solid ${exportMsg.startsWith("✅") ? "#27ae60" : exportMsg.startsWith("⚠️") ? "#e6a817" : "#cc3333"}`,
          borderRadius: "10px", padding: "10px 16px", marginBottom: "12px",
          fontSize: "13px", fontWeight: 600,
          color: exportMsg.startsWith("✅") ? "#27ae60" : exportMsg.startsWith("⚠️") ? "#7a4a00" : "#cc3333",
        }}>
          {exportMsg}
        </div>
      )}

      {/* On-screen display of exported changes */}
      {exportContent && (
        <div style={{
          background: "#f8f9fa", border: "1.5px solid #c8c8c0",
          borderRadius: "10px", padding: "16px", marginBottom: "16px",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ fontWeight: 700, fontSize: "13px", color: "var(--navy)" }}>
              📄 Pending changes — paste this to Claude Code
            </span>
            <button onClick={() => setExportContent("")} style={{
              background: "none", border: "none", fontSize: "18px", cursor: "pointer",
              color: "var(--mid-gray)", lineHeight: 1,
            }}>✕</button>
          </div>
          <textarea
            readOnly
            value={exportContent}
            onClick={e => e.target.select()}
            style={{
              width: "100%", minHeight: "160px", fontFamily: "monospace", fontSize: "11px",
              border: "1px solid #ddd", borderRadius: "6px", padding: "10px",
              background: "white", boxSizing: "border-box", resize: "vertical",
              color: "#1a1a1a",
            }}
          />
          <p style={{ fontSize: "12px", color: "var(--mid-gray)", margin: "8px 0 0" }}>
            Click the text area to select all, then copy and paste into Claude Code. Claude will apply these changes permanently to resources.js.
          </p>
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

      {showPrint && <PrintModal onClose={() => setShowPrint(false)} overrides={overrides} removed={removed} localAdditions={localAdditions} />}

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
              background: "#e8fdf0", border: "1px solid #27ae60",
              borderRadius: "8px", padding: "10px 14px", marginBottom: "16px",
              fontSize: "12px", color: "#1a6a3a",
            }}>
              ✅ Clicking <strong>Save Changes</strong> will write directly to resources.js and trigger a Vercel deployment.
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
  const [configOk, setConfigOk] = useState(null); // null=loading, true=ok, false=not configured

  useEffect(() => {
    fetch("/api/check-config")
      .then(r => r.json())
      .then(d => setConfigOk(d.configured))
      .catch(() => setConfigOk(false));
  }, []);

  const overdue = allResources.filter(r => daysSince(r.lastReviewed) >= 60);

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "24px 16px 60px" }}>
      <h1 style={{ fontFamily: "'Lora', serif", fontSize: "26px", color: "var(--navy)", marginBottom: "6px" }}>
        🔐 Admin Dashboard
      </h1>
      <p style={{ fontSize: "14px", color: "var(--mid-gray)", marginBottom: "24px" }}>
        Private area — CancerCompass resource management
      </p>

      {configOk === false && (
        <div style={{
          background: "#fff3cd", border: "2px solid #e6a817",
          borderRadius: "12px", padding: "16px 20px", marginBottom: "20px",
          display: "flex", alignItems: "flex-start", gap: "12px",
        }}>
          <span style={{ fontSize: "22px", flexShrink: 0 }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: "15px", color: "#7a4a00", marginBottom: "4px" }}>
              Direct save to file is not configured
            </div>
            <div style={{ fontSize: "13px", color: "#7a4a00", lineHeight: "1.5" }}>
              The GitHub token has not been set up yet. <strong>Your edits, adds, and removes are only saved in this browser.</strong> Other users and the live site will not see them until you use <strong>Export Fixes</strong> in the Manage Resources tab and paste the result to Claude Code.
              <br /><br />
              To enable direct saving: add <code style={{ background: "#fde68a", padding: "1px 5px", borderRadius: "3px" }}>GITHUB_TOKEN</code> and <code style={{ background: "#fde68a", padding: "1px 5px", borderRadius: "3px" }}>GITHUB_REPO</code> to your Vercel environment variables. Set <code style={{ background: "#fde68a", padding: "1px 5px", borderRadius: "3px" }}>GITHUB_REPO</code> to <code style={{ background: "#fde68a", padding: "1px 5px", borderRadius: "3px" }}>jroad19-cmd/cancercompass</code>.
            </div>
          </div>
        </div>
      )}

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
            background: "#e8fdf0", border: "1.5px solid #27ae60",
            borderRadius: "10px", padding: "12px 16px", marginBottom: "16px",
            fontSize: "13px", color: "#1a6a3a",
          }}>
            ✅ <strong>Tip:</strong> If you find a broken link, go to the <strong>Manage Resources</strong> tab, click <strong>Edit</strong> on that resource, and click <strong>Save Changes</strong> — it will update the live site automatically within ~2 minutes.
          </div>
          <p style={{ fontSize: "14px", color: "var(--mid-gray)", marginBottom: "16px" }}>
            Resources listed from most overdue to most recent. Click <strong>Visit →</strong> to check the link, then click <strong>✓ Mark as Reviewed</strong>. If a link is broken or the info is wrong, go to the <strong>Manage Resources</strong> tab and click <strong>Edit</strong> to fix it permanently.
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

      {tab === "manage" && <ManageTab configOk={configOk} />}
    </div>
  );
}
