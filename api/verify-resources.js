// api/verify-resources.js
// Manual integrity check — called by the "Verify File Integrity" button in the admin panel.
// Fetches the live resources.js from GitHub and runs the same four checks as save-resources.js.

const { validateContent } = require("./_validate");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") return res.status(200).end();

  const token = process.env.GITHUB_TOKEN;
  const repo  = process.env.GITHUB_REPO;
  if (!token || !repo) {
    return res.status(500).json({ error: "GITHUB_TOKEN and GITHUB_REPO env vars must be set." });
  }

  const FILE_PATH = "src/data/resources.js";
  const apiBase   = `https://api.github.com/repos/${repo}/contents/${FILE_PATH}`;
  const headers   = {
    Authorization: `Bearer ${token}`,
    Accept:        "application/vnd.github+json",
    "User-Agent":  "CancerCompass-Admin/1.0",
  };

  let content;
  try {
    const getRes = await fetch(apiBase, { headers });
    if (!getRes.ok) {
      const err = await getRes.text();
      return res.status(500).json({ error: `GitHub GET failed: ${getRes.status} — ${err}` });
    }
    const json = await getRes.json();
    content = Buffer.from(json.content, "base64").toString("utf8");
  } catch (e) {
    return res.status(500).json({ error: `Failed to fetch file from GitHub: ${e.message}` });
  }

  // Run full validation (no before/after comparison — just checks the current state)
  const result = validateContent(content);

  if (result.valid) {
    return res.status(200).json({
      valid: true,
      count: result.count,
      message: `All good — ${result.count} resources, no duplicates, no corruption`,
    });
  }

  console.error("[verify-resources] Issues found:", result.errors);
  return res.status(200).json({
    valid: false,
    count: result.count,
    errors: result.errors,
  });
};
