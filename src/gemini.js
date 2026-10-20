// Gemini API（Google AI Studio のAPIキー）を直接呼び出す小さなクライアント
// ドキュメント: https://ai.google.dev/api

import { state } from "./store.js";

const BASE = "https://generativelanguage.googleapis.com/v1beta";
export const DEFAULT_MODEL = import.meta.env?.VITE_GEMINI_MODEL || "gemini-flash-latest";

export const apiKey = () => state.settings.apiKey || import.meta.env?.VITE_GEMINI_API_KEY || "";
export const model = () => state.settings.model || DEFAULT_MODEL;

export class GeminiError extends Error {
  constructor(message, status) { super(message); this.status = status; }
}

function explain(status, body) {
  const msg = body?.error?.message || "";
  if (status === 400 && /API key/i.test(msg)) return "APIキーが正しくありません。設定タブで確認してください。";
  if (status === 403) return "このAPIキーではGeminiを使えません。AI Studioでキーの権限を確認してください。";
  if (status === 404) return `モデル「${model()}」が見つかりません。設定タブで別のモデルを選んでください。`;
  if (status === 429) return "無料枠の回数制限に達しました。1分ほど待つか、明日もう一度試してください。";
  if (status >= 500) return "Gemini側で一時的なエラーが起きました。少し待って送り直してください。";
  return msg || `エラー（${status}）`;
}

/**
 * 会話をストリーミングで生成する
 * @param {{system: string, messages: {role:"user"|"model", text:string}[], onText?: (full:string)=>void, signal?: AbortSignal}} p
 */
export async function chat({ system, messages, onText, signal }) {
  const key = apiKey();
  if (!key) throw new GeminiError("Gemini のAPIキーが未設定です。設定タブで入力してください。", 0);

  const res = await fetch(`${BASE}/models/${encodeURIComponent(model())}:streamGenerateContent?alt=sse`, {
    method: "POST",
    signal,
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: messages.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
      generationConfig: { temperature: 0.8 },
    }),
  });
  if (!res.ok) {
    let body = null; try { body = await res.json(); } catch (e) {}
    throw new GeminiError(explain(res.status, body), res.status);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "", full = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let i;
    while ((i = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, i).trim();
      buf = buf.slice(i + 1);
      if (!line.startsWith("data:")) continue;
      try {
        const json = JSON.parse(line.slice(5));
        const parts = json.candidates?.[0]?.content?.parts || [];
        const piece = parts.filter((p) => !p.thought).map((p) => p.text || "").join("");
        if (piece) { full += piece; onText?.(full); }
      } catch (e) { /* 途中の行は無視 */ }
    }
  }
  if (!full) throw new GeminiError("返答が空でした。もう一度送ってください。", 0);
  return full;
}

/** このキーで使えるモデルの一覧（テキスト生成できる gemini 系のみ） */
export async function listModels() {
  const key = apiKey();
  if (!key) throw new GeminiError("先にAPIキーを入力してください。", 0);
  const res = await fetch(`${BASE}/models?pageSize=200`, { headers: { "x-goog-api-key": key } });
  if (!res.ok) {
    let body = null; try { body = await res.json(); } catch (e) {}
    throw new GeminiError(explain(res.status, body), res.status);
  }
  const json = await res.json();
  return (json.models || [])
    .filter((m) => m.supportedGenerationMethods?.includes("generateContent") && /gemini/.test(m.name) && !/image|tts|embedding|live|audio/.test(m.name))
    .map((m) => ({ id: m.name.replace("models/", ""), label: m.displayName || m.name }));
}
