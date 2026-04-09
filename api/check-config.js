// api/check-config.js
// Returns whether the GitHub save-to-file feature is configured.
// Called by the admin panel on load to show/hide the "not configured" banner.
module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-store");
  const configured = !!(process.env.GITHUB_TOKEN && process.env.GITHUB_REPO);
  return res.status(200).json({ configured });
};
