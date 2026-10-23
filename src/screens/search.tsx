import { useMemo, useState } from "react";
import { Heart, MapPin, Share2, SlidersHorizontal } from "lucide-react";
import { useNav } from "@/app/nav";
import { AppButton, BackButton, BottomSheet, ChipGroup, EmptyState, MenuButton, PageDots, Photo, RatingStars, SegmentedControl, SliderField, StatusBadge } from "@/components/ios";
import { photoSrc } from "@/data/photos";
import { PROVIDERS, providerById } from "@/data/providers";
import { SERVICES } from "@/data/services";
import type { CareType, Grade, Provider } from "@/data/types";
import { iso } from "@/lib/dates";
import { useKiddo, useTx } from "@/lib/store";
import { shareText } from "@/services/files";

type Filters = {
  distance: number;
  hourly: number;
  monthly: number;
  priceMode: "hr" | "mo";
  age: Grade | "";
  days: string[];
  rating4: boolean;
  certs: string[];
  languages: string;
  meals: boolean;
  transport: boolean;
  openNow: boolean;
  special: boolean;
};

const DEFAULTS: Filters = {
  distance: 15,
  hourly: 60,
  monthly: 2000,
  priceMode: "hr",
  age: "",
  days: [],
  rating4: false,
  certs: [],
  languages: "",
  meals: false,
  transport: false,
  openNow: false,
  special: false,
};

