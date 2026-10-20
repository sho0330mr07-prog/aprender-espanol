// データはブラウザの localStorage に保存する（このパソコンのこのブラウザだけ）。
// 設定タブから JSON で書き出し・読み込みしてバックアップできる。

const KEY = "aprender-espanol:v2";

const defaults = () => ({
  exam: "DELE",
  level: "B2",
  session: "2027-10-15",
  customDate: "",
  done: {},          // { "w0": [0,2], ... } 週ごとの完了タスク
  notes: [],         // 間違いノート { id, text, date, themeId, convId }
  conversations: [], // 会話記録（下の newConversation 参照）
  settings: { apiKey: "", model: "" },
});

export const state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...defaults(), ...JSON.parse(raw) };
  } catch (e) { /* 読めなければ初期値 */ }
  return defaults();
}

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { console.warn("保存できませんでした", e); }
}

export function exportJSON() {
  return JSON.stringify({ app: "aprender-espanol", version: 2, exportedAt: new Date().toISOString(), data: { ...state, settings: { model: state.settings.model } } }, null, 2);
}

export function importJSON(text) {
  const parsed = JSON.parse(text);
  const data = parsed.data || parsed;
  const apiKey = state.settings.apiKey;
  Object.assign(state, defaults(), data);
  state.settings = { ...state.settings, apiKey };
  save();
}

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export function newConversation({ mode, themeId, tareaId, level }) {
  const c = {
    id: uid(), mode, themeId, tareaId, level,
    title: "", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    messages: [], // { role: "user" | "model", text, hidden? }
  };
  state.conversations.unshift(c);
  save();
  return c;
}

export function deleteConversation(id) {
  state.conversations = state.conversations.filter((c) => c.id !== id);
  save();
}
