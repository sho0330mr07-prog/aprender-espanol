import { defineConfig } from "vite";

// GitHub Pages は https://<ユーザー名>.github.io/aprender-espanol/ で配信されるので、本番だけパスをずらす
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/aprender-espanol/" : "/",
}));
