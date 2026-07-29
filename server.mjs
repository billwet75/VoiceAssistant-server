import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv(path) {
  let content;
  try {
    content = readFileSync(path, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return;
    throw error;
  }

  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match || match[1] in process.env) continue;
    let value = match[2];
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[match[1]] = value;
  }
}

loadEnv(resolve(".env.local"));

const apiKey = process.env.PERPLEXITY_API_KEY;
const model = process.env.PERPLEXITY_MODEL || "sonar";
const appToken = process.env.VOICEASSISTANT_TOKEN || "";
const port = Number(process.env.PORT || 8787);
const host = process.env.HOST || "127.0.0.1";
const conversations = new Map();

if (!apiKey) {
  throw new Error("PERPLEXITY_API_KEY отсутствует в .env.local");
}

function sendJson(response, status, body) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(body));
}

async function readJson(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 64 * 1024) throw new Error("request_too_large");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function askPerplexity(question, conversationId) {
  const id =
    conversationId && conversations.has(conversationId)
      ? conversationId
      : randomUUID();
  const history = conversations.get(id) || [];
  const payload = {
    model,
    messages: [
      {
        role: "system",
        content:
          "Ты голосовой помощник на Android. Отвечай по-русски, кратко, понятно и пригодно для озвучивания. Не утверждай, что выполнил действие на телефоне. Для свежих данных используй доступный веб-поиск.",
      },
      ...history,
      { role: "user", content: question },
    ],
    max_tokens: 500,
  };

  const response = await fetch("https://api.perplexity.ai/v1/sonar", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(45_000),
  });
  const data = await response.json();
  if (!response.ok) {
    const message = data?.error?.message || `Perplexity API: HTTP ${response.status}`;
    throw new Error(message);
  }
  const answer = data?.choices?.[0]?.message?.content?.trim() || "";
  if (!answer) throw new Error("Perplexity API returned an empty answer");
  const updatedHistory = [
    ...history,
    { role: "user", content: question },
    { role: "assistant", content: answer },
  ].slice(-12);
  conversations.set(id, updatedHistory);
  return { answer, responseId: id };
}

const server = createServer(async (request, response) => {
  if (request.method === "GET" && request.url === "/health") {
    sendJson(response, 200, { ok: true, model });
    return;
  }
  if (request.method !== "POST" || request.url !== "/api/ask") {
    sendJson(response, 404, { error: "not_found" });
    return;
  }
  if (
    appToken &&
    request.headers.authorization !== `Bearer ${appToken}`
  ) {
    sendJson(response, 401, { error: "unauthorized" });
    return;
  }

  try {
    const body = await readJson(request);
    const question = typeof body.question === "string" ? body.question.trim() : "";
    const previousResponseId =
      typeof body.previousResponseId === "string" ? body.previousResponseId : undefined;
    if (!question || question.length > 4000) {
      sendJson(response, 400, { error: "invalid_question" });
      return;
    }
    const result = await askPerplexity(question, previousResponseId);
    sendJson(response, 200, result);
  } catch (error) {
    const message =
      error.message === "request_too_large" ? error.message : "ai_request_failed";
    console.error(error instanceof Error ? error.message : error);
    sendJson(response, message === "request_too_large" ? 413 : 502, { error: message });
  }
});

server.listen(port, host, () => {
  console.log(`VoiceAssistant server: http://${host}:${port}`);
});
