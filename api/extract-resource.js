// Updated April 2026
const Anthropic = require("@anthropic-ai/sdk");

const CANCER_TYPES = [
  "Bladder Cancer","Blood Cancer (General)","Brain / CNS Cancer","Breast Cancer",
  "Cervical Cancer","Colon / Colorectal Cancer","Esophageal Cancer","Head & Neck Cancer",
  "Kidney (Renal) Cancer","Leukemia (ALL)","Leukemia (AML)","Leukemia (CLL)","Leukemia (CML)",
  "Liver Cancer","Lung Cancer (Non-Small Cell)","Lung Cancer (Small Cell)",
  "Lymphoma (Hodgkin's)","Lymphoma (Non-Hodgkin's)","Melanoma / Skin Cancer","Mesothelioma",
  "Multiple Myeloma","Ovarian Cancer","Pancreatic Cancer","Prostate Cancer","Sarcoma",
  "Stomach / Gastric Cancer","Testicular Cancer","Thyroid Cancer","Uterine / Endometrial Cancer",
  "Other / Rare Cancer (Not Listed)",
];

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire",
  "New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio",
  "Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota",
  "Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia",
  "Wisconsin","Wyoming","Washington D.C.",
];

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { url } = req.body || {};
  if (!url) return res.status(400).json({ error: "URL is required." });

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({
      error: "ANTHROPIC_API_KEY is not configured. Add it to your Vercel environment variables.",
    });
  }

  // Fetch the page HTML
  let html;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const pageRes = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; CancerCompass-Admin/1.0)" },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    html = await pageRes.text();
    // Trim to stay within token limits — keep the most content-rich first 60K chars
    if (html.length > 60000) html = html.slice(0, 60000);
  } catch (e) {
    return res.status(400).json({ error: `Could not fetch the URL: ${e.message}` });
  }

  // Call Claude to extract structured resource data
  const client = new Anthropic.Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are a data-entry assistant for a cancer patient resource database. Extract structured information about this cancer support organization from the webpage HTML below.

URL: ${url}

HTML:
${html}

Return ONLY a valid JSON object with exactly these fields — no other text, no markdown:
{
  "name": "Organization Name — Program Name (specific, e.g. 'Susan G. Komen Foundation — Financial Assistance Program')",
  "description": "1-2 sentences in plain English describing what help is available and key details patients should know. Be specific about dollar amounts, time limits, or notable restrictions if present.",
  "qualifies": "One sentence covering who can apply and the key eligibility requirements (income, diagnosis, insurance, geography, etc.).",
  "type": "exactly one of: financial, medication, transportation, housing, nutrition, mental, legal, veterans, pediatric",
  "phone": "phone number as a string (e.g. '1-800-123-4567'), or null if not found",
  "states": ${JSON.stringify(US_STATES.slice(0, 5))} — use this format but only include states where the program is available. Use an empty array [] if the program is available nationwide.",
  "cancerTypes": "array using only these exact values: ${CANCER_TYPES.join(", ")}. Use an empty array [] if the program applies to all cancer types."
}`,
        },
      ],
    });

    const raw = message.content[0]?.type === "text" ? message.content[0].text.trim() : "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Claude did not return a JSON object.");

    const data = JSON.parse(jsonMatch[0]);

    // Validate and clean
    const validTypes = ["financial","medication","transportation","housing","nutrition","mental","legal","veterans","pediatric"];
    if (!validTypes.includes(data.type)) data.type = "financial";
    if (!Array.isArray(data.states)) data.states = [];
    if (!Array.isArray(data.cancerTypes)) data.cancerTypes = [];

    // Filter to only valid values
    data.states = data.states.filter(s => US_STATES.includes(s));
    data.cancerTypes = data.cancerTypes.filter(c => CANCER_TYPES.includes(c));

    return res.status(200).json({ success: true, data });
  } catch (e) {
    return res.status(500).json({ error: `Extraction failed: ${e.message}` });
  }
};
