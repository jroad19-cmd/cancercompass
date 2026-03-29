// Handles multiple saved profiles in localStorage

const STORAGE_KEY = "cancercompass_profiles";
const ACTIVE_KEY  = "cancercompass_active_profile";

export function loadProfiles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveProfiles(profiles) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
}

export function getActiveProfileId() {
  return localStorage.getItem(ACTIVE_KEY) || null;
}

export function setActiveProfileId(id) {
  localStorage.setItem(ACTIVE_KEY, id);
}

export function getActiveProfile() {
  const profiles = loadProfiles();
  const id = getActiveProfileId();
  return profiles.find(p => p.id === id) || null;
}

export function saveProfile(profile) {
  const profiles = loadProfiles();
  const idx = profiles.findIndex(p => p.id === profile.id);
  if (idx >= 0) profiles[idx] = profile;
  else profiles.push(profile);
  saveProfiles(profiles);
  setActiveProfileId(profile.id);
}

export function deleteProfile(id) {
  let profiles = loadProfiles();
  profiles = profiles.filter(p => p.id !== id);
  saveProfiles(profiles);
  if (getActiveProfileId() === id) {
    setActiveProfileId(profiles[0]?.id || null);
  }
}

export function profileLabel(p) {
  if (!p) return "My Profile";
  const name = p.firstName ? p.firstName.trim() : "";
  return name || "My Profile";
}

export function generateId() {
  return "p_" + Math.random().toString(36).slice(2, 10);
}