export function SearchScreen() {
  const nav = useNav();
  const kiddo = useKiddo();
  const { tx } = useTx();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"Map" | "List">("List");
  const [type, setType] = useState<CareType | "">("");
  const [sort, setSort] = useState("Recommended");
  const [filters, setFilters] = useState<Filters>(DEFAULTS);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Filters>(DEFAULTS);
  const results = useMemo(() => {
    let list = PROVIDERS.filter((provider) => {
      if (query && !`${provider.name} ${provider.type} ${provider.address}`.toLowerCase().includes(query.toLowerCase())) return false;
      if (type && provider.type !== type) return false;
      if (provider.distance > filters.distance) return false;
      if (filters.priceMode === "hr" && provider.hourly > filters.hourly) return false;
      if (filters.priceMode === "mo" && provider.monthly > 0 && provider.monthly > filters.monthly) return false;
      if (filters.age && !provider.ageGroups.includes(filters.age)) return false;
      if (filters.days.length && !filters.days.every((day) => provider.days.includes(day))) return false;
      if (filters.rating4 && provider.rating < 4) return false;
      if (filters.certs.includes("CPR") && !provider.badges.includes("CPR")) return false;
      if (filters.certs.includes("First Aid") && !provider.badges.includes("First Aid")) return false;
      if (filters.certs.includes("ECE") && !provider.badges.includes("ECE")) return false;
      if (filters.certs.includes("Background") && !provider.badges.includes("Background Checked")) return false;
      if (filters.certs.includes("Licensed") && !provider.badges.includes("Licensed")) return false;
      if (filters.languages && !provider.languages.includes(filters.languages)) return false;
      if (filters.meals && !provider.badges.includes("Meals")) return false;
      if (filters.transport && !provider.badges.includes("Transport")) return false;
      if (filters.openNow && !provider.openNow) return false;
      if (filters.special && !provider.badges.includes("Special Needs")) return false;
      return true;
    });
    if (sort === "Nearest") list = [...list].sort((a, b) => a.distance - b.distance);
    else if (sort === "Lowest price") list = [...list].sort((a, b) => a.weeklyCost - b.weeklyCost);
    else if (sort === "Highest rated") list = [...list].sort((a, b) => b.rating - a.rating);
    else list = [...list].sort((a, b) => b.rating * 10 - b.distance - (a.rating * 10 - a.distance));
    return list;
  }, [query, type, filters, sort]);

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-3 px-5 pt-3">
        <div className="flex gap-2">
          <input
            className="min-h-11 flex-1 rounded-xl bg-muted px-3"
            placeholder={tx("Search daycares, nannies, babysitters…", "Busca guarderías, niñeras, canguros…")}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label={tx("Search", "Buscar")}
          />
          {query ? (
            <button type="button" className="min-h-11 font-semibold text-[var(--teal-ink)]" onClick={() => setQuery("")}>
              {tx("Cancel", "Cancelar")}
            </button>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <SegmentedControl ariaLabel="View" value={mode} onChange={setMode} options={[{ id: "Map", label: tx("Map", "Mapa") }, { id: "List", label: tx("List", "Lista") }]} />
          </div>
          <button type="button" aria-label={tx("Filters", "Filtros")} className="grid h-11 w-11 place-items-center rounded-xl bg-card shadow-card" onClick={() => { setDraft(filters); setOpen(true); }}>
            <SlidersHorizontal size={18} />
          </button>
          <MenuButton
            label={sort === "Recommended" ? tx("Sort", "Orden") : sort}
            options={["Recommended", "Nearest", "Lowest price", "Highest rated"]}
            onSelect={setSort}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button type="button" className={`min-h-11 shrink-0 rounded-full px-3 text-[13px] font-semibold ${type === "" ? "bg-primary text-white" : "bg-surface"}`} onClick={() => setType("")}>{tx("All", "Todo")}</button>
          {SERVICES.map((service) => (
            <button key={service.id} type="button" className={`min-h-11 shrink-0 rounded-full px-3 text-[13px] font-semibold ${type === service.id ? "bg-primary text-white" : "bg-surface"}`} onClick={() => setType(service.id)}>
              {service.title.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-3">
        {results.length === 0 ? (
          <EmptyState image="emptyBookings" title={tx("No matches", "Sin resultados")} body={tx("Try a wider radius or clear a filter.", "Prueba un radio más amplio o quita un filtro.")} action={tx("Reset", "Restablecer")} onAction={() => { setFilters(DEFAULTS); setType(""); setQuery(""); }} />
        ) : mode === "List" ? (
          <div className="space-y-3">
            {results.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} saved={kiddo.family?.favorites.includes(provider.id) ?? false} onOpen={() => nav.push({ name: "provider", id: provider.id })} onSave={() => kiddo.toggleFavorite(provider.id)} />
            ))}
          </div>
        ) : (
          <MapView providers={results} onOpen={(id) => nav.push({ name: "provider", id })} />
        )}
      </div>
      <BottomSheet open={open} onClose={() => setOpen(false)} title={tx("Filters", "Filtros")}>
        <div className="space-y-4">
          <SliderField label={tx("Distance", "Distancia")} min={1} max={25} value={draft.distance} onChange={(distance) => setDraft({ ...draft, distance })} format={(n) => `${n} mi`} />
          <SegmentedControl ariaLabel="Price unit" value={draft.priceMode} onChange={(priceMode) => setDraft({ ...draft, priceMode })} options={[{ id: "hr", label: "$/hr" }, { id: "mo", label: "$/mo" }]} />
          {draft.priceMode === "hr" ? (
            <SliderField label={tx("Max hourly", "Máximo por hora")} min={10} max={60} value={draft.hourly} onChange={(hourly) => setDraft({ ...draft, hourly })} format={(n) => `$${n}`} />
          ) : (
            <SliderField label={tx("Max monthly", "Máximo mensual")} min={800} max={2000} value={draft.monthly} onChange={(monthly) => setDraft({ ...draft, monthly })} format={(n) => `$${n}`} />
          )}
          <p className="text-[13px] font-medium">{tx("Age group", "Edad")}</p>
          <ChipGroup options={["Infant", "Toddler", "Preschool", "Pre-K", "Elementary"]} value={draft.age ? [draft.age] : []} onChange={(value) => setDraft({ ...draft, age: (value[0] as Grade) ?? "" })} />
          <p className="text-[13px] font-medium">{tx("Days", "Días")}</p>
          <ChipGroup multiple options={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]} value={draft.days} onChange={(days) => setDraft({ ...draft, days })} />
          <label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={draft.rating4} onChange={(e) => setDraft({ ...draft, rating4: e.target.checked })} /> {tx("Rating 4+", "Calificación 4+")}</label>
          <ChipGroup multiple options={["CPR", "First Aid", "ECE", "Background", "Licensed"]} value={draft.certs} onChange={(certs) => setDraft({ ...draft, certs })} />
          <ChipGroup options={["English", "Spanish"]} value={draft.languages ? [draft.languages] : []} onChange={(value) => setDraft({ ...draft, languages: value[0] ?? "" })} />
          <label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={draft.meals} onChange={(e) => setDraft({ ...draft, meals: e.target.checked })} /> {tx("Meals provided", "Incluye comidas")}</label>
          <label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={draft.transport} onChange={(e) => setDraft({ ...draft, transport: e.target.checked })} /> {tx("Transportation", "Transporte")}</label>
          <label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={draft.openNow} onChange={(e) => setDraft({ ...draft, openNow: e.target.checked })} /> {tx("Open now", "Abierto ahora")}</label>
          <label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={draft.special} onChange={(e) => setDraft({ ...draft, special: e.target.checked })} /> {tx("Special needs experienced", "Experiencia en necesidades especiales")}</label>
          <div className="grid grid-cols-2 gap-2">
            <AppButton variant="secondary" onClick={() => setDraft(DEFAULTS)}>{tx("Reset", "Restablecer")}</AppButton>
            <AppButton onClick={() => { setFilters(draft); setOpen(false); }}>{tx("Show results", "Ver resultados")}</AppButton>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}

export function ProviderCard({ provider, saved, onOpen, onSave }: { provider: Provider; saved: boolean; onOpen: () => void; onSave: () => void }) {
  return (
    <article className="overflow-hidden rounded-2xl bg-card shadow-card">
      <button type="button" className="block w-full text-left" onClick={onOpen}>
        <Photo id={provider.photo} alt={provider.name} className="h-36 w-full" />
      </button>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <button type="button" className="text-left" onClick={onOpen}>
            <h2 className="text-[17px] font-semibold">{provider.name}</h2>
            <StatusBadge status={provider.type} />
          </button>
          <button type="button" aria-label={saved ? "Remove favorite" : "Save"} className="grid h-11 w-11 place-items-center" onClick={onSave}>
            <Heart size={20} className={saved ? "fill-coral text-coral" : ""} />
          </button>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-[13px]">
          <RatingStars value={provider.rating} count={provider.reviewCount} />
          <span>{provider.priceLabel}</span>
          <span className="text-muted-foreground">{provider.distance} mi</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {provider.badges.slice(0, 3).map((badge) => (
            <span key={badge} className="rounded-full bg-surface px-2 py-1 text-[11px] font-semibold text-[var(--teal-ink)]">{badge}</span>
          ))}
          <span className="rounded-full bg-sun/30 px-2 py-1 text-[11px] font-semibold">{provider.availability}</span>
        </div>
      </div>
    </article>
  );
}

function MapView({ providers, onOpen }: { providers: Provider[]; onOpen: (id: string) => void }) {
  const { tx } = useTx();
  const [active, setActive] = useState(providers[0]?.id ?? "");
  return (
    <div>
      <div className="relative h-72 overflow-hidden rounded-3xl bg-[#D7EFE8]">
        <svg viewBox="0 0 300 220" className="absolute inset-0 h-full w-full">
          <path d="M0 120 C 40 90 80 150 140 110 S 240 60 300 100" stroke="#fff" strokeWidth="14" fill="none" />
          <path d="M40 0 C 70 60 40 120 90 220" stroke="#fff" strokeWidth="10" fill="none" />
          <circle cx="210" cy="48" r="28" fill="#B7E2C8" />
        </svg>
        {providers.map((provider) => {
          const x = ((provider.lng + 97.85) / 0.2) * 100;
          const y = ((30.4 - provider.lat) / 0.2) * 100;
          return (
            <button key={provider.id} type="button" className="absolute -translate-x-1/2 -translate-y-full" style={{ left: `${Math.min(90, Math.max(8, x))}%`, top: `${Math.min(86, Math.max(10, y))}%` }} onClick={() => { setActive(provider.id); onOpen(provider.id); }}>
              <span className="rounded-full bg-ink px-2 py-1 text-[11px] font-semibold text-white shadow-card">{provider.priceLabel}</span>
            </button>
          );
        })}
        <button type="button" className="absolute left-3 top-3 min-h-11 rounded-full bg-card px-3 text-[13px] font-semibold shadow-card">{tx("Search this area", "Buscar en esta zona")}</button>
        <button type="button" aria-label={tx("Current location", "Ubicación actual")} className="absolute bottom-3 right-3 grid h-11 w-11 place-items-center rounded-full bg-card shadow-card"><MapPin size={18} /></button>
      </div>
      <div className="mt-3 flex gap-3 overflow-x-auto">
        {providers.map((provider) => (
          <button key={provider.id} type="button" className={`w-48 shrink-0 rounded-2xl bg-card p-2 text-left shadow-card ${active === provider.id ? "ring-2 ring-primary" : ""}`} onClick={() => onOpen(provider.id)}>
            <Photo id={provider.photo} alt="" className="h-16 w-full rounded-xl" />
            <p className="mt-1 font-semibold">{provider.name}</p>
            <p className="text-[12px] text-muted-foreground">{provider.distance} mi</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export function ProviderScreen() {
  const nav = useNav();
  const kiddo = useKiddo();
  const { tx } = useTx();
  const id = nav.route.name === "provider" ? nav.route.id : "";
  const provider = providerById(id);
  const [photo, setPhoto] = useState(0);
  const saved = kiddo.family?.favorites.includes(provider.id) ?? false;
  const reviews = (kiddo.family?.reviews ?? []).filter((review) => review.providerId === provider.id);
  const similar = PROVIDERS.filter((item) => item.type === provider.type && item.id !== provider.id).slice(0, 3);
  const bars = [5, 4, 3, 2, 1].map((star) => ({ star, width: star === 5 ? 72 : star === 4 ? 18 : 6 }));
  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto pb-4">
        <div className="relative">
          <div className="flex snap-x snap-mandatory overflow-x-auto">
            {provider.gallery.map((image, index) => (
              <button key={image + index} type="button" className="w-full shrink-0 snap-center" onClick={() => { setPhoto(index); nav.push({ name: "photo", id: image, title: provider.name }); }}>
                <Photo id={image} alt={`${provider.name} photo ${index + 1}`} className="h-56 w-full" />
              </button>
            ))}
          </div>
          <div className="absolute bottom-3 left-0 right-0"><PageDots count={Math.min(provider.gallery.length, 6)} index={photo % 6} /></div>
          <div className="absolute left-3 top-3">
            <BackButton />
          </div>
        </div>
        <div className="space-y-4 px-5 pt-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-[28px] font-bold leading-tight">{provider.name}</h1>
              <StatusBadge status={provider.type} />
              <div className="mt-1"><RatingStars value={provider.rating} count={provider.reviewCount} /></div>
            </div>
            <div className="flex">
              <button type="button" aria-label="Share" className="grid h-11 w-11 place-items-center" onClick={() => shareText(provider.name, `${provider.name} · ${provider.address}`)}><Share2 size={18} /></button>
              <button type="button" aria-label="Favorite" className="grid h-11 w-11 place-items-center" onClick={() => kiddo.toggleFavorite(provider.id)}><Heart className={saved ? "fill-coral text-coral" : ""} size={18} /></button>
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {provider.badges.map((badge) => <span key={badge} className="rounded-full bg-surface px-2 py-1 text-[12px] font-semibold text-[var(--teal-ink)]">{badge}</span>)}
          </div>
          <Section title={tx("About", "Acerca de")} body={provider.about} />
          <Section title={tx("Philosophy", "Filosofía")} body={provider.philosophy} />
          <Section title={tx("Experience", "Experiencia")} body={`${provider.years} years. ${provider.roles}`} />
          <Section title={tx("Education and certifications", "Estudios y certificados")} body={provider.education.join(" · ")} />
          <Section title={tx("License", "Licencia")} body={provider.license ? `${provider.license.number} · ${provider.license.status} · exp ${provider.license.expires}` : tx("Individual caregiver. No center license required.", "Cuidador individual. No requiere licencia de centro.")} />
          {provider.license ? <button type="button" className="min-h-11 font-semibold text-[var(--teal-ink)]" onClick={() => nav.toast(tx("Texas HHSC child-care search", "Búsqueda de HHSC de Texas"), provider.license?.number)}>{tx("View state registry", "Ver registro estatal")}</button> : null}
          <button type="button" className="min-h-11 font-semibold text-[var(--teal-ink)]" onClick={() => nav.push({ name: "waitlist", id: provider.id })}>{tx("Join the waitlist", "Entrar a la lista de espera")}</button>
          <Section title={tx("Background check", "Antecedentes")} body={`${provider.background.status} · ${provider.background.vendor} · ${provider.background.date}`} />
          <div className="overflow-hidden rounded-2xl bg-card shadow-card">
            {provider.rates.map((rate) => (
              <div key={rate.label} className="flex justify-between border-b border-line px-4 py-3 last:border-0"><span>{rate.label}</span><span className="font-semibold">{rate.amount}</span></div>
            ))}
          </div>
          <Section title={tx("Hours", "Horario")} body={`${provider.hours}. ${provider.availability}`} />
          <Section title={tx("Capacity and ratio", "Cupo y proporción")} body={provider.capacity} />
          <Section title={tx("Ages", "Edades")} body={`${provider.ages}. ${provider.ageGroups.join(", ")}`} />
          <Section title={tx("Languages", "Idiomas")} body={provider.languages.join(", ")} />
          <Section title={tx("Meals and snacks", "Comidas")} body={provider.meals} />
          <Section title={tx("Curriculum", "Actividades")} body={provider.curriculum.join(" · ")} />
          <Section title={tx("Safety", "Seguridad")} body={provider.safety.join(" · ")} />
          <div className="rounded-2xl bg-card p-4 shadow-card">
            <h2 className="font-semibold">{tx("Location", "Ubicación")}</h2>
            <p className="text-[15px]">{provider.address}, {provider.city}, {provider.state} {provider.zip}</p>
            <a className="mt-2 inline-flex min-h-11 items-center font-semibold text-[var(--teal-ink)]" href={`https://maps.apple.com/?q=${encodeURIComponent(`${provider.address} ${provider.city}`)}`}>{tx("Directions", "Cómo llegar")}</a>
          </div>
          {provider.policies.map((policy) => <Section key={policy.label} title={policy.label} body={policy.text} />)}
          <div>
            <h2 className="text-[22px] font-semibold">{tx("Reviews", "Reseñas")}</h2>
            {bars.map((bar) => (
              <div key={bar.star} className="mt-1 flex items-center gap-2 text-[12px]">
                <span className="w-3">{bar.star}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted"><span className="block h-full bg-sun" style={{ width: `${bar.width}%` }} /></span>
              </div>
            ))}
            <div className="mt-3 space-y-3">
              {reviews.map((review) => (
                <article key={review.id} className="rounded-2xl bg-card p-3 shadow-card">
                  <div className="flex justify-between"><strong>{review.author}</strong><RatingStars value={review.rating} /></div>
                  <p className="text-[12px] text-muted-foreground">{review.date}</p>
                  <p className="mt-1 text-[15px]">{review.text}</p>
                  <div className="mt-1 flex flex-wrap gap-1">{review.tags.map((tag) => <span key={tag} className="rounded-full bg-surface px-2 text-[11px]">{tag}</span>)}</div>
                  {review.reply ? <p className="mt-2 rounded-xl bg-surface p-2 text-[14px]">{tx("Provider", "Proveedor")}: {review.reply}</p> : null}
                </article>
              ))}
            </div>
            <button type="button" className="mt-3 min-h-11 font-semibold text-[var(--teal-ink)]" onClick={() => nav.push({ name: "review", id: provider.id })}>{tx("Write a Review", "Escribir reseña")}</button>
          </div>
          <div>
            <h2 className="text-[22px] font-semibold">{tx("Similar providers", "Parecidos")}</h2>
            {similar.map((item) => (
              <button key={item.id} type="button" className="mt-2 flex w-full items-center gap-3 rounded-2xl bg-card p-3 text-left shadow-card" onClick={() => nav.push({ name: "provider", id: item.id })}>
                <img src={photoSrc(item.avatar)} alt="" className="h-12 w-12 rounded-full object-cover" />
                <span><span className="block font-semibold">{item.name}</span><span className="text-[13px] text-muted-foreground">{item.priceLabel}</span></span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 border-t border-line px-3 py-3">
        <AppButton variant="secondary" className="min-h-11 px-1 text-[13px]" onClick={() => nav.setTab("messages")}>{tx("Message", "Mensaje")}</AppButton>
        <AppButton variant="secondary" className="min-h-11 px-1 text-[13px]" onClick={() => nav.push({ name: "tour", id: provider.id })}>{tx("Tour", "Visita")}</AppButton>
        <AppButton className="min-h-11 px-1 text-[13px]" onClick={() => {
          kiddo.setDraft({
            providerId: provider.id,
            type: provider.type === "daycare" || provider.type === "infant" ? "enrollment" : "once",
            childIds: [],
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
            pickupId: kiddo.family?.pickups[0]?.id ?? "",
            promo: "",
          });
          nav.push({ name: "book", step: 0 });
        }}>{tx("Book", "Reservar")}</AppButton>
      </div>
    </div>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <section>
      <h2 className="text-[17px] font-semibold">{title}</h2>
      <p className="text-[15px] leading-relaxed text-muted-foreground">{body}</p>
    </section>
  );
}

export function FavoritesScreen() {
  const nav = useNav();
  const kiddo = useKiddo();
  const { tx } = useTx();
  const saved = PROVIDERS.filter((provider) => kiddo.family?.favorites.includes(provider.id));
  return (
    <div className="h-full overflow-y-auto px-5 py-4">
      <BackButton />
      <h1 className="text-[34px] font-bold">{tx("Favorites", "Favoritos")}</h1>
      {saved.length === 0 ? (
        <EmptyState image="emptyBookings" title={tx("No saved providers", "Sin proveedores guardados")} body={tx("Tap the heart on a profile to keep them here.", "Toca el corazón en un perfil para guardarlo aquí.")} action={tx("Browse", "Explorar")} onAction={() => nav.setTab("programs")} />
      ) : (
        <div className="mt-4 space-y-3">
          {saved.map((provider) => (
            <div key={provider.id} className="flex items-center gap-2">
              <div className="flex-1">
                <ProviderCard provider={provider} saved onOpen={() => nav.push({ name: "provider", id: provider.id })} onSave={() => kiddo.toggleFavorite(provider.id)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
