// カテゴリ文字列から余計な空白や先頭ハッシュを取り除く
export function normalizeCategory(raw?: string | null): string {
  if (!raw) return "";
  return raw.trim().replace(/^#/, "");
}

// 画面表示用に先頭へハッシュを付け直す
export function formatCategory(raw?: string | null): string {
  const normalized = normalizeCategory(raw);
  return normalized ? `#${normalized}` : "";
}

// ルーティング用に URL セーフなスラッグへ変換する
export function categoryToSlug(raw?: string | null): string {
  const normalized = normalizeCategory(raw);
  return normalized ? encodeURIComponent(normalized) : "";
}

// スラッグから元のカテゴリ文字列へ戻す（復号できない場合はそのまま返す）
export function slugToCategory(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}
