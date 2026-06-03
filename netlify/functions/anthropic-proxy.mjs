export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: ch(), body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: ch(), body: "Method Not Allowed" };
  }
  try {
    const body = JSON.parse(event.body);
    const apiKey = process.env.ANTHROPIC_API_KEY || body._apiKey;
    if (!apiKey) return { statusCode: 400, headers: ch(), body: JSON.stringify({ error: "No API key" }) };
    delete body._apiKey;
    const hasMCP = body.mcp_servers && body.mcp_servers.length > 0;
    const headers = {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    };
    if (hasMCP) headers["anthropic-beta"] = "mcp-client-2025-04-04";
    const resp = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers, body: JSON.stringify(body) });
    const data = await resp.json();
    return { statusCode: resp.status, headers: ch(), body: JSON.stringify(data) };
  } catch (e) {
    return { statusCode: 500, headers: ch(), body: JSON.stringify({ error: e.message }) };
  }
}
function ch() {
  return { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "POST, OPTIONS", "Content-Type": "application/json" };
}
