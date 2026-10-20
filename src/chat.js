// AI会話タブ：Gemini と会話し、会話ごと・テーマごとに記録を残す
import { state, save, newConversation } from "./store.js";
import { LEVELS, THEMES, TAREAS, MODES, themeById } from "./data.js";
import { chat as geminiChat, model } from "./gemini.js";
import { $, esc, isoDate, today, fmtDateTime, showTab } from "./util.js";

const setup = { mode: "theme", level: "B2", themeId: "trabajo", tareaId: "t1" };
let current = null;   // いま話している会話（store の conversations の1件）
let busy = false;
let ctrl = null;

const KICK = "（会話を始めてください。最初の話題や課題を出してください）";

function systemPrompt(c) {
  const theme = themeById(c.themeId);
  const base = `Eres un tutor de español nativo y amable para un estudiante japonés que prepara el DELE. Nivel objetivo del estudiante: ${c.level} (MCER). Ajusta vocabulario, gramática y longitud a ese nivel; en B2 usa subjuntivo y conectores variados con naturalidad. Responde normalmente en 2–5 frases y termina con una pregunta para seguir la conversación. Si el estudiante escribe en japonés, responde igualmente en español sencillo.`;
  let mode;
  if (c.mode === "free") mode = "Modo: conversación libre sobre lo que el estudiante quiera.";
  else if (c.mode === "theme") mode = `Modo: conversación guiada sobre el tema del DELE «${theme.es}» (${theme.hint}). Mantén la conversación dentro del tema, plantea preguntas de opinión como en el examen e introduce vocabulario útil del tema.`;
  else {
    const t = TAREAS.find((x) => x.id === c.tareaId) || TAREAS[0];
    mode = `Modo: simulacro de examen oral. Actúa como examinador. ${t.prompt} El material debe tratar el tema «${theme.es}». Presenta el material de la tarea por escrito al inicio, deja hablar al candidato y haz preguntas de seguimiento como en el examen real. Cuando el candidato pida la valoración, evalúa según los criterios del DELE (coherencia, fluidez, corrección, alcance) en japonés.`;
  }
  const fmt = `FORMATO OBLIGATORIO de cada respuesta:
1) Tu respuesta en español.
2) Una línea exacta "###JA###" y debajo la traducción al japonés de tu respuesta.
3) Una línea exacta "###CORR###" y debajo, en japonés, los errores del ÚLTIMO mensaje del estudiante, uno por línea con el formato: 誤: <frase original> → 正: <corrección>（<explicación breve en japonés>）. Si algo es correcto pero suena poco natural, inclúyelo también. Si no hay errores escribe solo: なし
No añadas nada más.`;
  return `${base}\n${mode}\n${fmt}`;
}

export function splitReply(text) {
  const [es, rest = ""] = text.split("###JA###");
  const [ja = "", corr = ""] = rest.split("###CORR###");
  return { es: es.trim(), ja: ja.trim(), corr: corr.trim() };
}

export function messageHTML(m) {
  if (m.hidden) return "";
  if (m.role === "user") return `<div class="msg me">${esc(m.text)}</div>`;
  const s = splitReply(m.text);
  let h = `<div class="msg ai"><div class="es">${esc(s.es || "…")}</div>`;
  if (s.ja) h += `<details><summary>日本語訳</summary>${esc(s.ja)}</details>`;
  if (s.corr && s.corr !== "なし") h += `<div class="corr"><b>あなたの文の直し</b><br>${esc(s.corr)}</div>`;
  return h + "</div>";
}

export function convLabel(c) {
  const theme = themeById(c.themeId);
  const modeName = MODES.find((m) => m.id === c.mode)?.name || "";
  const tarea = c.mode === "oral" ? " · " + (TAREAS.find((t) => t.id === c.tareaId)?.name.split("：")[0] || "") : "";
  return `${theme.ja} · ${modeName}${tarea} · ${c.level}`;
}

function renderSetup() {
  $("mode").value = setup.mode;
  $("clevel").value = setup.level;
  $("themeWrap").hidden = setup.mode === "free";
  $("oralWrap").hidden = setup.mode !== "oral";
  const chip = (v, n, on) => `<button type="button" class="chip" aria-pressed="${on}" data-v="${esc(v)}">${esc(n)}</button>`;
  $("themes").innerHTML = THEMES.filter((t) => t.id !== "free").map((t) => chip(t.id, t.ja, t.id === setup.themeId)).join("");
  $("tareas").innerHTML = TAREAS.map((t) => chip(t.id, t.name, t.id === setup.tareaId)).join("");
}

