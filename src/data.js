// 試験・テーマなどの固定データ

export const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
export const NISEN_LEVELS = ["6級", "5級", "4級", "3級", "2級", "1級"];

// DELE 2027（Instituto Cervantes 公表の全世界共通日程。日付は筆記試験日）
// 毎年秋に翌年分が発表されるので、ここを更新する。
export const DELE_SESSIONS = [
  { date: "2027-02-12", deadline: "2027-01-07", levels: ["A2"] },
  { date: "2027-04-02", deadline: "2027-02-10", levels: ["A1", "A2", "B1", "B2", "C1"] },
  { date: "2027-05-22", deadline: "2027-04-07", levels: LEVELS },
  { date: "2027-07-09", deadline: "2027-05-12", levels: LEVELS },
  { date: "2027-09-10", deadline: "2027-07-14", levels: ["A2"] },
  { date: "2027-10-15", deadline: "2027-09-01", levels: ["A2", "B1", "B2"] },
  { date: "2027-11-13", deadline: "2027-09-29", levels: LEVELS },
];
export const DELE_REGISTRATION_OPENS = "2026-11-18";

export const PHASES = [
  { name: "基礎固め", ratio: 0.4, desc: "文法の総点検（接続法・時制の一致・関係詞）と語彙の土台づくり。毎日の会話で口を慣らす時期。" },
  { name: "4技能強化", ratio: 0.3, desc: "DELE形式の課題で読解・聴解・作文・口頭を一つずつ鍛える。弱点の技能に時間を多めに配分。" },
  { name: "模試", ratio: 0.2, desc: "本番と同じ時間配分で通し模試。結果から弱点を洗い出し、間違いノートで復習。" },
  { name: "直前", ratio: 0.1, desc: "新しいことは増やさず、間違いノートと口頭試験の型を仕上げる。体調と当日の段取りを整える。" },
];

export const TASKS = {
  "基礎固め": [
    ["接続法現在の用法を1テーマ学習（願望・感情・疑い など）", "文法"],
    ["頻出単語を毎日20語、間隔反復で復習", "語彙"],
    ["AI会話で試験テーマを1つ選び 15分×3回", "会話"],
    ["ニュースやポッドキャストを10分×5日、聞いた内容を3文で要約", "聴解"],
    ["新聞・ブログ記事を1本精読し、知らない表現を間違いノートへ", "読解"],
  ],
  "4技能強化": [
    ["読解 Tarea 1〜2 を1セット（時間を計る）", "読解"],
    ["聴解 Tarea 1〜3 を1セット、スクリプトで答え合わせ", "聴解"],
    ["作文 Tarea 1（150〜180語の手紙・メール）を書いてAIに添削依頼", "作文"],
    ["口頭試験 Tarea 1 をAI会話の模擬モードで練習", "口頭"],
    ["記録タブで会話の少ないテーマを1つ選んで話す", "会話"],
  ],
  "模試": [
    ["読解・聴解の通し模試（本番の時間で）", "読解"],
    ["作文 Tarea 1・2 を時間内に書く", "作文"],
    ["口頭 Tarea 1〜3 を準備20分＋本番20分で通す", "口頭"],
    ["模試の弱点トップ3を書き出し、翌週の重点にする", "復習"],
  ],
  "直前": [
    ["間違いノートを全部見直す", "復習"],
    ["口頭試験の型（導入・意見・反論への返し）を声に出して確認", "口頭"],
    ["軽めの聴解を毎日10分（耳を慣らすだけ）", "聴解"],
    ["受験票・会場・持ち物・当日の移動を確認", "準備"],
  ],
};

// DELEで出題される主なテーマ（Plan Curricular del Instituto Cervantes の分類をもとに整理）
export const THEMES = [
  { id: "free", ja: "フリートーク", es: "Conversación libre", hint: "" },
  { id: "relaciones", ja: "人と人間関係", es: "Individuo y relaciones personales", hint: "familia, amistad, carácter, convivencia, conflictos" },
  { id: "educacion", ja: "教育と学び", es: "Educación y formación", hint: "sistema educativo, universidad, aprender idiomas, formación continua" },
  { id: "trabajo", ja: "仕事と働き方", es: "Trabajo y vida laboral", hint: "teletrabajo, conciliación, desempleo, entrevistas, emprendimiento" },
  { id: "ocio", ja: "余暇・スポーツ", es: "Ocio, deporte y tiempo libre", hint: "aficiones, fútbol, espectáculos, fines de semana" },
  { id: "medios", ja: "メディアとSNS", es: "Medios de comunicación y redes sociales", hint: "noticias falsas, influencers, privacidad, prensa" },
  { id: "vivienda", ja: "住まいと都市", es: "Vivienda y ciudad", hint: "alquiler, vida urbana vs rural, transporte público, barrio" },
  { id: "consumo", ja: "買い物と消費", es: "Compras y consumo", hint: "consumo responsable, compras online, publicidad, reclamaciones" },
  { id: "alimentacion", ja: "食と食文化", es: "Alimentación y gastronomía", hint: "dieta, comida rápida, gastronomía española, desperdicio de alimentos" },
  { id: "salud", ja: "健康と生活習慣", es: "Salud y bienestar", hint: "hábitos saludables, estrés, sistema sanitario, deporte" },
  { id: "viajes", ja: "旅行と観光", es: "Viajes y turismo", hint: "turismo masivo, experiencias de viaje, alojamiento, transporte" },
  { id: "economia", ja: "経済と社会", es: "Economía y sociedad", hint: "desigualdad, envejecimiento, consumo, empleo juvenil" },
  { id: "tecnologia", ja: "科学とテクノロジー", es: "Ciencia y tecnología", hint: "inteligencia artificial, móviles, inventos, brecha digital" },
  { id: "medioambiente", ja: "環境と自然", es: "Medio ambiente y naturaleza", hint: "cambio climático, reciclaje, energías renovables, animales" },
  { id: "cultura", ja: "芸術と文化", es: "Arte, cultura y tradiciones", hint: "cine, literatura, fiestas populares, patrimonio" },
];

export const TAREAS = [
  { id: "t1", name: "Tarea 1：提案への意見", prompt: "DELE B2 Prueba oral Tarea 1: presenta un problema con 4–5 propuestas de solución; el candidato habla 3–5 minutos valorando las propuestas y luego conversáis 2–3 minutos." },
  { id: "t2", name: "Tarea 2：写真の状況", prompt: "DELE B2 Prueba oral Tarea 2: describe con palabras una fotografía de una situación cotidiana; el candidato imagina qué pasa, quiénes son y qué pasará (2–3 min) y luego conversáis sobre experiencias propias (3–4 min)." },
  { id: "t3", name: "Tarea 3：アンケート結果", prompt: "DELE B2 Prueba oral Tarea 3: presenta los resultados de una encuesta inventada (porcentajes); el candidato compara con su opinión y su país y luego conversáis (3–4 min)." },
];

export const MODES = [
  { id: "free", name: "フリートーク" },
  { id: "theme", name: "テーマ別トーク" },
  { id: "oral", name: "DELE口頭試験（模擬）" },
];

export const themeById = (id) => THEMES.find((t) => t.id === id) || THEMES[0];
