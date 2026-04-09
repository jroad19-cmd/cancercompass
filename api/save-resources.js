// api/save-resources.js
// Writes admin panel changes directly to src/data/resources.js via the GitHub Contents API.
// Required env vars: GITHUB_TOKEN (PAT with contents:write), GITHUB_REPO (e.g. "jroad19-cmd/cancercompass")
// Optional env var:  ADMIN_SECRET (if set, requests must include matching secret field)

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Optional secret check
  const adminSecret = process.env.ADMIN_SECRET;
  if (adminSecret && req.body?.secret !== adminSecret) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const { changes = {}, removals = [], additions = [] } = req.body || {};

  const token = process.env.GITHUB_TOKEN;
  const repo  = process.env.GITHUB_REPO; // "owner/repo"
  if (!token || !repo) {
    return res.status(500).json({ error: "GITHUB_TOKEN and GITHUB_REPO env vars must be set." });
  }

  const FILE_PATH = "src/data/resources.js";
  const apiBase   = `https://api.github.com/repos/${repo}/contents/${FILE_PATH}`;
  const headers   = {
    Authorization: `Bearer ${token}`,
    Accept:        "application/vnd.github+json",
    "User-Agent":  "CancerCompass-Admin/1.0",
    "Content-Type": "application/json",
  };

  // 1. Fetch current file content + SHA
  let currentContent, sha;
  try {
    const getRes = await fetch(apiBase, { headers });
    if (!getRes.ok) {
      const err = await getRes.text();
      return res.status(500).json({ error: `GitHub GET failed: ${getRes.status} — ${err}` });
    }
    const json = await getRes.json();
    sha = json.sha;
    currentContent = Buffer.from(json.content, "base64").toString("utf8");
  } catch (e) {
    return res.status(500).json({ error: `Failed to fetch file from GitHub: ${e.message}` });
  }

  // 2. Apply changes surgically
  let updated;
  try {
    updated = applyChanges(currentContent, changes, removals, additions);
  } catch (e) {
    return res.status(500).json({ error: `Failed to apply changes: ${e.message}` });
  }

  if (updated === currentContent) {
    return res.status(200).json({ success: true, message: "No changes detected — file unchanged." });
  }

  // 3. Commit updated file back to GitHub
  const nChanges   = Object.keys(changes).length;
  const nRemovals  = removals.length;
  const nAdditions = additions.length;
  const parts = [];
  if (nAdditions > 0) parts.push(`add ${nAdditions} resource${nAdditions > 1 ? "s" : ""}`);
  if (nChanges  > 0) parts.push(`edit ${nChanges} resource${nChanges > 1 ? "s" : ""}`);
  if (nRemovals > 0) parts.push(`remove ${nRemovals} resource${nRemovals > 1 ? "s" : ""}`);
  const commitMessage = `Admin panel: ${parts.join(", ")} — ${new Date().toISOString().slice(0, 10)}`;

  try {
    const putRes = await fetch(apiBase, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        message: commitMessage,
        content: Buffer.from(updated, "utf8").toString("base64"),
        sha,
      }),
    });
    if (!putRes.ok) {
      const err = await putRes.text();
      return res.status(500).json({ error: `GitHub PUT failed: ${putRes.status} — ${err}` });
    }
  } catch (e) {
    return res.status(500).json({ error: `Failed to commit to GitHub: ${e.message}` });
  }

  return res.status(200).json({ success: true, message: commitMessage });
};

// ── Surgical string replacement helpers ──────────────────────────────────────

function escapeForJsString(str) {
  return String(str).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function buildResourceLine(r) {
  const q = v => `"${escapeForJsString(String(v ?? ""))}"`;
  const phone = r.phone ? `"${escapeForJsString(String(r.phone))}"` : "null";
  const cancerTypes = JSON.stringify(Array.isArray(r.cancerTypes) ? r.cancerTypes : []);
  const states      = JSON.stringify(Array.isArray(r.states)      ? r.states      : []);
  return `  { id:${q(r.id)}, name:${q(r.name)}, description:${q(r.description)}, type:${q(r.type)}, cancerTypes:${cancerTypes}, states:${states}, qualifies:${q(r.qualifies)}, phone:${phone}, url:${q(r.url)}, lastReviewed:${q(r.lastReviewed)} },`;
}

function applyChanges(content, changes, removals, additions) {
  let lines = content.split("\n");

  // Remove lines for deleted resources
  if (removals && removals.length > 0) {
    lines = lines.filter(line => {
      for (const id of removals) {
        if (line.includes(`id:"${id}"`)) return false;
      }
      return true;
    });
  }

  // Apply field edits
  for (const [id, fields] of Object.entries(changes)) {
    lines = lines.map(line => {
      if (!line.includes(`id:"${id}"`)) return line;
      for (const [field, value] of Object.entries(fields)) {
        if (field === "phone") {
          line = line.replace(
            /phone:(?:null|"(?:[^"\\]|\\.)*")/,
            value === null ? "phone:null" : `phone:"${escapeForJsString(value)}"`
          );
        } else if (["name", "url", "description", "qualifies"].includes(field)) {
          const re = new RegExp(`(${field}:")(?:[^"\\\\]|\\\\.)*(")`);
          line = line.replace(re, (_, open, close) => `${open}${escapeForJsString(value)}${close}`);
        }
      }
      return line;
    });
  }

  // Insert new resources before the closing ]; of the resources array
  // Search BACKWARDS to find the last ]; — the one that closes the resources array,
  // not one of the earlier arrays (RESOURCE_TYPES, CANCER_TYPES, US_STATES, etc.)
  if (additions && additions.length > 0) {
    let closingIdx = -1;
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].trim() === "];") { closingIdx = i; break; }
    }
    if (closingIdx !== -1) {
      const newLines = additions.map(r => buildResourceLine(r));
      lines.splice(closingIdx, 0, ...newLines);
    }
  }

  return lines.join("\n");
}
