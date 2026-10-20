// 記録タブ（テーマ別の会話記録）とノートタブ
import { state, save, deleteConversation } from "./store.js";
import { THEMES, themeById } from "./data.js";
import { messageHTML, convLabel, continueConversation, startWithTheme } from "./chat.js";
import { $, esc, fmtDate, fmtDateTime } from "./util.js";

let selectedTheme = null;
let viewingId = null;
let confirmDelete = false;

const userTurns = (c) => c.messages.filter((m) => m.role === "user" && !m.hidden).length;

function renderGrid() {
  $("themeGrid").innerHTML = THEMES.map((t) => {
    const convs = state.conversations.filter((c) => c.themeId === t.id);
    const last = convs.reduce((a, c) => (c.updatedAt > a ? c.updatedAt : a), "");
    return `<button class="tcard${convs.length ? "" : " zero"}" data-id="${t.id}" aria-pressed="${t.id === selectedTheme}">
      <span class="ja">${esc(t.ja)}</span><span class="es">${esc(t.es)}</span>
      <span class="stat"><span><b>${convs.length}</b> 回</span><span>${last ? "最終 " + fmtDate(new Date(last)) : "未練習"}</span></span>
    </button>`;
  }).join("");
}

function renderList() {
  $("recordList").hidden = !selectedTheme;
  if (!selectedTheme) return;
  const t = themeById(selectedTheme);
  $("recordTitle").textContent = t.ja;
  const convs = state.conversations.filter((c) => c.themeId === selectedTheme);
  $("convs").innerHTML = convs.length
    ? convs.map((c) => `<li><button data-id="${esc(c.id)}"><span>${esc(c.title || "（無題）")}</span><span class="meta">${fmtDateTime(c.updatedAt)} · ${esc(convLabel(c))} · 発言${userTurns(c)}回</span></button></li>`).join("")
    : '<li class="empty">まだ会話がありません。「このテーマで話す」から始めましょう。</li>';
}

function renderView() {
  const c = state.conversations.find((x) => x.id === viewingId);
  $("recordView").hidden = !c;
  if (!c) return;
  $("viewTitle").textContent = c.title || "（無題）";
  $("viewMeta").textContent = `${convLabel(c)} · ${fmtDateTime(c.createdAt)} 〜 ${fmtDateTime(c.updatedAt)}`;
  $("viewLog").innerHTML = c.messages.map(messageHTML).join("");
  $("viewDelete").textContent = confirmDelete ? "本当に削除する" : "削除";
}

export function renderRecords() { renderGrid(); renderList(); renderView(); }

function renderNotes() {
  const used = THEMES.filter((t) => state.notes.some((n) => n.themeId === t.id));
  const f = $("noteFilter");
  const cur = f.value;
  f.innerHTML = `<option value="">すべてのテーマ</option>` + used.map((t) => `<option value="${t.id}">${esc(t.ja)}</option>`).join("");
  f.value = used.some((t) => t.id === cur) ? cur : "";
  const list = state.notes.filter((n) => !f.value || n.themeId === f.value);
  $("noteList").innerHTML = list.length
    ? list.map((n) => `<li><div>${esc(n.text)}<br><small>${esc(n.date)}${n.themeId ? " · " + esc(themeById(n.themeId).ja) : ""}</small></div><button class="linkbtn" data-id="${esc(n.id)}">覚えた</button></li>`).join("")
    : '<li class="empty">AI会話で直された表現がここにたまります。</li>';
}

export function initRecords() {
  $("themeGrid").onclick = (e) => {
    const b = e.target.closest(".tcard"); if (!b) return;
    selectedTheme = b.dataset.id; viewingId = null; confirmDelete = false;
    renderRecords();
    $("recordList").scrollIntoView({ behavior: "smooth", block: "start" });
  };
  $("convs").onclick = (e) => {
    const b = e.target.closest("button"); if (!b) return;
    viewingId = b.dataset.id; confirmDelete = false; renderView();
    $("recordView").scrollIntoView({ behavior: "smooth", block: "start" });
  };
  $("recordNew").onclick = () => startWithTheme(selectedTheme);
  $("viewContinue").onclick = () => continueConversation(viewingId);
  $("viewDelete").onclick = () => {
    if (!confirmDelete) { confirmDelete = true; renderView(); return; }
    deleteConversation(viewingId); viewingId = null; confirmDelete = false; renderRecords();
  };
  $("noteFilter").onchange = renderNotes;
  $("noteList").onclick = (e) => {
    const id = e.target.dataset?.id; if (!id) return;
    state.notes = state.notes.filter((n) => n.id !== id); save(); renderNotes();
  };
}

export { renderNotes };
