import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      colors: {
        background: "#2B3742", // 背景カラーを1色だけ定義
      },
      backgroundImage: {
        // 背景画像
        "site-texture": "url('/images/bg-noise.jpg')",
      },
    },
  },
  plugins: [],
};
export default config;