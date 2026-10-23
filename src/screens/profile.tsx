import { useState, type ReactNode } from "react";
import { Bell, ChevronRight, CreditCard, FileText, FolderClosed, HeartHandshake, LifeBuoy, Phone, Shield, Smile, UserRound } from "lucide-react";
import { useNav } from "@/app/nav";
import { BrandLogo } from "@/components/BrandLogo";
import { brand, brandAddress } from "@/config/brand";
import { AppButton, AppInput, BackButton, Group, ListRow, ToggleRow } from "@/components/ios";
import { photoSrc } from "@/data/photos";
import type { Lang } from "@/data/types";
import { useKiddo, useTx } from "@/lib/store";
import { cardBrand, formatCard, formatPhone, uid } from "@/lib/validate";

function ProfileRow({ icon, title, detail, onClick }: { icon: ReactNode; title: string; detail?: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex min-h-[60px] w-full items-center gap-3 px-4 py-2 text-left">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#E6F7F4] text-[#14685f]">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[17px] font-semibold text-[#F7F4EE]">{title}</span>
        {detail ? <span className="block truncate text-[13px] text-[#D5E2EA]">{detail}</span> : null}
      </span>
      <ChevronRight size={18} className="shrink-0 text-[#D5E2EA]" aria-hidden />
    </button>
  );
}

export function ProfileScreen() {
  const nav = useNav();
  const kiddo = useKiddo();
  const { tx } = useTx();
  const user = kiddo.user;
  const family = kiddo.family;
  if (!user) return null;
  const children = family?.children.map((child) => child.firstName).join(", ");
  const sections: { label: string; rows: { title: string; detail?: string; icon: ReactNode; route: Parameters<typeof nav.push>[0] }[] }[] = [
    {
      label: tx("Family", "Familia"),
      rows: [
        { title: tx("Edit Profile", "Editar perfil"), detail: user.phone || user.email, icon: <UserRound size={20} />, route: { name: "edit-profile" } },
        { title: tx("Manage Children", "Niños"), detail: children || tx("Add a child", "Agregar un niño"), icon: <Smile size={20} />, route: { name: "manage-children" } },
        { title: tx("Emergency Contacts", "Contactos de emergencia"), detail: tx("Who we call first", "A quién llamamos primero"), icon: <Phone size={20} />, route: { name: "emergency" } },
      ],
    },
    {
      label: tx("Center", "Centro"),
      rows: [
        { title: tx("Tuition and Billing", "Colegiatura y pagos"), detail: tx("Invoices and receipts", "Facturas y recibos"), icon: <CreditCard size={20} />, route: { name: "invoices" } },
        { title: tx("Documents", "Documentos"), detail: tx("Forms and records", "Formularios y registros"), icon: <FolderClosed size={20} />, route: { name: "documents" } },
        { title: tx("About the Center", "El centro"), detail: brand.city, icon: <HeartHandshake size={20} />, route: { name: "legal", doc: "about" } },
      ],
    },
    {
      label: tx("Preferences", "Preferencias"),
      rows: [
        { title: tx("Notifications", "Avisos"), icon: <Bell size={20} />, route: { name: "notif-prefs" } },
        { title: tx("Privacy and Data", "Privacidad y datos"), icon: <Shield size={20} />, route: { name: "privacy" } },
      ],
    },
    {
      label: tx("Support", "Ayuda"),
      rows: [
        { title: tx("Help Center", "Ayuda"), icon: <LifeBuoy size={20} />, route: { name: "help" } },
        { title: tx("Contact Support", "Contactar soporte"), detail: brand.phone, icon: <Phone size={20} />, route: { name: "support" } },
        { title: tx("Terms of Service", "Términos"), icon: <FileText size={20} />, route: { name: "legal", doc: "terms" } },
        { title: tx("Privacy Policy", "Privacidad"), icon: <Shield size={20} />, route: { name: "legal", doc: "privacy" } },
      ],
    },
  ];
  return (
    <div className="h-full overflow-y-auto px-5 pb-8 pt-4">
      <h1 className="text-[34px] font-bold text-[#F7F4EE]">{tx("Profile", "Perfil")}</h1>
      <button type="button" onClick={() => nav.push({ name: "edit-profile" })} className="mt-4 flex w-full items-center gap-4 rounded-2xl bg-[#3A6294] p-4 text-left shadow-card">
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#259f94] text-[24px] font-bold text-white">{user.firstName.slice(0, 1) || "P"}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[20px] font-semibold text-[#F7F4EE]">{user.firstName} {user.lastName}</span>
          <span className="mt-0.5 block truncate text-[15px] text-[#D5E2EA]">{user.email}</span>
          <span className="mt-0.5 block truncate text-[14px] text-[#D5E2EA]">{[user.phone, user.city].filter(Boolean).join(" · ") || brand.name}</span>
        </span>
        <ChevronRight size={20} className="shrink-0 text-[#D5E2EA]" aria-hidden />
      </button>

      {sections.map((section) => (
        <section key={section.label} className="mt-6">
          <h2 className="mb-2 px-1 text-[13px] font-semibold uppercase tracking-wide text-[#D5E2EA]">{section.label}</h2>
          <div className="divide-y divide-[#6D8EB8] overflow-hidden rounded-2xl bg-[#3A6294] shadow-card">
            {section.rows.map((row) => (
              <ProfileRow key={row.title} icon={row.icon} title={row.title} detail={row.detail} onClick={() => nav.push(row.route)} />
            ))}
          </div>
        </section>
      ))}

      <button
        type="button"
        className="mt-6 min-h-[52px] w-full rounded-lg bg-[#3A6294] text-[17px] font-semibold text-[#F7F4EE]"
        onClick={async () => {
          const ok = await nav.confirm({ title: tx("Log out?", "¿Cerrar sesión?"), message: tx("You can sign back in any time.", "Puedes volver a entrar cuando quieras.") });
          if (ok) {
            kiddo.logout();
            nav.resetAuth({ name: "login" });
          }
        }}
      >
        {tx("Log Out", "Cerrar sesión")}
      </button>
      <button
        type="button"
        className="mt-2 min-h-11 w-full text-[15px] font-semibold text-[#FF8D90]"
        onClick={async () => {
          const ok = await nav.confirm({
            title: tx("Delete your account?", "¿Eliminar tu cuenta?"),
            message: tx("This removes the family profile from this phone.", "Esto quita el perfil de este teléfono."),
            destructive: true,
            confirmLabel: tx("Delete", "Eliminar"),
          });
          if (ok) {
            kiddo.deleteAccount();
            nav.resetAuth({ name: "login" });
          }
        }}
      >
        {tx("Delete Account", "Eliminar cuenta")}
      </button>
      <p className="mt-6 pb-2 text-center text-[13px] text-[#D5E2EA]">{brand.name} · {tx("Version 1.0.0", "Versión 1.0.0")}</p>
    </div>
  );
}

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="h-full overflow-y-auto px-5 py-4">
      <BackButton />
      <h1 className="mb-4 text-[28px] font-bold">{title}</h1>
      {children}
    </div>
  );
}

