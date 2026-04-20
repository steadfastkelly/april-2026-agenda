// Vercel serverless function — updates public/schedule-data.json on GitHub.
// Requires the GITHUB_TOKEN environment variable (repo contents:write scope).

const OWNER = "steadfastkelly";
const REPO  = "april-2026-agenda";
const PATH  = "public/schedule-data.json";
const API   = "https://api.github.com";

export default async function handler(req: any, res: any) {
  // Allow GET for a quick diagnostics ping
  if (req.method === "GET") {
    const token = process.env.GITHUB_TOKEN;
    if (!token) return res.status(200).json({ configured: false, reason: "GITHUB_TOKEN not set" });
    // Verify the token can read the repo
    const check = await fetch(
      `${API}/repos/${OWNER}/${REPO}`,
      { headers: { Authorization: `Bearer ${token}`, "User-Agent": "april-2026-agenda-publish" } }
    ).catch(() => null);
    if (!check) return res.status(200).json({ configured: true, reachable: false });
    const data = await check.json() as { full_name?: string; message?: string };
    return res.status(200).json({
      configured: true,
      reachable: check.ok,
      repo: data.full_name ?? null,
      ghStatus: check.status,
      ghMessage: data.message ?? null,
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return res.status(503).json({ error: "GITHUB_TOKEN not configured on this deployment" });
  }

  const body = req.body ?? {};
  const events = body.events;
  const details = body.details;

  if (!Array.isArray(events) || events.length === 0) {
    return res.status(400).json({ error: "Invalid payload — events array required" });
  }

  const ghHeaders: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
    "User-Agent": "april-2026-agenda-publish",
  };

  const fileUrl = `${API}/repos/${OWNER}/${REPO}/contents/${PATH}`;

  // ── Step 1: Get current file SHA (required by GitHub to update an existing file) ──
  let sha: string | undefined;
  let getStatus = 0;
  let getError = "";

  try {
    const getRes = await fetch(fileUrl, { headers: ghHeaders });
    getStatus = getRes.status;

    if (getRes.ok) {
      const current = await getRes.json() as { sha?: string };
      sha = current.sha;
    } else if (getRes.status !== 404) {
      // 404 = file doesn't exist yet (fine, we'll create it)
      // Any other non-OK status means the token likely can't access the repo
      const errText = await getRes.text();
      let parsed: { message?: string } = {};
      try { parsed = JSON.parse(errText); } catch { /* raw text */ }
      getError = parsed.message ?? errText.slice(0, 200);
      console.error(`GET ${PATH} failed (${getRes.status}):`, getError);
      return res.status(500).json({
        error: `GitHub access denied (${getRes.status}) — ${getError}. Check token has Contents: Read & Write for this repo.`,
      });
    }
  } catch (e: any) {
    console.error("GET network error:", e?.message);
    return res.status(500).json({ error: "Network error reaching GitHub API" });
  }

  // ── Step 2: Commit new content ────────────────────────────────────────────────
  const newContent = JSON.stringify({ events, details: details ?? {} }, null, 2);
  const encoded = Buffer.from(newContent, "utf-8").toString("base64");

  let putRes: Response;
  try {
    putRes = await fetch(fileUrl, {
      method: "PUT",
      headers: ghHeaders,
      body: JSON.stringify({
        message: "Update schedule via Publish button",
        content: encoded,
        ...(sha ? { sha } : {}),
      }),
    });
  } catch (e: any) {
    console.error("PUT network error:", e?.message);
    return res.status(500).json({ error: "Network error reaching GitHub API" });
  }

  if (!putRes.ok) {
    const errText = await putRes.text();
    let parsed: { message?: string } = {};
    try { parsed = JSON.parse(errText); } catch { /* raw text */ }
    const ghMsg = parsed.message ?? errText.slice(0, 300);
    console.error(`PUT ${PATH} failed (${putRes.status}):`, ghMsg);

    // Specific help for common status codes
    let hint = "";
    if (putRes.status === 422 && !sha) {
      hint = " SHA missing — the file exists but couldn't be read. Ensure the token has Contents: Read access.";
    } else if (putRes.status === 403) {
      hint = " Token lacks write permission. Re-check Contents: Read & Write is set on the token.";
    } else if (putRes.status === 401) {
      hint = " Token is invalid or expired. Create a new token and update the GITHUB_TOKEN env var in Vercel.";
    }

    return res.status(500).json({
      error: `GitHub ${putRes.status}: ${ghMsg}${hint}`,
    });
  }

  return res.status(200).json({ ok: true });
}
