const MCP_SM = [{ type: "url", url: "https://mcp.supermetrics.com/mcp", name: "supermetrics" }];
export function getApiKey() { return localStorage.getItem("sri_anthropic_key") || ""; }
export function setApiKey(key) { localStorage.setItem("sri_anthropic_key", key); }
export function hasApiKey() { return !!getApiKey(); }

async function callAPI(body) {
  const key = getApiKey();
  if (!key) throw new Error("APIキーが未設定");
  const resp = await fetch("/.netlify/functions/anthropic-proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, _apiKey: key }),
  });
  if (!resp.ok) throw new Error("API error: " + resp.status);
  return resp.json();
}

export async function fetchWithSupermetrics(sys, usr) {
  return callAPI({ model: "claude-sonnet-4-6", max_tokens: 4096, system: sys, messages: [{ role: "user", content: usr }], mcp_servers: MCP_SM });
}

export async function chatWithAgent(sys, msgs) {
  return callAPI({ model: "claude-sonnet-4-6", max_tokens: 1000, system: sys, messages: msgs });
}

export function extractText(d) {
  if (!d || !d.content) return "";
  return d.content.filter(function(b) { return b.type === "text"; }).map(function(b) { return b.text; }).join("\n");
}
