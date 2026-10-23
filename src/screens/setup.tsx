import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { useNav } from "@/app/nav";
import { BrandLogo } from "@/components/BrandLogo";
import { KidsStage } from "@/components/KidsStage";
import {
  AppButton,
  AppInput,
  AppSelect,
  BackButton,
  StepProgressBar,
  ToggleRow,
} from "@/components/ios";
import type { Child, Grade } from "@/data/types";
import { ageLabel } from "@/lib/dates";
import { useKiddo, useTx } from "@/lib/store";
import { formatPhone, lookupZip, uid } from "@/lib/validate";
import { photoSrc } from "@/data/photos";

const GRADES: Grade[] = ["Infant", "Toddler", "Preschool", "Pre-K", "Elementary"];

function blankChild(): Child {
  return {
    id: uid("child"),
    firstName: "",
    lastName: "",
    nickname: "",
    dob: "2022-06-01",
    gender: "Girl",
    grade: "Preschool",
    allergies: [],
    medical: "",
    medications: [],
    specialNeeds: "",
    diet: "",
    pediatrician: "",
    pediatricianPhone: "",
    insurance: "",
    memberId: "",
    notes: "",
    avatar: "",
  };
}

export function SetupScreen() {
  const nav = useNav();
  const kiddo = useKiddo();
  const { tx } = useTx();
  const step = nav.route.name === "setup" ? nav.route.step : 0;
  const family = kiddo.family;
  if (!family) return null;
  const body = (
    <div className="flex h-full flex-col">
      <div className="px-5 pt-4">
        <div className="mb-3 flex items-center justify-between">
          {step > 0 ? <BackButton /> : <span />}
          {step === 2 ? (
            <button
              type="button"
              className="min-h-11 font-semibold text-[#F7F4EE]"
              onClick={() => {
                kiddo.setSetupComplete(true);
                nav.resetHome();
                nav.push({ name: "setup-done" });
              }}
            >
              {tx("Skip for now", "Omitir por ahora")}
            </button>
          ) : null}
        </div>
        <StepProgressBar step={step + 1} total={3} label={tx(`Step ${step + 1} of 3`, `Paso ${step + 1} de 3`)} />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {step === 0 ? <ParentStep /> : null}
        {step === 1 ? <ChildStep /> : null}
        {step === 2 ? <EmergencyStep /> : null}
      </div>
    </div>
  );
  return <KidsStage>{body}</KidsStage>;
}

function ParentStep() {
  const nav = useNav();
  const { family, updateUser } = useKiddo();
  const { tx } = useTx();
  const user = family!.user;
  const [form, setForm] = useState(user);
  return (
    <div className="space-y-3 pb-8">
      <BrandLogo variant="white" className="h-14" />
      <h1 className="text-[28px] font-bold">{tx("Parent information", "Datos del padre o madre")}</h1>
      <button
        type="button"
        className="min-h-11 font-semibold text-[var(--teal-ink)]"
        onClick={async () => {
          const choice = await nav.actionSheet({
            title: tx("Profile photo", "Foto de perfil"),
            actions: [
              { id: "camera", label: tx("Take photo", "Tomar foto") },
              { id: "library", label: tx("Photo library", "Fototeca") },
            ],
          });
          if (choice) nav.toast(tx("Photo saved on this phone", "Foto guardada en este teléfono"));
        }}
      >
        {tx("Add profile photo", "Agregar foto de perfil")}
      </button>
      <AppInput label={tx("Full name", "Nombre completo")} value={`${form.firstName} ${form.lastName}`} onChange={(e) => {
        const [first, ...rest] = e.target.value.split(" ");
        setForm({ ...form, firstName: first ?? "", lastName: rest.join(" ") });
      }} />
      <AppInput label={tx("Preferred name", "Nombre preferido")} value={form.preferredName} onChange={(e) => setForm({ ...form, preferredName: e.target.value })} />
      <AppInput label={tx("Phone", "Teléfono")} value={form.phone} onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })} />
      <AppInput label={tx("Email", "Correo")} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <AppInput label={tx("Street", "Calle")} value={form.street} autoComplete="street-address" onChange={(e) => setForm({ ...form, street: e.target.value })} />
      <AppInput label={tx("Apt", "Apto")} value={form.apt} onChange={(e) => setForm({ ...form, apt: e.target.value })} />
      <AppInput label={tx("City", "Ciudad")} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
      <AppInput label={tx("State", "Estado")} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
      <AppInput
        label={tx("ZIP", "ZIP")}
        value={form.zip}
        inputMode="numeric"
        onChange={(e) => {
          const zip = e.target.value.replace(/\D/g, "").slice(0, 5);
          const found = lookupZip(zip);
          setForm({ ...form, zip, city: found?.city ?? form.city, state: found?.state ?? form.state });
        }}
      />
      <details className="rounded-2xl bg-card px-4">
        <summary className="flex min-h-12 cursor-pointer items-center text-[17px] font-semibold">{tx("Work (optional)", "Trabajo (opcional)")}</summary>
        <div className="space-y-3 pb-4">
          <AppInput label={tx("Employer", "Empleador")} value={form.employer} onChange={(e) => setForm({ ...form, employer: e.target.value })} />
          <AppInput label={tx("Work phone", "Teléfono del trabajo")} value={form.workPhone} onChange={(e) => setForm({ ...form, workPhone: formatPhone(e.target.value) })} />
        </div>
      </details>
      <AppButton
        onClick={() => {
          updateUser(form);
          nav.push({ name: "setup", step: 1 });
        }}
      >
        {tx("Continue", "Continuar")}
      </AppButton>
    </div>
  );
}

