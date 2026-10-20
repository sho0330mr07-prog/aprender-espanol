import { state, save, exportJSON, importJSON } from "./store.js";
import { listModels, chat as geminiChat, model, DEFAULT_MODEL, apiKey } from "./gemini.js";
import { initPlan, renderPlanTab } from "./plan.js";
import { initChat, refreshChat } from "./chat.js";
import { initRecords, renderRecords, renderNotes } from "./records.js";
import { $, esc, onTab, showTab } from "./util.js";

// ---- タブ ----
document.querySelectorAll(".tabs button").forEach((b) => (b.onclick = () => showTab(b.dataset.tab)));
onTab("plan", renderPlanTab);
onTab("chat", refreshChat);
onTab("records", renderRecords);
onTab("notes", renderNotes);
onTab("settings", renderSettings);

// ---- 設定 ----
function renderModelOptions(models) {
  const list = models || [{ id: DEFAULT_MODEL, label: `${DEFAULT_MODEL}（既定・常に最新のFlash）` }];
  if (!list.some((m) => m.id === model())) list.unshift({ id: model(), label: model() });
  $("model").innerHTML = list.map((m) => `<option value="${esc(m.id)}">${esc(m.label)}${m.label.includes(m.id) ? "" : `（${esc(m.id)}）`}</option>`).join("");
  $("model").value = model();
}
function renderSettings() {
  $("apiKey").value = state.settings.apiKey || "";
  $("apiKey").placeholder = import.meta.env?.VITE_GEMINI_API_KEY ? ".env のキーを使用中（上書きする場合だけ入力）" : "AIza...";
  if (!$("model").options.length) renderModelOptions();
}
function storeSettings() {
  state.settings.apiKey = $("apiKey").value.trim();
  state.settings.model = $("model").value === DEFAULT_MODEL ? "" : $("model").value;
  save();
}
$("saveKey").onclick = () => { storeSettings(); $("keyStatus").textContent = "保存しました。"; };
$("loadModels").onclick = async () => {
  storeSettings();
  $("keyStatus").textContent = "読み込み中…";
  try {
    const models = await listModels();
    models.unshift({ id: DEFAULT_MODEL, label: `${DEFAULT_MODEL}（既定・常に最新のFlash）` });
    renderModelOptions(models);
    $("keyStatus").textContent = `${models.length - 1}個のモデルが使えます。`;
  } catch (e) { $("keyStatus").textContent = e.message; }
};
$("model").onchange = storeSettings;
$("testKey").onclick = async () => {
  storeSettings();
  $("keyStatus").textContent = "接続中…";
  try {
    const r = await geminiChat({ system: "Responde en una sola frase corta.", messages: [{ role: "user", text: "Hola, ¿funciona la conexión?" }] });
    $("keyStatus").textContent = `つながりました（${model()}）：${r.slice(0, 80)}`;
  } catch (e) { $("keyStatus").textContent = e.message; }
};

// ---- バックアップ ----
$("exportBtn").onclick = () => {
  const blob = new Blob([exportJSON()], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `aprender-espanol-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  $("backupStatus").textContent = "書き出しました。";
};
$("importFile").onchange = async (e) => {
  const f = e.target.files[0]; if (!f) return;
  try {
    importJSON(await f.text());
    $("backupStatus").textContent = `読み込みました（会話 ${state.conversations.length} 件・ノート ${state.notes.length} 件）。`;
    renderPlanTab();
  } catch (err) { $("backupStatus").textContent = "読み込めませんでした。書き出したJSONファイルを選んでください。"; }
  e.target.value = "";
};

// ---- 起動 ----
initPlan();
initChat();
initRecords();
if (!apiKey()) {
  $("chatStatus").textContent = "AI会話を使うには、設定タブで Gemini のAPIキーを入力してください。";
}

// ホーム画面に追加したときにオフラインでも開けるように（本番ビルドのみ）
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`);
}
