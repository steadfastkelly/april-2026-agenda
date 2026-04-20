// Vercel serverless function — updates public/schedule-data.json on GitHub.
// Requires the GITHUB_TOKEN environment variable (repo contents:write scope).

const OWNER = "steadfastkelly";
const REPO  = "april-2026-agenda";
const PATH  = "public/schedule-data.json";
const API   = "https://api.github.com";

export default async function handler(req: any, res: any) {
  // Only allow POST
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    res.status(503).json({ error: "GITHUB_TOKEN not configured on this deployment" });
    return;
  }

  const { events, details } = req.body ?? {};
  if (!Array.isArray(events) || events.length === 0) {
    res.status(400).json({ error: "Invalid payload — events array required" });
    return;
  }

  const ghHeaders: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
    "User-Agent": "april-2026-agenda-publish",
  };

  const fileUrl = `${API}/repos/${OWNER}/${REPO}/contents/${PATH}`;

  // Fetch current SHA so GitHub accepts the update
  let sha: string | undefined;
  try {
    const getRes = await fetch(fileUrl, { headers: ghHeaders });
    if (getRes.ok) {
      const current = await getRes.json() as { sha: string };
      sha = current.sha;
    }
  } catch { /* file may not exist yet — that's fine */ }

  // Encode new content as base64 (GitHub API requires this)
  const newContent = JSON.stringify({ events, details: details ?? {} }, null, 2);
  const encoded = Buffer.from(newContent, "utf-8").toString("base64");

  const putRes = await fetch(fileUrl, {
    method: "PUT",
    headers: ghHeaders,
    body: JSON.stringify({
      message: "Update schedule via Publish button",
      content: encoded,
      ...(sha ? { sha } : {}),
    }),
  });

  if (!putRes.ok) {
    const text = await putRes.text();
    console.error("GitHub API error:", putRes.status, text);
    res.status(500).json({ error: "GitHub update failed — check GITHUB_TOKEN permissions" });
    return;
  }

  res.status(200).json({ ok: true });
}