export function ChildStep() {
  const nav = useNav();
  const { family, upsertChild, removeChild } = useKiddo();
  const { tx, lang } = useTx();
  const [editing, setEditing] = useState<Child>(family?.children[0] ?? blankChild());
  const photoInput = useRef<HTMLInputElement>(null);
  const hasPhoto = Boolean(editing.avatar);
  const genders = [
    { id: "Boy" as const, label: tx("Boy", "Niño") },
    { id: "Girl" as const, label: tx("Girl", "Niña") },
    { id: "Prefer not to say" as const, label: tx("Skip", "Omitir") },
  ];
  const save = () => {
    upsertChild(editing);
  };
  return (
    <div className="space-y-3 pb-10">
      <h1 className="text-[28px] font-bold text-[#F7F4EE]">{tx("Add a child", "Agrega un niño")}</h1>
      <p className="text-[16px] text-[#D5E2EA]">{tx("Add a photo, then the basics. Extra care notes can wait.", "Agrega una foto y lo básico. Las notas de cuidado pueden esperar.")}</p>
      <button
        type="button"
        onClick={() => photoInput.current?.click()}
        className="flex w-full items-center gap-4 rounded-2xl bg-[#3A6294] p-4 text-left"
      >
        <span className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-[#E6F7F4] text-[#14685f]">
          {hasPhoto ? <img src={photoSrc(editing.avatar)} alt="" className="h-full w-full object-cover" /> : <Camera className="h-8 w-8" />}
        </span>
        <span>
          <span className="block text-[17px] font-semibold text-[#F7F4EE]">{hasPhoto ? tx("Change photo", "Cambiar foto") : tx("Upload a photo", "Subir una foto")}</span>
          <span className="mt-1 block text-[15px] text-[#D5E2EA]">{tx("Use a clear picture of your child.", "Usa una foto clara de tu hijo.")}</span>
        </span>
      </button>
      <input
        ref={photoInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => setEditing((current) => ({ ...current, avatar: String(reader.result || "") }));
          reader.readAsDataURL(file);
        }}
      />
      <AppInput label={tx("First name", "Nombre")} value={editing.firstName} onChange={(e) => setEditing({ ...editing, firstName: e.target.value })} />
      <AppInput label={tx("Last name", "Apellido")} value={editing.lastName} onChange={(e) => setEditing({ ...editing, lastName: e.target.value })} />
      <AppInput label={tx("Nickname", "Apodo")} value={editing.nickname} onChange={(e) => setEditing({ ...editing, nickname: e.target.value })} />
      <label className="block">
        <span className="mb-1 flex items-baseline justify-between text-[15px] font-medium text-[#E4EEF6]">
          <span>{tx("Date of birth", "Fecha de nacimiento")}</span>
          <span>{ageLabel(editing.dob, lang)}</span>
        </span>
        <input type="date" value={editing.dob} onChange={(event) => event.target.value && setEditing({ ...editing, dob: event.target.value })} className="min-h-[52px] w-full rounded-xl bg-surface px-3.5 text-[17px]" />
      </label>
      <div role="tablist" aria-label="Gender" className="grid grid-cols-3 gap-1 rounded-2xl bg-[#102033] p-1">
        {genders.map((option) => {
          const selected = editing.gender === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="tab"
              aria-selected={selected}
              className="min-h-11 rounded-xl text-[15px] font-semibold"
              style={{ backgroundColor: selected ? "#259f94" : "transparent", color: selected ? "#ffffff" : "#F7F4EE" }}
              onClick={() => setEditing({ ...editing, gender: option.id })}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      <AppSelect
        label={tx("Age group", "Grupo de edad")}
        value={editing.grade}
        options={GRADES.map((grade) => ({ value: grade, label: grade }))}
        onChange={(value) => setEditing({ ...editing, grade: value as Grade })}
      />
      <div className="space-y-2">
        {(family?.children ?? []).map((child) => (
          <div key={child.id} className="flex items-center justify-between rounded-2xl bg-card px-3 py-2 text-ink shadow-card">
            <button type="button" className="min-h-11 text-left" onClick={() => setEditing(child)}>
              {child.firstName} {child.lastName}
            </button>
            <button
              type="button"
              className="min-h-11 text-destructive"
              onClick={async () => {
                const ok = await nav.confirm({ title: tx("Remove child?", "¿Quitar niño?"), message: child.firstName, destructive: true, confirmLabel: tx("Delete", "Eliminar") });
                if (ok) removeChild(child.id);
              }}
            >
              {tx("Delete", "Eliminar")}
            </button>
          </div>
        ))}
      </div>
      <AppButton
        variant="secondary"
        onClick={() => {
          save();
          setEditing(blankChild());
        }}
      >
        {tx("Add another child", "Agregar otro niño")}
      </AppButton>
      <AppButton
        onClick={() => {
          save();
          nav.push({ name: "setup", step: 2 });
        }}
      >
        {tx("Continue", "Continuar")}
      </AppButton>
    </div>
  );
}

function EmergencyStep() {
  const nav = useNav();
  const { family, setContacts, setSetupComplete } = useKiddo();
  const { tx } = useTx();
  const [list, setList] = useState(family?.contacts ?? []);
  const [draft, setDraft] = useState({ name: "", relationship: "", phone: "", altPhone: "", canDecide: true });
  return (
    <div className="space-y-3 pb-8">
      <h1 className="text-[28px] font-bold">{tx("Emergency contacts", "Contactos de emergencia")}</h1>
      <p className="text-[15px] text-muted-foreground">{tx("Add the people we should call, in the order they should be reached.", "Agrega a las personas a las que debemos llamar, en orden.")}</p>
      {list.map((contact, index) => (
        <div key={contact.id} className="rounded-2xl bg-card p-3 text-ink shadow-card">
          <div className="flex items-center justify-between">
            <p className="font-semibold">{contact.name}</p>
            <span className="flex gap-2">
              <button type="button" aria-label="Move up" className="h-11 w-11" disabled={index === 0} onClick={() => {
                const next = [...list];
                const [item] = next.splice(index, 1);
                next.splice(index - 1, 0, item);
                setList(next);
              }}>↑</button>
              <button type="button" aria-label="Move down" className="h-11 w-11" disabled={index === list.length - 1} onClick={() => {
                const next = [...list];
                const [item] = next.splice(index, 1);
                next.splice(index + 1, 0, item);
                setList(next);
              }}>↓</button>
            </span>
          </div>
          <p className="text-[13px] text-muted-foreground">{contact.relationship} · {contact.phone}</p>
        </div>
      ))}
      <AppInput label={tx("Name", "Nombre")} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
      <AppInput label={tx("Relationship", "Relación")} value={draft.relationship} onChange={(e) => setDraft({ ...draft, relationship: e.target.value })} />
      <AppInput label={tx("Phone", "Teléfono")} value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: formatPhone(e.target.value) })} />
      <AppInput label={tx("Alternate phone", "Teléfono alterno")} value={draft.altPhone} onChange={(e) => setDraft({ ...draft, altPhone: formatPhone(e.target.value) })} />
      <ToggleRow label={tx("Can make decisions in emergencies", "Puede decidir en emergencias")} checked={draft.canDecide} onChange={(canDecide) => setDraft({ ...draft, canDecide })} />
      <AppButton
        variant="secondary"
        onClick={() => {
          setList([...list, { ...draft, id: uid("ec") }]);
          setDraft({ name: "", relationship: "", phone: "", altPhone: "", canDecide: true });
        }}
      >
        {tx("Add contact", "Agregar contacto")}
      </AppButton>
      <AppButton
        onClick={() => {
          const pending = draft.name || draft.relationship || draft.phone || draft.altPhone ? [...list, { ...draft, id: uid("ec") }] : list;
          setContacts(pending);
          setSetupComplete(true);
          nav.resetHome();
          nav.push({ name: "setup-done" });
        }}
      >
        {tx("Finish", "Terminar")}
      </AppButton>
    </div>
  );
}

