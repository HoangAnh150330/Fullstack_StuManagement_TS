export const API_ORIGIN = ( "http://localhost:3000")
  .replace(/\/$/, "");

export function absolutize(u?: string) {
  if (!u) return u;
  // đã là http/https thì giữ nguyên
  if (/^https?:\/\//i.test(u)) return u;
  // nếu trả về "/uploads/..." hoặc "uploads/..."
  return `${API_ORIGIN}${u.startsWith("/") ? u : `/${u}`}`;
}
