import type { Lang } from "@/data/types";

export function iso(offset = 0) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseIso(value: string) {
  return new Date(`${value}T12:00:00`);
}

export function formatLong(value: string, lang: Lang = "en") {
  return parseIso(value).toLocaleDateString(lang === "es" ? "es-US" : "en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatMonthDay(value: string, lang: Lang = "en") {
  return parseIso(value).toLocaleDateString(lang === "es" ? "es-US" : "en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function weekday(value: string) {
  return parseIso(value).toLocaleDateString("en-US", { weekday: "short" });
}

export function ageParts(dob: string) {
  const born = parseIso(dob);
  const now = new Date();
  let months = (now.getFullYear() - born.getFullYear()) * 12 + (now.getMonth() - born.getMonth());
  if (now.getDate() < born.getDate()) months -= 1;
  months = Math.max(0, months);
  const years = Math.floor(months / 12);
  return { months, years };
}

export function ageLabel(dob: string, lang: Lang = "en") {
  const { months, years } = ageParts(dob);
  if (months < 24) return lang === "es" ? `${months} meses` : `${months} months`;
  return lang === "es" ? `${years} años` : `${years} years`;
}

export function isAdult(dob: string) {
  return ageParts(dob).years >= 18;
}

export function clockLabel(hhmm: string) {
  const [hRaw, mRaw] = hhmm.split(":");
  let h = Number(hRaw);
  const m = mRaw ?? "00";
  const suffix = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${suffix}`;
}

export function greeting(lang: Lang) {
  const h = new Date().getHours();
  if (lang === "es") {
    if (h < 12) return "Buenos días";
    if (h < 17) return "Buenas tardes";
    return "Buenas noches";
  }
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function hoursBetween(start: string, end: string) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const mins = eh * 60 + em - (sh * 60 + sm);
  return Math.max(1, Math.round((mins / 60) * 10) / 10);
}

export function groupLabel(value: string, lang: Lang) {
  const today = iso(0);
  const yesterday = iso(-1);
  if (value === today) return lang === "es" ? "Hoy" : "Today";
  if (value === yesterday) return lang === "es" ? "Ayer" : "Yesterday";
  return formatLong(value, lang);
}
