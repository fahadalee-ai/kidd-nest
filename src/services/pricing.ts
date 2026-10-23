import type { BookingDraft, Provider } from "@/data/types";
import { hoursBetween } from "@/lib/dates";

export const ADDONS: { id: string; en: string; es: string; price: number }[] = [
  { id: "meals", en: "Meals", es: "Comidas", price: 12 },
  { id: "transport", en: "Transportation", es: "Transporte", price: 8 },
  { id: "homework", en: "Homework help", es: "Ayuda con tareas", price: 15 },
  { id: "extra", en: "Extra child", es: "Niño adicional", price: 10 },
  { id: "overnight", en: "Overnight", es: "Pernocta", price: 40 },
];

export function quote(provider: Provider, draft: BookingDraft) {
  const hours = hoursBetween(draft.start, draft.end);
  const kids = Math.max(1, draft.childIds.length);
  let base = provider.hourly * hours * kids;
  let baseLabel = `${hours} hrs × ${kids} child${kids > 1 ? "ren" : ""}`;
  if (draft.type === "enrollment") {
    base = provider.monthly || provider.weeklyCost * 4;
    baseLabel = "Monthly tuition";
  } else if (draft.type === "recurring") {
    const dayCount = Math.max(1, draft.days.length);
    base = provider.hourly * hours * kids * dayCount;
    baseLabel = `Weekly estimate · ${dayCount} days`;
  } else if (draft.type === "lastminute") {
    base = provider.hourly * hours * kids * 1.15;
    baseLabel = "Last-minute rate";
  }
  const lines: { label: string; amount: number }[] = [{ label: baseLabel, amount: round(base) }];
  if (draft.type === "enrollment") {
    lines.push({ label: "Registration fee", amount: 150 });
  }
  for (const id of draft.addons) {
    const addon = ADDONS.find((item) => item.id === id);
    if (addon) lines.push({ label: addon.en, amount: addon.price * (id === "extra" ? 1 : kids) });
  }
  const subtotal = lines.reduce((sum, line) => sum + line.amount, 0);
  let discount = 0;
  if (draft.promo.trim().toUpperCase() === "WELCOME10") {
    discount = round(subtotal * 0.1);
    lines.push({ label: "WELCOME10", amount: -discount });
  }
  const fee = round((subtotal - discount) * 0.045);
  const tax = round((subtotal - discount + fee) * 0.0825);
  lines.push({ label: "KiddoNest service fee", amount: fee });
  lines.push({ label: "Tax", amount: tax });
  const total = round(lines.reduce((sum, line) => sum + line.amount, 0));
  return { lines, total, hold: draft.type !== "enrollment" };
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}

export function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return aStart < bEnd && bStart < aEnd;
}
