import { defineConfig } from "vite";

// 公開版だけに入れる CSP。読み込めるのは自分のファイル・Google Fonts・Gemini API だけにする
// （開発中は Vite のホットリロードと衝突するので入れない）
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src https://fonts.gstatic.com",
  "img-src 'self' data:",
  "connect-src 'self' https://generativelanguage.googleapis.com https://fonts.googleapis.com https://fonts.gstatic.com",
  "manifest-src 'self'",
  "worker-src 'self'",
  "base-uri 'self'",
  "form-action 'none'",
  "object-src 'none'",
].join("; ");

const csp = () => ({
  name: "csp",
  apply: "build",
  transformIndexHtml: () => [{ tag: "meta", attrs: { "http-equiv": "Content-Security-Policy", content: CSP }, injectTo: "head-prepend" }],
});

// GitHub Pages は https://<ユーザー名>.github.io/aprender-espanol/ で配信されるので、本番だけパスをずらす
export default defineConfig(({ command, isPreview }) => ({
  base: command === "build" || isPreview ? "/aprender-espanol/" : "/",
  plugins: [csp()],
}));
