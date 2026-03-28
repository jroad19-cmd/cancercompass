// CancerCompass Resource Database
// Each resource has:
//   id, name, description, type, cancerTypes ([] = all cancers), states ([] = all states),
//   qualifies, phone, url, lastReviewed

export const RESOURCE_TYPES = [
  { value: "all", label: "All Types of Help" },
  { value: "financial", label: "💰 Financial" },
  { value: "transportation", label: "🚗 Transportation" },
  { value: "housing", label: "🏠 Housing" },
  { value: "medication", label: "💊 Medication" },
  { value: "mental", label: "🧠 Mental Health" },
  { value: "legal", label: "⚖️ Legal" },
  { value: "nutrition", label: "🍎 Nutrition" },
  { value: "pediatric", label: "👶 Pediatric" },
  { value: "veterans", label: "🎖️ Veterans" },
];

export const TYPE_LABELS = {
  financial:      { label: "💰 Financial Grant",       className: "tag-financial" },
  transportation: { label: "🚗 Transportation",        className: "tag-transport" },
  housing:        { label: "🏠 Housing",               className: "tag-housing" },
  medication:     { label: "💊 Medication Assistance", className: "tag-medication" },
  mental:         { label: "🧠 Mental Health Support", className: "tag-mental" },
  legal:          { label: "⚖️ Legal Assistance",      className: "tag-legal" },
  nutrition:      { label: "🍎 Nutrition",             className: "tag-nutrition" },
  pediatric:      { label: "👶 Pediatric",             className: "tag-pediatric" },
  veterans:       { label: "🎖️ Veterans",              className: "tag-veterans" },
};

export const CANCER_TYPES = [
  "Bladder Cancer",
  "Blood Cancer (General)",
  "Brain / CNS Cancer",
  "Breast Cancer",
  "Cervical Cancer",
  "Colon / Colorectal Cancer",
  "Esophageal Cancer",
  "Head & Neck Cancer",
  "Kidney (Renal) Cancer",
  "Leukemia (ALL)",
  "Leukemia (AML)",
  "Leukemia (CLL)",
  "Leukemia (CML)",
  "Liver Cancer",
  "Lung Cancer (Non-Small Cell)",
  "Lung Cancer (Small Cell)",
  "Lymphoma (Hodgkin's)",
  "Lymphoma (Non-Hodgkin's)",
  "Melanoma / Skin Cancer",
  "Mesothelioma",
  "Multiple Myeloma",
  "Ovarian Cancer",
  "Pancreatic Cancer",
  "Prostate Cancer",
  "Sarcoma",
  "Stomach / Gastric Cancer",
  "Testicular Cancer",
  "Thyroid Cancer",
  "Uterine / Endometrial Cancer",
  "Other / Rare Cancer (Not Listed)",
];

export const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire",
  "New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio",
  "Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota",
  "Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia",
  "Wisconsin","Wyoming","Washington D.C.",
];

export const TREATMENT_STATUSES = [
  "Newly Diagnosed",
  "In Treatment",
  "Finished Treatment",
  "Recurrence",
];

export const STAGES = [
  "Stage 1","Stage 2","Stage 3","Stage 4","Unknown","Not Applicable",
];

export const AGE_RANGES = [
  "Under 18","18–30","31–45","46–60","61–75","76+",
];

export const INSURANCE_STATUSES = [
  "Insured (Private)","Uninsured","Medicare","Medicaid","VA Benefits","Other",
];

// ── RESOURCE DATABASE ──────────────────────────────────────────────────────
// cancerTypes: [] means applies to ALL cancer types
// states: [] means applies to ALL states (national)

