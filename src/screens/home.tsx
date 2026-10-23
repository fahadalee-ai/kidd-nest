import { useState } from "react";
import { BadgeCheck, Bell, CalendarPlus, CreditCard, Lock, MessageCircle, Search, ShieldCheck, Users } from "lucide-react";
import { useNav } from "@/app/nav";
import { centerDraft } from "@/screens/booking";
import { BackButton, Photo, ScreenHeader, SectionHeader, SkeletonCard, StatusBadge, useBootSkeleton } from "@/components/ios";
import { brand, brandAddress } from "@/config/brand";
import { MENU, PROGRAMS, STAFF, TRUST, carePlace } from "@/data/center";
import { photoSrc } from "@/data/photos";
import { providerById, PROVIDERS } from "@/data/providers";
import { SERVICES } from "@/data/services";
import type { CareType } from "@/data/types";
import { clockLabel, formatLong, greeting, iso } from "@/lib/dates";
import { useKiddo, useTx } from "@/lib/store";
import { usd } from "@/lib/validate";

export function HomeScreen() {
  const nav = useNav();
  const kiddo = useKiddo();
  const { tx, lang } = useTx();
  const loading = useBootSkeleton();
  const family = kiddo.family;
  if (!family) return null;
  const selected = family.selectedChild;
  const child = family.children.find((item) => item.id === selected) ?? family.children[0];
  const booking = family.bookings.find((item) => item.childIds.includes(child?.id ?? "") && item.date === iso(0) && item.status !== "Cancelled");
  const place = booking ? carePlace(booking.providerId) : null;
  const status = booking?.status === "In Progress" ? (lang === "es" ? "Entró" : "Checked In") : booking ? (lang === "es" ? "Confirmado" : "Confirmed") : lang === "es" ? "Sin cuidado hoy" : "No care today";
  const upcoming = family.bookings.filter((item) => ["Pending", "Confirmed", "In Progress"].includes(item.status)).slice(0, 6);
  const unread = family.notifications.filter((note) => !note.read).length;

  const nextTask = kiddo.completion.tasks.find((task) => !task.done);
  const teacher = place ? { name: place.teacher, role: place.role } : (STAFF.find((person) => person.program === "Preschool") ?? STAFF[0]);
  const parentName = family.user.preferredName.trim() || family.user.firstName.trim() || tx("there", "hola");
  return (
    <div className="h-full overflow-y-auto px-5 pb-8 pt-4">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[15px] text-[#D5E2EA]">{greeting(lang)}</p>
          <h1 className="truncate text-[28px] font-bold leading-tight text-[#F7F4EE]">{parentName}</h1>
        </div>
        <button type="button" aria-label={tx("Notifications", "Notificaciones")} className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#E6F7F4] text-[#1F2A44]" onClick={() => nav.push({ name: "notifications" })}>
          <Bell size={22} />
          {unread > 0 ? <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-coral px-1 text-[11px] font-bold text-[#1F2A44]">{unread}</span> : null}
        </button>
        <button type="button" aria-label={tx("Profile", "Perfil")} className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#259f94] text-[18px] font-bold text-white" onClick={() => nav.setTab("profile")}>
          {(family.user.firstName || parentName).slice(0, 1).toUpperCase()}
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2 overflow-x-auto overflow-y-hidden pb-1">
        <ChildChip label={tx("All", "Todos")} active={selected === "all"} onClick={() => kiddo.setSelectedChild("all")} />
        {family.children.map((item) => {
          const active = selected === item.id;
          const label = item.firstName.trim() || tx("Child", "Niño");
          return (
            <button key={item.id} type="button" onClick={() => kiddo.setSelectedChild(item.id)} className={`flex h-12 max-w-[180px] shrink-0 items-center gap-2 overflow-hidden rounded-full pl-1 pr-4 ${active ? "bg-[#259f94] text-white" : "bg-[#3A6294] text-[#F7F4EE]"}`}>
              <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-[#E6F7F4]">
                {item.avatar ? <img src={photoSrc(item.avatar)} alt="" className="h-10 w-10 max-h-10 max-w-10 object-cover" /> : <span className="text-[16px] font-bold text-[#14685f]">{label.slice(0, 1)}</span>}
              </span>
              <span className="truncate text-[15px] font-semibold">{label}</span>
            </button>
          );
        })}
        <button type="button" className="h-12 shrink-0 rounded-full bg-[#E6F7F4] px-4 text-[15px] font-semibold text-[#14685f]" onClick={() => nav.push({ name: "manage-children" })}>
          + {tx("Add", "Agregar")}
        </button>
      </div>

      {loading ? (
        <div className="mt-6 space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-6">
          <article className="rounded-2xl bg-card p-4 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[13px] text-muted-foreground">{tx("Today", "Hoy")}</p>
                <h2 className="text-[22px] font-semibold">{child?.firstName ?? tx("Your children", "Tus niños")}</h2>
                <p className="text-[16px]">{place ? place.program : brand.name}</p>
                <p className="text-[15px] text-muted-foreground">{teacher.name} · {teacher.role}</p>
                {booking ? <p className="text-[15px] text-muted-foreground">{tx("Checked in", "Entrada")} {clockLabel(booking.start)}</p> : <p className="text-[15px] text-muted-foreground">{tx("Not scheduled today", "Sin horario hoy")}</p>}
              </div>
              <StatusBadge status={status} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button type="button" className="min-h-[52px] rounded-lg bg-surface text-[16px] font-semibold text-[var(--teal-ink)]" onClick={() => (child ? nav.push({ name: "daily", id: child.id }) : nav.push({ name: "manage-children" }))}>
                {tx("View Updates", "Ver avisos")}
              </button>
              <button type="button" className="min-h-[52px] rounded-lg bg-coral text-[16px] font-semibold text-white" onClick={() => nav.setTab("messages")}>
                {tx("Message Teacher", "Escribir al maestro")}
              </button>
            </div>
          </article>

          {kiddo.completion.percent < 100 ? (
            <button type="button" className="rounded-2xl bg-card p-4 text-left shadow-card" onClick={() => nav.push(nextTask?.id === "children" ? { name: "manage-children" } : nextTask?.id === "emergency" ? { name: "emergency" } : { name: "edit-profile" })}>
              <div className="flex items-center justify-between">
                <p className="text-[17px] font-semibold">{tx("Profile", "Perfil")} {kiddo.completion.percent}%</p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface">
                <div className="h-full rounded-full bg-primary" style={{ width: `${kiddo.completion.percent}%` }} />
              </div>
              {nextTask ? <p className="mt-3 text-[16px] text-ink">{lang === "es" ? nextTask.es : nextTask.en}</p> : null}
            </button>
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: <CalendarPlus size={22} />, label: tx("Book Care", "Reservar"), go: () => { kiddo.setDraft(centerDraft(family)); nav.push({ name: "book", step: 0 }); } },
              { icon: <Search size={22} />, label: tx("Schedule a Tour", "Agendar visita"), go: () => nav.push({ name: "tour", id: "center" }) },
              { icon: <CreditCard size={22} />, label: tx("Pay Tuition", "Pagar colegiatura"), go: () => nav.push({ name: "invoices" }) },
              { icon: <MessageCircle size={22} />, label: tx("Message Center", "Escribir al centro"), go: () => nav.setTab("messages") },
            ].map((action) => (
              <button key={action.label} type="button" onClick={action.go} className="flex min-h-[72px] items-center gap-3 rounded-2xl bg-card px-3 text-left shadow-card">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-surface text-[var(--teal-ink)]">{action.icon}</span>
                <span className="text-[16px] font-semibold leading-tight">{action.label}</span>
              </button>
            ))}
          </div>

          <div>
            <SectionHeader title={tx("Our Programs", "Nuestros programas")} action={tx("See all", "Ver todo")} onAction={() => nav.setTab("programs")} />
            <div className="grid grid-cols-2 gap-3">
              {PROGRAMS.slice(0, 4).map((program) => (
                <button key={program.id} type="button" onClick={() => nav.push({ name: "program", id: program.id })} className="overflow-hidden rounded-2xl bg-card text-left shadow-card">
                  <Photo id={program.photo} alt={program.name} className="h-24 w-full" />
                  <span className="block px-3 py-3">
                    <span className="block text-[16px] font-semibold leading-tight">{lang === "es" ? program.nameEs : program.name}</span>
                    <span className="mt-1 block text-[13px] text-muted-foreground">{program.ages}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {upcoming.length > 0 ? (
            <div>
              <SectionHeader title={tx("Upcoming", "Próximas")} action={tx("See all", "Ver todo")} onAction={() => nav.setTab("schedule")} />
              <div className="flex gap-3 overflow-x-auto pb-1">
                {upcoming.slice(0, 4).map((item) => {
                  const itemPlace = carePlace(item.providerId);
                  return (
                    <button key={item.id} type="button" onClick={() => nav.push({ name: "booking", id: item.id })} className="w-60 shrink-0 rounded-2xl bg-card p-4 text-left shadow-card">
                      <p className="text-[16px] font-semibold">{itemPlace.program}</p>
                      <p className="mt-1 text-[15px] text-muted-foreground">{formatLong(item.date, lang)} · {clockLabel(item.start)}</p>
                      <div className="mt-2"><StatusBadge status={item.status} /></div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <article className="overflow-hidden rounded-lg bg-card shadow-card">
            <div className="px-4 pb-1 pt-4">
              <h2 className="text-[22px] font-semibold text-[#F7F4EE]">{tx("Meet our team", "Nuestro equipo")}</h2>
              <p className="mt-1 text-[14px] text-[#D5E2EA]">{tx("The people who greet your child each day.", "Quienes reciben a tu hijo cada día.")}</p>
            </div>
            <ul>
              {["elena", "jordan", "hannah", "andre"].map((id) => {
                const person = STAFF.find((member) => member.id === id);
                if (!person) return null;
                const place = person.program === "Center" || person.program === "Front Office" ? person.role : `${person.role} · ${person.program}`;
                return (
                  <li key={person.id} className="border-t border-[#6D8EB8]">
                    <button type="button" className="flex w-full items-center gap-3 px-4 py-3 text-left" onClick={() => nav.push({ name: "staff", id: person.id })}>
                      <img src={photoSrc(person.photo)} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                      <span className="min-w-0">
                        <span className="block truncate text-[17px] font-semibold text-[#F7F4EE]">{person.name}</span>
                        <span className="block truncate text-[14px] text-[#D5E2EA]">{place}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </article>

          <article className="rounded-lg bg-card p-4 shadow-card">
            <h2 className="text-[22px] font-semibold text-[#F7F4EE]">{tx("This week's menu", "Menú de la semana")}</h2>
            <ul className="mt-2">
              {MENU.map((item) => (
                <li key={item.day} className="flex items-center gap-3 border-t border-[#6D8EB8] py-3 first:border-0">
                  <span className="grid h-10 w-12 shrink-0 place-items-center rounded-md bg-[#14263e] text-[13px] font-bold text-[#259f94]">{item.day}</span>
                  <span className="text-[16px] leading-snug text-[#F7F4EE]">{item.meal}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-lg bg-card p-4 shadow-card">
            <h2 className="text-[22px] font-semibold text-[#F7F4EE]">{tx("Why parents trust us", "Por qué las familias confían")}</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {TRUST.map((item) => {
                const icon = item.startsWith("State") ? <ShieldCheck size={18} /> : item.startsWith("CPR") ? <BadgeCheck size={18} /> : item.startsWith("Background") ? <Users size={18} /> : item.startsWith("Secure") ? <Lock size={18} /> : <BadgeCheck size={18} />;
                return (
                  <button key={item} type="button" className="flex min-h-[52px] items-center gap-2 rounded-md bg-[#14263e] px-2.5 py-2 text-left" onClick={() => nav.push({ name: "legal", doc: "about" })}>
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[#E6F7F4] text-[#14685f]">{icon}</span>
                    <span className="text-[13px] font-semibold leading-tight text-[#F7F4EE]">{item}</span>
                  </button>
                );
              })}
            </div>
          </article>

          <article className="rounded-2xl bg-card p-4 shadow-card">
            <h2 className="text-[17px] font-semibold">{brand.name}</h2>
            <p className="mt-1 text-[15px] text-muted-foreground">{brandAddress}</p>
            <p className="text-[15px] text-muted-foreground">{brand.hours}</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <a className="inline-flex min-h-[52px] items-center justify-center rounded-lg bg-surface font-semibold text-[var(--teal-ink)]" href={`tel:${brand.phone}`}>{tx("Call", "Llamar")}</a>
              <a className="inline-flex min-h-[52px] items-center justify-center rounded-lg bg-coral font-semibold text-white" href={`https://maps.apple.com/?q=${encodeURIComponent(brandAddress)}`}>{tx("Directions", "Cómo llegar")}</a>
            </div>
          </article>
        </div>
      )}
    </div>
  );
}

function ChildChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`h-12 shrink-0 rounded-full px-4 text-[15px] font-semibold ${active ? "bg-primary text-white" : "bg-card text-ink shadow-card"}`}>
      {label}
    </button>
  );
}

export function ServiceScreen() {
  const nav = useNav();
  const { tx, lang } = useTx();
  const id = nav.route.name === "service" ? nav.route.id : "daycare";
  const service = SERVICES.find((item) => item.id === id) ?? SERVICES[0];
  const matches = PROVIDERS.filter((provider) => provider.type === (id as CareType));
  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="relative">
          <Photo id={service.photo} alt={service.title} className="h-56 w-full" />
          <div className="absolute left-3 top-3">
            <BackButton />
          </div>
        </div>
        <div className="space-y-4 px-5 py-5">
          <h1 className="text-[28px] font-bold">{lang === "es" ? service.titleEs : service.title}</h1>
          <p className="text-[17px] leading-relaxed">{lang === "es" ? service.descriptionEs : service.description}</p>
          <Block title={tx("Who it is for", "Para quién es")} body={service.who} />
          <Block title={tx("What is included", "Qué incluye")} body={service.included.join(" · ")} />
          <Block title={tx("Typical price", "Precio habitual")} body={service.price} />
          <Block title={tx("Age groups", "Edades")} body={service.ages} />
          <Block title={tx("Safety standards", "Seguridad")} body={service.safety} />
          <div>
            <h2 className="text-[22px] font-semibold">{tx("How it works", "Cómo funciona")}</h2>
            <ol className="mt-2 space-y-3">
              {service.steps.map((step, index) => (
                <li key={step.title} className="rounded-2xl bg-card p-3 shadow-card">
                  <p className="text-[13px] font-semibold text-primary">{index + 1}</p>
                  <p className="font-semibold">{step.title}</p>
                  <p className="text-[15px] text-muted-foreground">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h2 className="text-[22px] font-semibold">{tx("FAQs", "Preguntas")}</h2>
            {service.faqs.map((faq) => (
              <details key={faq.q} className="mt-2 rounded-2xl bg-card px-3 py-2 shadow-card">
                <summary className="min-h-11 cursor-pointer font-semibold">{faq.q}</summary>
                <p className="pb-3 text-[15px] text-muted-foreground">{faq.a}</p>
              </details>
            ))}
          </div>
          <div>
            <h2 className="text-[22px] font-semibold">{tx("Top providers", "Proveedores")}</h2>
            <div className="mt-2 space-y-2">
              {matches.map((provider) => (
                <button key={provider.id} type="button" className="flex w-full items-center gap-3 rounded-2xl bg-card p-3 text-left shadow-card" onClick={() => nav.push({ name: "provider", id: provider.id })}>
                  <img src={photoSrc(provider.avatar)} alt="" className="h-12 w-12 rounded-full object-cover" />
                  <span>
                    <span className="block font-semibold">{provider.name}</span>
                    <span className="text-[13px] text-muted-foreground">{provider.priceLabel} · {usd(provider.hourly)}/hr</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-line px-5 py-3">
        <button type="button" className="min-h-[52px] w-full rounded-lg bg-coral font-semibold text-white" onClick={() => nav.setTab("programs")}>
          {tx("Find Providers", "Buscar proveedores")}
        </button>
      </div>
    </div>
  );
}

function Block({ title, body }: { title: string; body: string }) {
  return (
    <section className="rounded-2xl bg-card p-4 shadow-card">
      <h2 className="text-[15px] font-semibold text-[var(--teal-ink)]">{title}</h2>
      <p className="mt-1 text-[16px] leading-relaxed">{body}</p>
    </section>
  );
}

export function NotificationsScreen() {
  const nav = useNav();
  const kiddo = useKiddo();
  const { tx } = useTx();
  const family = kiddo.family;
  const [filter, setFilter] = useState<"all" | "bookings" | "updates" | "payments">("all");
  if (!family) return null;
  const notes = family.notifications.filter((note) => filter === "all" || note.kind === filter);
  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title={tx("Notifications", "Notificaciones")} right={<button type="button" className="min-h-11 px-1 text-[13px] font-semibold text-[#8EE0D6]" onClick={() => kiddo.markAllNotes()}>{tx("Read all", "Leídas")}</button>} />
      <div className="px-5">
        <div className="grid grid-cols-4 rounded-xl bg-muted p-1 text-[12px] font-semibold">
          {(["all", "bookings", "updates", "payments"] as const).map((id) => (
            <button key={id} type="button" className={`min-h-11 rounded-lg ${filter === id ? "bg-card shadow-card" : ""}`} onClick={() => setFilter(id)}>
              {tx(id === "all" ? "All" : id[0].toUpperCase() + id.slice(1), id === "all" ? "Todo" : id === "bookings" ? "Reservas" : id === "updates" ? "Avisos" : "Pagos")}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-3 min-h-0 flex-1 overflow-y-auto px-5">
        {notes.length === 0 ? <p className="py-8 text-center text-muted-foreground">{tx("You’re caught up.", "Estás al día.")}</p> : null}
        {notes.map((note) => (
          <div key={note.id} className="mb-2 flex items-stretch overflow-hidden rounded-2xl bg-card shadow-card">
            <button type="button" className="flex-1 px-4 py-3 text-left" onClick={() => kiddo.markNoteRead(note.id)}>
              <p className="text-[12px] text-muted-foreground">{note.at}</p>
              <p className={`text-[16px] ${note.read ? "" : "font-semibold"}`}>{note.title}</p>
              <p className="text-[14px] text-muted-foreground">{note.body}</p>
            </button>
            <button type="button" className="w-16 bg-destructive text-[12px] font-semibold text-white" onClick={() => kiddo.deleteNote(note.id)}>
              {tx("Delete", "Borrar")}
            </button>
          </div>
        ))}
        <button type="button" className="mb-6 mt-2 min-h-11 font-semibold text-[var(--teal-ink)]" onClick={() => nav.push({ name: "notif-prefs" })}>
          {tx("Notification preferences", "Preferencias de avisos")}
        </button>
      </div>
    </div>
  );
}

