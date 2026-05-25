export const HEBREW_DAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
export const HEBREW_MONTHS = [
  "ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"
];

export function formatHebrewDate(d: Date) {
  return `יום ${HEBREW_DAYS[d.getDay()]}, ${d.getDate()} ב${HEBREW_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatTime(d: Date) {
  return d.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}
export function formatHHMM(d: Date) {
  return d.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}

export function avatarColorFor(name: string) {
  const c = name.trim()[0] ?? "";
  if (!c) return "#64748B";
  // א-ד / ה-י / כ-מ / נ-ס / ע-ת
  const code = c.charCodeAt(0);
  if (code >= 0x05D0 && code <= 0x05D3) return "#2563EB";
  if (code >= 0x05D4 && code <= 0x05D9) return "#7C3AED";
  if (code >= 0x05DB && code <= 0x05DE) return "#DB2777";
  if (code >= 0x05E0 && code <= 0x05E1) return "#059669";
  return "#D97706";
}

export function roleColor(role: string | undefined | null) {
  switch (role) {
    case "super_admin": return "#A855F7";
    case "admin": return "#F59E0B";
    case "manager": return "#2563EB";
    case "employee": return "#10B981";
    default: return "#64748B";
  }
}

export function roleLabel(role: string | undefined | null) {
  switch (role) {
    case "super_admin": return "סופר אדמין";
    case "admin": return "מנהל חברה";
    case "manager": return "ראש צוות";
    case "employee": return "עובד";
    default: return "—";
  }
}

export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