export const resources = [
  // ── NATIONAL ──
  {
    id: "n001",
    name: "CancerCare — Financial Assistance & Counseling",
    description: "Free professional counseling, support groups, and limited financial assistance for treatment-related costs. Available by phone, online, and in-person.",
    type: "mental",
    cancerTypes: [],
    states: [],
    qualifies: "Any cancer patient or caregiver, regardless of income or insurance.",
    phone: "1-800-813-4673",
    url: "https://www.cancercare.org",
    lastReviewed: "2026-02-15",
  },
  {
    id: "n002",
    name: "Patient Advocate Foundation — Copay Relief Fund",
    description: "Helps cover insurance co-pays, co-insurance, and deductibles for cancer patients actively receiving treatment.",
    type: "financial",
    cancerTypes: [],
    states: [],
    qualifies: "Insured cancer patients in active treatment; income requirements apply.",
    phone: "1-800-532-5274",
    url: "https://www.patientadvocate.org",
    lastReviewed: "2026-03-01",
  },
  {
    id: "n003",
    name: "HealthWell Foundation — Premium Assistance",
    description: "Helps cancer patients pay for health insurance premiums, co-pays, and other out-of-pocket costs so they can stay insured during treatment.",
    type: "financial",
    cancerTypes: [],
    states: [],
    qualifies: "U.S. residents with qualifying cancer diagnosis; income limits apply.",
    phone: "1-800-675-8416",
    url: "https://www.healthwellfoundation.org",
    lastReviewed: "2026-01-20",
  },
  {
    id: "n004",
    name: "American Cancer Society — Road To Recovery",
    description: "Volunteer-driven transportation program that gives cancer patients free rides to and from treatment appointments.",
    type: "transportation",
    cancerTypes: [],
    states: [],
    qualifies: "Cancer patients who need transportation to treatment; availability varies by location.",
    phone: "1-800-227-2345",
    url: "https://www.cancer.org",
    lastReviewed: "2026-02-10",
  },
  {
    id: "n005",
    name: "Joe's House — Lodging Near Treatment",
    description: "Searchable directory of lodging options near cancer treatment centers across the U.S., many at reduced rates or free.",
    type: "housing",
    cancerTypes: [],
    states: [],
    qualifies: "Any cancer patient traveling away from home for treatment.",
    phone: "1-877-563-7468",
    url: "https://www.joeshouse.org",
    lastReviewed: "2026-01-15",
  },
  {
    id: "n006",
    name: "NeedyMeds — Prescription Assistance",
    description: "Connects cancer patients to prescription assistance programs, free clinics, and drug discount cards to lower medication costs.",
    type: "medication",
    cancerTypes: [],
    states: [],
    qualifies: "Any patient struggling to afford prescription medications.",
    phone: "1-800-503-6897",
    url: "https://www.needymeds.org",
    lastReviewed: "2026-03-10",
  },
  {
    id: "n007",
    name: "Cancer Legal Resource Center",
    description: "Free legal information and referrals for cancer patients facing employment discrimination, insurance denials, and disability issues.",
    type: "legal",
    cancerTypes: [],
    states: [],
    qualifies: "Any cancer patient or survivor dealing with legal issues related to their diagnosis.",
    phone: "1-866-843-2572",
    url: "https://www.cancerlegalresources.org",
    lastReviewed: "2026-02-01",
  },
  {
    id: "n008",
    name: "Meals on Wheels — Cancer Patient Support",
    description: "Home-delivered meals for cancer patients who are unable to prepare food during treatment. Contact your local chapter for availability.",
    type: "nutrition",
    cancerTypes: [],
    states: [],
    qualifies: "Cancer patients who are homebound or unable to prepare meals; availability varies by area.",
    phone: "1-888-998-6325",
    url: "https://www.mealsonwheelsamerica.org",
    lastReviewed: "2026-01-25",
  },
  {
    id: "n009",
    name: "Children's Cancer Fund",
    description: "Provides financial assistance, research funding, and family support for children diagnosed with cancer across the United States.",
    type: "pediatric",
    cancerTypes: [],
    states: [],
    qualifies: "Children under 18 diagnosed with cancer and their families.",
    phone: "1-214-987-8816",
    url: "https://www.childrenscancerfund.org",
    lastReviewed: "2026-02-20",
  },
  {
    id: "n010",
    name: "VA National Oncology Program — Veterans Cancer Benefits",
    description: "Comprehensive cancer care, treatment funding, and support services for U.S. military veterans diagnosed with cancer.",
    type: "veterans",
    cancerTypes: [],
    states: [],
    qualifies: "U.S. military veterans enrolled in VA healthcare with a cancer diagnosis.",
    phone: "1-800-827-1000",
    url: "https://www.va.gov/health-care/health-needs-conditions/cancer-care",
    lastReviewed: "2026-03-05",
  },

  // ── BREAST CANCER SPECIFIC ──
  {
    id: "bc001",
    name: "Susan G. Komen Foundation — Financial Assistance",
    description: "Direct financial assistance for breast cancer patients covering treatment co-pays, transportation, childcare, and other costs during active treatment.",
    type: "financial",
    cancerTypes: ["Breast Cancer"],
    states: [],
    qualifies: "Breast cancer patients currently in treatment with demonstrated financial need.",
    phone: "1-877-465-6636",
    url: "https://www.komen.org",
    lastReviewed: "2026-01-30",
  },
  {
    id: "bc002",
    name: "Breastcancer.org — Peer Support Community",
    description: "Free online community and helpline connecting breast cancer patients with others who have been through similar experiences. Available 24/7.",
    type: "mental",
    cancerTypes: ["Breast Cancer"],
    states: [],
    qualifies: "Anyone affected by breast cancer — patients, survivors, and caregivers.",
    phone: null,
    url: "https://www.breastcancer.org",
    lastReviewed: "2026-03-12",
  },
  {
    id: "bc003",
    name: "Roche — Herceptin Patient Assistance Program",
    description: "Free or reduced-cost Herceptin (trastuzumab) for HER2-positive breast cancer patients who cannot afford their medication.",
    type: "medication",
    cancerTypes: ["Breast Cancer"],
    states: [],
    qualifies: "HER2+ breast cancer patients who are uninsured or underinsured; income requirements apply.",
    phone: "1-888-249-4918",
    url: "https://www.genentech-access.com",
    lastReviewed: "2026-02-08",
  },

  // ── LUNG CANCER SPECIFIC ──
  {
    id: "lc001",
    name: "LUNGevity Foundation — Financial & Emotional Support",
    description: "Grants, peer mentoring, and support resources specifically for lung cancer patients and their families navigating diagnosis and treatment.",
    type: "financial",
    cancerTypes: ["Lung Cancer (Non-Small Cell)", "Lung Cancer (Small Cell)"],
    states: [],
    qualifies: "Lung cancer patients and their caregivers at any stage of diagnosis.",
    phone: "1-312-407-6100",
    url: "https://www.lungevity.org",
    lastReviewed: "2026-02-25",
  },

  // ── LEUKEMIA / LYMPHOMA SPECIFIC ──
  {
    id: "ll001",
    name: "Leukemia & Lymphoma Society — Patient Aid",
    description: "Financial assistance for treatment costs, co-pays, and travel expenses for patients with blood cancers including leukemia, lymphoma, and myeloma.",
    type: "financial",
    cancerTypes: ["Leukemia (ALL)","Leukemia (AML)","Leukemia (CLL)","Leukemia (CML)","Lymphoma (Hodgkin's)","Lymphoma (Non-Hodgkin's)","Multiple Myeloma"],
    states: [],
    qualifies: "Patients with a confirmed blood cancer diagnosis; income requirements apply.",
    phone: "1-800-955-4572",
    url: "https://www.lls.org",
    lastReviewed: "2026-03-08",
  },

  // ── PANCREATIC CANCER SPECIFIC ──
  {
    id: "pc001",
    name: "Pancreatic Cancer Action Network — Patient Services",
    description: "Financial grants, clinical trial matching, and one-on-one support from trained specialists for pancreatic cancer patients.",
    type: "financial",
    cancerTypes: ["Pancreatic Cancer"],
    states: [],
    qualifies: "Pancreatic cancer patients and their caregivers at any stage.",
    phone: "1-877-272-6226",
    url: "https://www.pancan.org",
    lastReviewed: "2026-01-18",
  },

  // ── TEXAS STATE RESOURCES ──
  {
    id: "tx001",
    name: "Texas Cancer Council — Patient Assistance Fund",
    description: "State-funded assistance for Texas residents facing cancer-related financial hardship, covering utilities, rent, food, and transportation during treatment.",
    type: "financial",
    cancerTypes: [],
    states: ["Texas"],
    qualifies: "Texas residents diagnosed with any cancer type; income limits apply.",
    phone: "1-512-463-3190",
    url: "https://www.texascancercouncil.org",
    lastReviewed: "2026-02-14",
  },
  {
    id: "tx002",
    name: "Texas DSHS — Breast & Cervical Cancer Services",
    description: "Free or low-cost breast cancer screening and treatment services for uninsured or underinsured Texas women through the state health department.",
    type: "medication",
    cancerTypes: ["Breast Cancer", "Cervical Cancer"],
    states: ["Texas"],
    qualifies: "Texas women 40+ who are uninsured or underinsured; income requirements apply.",
    phone: "1-800-242-3247",
    url: "https://www.dshs.texas.gov",
    lastReviewed: "2026-01-22",
  },
  {
    id: "tx003",
    name: "UT MD Anderson — Financial Counseling Services",
    description: "Free financial counseling and assistance navigating insurance, payment plans, and assistance programs for MD Anderson cancer patients.",
    type: "financial",
    cancerTypes: [],
    states: ["Texas"],
    qualifies: "Patients receiving treatment at UT MD Anderson Cancer Center.",
    phone: "1-877-632-6789",
    url: "https://www.mdanderson.org",
    lastReviewed: "2026-03-02",
  },
  {
    id: "tx004",
    name: "Texas 2-1-1 — Local Cancer Support Referrals",
    description: "Free statewide helpline connecting Texans with local cancer support services, food banks, transportation, and financial assistance programs.",
    type: "financial",
    cancerTypes: [],
    states: ["Texas"],
    qualifies: "Any Texas resident in need of local support services.",
    phone: "2-1-1",
    url: "https://www.211texas.org",
    lastReviewed: "2026-02-28",
  },

  // ── CALIFORNIA STATE RESOURCES ──
  {
    id: "ca001",
    name: "Cancer Prevention Institute of California",
    description: "Research-backed programs and resources for California cancer patients, including screening navigation, financial counseling, and treatment support.",
    type: "financial",
    cancerTypes: [],
    states: ["California"],
    qualifies: "California residents with a cancer diagnosis.",
    phone: "1-408-354-2153",
    url: "https://www.cpic.org",
    lastReviewed: "2026-02-05",
  },

  // ── NEW YORK STATE RESOURCES ──
  {
    id: "ny001",
    name: "New York State Cancer Services Program",
    description: "Free cancer screenings and diagnostic services for uninsured and underinsured New York residents through the state health department.",
    type: "medication",
    cancerTypes: [],
    states: ["New York"],
    qualifies: "Uninsured or underinsured New York residents who meet income guidelines.",
    phone: "1-866-442-2262",
    url: "https://www.health.ny.gov/diseases/cancer",
    lastReviewed: "2026-01-10",
  },

  // ── FLORIDA STATE RESOURCES ──
  {
    id: "fl001",
    name: "Florida Cancer Connect — Resource Navigator",
    description: "Connects Florida cancer patients with local financial assistance, transportation, and support programs throughout the state.",
    type: "financial",
    cancerTypes: [],
    states: ["Florida"],
    qualifies: "Florida residents currently dealing with a cancer diagnosis.",
    phone: "1-800-227-2345",
    url: "https://www.floridacancerconnect.com",
    lastReviewed: "2026-02-18",
  },
];

// ── FILTER FUNCTION ────────────────────────────────────────────────────────
export function getFilteredResources(cancerType, state, typeFilter = "all") {
  const filtered = resources.filter(r => {
    const matchesCancer =
      r.cancerTypes.length === 0 || r.cancerTypes.includes(cancerType);
    const matchesState =
      r.states.length === 0 || r.states.includes(state);
    const matchesType =
      typeFilter === "all" || r.type === typeFilter;
    return matchesCancer && matchesState && matchesType;
  });

  const national = filtered.filter(r => r.states.length === 0 && r.cancerTypes.length === 0);
  const stateSpecific = filtered.filter(r => r.states.includes(state));
  const cancerSpecific = filtered.filter(
    r => r.cancerTypes.includes(cancerType) && r.states.length === 0
  );

  // sort each group by type
  const sortByType = arr => [...arr].sort((a, b) => a.type.localeCompare(b.type));

  return {
    national: sortByType(national),
    stateSpecific: sortByType(stateSpecific),
    cancerSpecific: sortByType(cancerSpecific),
    total: national.length + stateSpecific.length + cancerSpecific.length,
  };
}