export function EditProfileScreen() {
  const kiddo = useKiddo();
  const { tx } = useTx();
  const user = kiddo.user!;
  const [form, setForm] = useState(user);
  return (
    <Shell title={tx("Edit profile", "Editar perfil")}>
      <div className="space-y-3">
        <AppInput label={tx("Preferred name", "Nombre preferido")} value={form.preferredName} onChange={(e) => setForm({ ...form, preferredName: e.target.value })} />
        <AppInput label={tx("Phone", "Teléfono")} value={form.phone} onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })} />
        <AppInput label={tx("Street", "Calle")} value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} />
        <AppInput label={tx("City", "Ciudad")} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        <AppInput label={tx("ZIP", "ZIP")} value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} />
        <AppButton onClick={() => { kiddo.updateUser(form); }}>{tx("Save", "Guardar")}</AppButton>
      </div>
    </Shell>
  );
}

export function ManageChildrenScreen() {
  const nav = useNav();
  const kiddo = useKiddo();
  const { tx } = useTx();
  return (
    <Shell title={tx("Children", "Niños")}>
      <div className="space-y-3">
        {kiddo.family?.children.map((child) => (
          <div key={child.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card">
            <img src={photoSrc(child.avatar)} alt="" className="h-12 w-12 rounded-full" />
            <div className="flex-1">
              <p className="font-semibold">{child.firstName} {child.lastName}</p>
              <p className="text-[13px] text-muted-foreground">{child.allergies.join(", ") || tx("No allergies", "Sin alergias")}</p>
            </div>
            <button type="button" className="min-h-11 text-destructive" onClick={async () => {
              const ok = await nav.confirm({ title: tx("Remove child?", "¿Quitar niño?"), message: child.firstName, destructive: true, confirmLabel: tx("Delete", "Eliminar") });
              if (ok) kiddo.removeChild(child.id);
            }}>{tx("Delete", "Eliminar")}</button>
          </div>
        ))}
        <AppButton onClick={() => nav.push({ name: "setup", step: 1 })}>{tx("Add another child", "Agregar otro niño")}</AppButton>
      </div>
    </Shell>
  );
}

export function EmergencyScreen() {
  const { family } = useKiddo();
  const { tx } = useTx();
  return (
    <Shell title={tx("Emergency contacts", "Contactos de emergencia")}>
      <Group>
        {family?.contacts.map((contact) => (
          <ListRow key={contact.id} title={contact.name} detail={`${contact.relationship} · ${contact.phone}${contact.canDecide ? " · can decide" : ""}`} />
        ))}
      </Group>
    </Shell>
  );
}

export function PickupsScreen() {
  const { family } = useKiddo();
  const { tx } = useTx();
  return (
    <Shell title={tx("Authorized pickups", "Personas autorizadas")}>
      <p className="mb-3 rounded-2xl bg-warning/15 p-3 text-[14px]">{tx("Only people on this list can pick up your child.", "Solo las personas de esta lista pueden recoger a tu hijo.")}</p>
      {family?.pickups.map((person) => (
        <div key={person.id} className="mb-2 flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card">
          <img src={photoSrc(person.photo)} alt="" className="h-12 w-12 rounded-full object-cover" />
          <div>
            <p className="font-semibold">{person.name}</p>
            <p className="text-[13px] text-muted-foreground">{person.relationship} · {person.phone}</p>
          </div>
        </div>
      ))}
    </Shell>
  );
}

export function PaymentsScreen() {
  const nav = useNav();
  const kiddo = useKiddo();
  const { tx } = useTx();
  const [number, setNumber] = useState("");
  const [exp, setExp] = useState("");
  const [zip, setZip] = useState("78704");
  const [fsa, setFsa] = useState(false);
  return (
    <Shell title={tx("Payment methods", "Métodos de pago")}>
      <div className="space-y-3">
        {kiddo.family?.cards.map((card) => (
          <div key={card.id} className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-card">
            <div>
              <p className="font-semibold">{card.brand} ···· {card.last4}</p>
              <p className="text-[13px] text-muted-foreground">{card.exp} {card.fsa ? "· FSA/HSA" : ""} {card.isDefault ? "· default" : ""}</p>
            </div>
            <button type="button" className="min-h-11 text-[var(--teal-ink)]" onClick={() => kiddo.setDefaultCard(card.id)}>{tx("Default", "Principal")}</button>
          </div>
        ))}
        <AppInput label={tx("Card number", "Tarjeta")} value={number} onChange={(e) => setNumber(formatCard(e.target.value))} autoComplete="cc-number" />
        <AppInput label={tx("Exp", "Vence")} value={exp} onChange={(e) => setExp(e.target.value)} placeholder="MM/YY" />
        <AppInput label="ZIP" value={zip} onChange={(e) => setZip(e.target.value)} />
        <ToggleRow label={tx("FSA/HSA card", "Tarjeta FSA/HSA")} checked={fsa} onChange={setFsa} />
        <AppButton
          onClick={() => {
            if (number.replace(/\D/g, "").length < 13) {
              nav.toast(tx("Enter a full card number", "Ingresa el número completo"));
              return;
            }
            kiddo.addCard({ id: uid("card"), brand: cardBrand(number), last4: number.replace(/\D/g, "").slice(-4), exp: exp || "12/28", zip, fsa, isDefault: (kiddo.family?.cards.length ?? 0) === 0 });
            setNumber("");
            nav.toast(tx("Card saved", "Tarjeta guardada"));
          }}
        >
          {tx("Add card", "Agregar tarjeta")}
        </AppButton>
      </div>
    </Shell>
  );
}

export function LanguageScreen() {
  const kiddo = useKiddo();
  const { tx } = useTx();
  const options: { id: Lang; label: string }[] = [{ id: "en", label: "English" }];
  return (
    <Shell title={tx("Language", "Idioma")}>
      <Group>
        {options.map((option) => (
          <ListRow key={option.id} title={option.label} trailing={kiddo.lang === option.id ? "✓" : ""} onClick={() => kiddo.setLang(option.id)} />
        ))}
      </Group>
    </Shell>
  );
}

export function NotifPrefsScreen() {
  const kiddo = useKiddo();
  const { tx } = useTx();
  return (
    <Shell title={tx("Notifications", "Avisos")}>
      {Object.entries(kiddo.family?.notifPrefs ?? {}).map(([key, value]) => (
        <ToggleRow key={key} label={key} checked={value} onChange={() => kiddo.toggleNotif(key)} />
      ))}
    </Shell>
  );
}

export function PrivacyScreen() {
  const nav = useNav();
  const kiddo = useKiddo();
  const { tx } = useTx();
  const consents = kiddo.family?.consents;
  return (
    <Shell title={tx("Privacy and data", "Privacidad y datos")}>
      <p className="text-[15px] leading-relaxed text-muted-foreground">{tx("KiddoNest stores health notes only so caregivers you book can keep your child safe. You can turn off photo sharing. This preview keeps data on this phone.", "KiddoNest guarda notas de salud solo para que los cuidadores que reservas puedan cuidar a tu hijo. Puedes apagar el uso de fotos. Esta vista previa guarda los datos en este teléfono.")}</p>
      <ToggleRow label={tx("Allow photo sharing", "Permitir fotos")} checked={Boolean(consents?.photos)} onChange={(photos) => consents && kiddo.setConsents({ ...consents, photos })} />
      <ToggleRow label={tx("Emergency treatment consent", "Consentimiento médico")} checked={Boolean(consents?.medical)} onChange={(medical) => consents && kiddo.setConsents({ ...consents, medical })} />
      <AppButton variant="secondary" onClick={() => nav.toast(tx("Export started", "Exportación lista"), tx("A copy of your family file is ready in this preview.", "Una copia del archivo familiar está lista en esta vista previa."))}>{tx("Download my data", "Descargar mis datos")}</AppButton>
    </Shell>
  );
}

export function HelpScreen() {
  const { tx } = useTx();
  const faqs = [
    [tx("How do background checks work?", "¿Cómo funcionan los antecedentes?"), tx("Centers show a state license. Individual caregivers show a Checkr clear date on their profile.", "Los centros muestran licencia estatal. Los cuidadores muestran la fecha de Checkr en su perfil.")],
    [tx("When am I charged?", "¿Cuándo me cobran?"), tx("Bookings are authorized and captured after the provider confirms. Invoices charge when you tap Pay.", "Las reservas se cobran cuando el proveedor confirma. Las facturas se cobran al pulsar Pagar.")],
    [tx("Who can pick up my child?", "¿Quién puede recoger a mi hijo?"), tx("Only people on your authorized list, with their photo and PIN.", "Solo las personas de tu lista, con foto y PIN.")],
  ];
  return (
    <Shell title={tx("Help Center", "Ayuda")}>
      {faqs.map(([q, a]) => (
        <details key={q} className="mb-2 rounded-2xl bg-card px-3 py-2 shadow-card">
          <summary className="min-h-11 cursor-pointer font-semibold">{q}</summary>
          <p className="pb-3 text-[15px] text-muted-foreground">{a}</p>
        </details>
      ))}
    </Shell>
  );
}

export function SupportScreen() {
  const nav = useNav();
  const { tx } = useTx();
  const [topic, setTopic] = useState("Billing");
  const [message, setMessage] = useState("");
  return (
    <Shell title={tx("Contact support", "Contactar soporte")}>
      <div className="space-y-3">
        <AppInput label={tx("Topic", "Tema")} value={topic} onChange={(e) => setTopic(e.target.value)} />
        <AppInput multiline label={tx("How can we help?", "¿Cómo te ayudamos?")} value={message} onChange={(e) => setMessage(e.target.value)} />
        <AppButton onClick={() => { if (!message.trim()) return; nav.toast(tx("Message sent", "Mensaje enviado"), tx("A specialist replies within one business day.", "Un especialista responde en un día hábil.")); setMessage(""); }}>{tx("Send", "Enviar")}</AppButton>
        <a className="block min-h-11 text-center font-semibold text-[var(--teal-ink)]" href="tel:5125550190">{tx("Call (512) 555-0190", "Llamar (512) 555-0190")}</a>
      </div>
    </Shell>
  );
}

export function LegalScreen() {
  const nav = useNav();
  const { tx } = useTx();
  const doc = nav.route.name === "legal" ? nav.route.doc : "about";
  const copy = {
    terms: {
      title: tx("Terms of Service", "Términos"),
      body: tx("KiddoNest introduces parents to independent caregivers and licensed programs in the United States. You are responsible for confirming that a provider fits your child. Bookings, cancellations, and refunds follow the policy shown before you pay. The app is a preview and does not move real money.", "KiddoNest presenta a las familias con cuidadores independientes y programas con licencia en Estados Unidos. Tú confirmas que el proveedor es adecuado. Las reservas y reembolsos siguen la política que ves antes de pagar. Esta app es una vista previa y no mueve dinero real."),
    },
    privacy: {
      title: tx("Privacy Policy", "Privacidad"),
      body: tx("We collect parent contact details, child care notes, and documents you upload so booked providers can do their job. Health details are shown only inside your account and to the provider on an active booking. You may export or delete the profile from Privacy and Data. Children under 13 do not create accounts; a parent or guardian must.", "Recopilamos datos de contacto, notas de cuidado y documentos que subes para que el proveedor reservado pueda trabajar. Los datos de salud se ven solo en tu cuenta y con el proveedor de una reserva activa. Puedes exportar o borrar el perfil. Los menores de 13 años no crean cuentas; debe hacerlo un padre o tutor."),
    },
    about: {
      title: tx("About the Center", "El centro"),
      body: tx(
        `${brand.name} is a company-owned child care center at ${brandAddress}. State license ${brand.license}. Hours ${brand.hours}. Phone ${brand.phone}. Teachers are KiddoNest employees. Version 1.0.0.`,
        `${brand.name} es un centro propio en ${brandAddress}. Licencia ${brand.license}. Horario ${brand.hours}. Teléfono ${brand.phone}. Los maestros son empleados de KiddoNest. Versión 1.0.0.`,
      ),
    },
  }[doc];
  return (
    <Shell title={copy.title}>
      {doc === "about" ? <BrandLogo className="mb-5 h-[72px]" /> : null}
      <p className="text-[16px] leading-relaxed">{copy.body}</p>
    </Shell>
  );
}
