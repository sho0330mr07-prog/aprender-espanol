// 学習計画タブ：試験の選択、日程の自動反映、週ごとのタスク
import { state, save } from "./store.js";
import { LEVELS, NISEN_LEVELS, DELE_SESSIONS, DELE_REGISTRATION_OPENS, PHASES, TASKS } from "./data.js";
import { $, esc, DAY, today, parseDate, fmtDate, isoDate } from "./util.js";

let weekOffset = 0;

function examDate() {
  if (state.exam === "DELE") return state.session ? parseDate(state.session) : null;
  return state.customDate ? parseDate(state.customDate) : null;
}

function renderExam() {
  $("exam").value = state.exam;
  const levels = state.exam === "NISEN" ? NISEN_LEVELS : LEVELS;
  if (!levels.includes(state.level)) state.level = state.exam === "NISEN" ? "3級" : "B2";
  $("level").innerHTML = (state.exam === "SIELE" ? ["総合（A1〜C1判定）"] : levels).map((l) => `<option>${l}</option>`).join("");
  if (state.exam !== "SIELE") $("level").value = state.level;

  const isDele = state.exam === "DELE";
  $("sessWrap").hidden = !isDele;
  $("customWrap").hidden = isDele;
  const t = today();

  if (isDele) {
    const list = DELE_SESSIONS.filter((s) => s.levels.includes(state.level) && parseDate(s.date) >= t);
    if (!list.find((s) => s.date === state.session)) state.session = list.at(-1)?.date || "";
    $("session").innerHTML = list.map((s) => `<option value="${s.date}">${fmtDate(parseDate(s.date))}（申込締切 ${fmtDate(parseDate(s.deadline))}）</option>`).join("") || "<option>このレベルの日程なし</option>";
    $("session").value = state.session;
  } else {
    $("customDate").value = state.customDate || "";
  }

  const ed = examDate();
  $("days").textContent = ed ? Math.max(0, Math.round((ed - t) / DAY)) : "—";
  const examName = { DELE: "DELE", SIELE: "SIELE", NISEN: "西検" }[state.exam];
  $("heroSub").textContent = `${examName} ${state.exam === "SIELE" ? "" : state.level} 合格プラン`;

  const miles = [];
  if (isDele && ed) {
    const s = DELE_SESSIONS.find((x) => x.date === state.session);
    if (parseDate(DELE_REGISTRATION_OPENS) >= t) miles.push([DELE_REGISTRATION_OPENS, "申込受付開始", false]);
    miles.push([s.deadline, "申込締切", true]);
    miles.push([s.date, "筆記試験（口頭は前後の日程の場合あり）", true]);
    const r = new Date(ed); r.setMonth(r.getMonth() + 3);
    miles.push([isoDate(r), "結果発表の目安（約3か月後）", false]);
  } else if (ed) {
    miles.push([isoDate(ed), "試験日", true]);
  }
  $("miles").innerHTML = miles.map(([d, tx, hot]) => `<div class="mile${hot ? " hot" : ""}"><div class="d">${fmtDate(parseDate(d))}</div><div class="t">${tx}</div></div>`).join("")
    || '<p class="note">試験日を入力すると計画が作られます。</p>';
  $("srcNote").textContent = isDele
    ? "日程はセルバンテス文化センターが公表した2027年の全世界共通日程。東京会場での実施と申込方法は公式サイトで確認してください。"
    : state.exam === "SIELE" ? "SIELEは会場・オンラインで随時受験できます。受験したい日を入力してください。"
    : "西検の日程は日本スペイン協会の発表に合わせて入力してください。";
}

function buildPlan() {
  const ed = examDate();
  if (!ed) return null;
  const start = today();
  const weeks = Math.max(1, Math.ceil((ed - start) / DAY / 7));
  let acc = 0;
  const phases = PHASES.map((p, i) => {
    const n = i === PHASES.length - 1 ? weeks - acc : Math.max(1, Math.round(weeks * p.ratio));
    const o = { ...p, from: acc, n }; acc += n; return o;
  }).filter((p) => p.n > 0);
  return { start, weeks, phases };
}

function renderPlan() {
  const p = buildPlan();
  if (!p) {
    $("phases").innerHTML = ""; $("phaseDesc").textContent = "";
    $("tasks").innerHTML = '<li class="empty">試験日を選ぶと週ごとのタスクが表示されます。</li>';
    $("weekTitle").textContent = "—"; $("weekRange").textContent = "";
    return;
  }
  weekOffset = Math.max(0, Math.min(p.weeks - 1, weekOffset));
  const cur = p.phases.find((x) => weekOffset >= x.from && weekOffset < x.from + x.n) || p.phases.at(-1);
  $("phases").innerHTML = p.phases.map((x) => `<div style="flex:${x.n}" class="${x === cur ? "now" : ""}" title="${x.name}（${x.n}週）">${x.name}</div>`).join("");
  $("phaseDesc").textContent = `全${p.weeks}週 · いまは「${cur.name}」：${cur.desc}`;

  const ws = new Date(p.start.getTime() + weekOffset * 7 * DAY);
  const we = new Date(ws.getTime() + 6 * DAY);
  $("weekTitle").textContent = weekOffset === 0 ? "今週" : `第${weekOffset + 1}週`;
  $("weekRange").textContent = `${fmtDate(ws)} – ${fmtDate(we)}`;

  const done = state.done["w" + weekOffset] || [];
  const list = TASKS[cur.name];
  $("tasks").innerHTML = list.map((t, i) => `<li><label class="${done.includes(i) ? "done" : ""}"><input type="checkbox" data-i="${i}" ${done.includes(i) ? "checked" : ""}><span class="tx">${esc(t[0])}</span><span class="sk">${t[1]}</span></label></li>`).join("");
  $("weekBar").style.width = (done.length / list.length) * 100 + "%";
  $("prevW").disabled = weekOffset === 0;
  $("nextW").disabled = weekOffset >= p.weeks - 1;
}

export function renderPlanTab() { renderExam(); renderPlan(); }

export function initPlan() {
  $("tasks").addEventListener("change", (e) => {
    const i = +e.target.dataset.i; const k = "w" + weekOffset;
    const set = new Set(state.done[k] || []);
    e.target.checked ? set.add(i) : set.delete(i);
    state.done[k] = [...set]; save(); renderPlan();
  });
  $("prevW").onclick = () => { weekOffset--; renderPlan(); };
  $("nextW").onclick = () => { weekOffset++; renderPlan(); };
  $("exam").onchange = (e) => { state.exam = e.target.value; weekOffset = 0; save(); renderPlanTab(); };
  $("level").onchange = (e) => { state.level = e.target.value; save(); renderPlanTab(); };
  $("session").onchange = (e) => { state.session = e.target.value; save(); renderPlanTab(); };
  $("customDate").onchange = (e) => { state.customDate = e.target.value; save(); renderPlanTab(); };
  renderPlanTab();
}
