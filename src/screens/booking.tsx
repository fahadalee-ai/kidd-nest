import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useNav } from "@/app/nav";
import { AppButton, AppInput, BackButton, CalendarMonth, CheckRow, ChipGroup, EmptyState, SegmentedControl, StatusBadge, Stepper, SuccessMark, SwipeRow, ToggleRow } from "@/components/ios";
import { photoSrc } from "@/data/photos";
import { brand, brandAddress } from "@/config/brand";
import { carePlace } from "@/data/center";
import { providerById } from "@/data/providers";
import type { Booking, BookingDraft } from "@/data/types";
import { clockLabel, formatLong, hoursBetween, iso } from "@/lib/dates";
import { useKiddo, useTx } from "@/lib/store";
import { downloadIcs, shareText } from "@/services/files";
import { ADDONS, overlaps, quote } from "@/services/pricing";
import { uid, usd } from "@/lib/validate";

const HOURS = ["07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21"];
const MINUTES = ["00", "15", "30", "45"];

function TimePick({ label, value, onChange }: { label: string; value: string; onChange: (next: string) => void }) {
  const hour = value.slice(0, 2);
  const minute = value.slice(3, 5);
  return (
    <div>
      <p className="mb-1.5 text-[13px] font-semibold uppercase tracking-wide text-[#8EE0D6]">{label}</p>
      <div className="flex items-center rounded-2xl bg-[#E6F7F4] px-1">
        <select aria-label={`${label} hour`} value={hour} onChange={(event) => onChange(`${event.target.value}:${minute}`)} className="h-12 min-w-0 flex-1 appearance-none bg-transparent text-center text-[20px] font-bold text-[#1F2A44] outline-none">
          {HOURS.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
        <span className="text-[20px] font-bold text-[#1F2A44]">:</span>
        <select aria-label={`${label} minute`} value={minute} onChange={(event) => onChange(`${hour}:${event.target.value}`)} className="h-12 min-w-0 flex-1 appearance-none bg-transparent text-center text-[20px] font-bold text-[#1F2A44] outline-none">
          {MINUTES.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function centerDraft(family: { selectedChild?: string; children: { id: string }[]; pickups: { id: string }[] } | null, type: BookingDraft["type"] = "once"): BookingDraft {
  const selected = family?.selectedChild;
  const childIds = selected && selected !== "all" ? [selected] : family?.children[0] ? [family.children[0].id] : [];
  return {
    providerId: "little-nest",
    type,
    childIds,
    date: iso(1),
    endDate: "",
    noEnd: false,
    start: "09:00",
    end: "15:00",
    days: ["Mon", "Wed", "Fri"],
    frequency: "Weekly",
    sessions: 1,
    addons: [],
    notes: "",
    pickupId: family?.pickups[0]?.id ?? "",
    promo: "",
  };
}

export function BookingsScreen() {
  const nav = useNav();
  const kiddo = useKiddo();
  const { tx, lang } = useTx();
  const [tab, setTab] = useState<"Upcoming" | "Past" | "Cancelled">("Upcoming");
  const family = kiddo.family;
  if (!family) return null;
  const list = family.bookings.filter((booking) => {
    if (tab === "Cancelled") return booking.status === "Cancelled";
    if (tab === "Past") return booking.status === "Completed";
    return !["Cancelled", "Completed"].includes(booking.status);
  });
  return (
    <div className="flex h-full flex-col px-5 pt-3">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-[34px] font-bold">{tx("Schedule", "Agenda")}</h1>
        <button
          type="button"
          aria-label={tx("Add", "Agregar")}
          className="grid h-12 w-12 place-items-center rounded-full bg-coral text-[28px] font-semibold text-white"
          onClick={async () => {
            const choice = await nav.actionSheet({
              title: tx("What do you need?", "¿Qué necesitas?"),
              actions: [
                { id: "book", label: tx("Book drop-in care", "Reservar cuidado extra") },
                { id: "tour", label: tx("Schedule a tour", "Agendar una visita") },
                { id: "enroll", label: tx("Enroll a child", "Inscribir a un niño") },
              ],
            });
            if (choice === "tour") nav.push({ name: "tour", id: "center" });
            else if (choice) {
              kiddo.setDraft(centerDraft(family, choice === "enroll" ? "enrollment" : "once"));
              nav.push({ name: "book", step: 0 });
            }
          }}
        >
          +
        </button>
      </div>
      <SegmentedControl
        ariaLabel="Bookings"
        value={tab}
        onChange={setTab}
        options={[
          { id: "Upcoming", label: tx("Upcoming", "Próximas") },
          { id: "Past", label: tx("Past", "Pasadas") },
          { id: "Cancelled", label: tx("Cancelled", "Canceladas") },
        ]}
      />
      <div className="mt-3 min-h-0 flex-1 space-y-3 overflow-y-auto pb-6">
        {list.length === 0 ? (
          <EmptyState image="emptyBookings" title={tx("No bookings yet", "Aún no hay reservas")} body={tx("When you book care, it will show up here.", "Cuando reserves, aparecerá aquí.")} action={tx("See programs", "Ver programas")} onAction={() => nav.setTab("programs")} />
        ) : null}
        {list.map((booking) => {
          const place = carePlace(booking.providerId);
          const child = family.children.filter((item) => booking.childIds.includes(item.id)).map((item) => item.firstName).join(", ");
          return (
            <SwipeRow
              key={booking.id}
              actions={[
                { label: tx("Move", "Mover"), tone: "teal", onPress: () => nav.push({ name: "reschedule", id: booking.id }) },
                { label: tx("Cancel", "Cancelar"), tone: "danger", onPress: () => nav.push({ name: "cancel", id: booking.id }) },
              ]}
            >
              <button type="button" className="flex w-full gap-3 p-3 text-left" onClick={() => nav.push({ name: "booking", id: booking.id })}>
                <img src={photoSrc(place.photo)} alt="" className="h-16 w-16 rounded-xl object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{place.program}</span>
                  <span className="block text-[13px] text-muted-foreground">{formatLong(booking.date, lang)} · {clockLabel(booking.start)}</span>
                  <span className="block text-[13px] text-muted-foreground">{child}</span>
                  <StatusBadge status={booking.status} />
                </span>
              </button>
            </SwipeRow>
          );
        })}
      </div>
    </div>
  );
}

export function BookFlow() {
  const nav = useNav();
  const kiddo = useKiddo();
  const { tx, lang } = useTx();
  const step = nav.route.name === "book" ? nav.route.step : 0;
  const draft = kiddo.draft;
  const family = kiddo.family;
  useEffect(() => {
    if (!draft && family && nav.route.name === "book") kiddo.setDraft(centerDraft(family));
  }, [draft, family, kiddo, nav.route.name]);
  if (!draft || !family) return null;
  const provider = providerById(draft.providerId);
  const set = (patch: Partial<BookingDraft>) => kiddo.patchDraft(patch);
  const go = (next: number) => nav.push({ name: "book", step: next });
  const priced = quote(provider, draft);
  const conflict = family.bookings.some((booking) => {
    if (["Cancelled", "Completed"].includes(booking.status)) return false;
    if (booking.date !== draft.date) return false;
    if (!booking.childIds.some((id) => draft.childIds.includes(id))) return false;
    return overlaps(booking.start, booking.end, draft.start, draft.end);
  });

  return (
    <div className="flex h-full flex-col">
      <header className="px-4 pb-4 pt-3">
        <div className="grid grid-cols-[2.75rem_1fr_2.75rem] items-center">
          <button type="button" aria-label={tx("Back", "Atrás")} className="grid h-11 w-11 place-items-center rounded-full bg-[#E6F7F4] text-[#1F2A44]" onClick={() => nav.pop()}>
            <ChevronLeft size={22} strokeWidth={2.5} />
          </button>
          <h1 className="truncate px-2 text-center text-[17px] font-bold leading-tight text-[#F7F4EE]">{tx("Book care", "Reservar cuidado")}</h1>
          <p className="text-right text-[13px] font-bold text-[#8EE0D6]">{step + 1}/7</p>
        </div>
        <div className="mt-3 flex gap-1.5" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={7} aria-label={tx(`Step ${step + 1} of 7`, `Paso ${step + 1} de 7`)}>
          {Array.from({ length: 7 }, (_, index) => (
            <span key={index} className={`h-1.5 flex-1 rounded-full ${index <= step ? "bg-[#259f94]" : "bg-[#3A6294]"}`} />
          ))}
        </div>
      </header>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-3">
        {step === 0 ? (
          <>
            <h2 className="text-[28px] font-bold">{tx("Choose a booking type", "Elige el tipo de reserva")}</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                ["once", tx("One-time", "Una vez")],
                ["recurring", tx("Recurring", "Recurrente")],
                ["lastminute", tx("Last-minute", "De último momento")],
                ["enrollment", tx("Enrollment", "Inscripción")],
              ].map(([id, label]) => (
                <button key={id} type="button" className={`min-h-[72px] rounded-2xl p-3 text-left font-semibold ${draft.type === id ? "bg-primary text-white" : "bg-card shadow-card"}`} onClick={() => set({ type: id as BookingDraft["type"] })}>
                  {label}
                </button>
              ))}
            </div>
            {draft.type === "enrollment" ? <p className="text-[14px] text-muted-foreground">{tx("You can join the waitlist if the room is full.", "Puedes entrar a la lista de espera si el grupo está lleno.")}</p> : null}
            {draft.type === "lastminute" ? <p className="rounded-lg bg-[#E6F7F4] p-3 text-[15px] text-[#1F2A44]">{brand.name} {tx("can arrive in about 75 minutes.", "puede llegar en unos 75 minutos.")}</p> : null}
          </>
        ) : null}
        {step === 1 ? (
          <>
            <h2 className="text-[28px] font-bold">{tx("Who is going?", "¿Quién va?")}</h2>
            {family.children.map((child) => {
              const outside = !provider.ageGroups.includes(child.grade);
              const allergy = child.allergies.length > 0 && !provider.nutFree && child.allergies.includes("Peanuts");
              const on = draft.childIds.includes(child.id);
              return (
                <button key={child.id} type="button" className={`flex w-full items-center gap-3 rounded-lg p-3 text-left ${on ? "bg-[#E6F7F4] text-[#1F2A44] ring-2 ring-[#259f94]" : "bg-card text-[#F7F4EE] shadow-card"}`} onClick={() => set({ childIds: on ? draft.childIds.filter((id) => id !== child.id) : [...draft.childIds, child.id] })}>
                  <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-[#14263e]">
                    <img src={photoSrc(child.avatar)} alt="" className="h-12 w-12 object-cover" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[17px] font-semibold">{child.firstName}</span>
                    <span className={`block text-[14px] ${on ? "text-[#3D4A63]" : "text-[#D5E2EA]"}`}>{child.grade}</span>
                    {outside ? <span className={`block text-[13px] ${on ? "text-[#8A4B08]" : "text-warning"}`}>{tx("Age group may be outside this provider’s range.", "La edad puede estar fuera del rango.")}</span> : null}
                    {allergy ? <span className={`block text-[13px] ${on ? "text-[#8E2430]" : "text-destructive"}`}>{tx("Peanut allergy needs a nut-free kitchen. Confirm with the provider.", "La alergia al cacahuate necesita una cocina sin nueces.")}</span> : null}
                  </span>
                </button>
              );
            })}
          </>
        ) : null}
        {step === 2 ? (
          <>
            <h2 className="text-[28px] font-bold">{tx("Date and time", "Fecha y hora")}</h2>
            {draft.type !== "recurring" ? <CalendarMonth value={draft.date} disablePast onChange={(date) => set({ date })} /> : null}
            {draft.type === "recurring" ? (
              <>
                <ChipGroup multiple options={["Mon", "Tue", "Wed", "Thu", "Fri"]} value={draft.days} onChange={(days) => set({ days })} />
                <AppInput type="date" label={tx("Starts", "Empieza")} value={draft.date} onChange={(e) => set({ date: e.target.value })} />
                <ToggleRow label={tx("No end date", "Sin fecha final")} checked={draft.noEnd} onChange={(noEnd) => set({ noEnd })} />
                {!draft.noEnd ? <AppInput type="date" label={tx("Ends", "Termina")} value={draft.endDate} onChange={(e) => set({ endDate: e.target.value })} /> : null}
                <SegmentedControl ariaLabel="Frequency" value={draft.frequency} onChange={(frequency) => set({ frequency })} options={[{ id: "Weekly", label: tx("Weekly", "Semanal") }, { id: "Bi-weekly", label: tx("Bi-weekly", "Quincenal") }]} />
                <Stepper label={tx("Sessions", "Sesiones")} value={draft.sessions} min={1} max={5} onChange={(sessions) => set({ sessions })} />
              </>
            ) : null}
            <div className="grid grid-cols-2 gap-3">
              <TimePick label={tx("Start", "Inicio")} value={draft.start} onChange={(start) => set({ start })} />
              <TimePick label={tx("End", "Fin")} value={draft.end} onChange={(end) => set({ end })} />
            </div>
            <p className="text-[15px]">{hoursBetween(draft.start, draft.end)} {tx("hours", "horas")} · {formatLong(draft.date, lang)}</p>
            {draft.date === iso(0) && draft.type !== "lastminute" ? <p className="text-[13px] text-warning">{tx("Today’s standard slots are closed. Switch to last-minute if you need care now.", "Los horarios de hoy ya cerraron. Usa último momento si lo necesitas ahora.")}</p> : null}
            {conflict ? <p className="text-[13px] text-destructive">{tx("This overlaps another booking for the same child.", "Esto se cruza con otra reserva del mismo niño.")}</p> : null}
          </>
        ) : null}
        {step === 3 ? (
          <>
            <h2 className="text-[28px] font-bold">{tx("Add-ons", "Extras")}</h2>
            {ADDONS.map((addon) => {
              const on = draft.addons.includes(addon.id);
              return (
                <button key={addon.id} type="button" className="flex min-h-[52px] w-full items-center justify-between rounded-2xl bg-card px-4 shadow-card" onClick={() => set({ addons: on ? draft.addons.filter((id) => id !== addon.id) : [...draft.addons, addon.id] })}>
                  <span>{lang === "es" ? addon.es : addon.en}</span>
                  <span className="font-semibold">{on ? "✓" : `+${usd(addon.price)}`}</span>
                </button>
              );
            })}
          </>
        ) : null}
        {step === 4 ? (
          <>
            <h2 className="text-[28px] font-bold">{tx("Special instructions", "Indicaciones")}</h2>
            <AppInput multiline label={tx("Nap, allergies, routines", "Siesta, alergias, rutinas")} value={draft.notes} onChange={(e) => set({ notes: e.target.value })} />
            <AppButton variant="secondary" onClick={() => nav.toast(tx("Attachment saved", "Archivo guardado"))}>{tx("Attach a photo or document", "Adjuntar foto o documento")}</AppButton>
            <p className="text-[13px] font-medium">{tx("Pickup person", "Quién recoge")}</p>
            {family.pickups.map((person) => (
              <button key={person.id} type="button" className={`min-h-11 w-full rounded-lg px-3 text-left ${draft.pickupId === person.id ? "bg-[#E6F7F4] font-semibold text-[#1F2A44]" : "bg-card text-[#F7F4EE]"}`} onClick={() => set({ pickupId: person.id })}>
                {person.name} · {person.relationship}
              </button>
            ))}
          </>
        ) : null}
        {step === 5 ? (
          <>
            <h2 className="text-[28px] font-bold">{tx("Review", "Revisar")}</h2>
            <button type="button" className="flex w-full gap-3 rounded-2xl bg-card p-3 text-left shadow-card" onClick={() => nav.push({ name: "provider", id: provider.id })}>
              <img src={photoSrc(provider.photo)} alt="" className="h-16 w-16 rounded-xl object-cover" />
              <span><span className="block font-semibold">{provider.name}</span><span className="text-[13px] text-muted-foreground">{formatLong(draft.date, lang)} · {clockLabel(draft.start)}–{clockLabel(draft.end)}</span></span>
            </button>
            <p>{family.children.filter((child) => draft.childIds.includes(child.id)).map((child) => child.firstName).join(", ")}</p>
            {priced.lines.map((line) => (
              <div key={line.label} className="flex justify-between text-[15px]"><span>{line.label}</span><span>{usd(line.amount)}</span></div>
            ))}
            <AppInput label={tx("Promo code", "Código")} value={draft.promo} onChange={(e) => set({ promo: e.target.value })} hint="WELCOME10" />
            <p className="text-[13px] text-muted-foreground">{provider.policies[0]?.text}</p>
            <p className="text-[22px] font-bold">{usd(priced.total)}</p>
          </>
        ) : null}
        {step === 6 ? (
          <>
            <h2 className="text-[28px] font-bold">{tx("Payment", "Pago")}</h2>
            <p className="text-[15px] text-muted-foreground">{priced.hold ? tx("You will not be charged until the provider confirms.", "No se hará el cargo hasta que el proveedor confirme.") : tx("Enrollment places a registration hold today.", "La inscripción aparta el lugar hoy.")}</p>
            <PayBox draft={draft} total={priced.total} onDone={(id) => nav.replace({ name: "book-done", id })} />
          </>
        ) : null}
      </div>
      {step < 6 ? (
        <div className="px-5 py-3">
          <AppButton
            onClick={async () => {
              if (step === 1 && draft.childIds.length === 0) {
                nav.toast(tx("Choose at least one child", "Elige al menos un niño"));
                return;
              }
              if (step === 2 && conflict) {
                const ok = await nav.confirm({ title: tx("Schedule conflict", "Conflicto de horario"), message: tx("This child already has care at that time.", "Este niño ya tiene cuidado a esa hora."), confirmLabel: tx("Keep anyway", "Seguir") });
                if (!ok) return;
              }
              if (step === 2 && draft.end <= draft.start) {
                nav.toast(tx("End time must be after start.", "La hora final debe ser después del inicio."));
                return;
              }
              go(step + 1);
            }}
          >
            {tx("Continue", "Continuar")}
          </AppButton>
        </div>
      ) : null}
    </div>
  );
}

function CardField({
  label,
  value,
  onChange,
  placeholder,
  inputMode = "text",
  autoComplete = "off",
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  inputMode?: "text" | "tel";
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[15px] font-medium text-[#F7F4EE]">{label}</span>
      <input
        type="text"
        inputMode={inputMode}
        autoComplete={autoComplete}
        autoCorrect="off"
        spellCheck={false}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-[52px] w-full rounded-xl bg-[#E6F7F4] px-3.5 text-[17px] outline-none placeholder:text-[#5C6578]"
        style={{ color: "#1F2A44", caretColor: "#1F2A44", WebkitTextFillColor: "#1F2A44" }}
      />
    </label>
  );
}

function PayBox({ draft, total, onDone }: { draft: BookingDraft; total: number; onDone: (id: string) => void }) {
  const nav = useNav();
  const kiddo = useKiddo();
  const { tx } = useTx();
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  return (
    <div className="space-y-3">
      <CardField label={tx("Name on card", "Nombre en la tarjeta")} value={name} autoComplete="off" onChange={setName} />
      <CardField
        label={tx("Card number", "Número de tarjeta")}
        value={number}
        inputMode="tel"
        placeholder="1234 5678 9012 3456"
        onChange={(next) => setNumber(next.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 "))}
      />
      <div className="grid grid-cols-2 gap-3">
        <CardField
          label={tx("Expiry", "Vence")}
          value={expiry}
          inputMode="tel"
          placeholder="MM/YY"
          onChange={(next) => {
            const raw = next.replace(/\D/g, "").slice(0, 4);
            setExpiry(raw.length > 2 ? `${raw.slice(0, 2)}/${raw.slice(2)}` : raw);
          }}
        />
        <CardField label="CVC" value={cvc} inputMode="tel" placeholder="123" onChange={(next) => setCvc(next.replace(/\D/g, "").slice(0, 4))} />
      </div>
      <CheckRow checked={terms} onChange={setTerms} label={tx("I agree to the cancellation policy and terms.", "Acepto la política de cancelación y los términos.")} />
      <AppButton
        loading={loading}
        onClick={async () => {
          if (!terms) {
            nav.toast(tx("Please accept the terms", "Acepta los términos"));
            return;
          }
          setLoading(true);
          const id = uid("KN").toUpperCase();
          const booking: Booking = {
            id,
            providerId: draft.providerId,
            childIds: draft.childIds,
            type: draft.type,
            date: draft.date,
            endDate: draft.endDate,
            start: draft.start,
            end: draft.end,
            days: draft.days,
            status: draft.type === "enrollment" ? "Submitted" : "Pending",
            addons: draft.addons,
            notes: draft.notes,
            pickupId: draft.pickupId,
            total,
            promo: draft.promo,
          };
          kiddo.addBooking(booking);
          setLoading(false);
          nav.toast(tx("Request sent", "Solicitud enviada"));
          onDone(id);
        }}
      >
        {tx("Confirm Booking", "Confirmar reserva")} · {usd(total)}
      </AppButton>
    </div>
  );
}

export function BookDoneScreen() {
  const nav = useNav();
  const { family } = useKiddo();
  const { tx } = useTx();
  const id = nav.route.name === "book-done" ? nav.route.id : "";
  const booking = family?.bookings.find((item) => item.id === id);
  const provider = booking ? providerById(booking.providerId) : null;
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <SuccessMark />
      <h1 className="mt-4 text-[28px] font-bold">{tx("You’re booked", "Quedó reservado")}</h1>
      <p className="mt-2 text-muted-foreground">{tx("Booking ID", "ID de reserva")} {id}</p>
      <div className="mt-6 w-full space-y-2">
        <AppButton onClick={() => nav.setTab("home")}>{tx("Go to Home", "Ir al inicio")}</AppButton>
        <AppButton variant="secondary" onClick={() => booking && provider && downloadIcs({ title: provider.name, date: booking.date, start: booking.start, end: booking.end, location: provider.address })}>{tx("Add to Calendar", "Agregar al calendario")}</AppButton>
        <AppButton variant="secondary" onClick={() => shareText("KiddoNest", `${provider?.name ?? ""} ${id}`)}>{tx("Share", "Compartir")}</AppButton>
        <AppButton variant="secondary" onClick={() => nav.setTab("messages")}>{tx("Message Teacher", "Escribir al maestro")}</AppButton>
        <AppButton variant="tertiary" onClick={() => nav.setTab("schedule")}>{tx("View Booking", "Ver reserva")}</AppButton>
      </div>
    </div>
  );
}

export function BookingDetailScreen() {
  const nav = useNav();
  const kiddo = useKiddo();
  const family = kiddo.family;
  const { tx, lang } = useTx();
  const id = nav.route.name === "booking" ? nav.route.id : "";
  const booking = family?.bookings.find((item) => item.id === id);
  if (!booking || !family) return null;
  const provider = providerById(booking.providerId);
  const steps = ["Submitted", "Pending", "Confirmed", "In Progress", "Completed"];
  return (
    <div className="h-full overflow-y-auto px-5 py-4">
      <BackButton />
      <h1 className="text-[28px] font-bold">{carePlace(booking.providerId).program}</h1>
      <p className="text-[15px] text-muted-foreground">{brand.name}</p>
      <StatusBadge status={booking.status} />
      <div className="mt-4 flex gap-1">
        {steps.map((step) => (
          <span key={step} className={`h-1.5 flex-1 rounded-full ${steps.indexOf(step) <= steps.indexOf(booking.status) ? "bg-primary" : "bg-muted"}`} />
        ))}
      </div>
      <p className="mt-3">{formatLong(booking.date, lang)} · {clockLabel(booking.start)}–{clockLabel(booking.end)}</p>
      <p>{family.children.filter((child) => booking.childIds.includes(child.id)).map((child) => child.firstName).join(", ")}</p>
      <p className="font-semibold">{usd(booking.total)}</p>
      <p className="text-[15px] text-muted-foreground">{booking.notes}</p>
      <a className="mt-2 inline-flex min-h-11 items-center font-semibold text-[var(--teal-ink)]" href={`https://maps.apple.com/?q=${encodeURIComponent(provider.address)}`}>{tx("Directions", "Cómo llegar")}</a>
      <div className="mt-4 grid grid-cols-2 gap-2 pb-8">
        <AppButton variant="secondary" onClick={() => nav.setTab("messages")}>{tx("Message", "Mensaje")}</AppButton>
        <AppButton variant="secondary" onClick={() => nav.push({ name: "reschedule", id: booking.id })}>{tx("Reschedule", "Reprogramar")}</AppButton>
        <AppButton variant="secondary" onClick={() => nav.push({ name: "cancel", id: booking.id })}>{tx("Cancel", "Cancelar")}</AppButton>
        <AppButton variant="secondary" onClick={() => {
          kiddo.setDraft({ providerId: booking.providerId, type: booking.type === "enrollment" ? "once" : booking.type, childIds: booking.childIds, date: iso(1), endDate: "", noEnd: false, start: booking.start, end: booking.end, days: booking.days, frequency: "Weekly", sessions: 1, addons: booking.addons, notes: booking.notes, pickupId: booking.pickupId, promo: "" });
          nav.push({ name: "book", step: 0 });
        }}>{tx("Rebook", "Reservar de nuevo")}</AppButton>
        <AppButton variant="secondary" onClick={() => nav.push({ name: "review", id: booking.id })}>{tx("Leave a Review", "Dejar reseña")}</AppButton>
        <AppButton variant="secondary" onClick={() => nav.push({ name: "checkin" })}>{tx("QR / PIN", "QR / PIN")}</AppButton>
      </div>
    </div>
  );
}

export function RescheduleScreen() {
  const nav = useNav();
  const kiddo = useKiddo();
  const { tx } = useTx();
  const id = nav.route.name === "reschedule" ? nav.route.id : "";
  const booking = kiddo.family?.bookings.find((item) => item.id === id);
  const [date, setDate] = useState(booking?.date ?? iso(2));
  const [start, setStart] = useState(booking?.start ?? "09:00");
  if (!booking) return null;
  return (
    <div className="h-full overflow-y-auto px-5 py-4">
      <BackButton />
      <h1 className="text-[28px] font-bold">{tx("Reschedule", "Reprogramar")}</h1>
      <CalendarMonth value={date} disablePast onChange={setDate} />
      <AppInput label={tx("Start", "Inicio")} value={start} onChange={(e) => setStart(e.target.value)} />
      <p className="text-[14px] text-muted-foreground">{tx("Changes inside 24 hours may include a $15 fee. The provider has to approve.", "Los cambios dentro de 24 horas pueden incluir $15. El proveedor debe aprobar.")}</p>
      <AppButton onClick={() => { kiddo.updateBooking(booking.id, { date, start, status: "Pending" }); nav.toast(tx("Sent for approval", "Enviado para aprobación")); nav.pop(); }}>{tx("Request change", "Pedir cambio")}</AppButton>
    </div>
  );
}

export function CancelScreen() {
  const nav = useNav();
  const kiddo = useKiddo();
  const { tx } = useTx();
  const id = nav.route.name === "cancel" ? nav.route.id : "";
  const booking = kiddo.family?.bookings.find((item) => item.id === id);
  const [reason, setReason] = useState("Plans changed");
  if (!booking) return null;
  const refund = Math.round(booking.total * 0.5);
  return (
    <div className="h-full overflow-y-auto px-5 py-4">
      <h1 className="text-[28px] font-bold">{tx("Cancel booking", "Cancelar reserva")}</h1>
      <ChipGroup options={["Plans changed", "Child is sick", "Found other care", "Provider asked"]} value={[reason]} onChange={(value) => setReason(value[0] ?? reason)} />
      <p className="mt-3 text-[15px]">{tx("Estimated refund", "Reembolso estimado")}: {usd(refund)}. {tx("Half is returned when you cancel more than 2 hours ahead.", "Se devuelve la mitad si cancelas con más de 2 horas.")}</p>
      <AppButton
        onClick={async () => {
          const ok = await nav.confirm({ title: tx("Cancel this booking?", "¿Cancelar esta reserva?"), message: reason, destructive: true, confirmLabel: tx("Cancel booking", "Cancelar reserva") });
          if (!ok) return;
          kiddo.updateBooking(booking.id, { status: "Cancelled", total: booking.total - refund });
          nav.toast(tx("Cancelled", "Cancelada"), tx(`Refund ${usd(refund)} is processing.`, `El reembolso de ${usd(refund)} está en proceso.`));
          nav.pop();
        }}
      >
        {tx("Confirm cancellation", "Confirmar cancelación")}
      </AppButton>
    </div>
  );
}

const TOUR_SLOTS = [
  { id: "Tue 10:00 AM", day: "Tuesday", dayEs: "Martes", time: "10:00 AM" },
  { id: "Wed 4:00 PM", day: "Wednesday", dayEs: "Miércoles", time: "4:00 PM" },
  { id: "Thu 9:30 AM", day: "Thursday", dayEs: "Jueves", time: "9:30 AM" },
  { id: "Fri 1:00 PM", day: "Friday", dayEs: "Viernes", time: "1:00 PM" },
];

export function TourScreen() {
  const nav = useNav();
  const { tx, lang } = useTx();
  const [slot, setSlot] = useState(TOUR_SLOTS[0].id);
  const [visitors, setVisitors] = useState(2);
  const [child, setChild] = useState(true);
  const [notes, setNotes] = useState("");
  const selected = TOUR_SLOTS.find((item) => item.id === slot) ?? TOUR_SLOTS[0];
  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 px-4 pb-2 pt-3">
        <button type="button" aria-label={tx("Back", "Atrás")} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#E6F7F4] text-[#1F2A44]" onClick={() => nav.pop()}>
          <ChevronLeft size={22} strokeWidth={2.5} />
        </button>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-[#8EE0D6]">{brand.name}</p>
          <h1 className="truncate text-[22px] font-bold leading-tight">{tx("Schedule a tour", "Agendar visita")}</h1>
        </div>
      </header>
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-3">
        <article className="rounded-2xl bg-card px-4 py-4 shadow-card">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-[#8EE0D6]">{tx("Location", "Lugar")}</p>
          <p className="mt-1 text-[17px] font-semibold leading-snug">{brandAddress}</p>
          <p className="mt-2 text-[14px] text-[#D5E2EA]">{brand.hours}</p>
          <p className="text-[14px] text-[#D5E2EA]">{tx("Tour length · 45 minutes", "Duración · 45 minutos")}</p>
        </article>

        <section>
          <h2 className="text-[13px] font-semibold uppercase tracking-wide text-[#8EE0D6]">{tx("Choose a time", "Elige un horario")}</h2>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {TOUR_SLOTS.map((item) => {
              const on = item.id === slot;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setSlot(item.id)}
                  className={`rounded-2xl px-3 py-3 text-left ${on ? "bg-[#259f94] text-white" : "bg-card text-[#F7F4EE] shadow-card"}`}
                >
                  <span className={`block text-[13px] font-semibold ${on ? "text-white/80" : "text-[#D5E2EA]"}`}>{lang === "es" ? item.dayEs : item.day}</span>
                  <span className="mt-0.5 block text-[18px] font-bold leading-tight">{item.time}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl bg-card px-4 py-4 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[17px] font-semibold">{tx("Visitors", "Visitantes")}</p>
              <p className="text-[13px] text-[#D5E2EA]">{tx("Adults joining the tour", "Adultos en la visita")}</p>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-[#102033] p-1">
              <button type="button" aria-label={tx("Fewer visitors", "Menos visitantes")} className="grid h-10 w-10 place-items-center rounded-full bg-[#E6F7F4] text-[22px] font-semibold leading-none text-[#1F2A44]" onClick={() => setVisitors((count) => Math.max(1, count - 1))}>
                −
              </button>
              <span className="w-8 text-center text-[18px] font-bold">{visitors}</span>
              <button type="button" aria-label={tx("More visitors", "Más visitantes")} className="grid h-10 w-10 place-items-center rounded-full bg-[#E6F7F4] text-[22px] font-semibold leading-none text-[#1F2A44]" onClick={() => setVisitors((count) => Math.min(6, count + 1))}>
                +
              </button>
            </div>
          </div>
        </section>

        <button
          type="button"
          role="switch"
          aria-checked={child}
          onClick={() => setChild((on) => !on)}
          className="flex w-full items-center gap-3 rounded-2xl bg-card px-4 py-4 text-left shadow-card"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-[17px] font-semibold">{tx("Child will attend", "El niño asistirá")}</span>
            <span className="mt-0.5 block text-[13px] text-[#D5E2EA]">{tx("They can see a classroom with you.", "Puede ver un salón contigo.")}</span>
          </span>
          <span className={`h-[31px] w-[51px] shrink-0 rounded-full p-0.5 ${child ? "bg-[#259f94]" : "bg-[#102033]"}`}>
            <span className={`block h-[27px] w-[27px] rounded-full bg-white shadow transition ${child ? "translate-x-5" : ""}`} />
          </span>
        </button>

        <label className="block">
          <span className="mb-2 block text-[13px] font-semibold uppercase tracking-wide text-[#8EE0D6]">{tx("Notes", "Notas")}</span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder={tx("Questions about the room, schedule, or ages.", "Preguntas sobre el salón, el horario o las edades.")}
            className="min-h-28 w-full rounded-2xl bg-[#E6F7F4] px-4 py-3 text-[16px] text-[#1F2A44] outline-none placeholder:text-[#5C6578]"
          />
        </label>
      </div>
      <div className="px-5 py-3">
        <p className="mb-2 text-center text-[13px] text-[#D5E2EA]">
          {lang === "es" ? selected.dayEs : selected.day} · {selected.time} · {visitors} {tx(visitors === 1 ? "visitor" : "visitors", visitors === 1 ? "visitante" : "visitantes")}
        </p>
        <AppButton
          onClick={() => {
            downloadIcs({ title: `Tour · ${brand.name}`, date: iso(3), start: "10:00", end: "10:45", location: brandAddress });
            nav.toast(
              tx("Tour requested", "Visita solicitada"),
              tx(`${lang === "es" ? selected.dayEs : selected.day} at ${selected.time}. We'll confirm by message.`, `${lang === "es" ? selected.dayEs : selected.day} a las ${selected.time}. Lo confirmamos por mensaje.`),
            );
            nav.pop();
          }}
        >
          {tx("Request tour", "Pedir visita")}
        </AppButton>
      </div>
    </div>
  );
}

export function WaitlistScreen() {
  const nav = useNav();
  const kiddo = useKiddo();
  const { tx } = useTx();
  const id = nav.route.name === "waitlist" ? nav.route.id : "";
  const [childId, setChildId] = useState(kiddo.family?.children[0]?.id ?? "");
  const [date, setDate] = useState(iso(21));
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"Submitted" | "Under Review" | "Offered" | "Enrolled" | "">("");
  return (
    <div className="h-full overflow-y-auto px-5 py-4">
      <BackButton />
      <h1 className="text-[28px] font-bold">{tx("Enrollment request", "Solicitud de inscripción")}</h1>
      {(kiddo.family?.children ?? []).map((child) => (
        <button key={child.id} type="button" className={`mt-2 min-h-11 w-full rounded-lg px-3 text-left ${childId === child.id ? "bg-[#E6F7F4] font-semibold text-[#1F2A44]" : "bg-card text-[#F7F4EE]"}`} onClick={() => setChildId(child.id)}>{child.firstName}</button>
      ))}
      <AppInput type="date" label={tx("Desired start", "Inicio deseado")} value={date} onChange={(e) => setDate(e.target.value)} />
      <AppInput multiline label={tx("Schedule notes", "Notas del horario")} value={notes} onChange={(e) => setNotes(e.target.value)} />
      {status ? (
        <div className="mt-3 space-y-2">
          {["Submitted", "Under Review", "Offered", "Enrolled"].map((item) => (
            <div key={item} className="flex items-center justify-between rounded-xl bg-card px-3 py-3">
              <span>{item}</span>
              <StatusBadge status={item === status ? item : "Pending"} />
            </div>
          ))}
          <AppButton variant="secondary" onClick={() => nav.toast(tx("Enrollment packet", "Paquete de inscripción"), tx("Signature fields are in Documents.", "Las firmas están en Documentos."))}>{tx("Open forms", "Abrir formularios")}</AppButton>
        </div>
      ) : (
        <AppButton onClick={() => { setStatus("Submitted"); nav.toast(tx("Request submitted", "Solicitud enviada")); }}>{tx("Submit", "Enviar")}</AppButton>
      )}
    </div>
  );
}

export function ReviewScreen() {
  const nav = useNav();
  const kiddo = useKiddo();
  const { tx } = useTx();
  const id = nav.route.name === "review" ? nav.route.id : "";
  const booking = kiddo.family?.bookings.find((item) => item.id === id);
  const providerId = booking?.providerId ?? id;
  const [stars, setStars] = useState(5);
  const [tags, setTags] = useState<string[]>([]);
  const [text, setText] = useState("");
  return (
    <div className="h-full overflow-y-auto px-5 py-4">
      <BackButton />
      <h1 className="text-[28px] font-bold">{tx("How was care?", "¿Cómo estuvo el cuidado?")}</h1>
      <div className="mt-3 flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button key={star} type="button" aria-label={`${star} stars`} className="grid h-11 w-11 place-items-center text-2xl" onClick={() => setStars(star)}>{star <= stars ? "★" : "☆"}</button>
        ))}
      </div>
      <div className="mt-3">
        <ChipGroup multiple options={["Caring", "Punctual", "Clean", "Great communication"]} value={tags} onChange={setTags} />
      </div>
      <AppInput multiline label={tx("Comment", "Comentario")} value={text} onChange={(e) => setText(e.target.value)} />
      <AppButton variant="secondary" onClick={() => nav.toast(tx("Photo added", "Foto agregada"))}>{tx("Add a photo", "Agregar foto")}</AppButton>
      <AppButton
        onClick={() => {
          if (!text.trim()) {
            nav.toast(tx("Add a short comment", "Agrega un comentario corto"));
            return;
          }
          kiddo.addReview({ id: uid("rev"), providerId, author: kiddo.user?.preferredName ?? "You", rating: stars, date: "Oct 2026", text, tags });
          nav.toast(tx("Review sent", "Reseña enviada"));
          nav.pop();
        }}
      >
        {tx("Submit", "Enviar")}
      </AppButton>
    </div>
  );
}
