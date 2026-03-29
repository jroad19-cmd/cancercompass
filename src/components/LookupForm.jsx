import { useState, useEffect } from "react";
import {
  CANCER_TYPES, US_STATES, TREATMENT_STATUSES,
  STAGES, AGE_RANGES, INSURANCE_STATUSES,
} from "../data/resources";
import {
  loadProfiles, getActiveProfile, saveProfile,
  setActiveProfileId, profileLabel, generateId, deleteProfile,
} from "./ProfileManager";

export default function LookupForm({ onResults, onAbout }) {
  const [form, setForm] = useState({
    id: generateId(),
    firstName: "",
    cancerType: "",
    state: "",
    treatmentStatus: "",
    stage: "",
    ageRange: "",
    insuranceStatus: "",
  });
  const [saveProfile_,  setSaveProfile]  = useState(false);
  const [profiles,      setProfiles]     = useState([]);
  const [showProfiles,  setShowProfiles] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [errors,        setErrors]       = useState({});

  useEffect(() => {
    const active = getActiveProfile();
    const all    = loadProfiles();
    setProfiles(all);
    if (active) {
      setForm(active);
      setSaveProfile(true);
    }
  }, []);

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: null }));
  }

  function validate() {
    const e = {};
    if (!form.cancerType) e.cancerType = "Please select your cancer type.";
    if (!form.state)      e.state      = "Please select your state.";
    return e;
  }

  function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    if (saveProfile_) {
      const toSave = { ...form };
      if (!toSave.id) toSave.id = generateId();
      saveProfile(toSave);
    }
    onResults(form);
  }

  function switchToProfile(p) {
    setForm(p);
    setSaveProfile(true);
    setActiveProfileId(p.id);
    setProfiles(loadProfiles());
    setShowProfiles(false);
    setEditingProfile(false);
  }

  function startNewProfile() {
    setForm({ id: generateId(), firstName: "", cancerType: "", state: "",
              treatmentStatus: "", stage: "", ageRange: "", insuranceStatus: "" });
    setSaveProfile(false);
    setShowProfiles(false);
    setEditingProfile(false);
  }

  function confirmDelete(id) { setDeleteConfirm(id); }

  function editProfile(p) {
    setForm(p);
    setSaveProfile(true);
    setActiveProfileId(p.id);
    setEditingProfile(true);
    setShowProfiles(false);
  }

  function doDelete(id) {
    deleteProfile(id);
    const all = loadProfiles();
    setProfiles(all);
    setDeleteConfirm(null);
    if (all.length > 0) switchToProfile(all[0]);
    else startNewProfile();
  }

  const activeProfile = getActiveProfile();

  return (
    <div style={{ paddingBottom: "40px" }}>
      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, var(--navy) 0%, var(--teal) 100%)",
        padding: "40px 24px 60px",
        textAlign: "center",
        color: "white",
      }}>
        <h1 style={{ fontFamily: "'Lora', serif", fontSize: "30px", fontWeight: 600, marginBottom: "10px", lineHeight: 1.3 }}>
          Let's find resources for you
        </h1>
        <p style={{ fontSize: "15px", opacity: 0.85, maxWidth: "400px", margin: "0 auto", lineHeight: 1.6 }}>
          Answer a few quick questions and we'll show you programs that match your situation.
        </p>

        {/* Profile switcher */}
        {profiles.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginTop: "18px", flexWrap: "wrap" }}>
            <span style={{
              background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: "20px", padding: "6px 16px", fontSize: "14px", color: "white", fontWeight: 500,
            }}>
              👤 {profileLabel(activeProfile)}
            </span>
            {profiles.length > 1 && (
              <button onClick={() => setShowProfiles(true)} style={{
                color: "rgba(255,255,255,0.8)", fontSize: "13px", cursor: "pointer",
                textDecoration: "underline", background: "none", border: "none",
                fontFamily: "'DM Sans', sans-serif",
              }}>Change Profile</button>
            )}
            <button onClick={startNewProfile} style={{
              color: "rgba(255,255,255,0.8)", fontSize: "13px", cursor: "pointer",
              textDecoration: "underline", background: "none", border: "none",
              fontFamily: "'DM Sans', sans-serif",
            }}>+ New Profile</button>
          </div>
        )}
      </div>

      {/* Profile picker modal */}
      {showProfiles && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
          zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
        }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "28px", maxWidth: "400px", width: "100%" }}>
            <h3 style={{ fontFamily: "'Lora', serif", fontSize: "20px", color: "var(--navy)", marginBottom: "16px" }}>
              Choose a Profile
            </h3>
            {profiles.map(p => (
              <div key={p.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 14px", border: "1.5px solid #e8e8e4", borderRadius: "10px",
                marginBottom: "8px",
              }}>
                <span onClick={() => switchToProfile(p)} style={{ flex: 1, fontWeight: 500, color: "var(--navy)", cursor: "pointer" }}>
                  👤 {profileLabel(p)}
                </span>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={() => editProfile(p)} style={{
                    background: "none", border: "none", color: "var(--teal)", cursor: "pointer",
                    fontSize: "13px", fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
                  }}>Edit</button>
                  <button onClick={() => confirmDelete(p.id)} style={{
                    background: "none", border: "none", color: "#cc3333", cursor: "pointer",
                    fontSize: "13px", fontFamily: "'DM Sans', sans-serif",
                  }}>Delete</button>
                </div>
              </div>
            ))}
            <button onClick={() => setShowProfiles(false)} className="btn-ghost" style={{ width: "100%", marginTop: "8px" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
          zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
        }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "28px", maxWidth: "380px", width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>⚠️</div>
            <h3 style={{ fontFamily: "'Lora', serif", fontSize: "18px", color: "var(--navy)", marginBottom: "10px" }}>
              Delete this profile?
            </h3>
            <p style={{ fontSize: "14px", color: "#5a5a55", marginBottom: "20px" }}>
              This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setDeleteConfirm(null)} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button onClick={() => doDelete(deleteConfirm)} style={{
                flex: 1, background: "#cc3333", color: "white", border: "none",
                borderRadius: "10px", padding: "12px", fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px", fontWeight: 600, cursor: "pointer",
              }}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Form card */}
      <div style={{
        background: "white", margin: "0 auto", borderRadius: "20px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.1)", padding: "28px 24px",
        maxWidth: "560px", position: "relative", top: "-20px",
        marginLeft: "auto", marginRight: "auto",
        marginBottom: "0",
      }} className="fade-up">

        {/* Editing banner */}
        {editingProfile && (
          <div style={{
            background: "var(--teal-pale)", border: "1px solid #c5e0e0",
            borderRadius: "10px", padding: "12px 16px", marginBottom: "20px",
            fontSize: "14px", color: "var(--teal)", display: "flex",
            alignItems: "center", gap: "8px",
          }}>
            ✏️ <span>Editing profile — update any field including your name, then hit Save & Find Resources.</span>
          </div>
        )}

        {/* First name field — always visible */}
        <div className="field-group">
          <div className="field-label">
            Your first name <span className="optional-tag">(optional)</span>
          </div>
          <input
            type="text"
            value={form.firstName || ""}
            onChange={e => set("firstName", e.target.value)}
            placeholder="e.g. Mary"
            style={{ padding: "12px 16px" }}
          />
          <p style={{ fontSize: "13px", color: "var(--mid-gray)", marginTop: "6px" }}>
            This name will be used to identify your saved profile.
          </p>
        </div>

        {/* Required fields */}
        <div className="field-group">
          <div className="field-label"><span className="required-star">✦</span> What type of cancer?</div>
          <select value={form.cancerType} onChange={e => set("cancerType", e.target.value)}>
            <option value="">Select cancer type...</option>
            {CANCER_TYPES.map(c => <option key={c}>{c}</option>)}
          </select>
          {errors.cancerType && <p style={{ color: "#cc3333", fontSize: "13px", marginTop: "5px" }}>{errors.cancerType}</p>}
        </div>

        <div className="field-group">
          <div className="field-label"><span className="required-star">✦</span> What state do you live in?</div>
          <select value={form.state} onChange={e => set("state", e.target.value)}>
            <option value="">Select your state...</option>
            {US_STATES.map(s => <option key={s}>{s}</option>)}
          </select>
          {errors.state && <p style={{ color: "#cc3333", fontSize: "13px", marginTop: "5px" }}>{errors.state}</p>}
        </div>

        {/* Optional fields */}
        <div className="field-group">
          <div className="field-label">What is your current treatment status? <span className="optional-tag">(optional)</span></div>
          <select value={form.treatmentStatus} onChange={e => set("treatmentStatus", e.target.value)}>
            <option value="">Select status...</option>
            {TREATMENT_STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div className="field-group">
          <div className="field-label">What is your cancer stage? <span className="optional-tag">(optional)</span></div>
          <select value={form.stage} onChange={e => set("stage", e.target.value)}>
            <option value="">Select stage...</option>
            {STAGES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div className="field-group">
          <div className="field-label">What is your age range? <span className="optional-tag">(optional)</span></div>
          <select value={form.ageRange} onChange={e => set("ageRange", e.target.value)}>
            <option value="">Select age range...</option>
            {AGE_RANGES.map(a => <option key={a}>{a}</option>)}
          </select>
        </div>

        <div className="field-group">
          <div className="field-label">What is your insurance status? <span className="optional-tag">(optional)</span></div>
          <select value={form.insuranceStatus} onChange={e => set("insuranceStatus", e.target.value)}>
            <option value="">Select insurance status...</option>
            {INSURANCE_STATUSES.map(i => <option key={i}>{i}</option>)}
          </select>
        </div>

        <hr className="form-divider" />

        <label className="save-option">
          <input type="checkbox" checked={saveProfile_} onChange={e => setSaveProfile(e.target.checked)} />
          <span className="save-option-text">Save my answers on this device for next time</span>
        </label>

        <button className="btn-find" onClick={handleSubmit}>
          {editingProfile ? "Save & Find Resources →" : "Find Resources →"}
        </button>
      </div>

      <footer className="cc-footer">
        <strong>CancerCompass</strong><br />
        CancerCompass provides this information as a free public service. We do not endorse, recommend, or have any affiliation with the organizations listed.<br />
        Always verify details directly with the organization before applying.<br />
        <button onClick={onAbout} style={{
          background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.4)",
          borderRadius: "8px", color: "white",
          fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 600,
          cursor: "pointer", marginTop: "14px", padding: "8px 18px",
          transition: "background 0.2s",
        }}>
          ℹ️ About CancerCompass
        </button>
      </footer>
    </div>
  );
}