function renderLog(streamText) {
  const msgs = current ? current.messages : [];
  let html = msgs.map(messageHTML).join("");
  if (streamText != null) html += messageHTML({ role: "model", text: streamText });
  $("log").innerHTML = html || `<div class="empty">モードとテーマを選んで、下の欄から話しかけてください。<br>「AIから話題を出してもらう」で始めることもできます。<br>会話は自動で「記録」タブに保存されます。</div>`;
  $("log").scrollTop = $("log").scrollHeight;
  $("convLabel").textContent = current ? convLabel(current) : "新しい会話";
  $("convMeta").textContent = current ? `開始 ${fmtDateTime(current.createdAt)} · ${model()}` : `${model()} を使用`;
}

function startNew() {
  if (ctrl) ctrl.abort();
  current = null;
  $("chatStatus").textContent = "";
  renderLog();
}

function ensureConversation() {
  if (!current) {
    current = newConversation({
      mode: setup.mode,
      themeId: setup.mode === "free" ? "free" : setup.themeId,
      tareaId: setup.mode === "oral" ? setup.tareaId : null,
      level: setup.level,
    });
  }
  return current;
}

async function send(text, hidden = false) {
  if (busy) return;
  const c = ensureConversation();
  busy = true; $("send").disabled = true; $("startChat").disabled = true; $("chatStatus").textContent = "";
  c.messages.push({ role: "user", text, hidden });
  renderLog("");
  ctrl = new AbortController();
  try {
    const reply = await geminiChat({
      system: systemPrompt(c),
      messages: c.messages,
      onText: (full) => renderLog(full),
      signal: ctrl.signal,
    });
    c.messages.push({ role: "model", text: reply });
    if (!c.title && !hidden) c.title = text.slice(0, 60);
    if (!c.title && hidden) c.title = splitReply(reply).es.slice(0, 60);
    c.updatedAt = new Date().toISOString();
    if (!hidden) collectCorrections(c, splitReply(reply).corr);
    save();
  } catch (e) {
    c.messages.pop();
    if (!c.messages.length) { // 1通も残らなかった会話は記録に残さない
      state.conversations = state.conversations.filter((x) => x.id !== c.id);
      current = null;
    }
    save();
    if (!hidden && e.name !== "AbortError") $("input").value = text;
    $("chatStatus").textContent = e.name === "AbortError" ? "" : e.message;
  }
  busy = false; ctrl = null; $("send").disabled = false; $("startChat").disabled = false;
  renderLog();
}

function collectCorrections(c, corr) {
  if (!corr || corr === "なし") return;
  corr.split("\n").map((x) => x.replace(/^[-・*\s]+/, "").trim()).filter((x) => x.includes("→")).forEach((line) => {
    state.notes.unshift({ id: Math.random().toString(36).slice(2), text: line, date: isoDate(today()), themeId: c.themeId, convId: c.id });
  });
  state.notes = state.notes.slice(0, 500);
}

/** 記録タブから「続きから話す」 */
export function continueConversation(id) {
  const c = state.conversations.find((x) => x.id === id);
  if (!c) return;
  current = c;
  Object.assign(setup, { mode: c.mode, level: c.level, themeId: c.themeId === "free" ? setup.themeId : c.themeId, tareaId: c.tareaId || setup.tareaId });
  renderSetup(); renderLog();
  showTab("chat");
}

/** 記録タブから「このテーマで話す」 */
export function startWithTheme(themeId) {
  if (themeId === "free") setup.mode = "free";
  else { setup.themeId = themeId; if (setup.mode === "free") setup.mode = "theme"; }
  startNew(); renderSetup();
  showTab("chat");
}

export function initChat() {
  setup.level = LEVELS.includes(state.level) ? state.level : "B2";
  $("mode").innerHTML = MODES.map((m) => `<option value="${m.id}">${m.name}</option>`).join("");
  $("clevel").innerHTML = LEVELS.map((l) => `<option>${l}</option>`).join("");

  // 設定を変えたら新しい会話として記録する
  $("mode").onchange = (e) => { setup.mode = e.target.value; startNew(); renderSetup(); };
  $("clevel").onchange = (e) => { setup.level = e.target.value; startNew(); };
  $("themes").onclick = (e) => { const v = e.target.dataset?.v; if (!v) return; setup.themeId = v; startNew(); renderSetup(); };
  $("tareas").onclick = (e) => { const v = e.target.dataset?.v; if (!v) return; setup.tareaId = v; startNew(); renderSetup(); };
  $("newChat").onclick = startNew;
  $("startChat").onclick = () => { startNew(); send(KICK, true); };

  $("form").addEventListener("submit", (e) => {
    e.preventDefault();
    const v = $("input").value.trim();
    if (!v) return;
    $("input").value = "";
    send(v);
  });
  $("input").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); $("form").requestSubmit(); }
  });

  renderSetup(); renderLog();
}

export const refreshChat = () => renderLog();