function DoneArt() {
  return (
    <svg viewBox="0 0 160 160" className="h-40 w-40" aria-hidden="true">
      <circle cx="80" cy="80" r="74" fill="#1c3a52" />
      <circle cx="80" cy="80" r="58" fill="#E6F7F4" />
      <circle cx="80" cy="80" r="34" fill="#259f94" />
      <path d="M65 81 l10 10 21-24" fill="none" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SetupDoneScreen() {
  const nav = useNav();
  const { family } = useKiddo();
  const { tx } = useTx();
  const name = family?.user.firstName.trim();
  return (
    <KidsStage>
      <div className="flex h-full flex-col px-6 py-10 text-center">
        <BrandLogo variant="white" className="mx-auto h-14 object-center" />
        <div className="flex flex-1 flex-col items-center justify-center">
          <DoneArt />
          <h1 className="mt-6 text-[32px] font-bold leading-tight">{name ? tx(`You're all set, ${name}!`, `¡Todo listo, ${name}!`) : tx("You're all set!", "¡Todo listo!")}</h1>
          <p className="mt-3 max-w-[280px] text-[17px] leading-relaxed text-muted-foreground">
            {tx("Your family profile is ready. Find care, book a visit, or add a card whenever you like.", "El perfil de tu familia está listo. Busca cuidado, reserva una visita o agrega una tarjeta cuando quieras.")}
          </p>
        </div>
        <AppButton onClick={() => nav.resetHome()}>{tx("Go to Home", "Ir al inicio")}</AppButton>
      </div>
    </KidsStage>
  );
}

