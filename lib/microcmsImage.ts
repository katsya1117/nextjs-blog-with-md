export type MicroCmsImageOptions = {
  width?: number;
  height?: number;
  quality?: number;
  fit?: "clip" | "crop" | "fill" | "scale" | "thumb";
};

/**
 * microCMS（Imgix）向けにリサイズ・圧縮パラメータ付きのURLを生成する。
 * 元画像が大きい場合でも小さく取得して初期表示を速くするのが目的。
 */
export function buildMicroCmsImageUrl(
  src: string,
  { width, height, quality = 80, fit }: MicroCmsImageOptions = {}
) {
  if (!src) return src;

  try {
    const url = new URL(src);
    if (width) url.searchParams.set("w", String(width));
    if (height) url.searchParams.set("h", String(height));
    if (quality) url.searchParams.set("q", String(quality));
    url.searchParams.set("auto", "format,compress");
    if (fit) url.searchParams.set("fit", fit);
    return url.toString();
  } catch {
    // 万一不正なURLでも元を返して Image コンポーネントが落ちないようにする
    return src;
  }
}
