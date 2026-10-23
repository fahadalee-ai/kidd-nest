import { useEffect, useState } from "react";
import { useNav } from "@/app/nav";
import { AppButton, BackButton, DocumentUploadTile, Group, ListRow, Photo, QrBlock, ScreenHeader, SegmentedControl, SignaturePad, StatusBadge, ToggleRow } from "@/components/ios";
import { photoSrc } from "@/data/photos";
import { providerById } from "@/data/providers";
import type { DocFolder, Invoice } from "@/data/types";
import { ageLabel, clockLabel, formatLong, groupLabel, iso } from "@/lib/dates";
import { useKiddo, useTx } from "@/lib/store";
import { downloadPdf, shareText } from "@/services/files";
import { uid, usd } from "@/lib/validate";

export function ChildScreen() {
  const nav = useNav();
  const { family } = useKiddo();
  const { tx, lang } = useTx();
  const id = nav.route.name === "child" ? nav.route.id : "";
  const child = family?.children.find((item) => item.id === id);
  const [tab, setTab] = useState<"Overview" | "Daily Log" | "Health" | "Milestones" | "Documents">("Overview");
  if (!family || !child) return null;
  const updates = family.updates.filter((item) => item.childId === child.id);
  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title={child.firstName} />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
        <div className="flex items-center gap-3">
          <img src={photoSrc(child.avatar)} alt="" className="h-16 w-16 rounded-full object-cover" />
          <div>
            <p className="text-[22px] font-semibold">{child.firstName} {child.lastName}</p>
            <p className="text-muted-foreground">{ageLabel(child.dob, lang)} · {child.grade}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {child.allergies.map((allergy) => (
            <span key={allergy} className="rounded-full bg-warning/20 px-3 py-1 text-[13px] font-semibold">{allergy}</span>
          ))}
        </div>
        <div className="mt-4">
          <SegmentedControl
            ariaLabel="Child tabs"
            value={tab}
            onChange={setTab}
            options={[
              { id: "Overview", label: tx("Overview", "Resumen") },
              { id: "Daily Log", label: tx("Log", "Día") },
              { id: "Health", label: tx("Health", "Salud") },
              { id: "Milestones", label: tx("Goals", "Logros") },
              { id: "Documents", label: tx("Docs", "Docs") },
            ]}
          />
        </div>
        <div className="mt-4 space-y-3 text-[15px]">
          {tab === "Overview" ? (
            <>
              <p>{tx("Today", "Hoy")}: {updates.find((item) => item.date === iso(0))?.title ?? tx("No update yet", "Aún no hay aviso")}</p>
              <AppButton onClick={() => nav.push({ name: "daily", id: child.id })}>{tx("Open daily log", "Abrir registro del día")}</AppButton>
            </>
          ) : null}
          {tab === "Daily Log" ? updates.slice(0, 6).map((item) => <p key={item.id}>{item.time} · {item.title}</p>) : null}
          {tab === "Health" ? (
            <>
              <p>{tx("Pediatrician", "Pediatra")}: {child.pediatrician} · {child.pediatricianPhone}</p>
              <p>{tx("Insurance", "Seguro")}: {child.insurance} · {child.memberId}</p>
              <p>{tx("Medications", "Medicamentos")}: {child.medications.map((med) => `${med.name} ${med.dose}`).join(", ") || tx("None", "Ninguno")}</p>
              <p>{child.medical || tx("No medical conditions on file.", "Sin condiciones médicas registradas.")}</p>
            </>
          ) : null}
          {tab === "Milestones" ? <p>{updates.find((item) => item.kind === "milestone")?.body ?? tx("Milestones will show up from the daily log.", "Los logros aparecen en el registro del día.")}</p> : null}
          {tab === "Documents" ? <AppButton variant="secondary" onClick={() => nav.push({ name: "documents" })}>{tx("Open vault", "Abrir archivo")}</AppButton> : null}
        </div>
      </div>
    </div>
  );
}

export function DailyScreen() {
  const nav = useNav();
  const { family } = useKiddo();
  const { tx, lang } = useTx();
  const id = nav.route.name === "daily" ? nav.route.id : "";
  const [day, setDay] = useState(iso(0));
  const [filter, setFilter] = useState("All");
  if (!family) return null;
  const days = [-3, -2, -1, 0, 1, 2, 3].map((offset) => iso(offset));
  const items = family.updates.filter((item) => item.childId === id && item.date === day && (filter === "All" || item.kind === filter.toLowerCase()));
  return (
    <div className="flex h-full flex-col">
      <ScreenHeader
        title={tx("Daily updates", "Avisos del día")}
        right={
          <button type="button" className="min-h-11 px-1 text-[13px] font-semibold text-[#8EE0D6]" onClick={async () => {
            const choice = await nav.actionSheet({ title: tx("Filter", "Filtro"), actions: ["All", "Meal", "Nap", "Photo", "Incident"].map((id) => ({ id, label: id })) });
            if (choice) setFilter(choice);
          }}>{filter}</button>
        }
      />
      <div className="flex gap-2 overflow-x-auto px-5">
        {days.map((date) => (
          <button key={date} type="button" onClick={() => setDay(date)} className={`min-h-11 min-w-14 rounded-2xl px-2 text-[12px] font-semibold ${day === date ? "bg-primary text-white" : "bg-card"}`}>
            {formatLong(date, lang).split(",")[0]}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl bg-card p-3 shadow-card">
            <p className="text-[12px] font-semibold text-primary">{item.kind} · {item.time}</p>
            <h2 className="font-semibold">{item.title}</h2>
            <p className="text-[15px] text-muted-foreground">{item.body}</p>
            {item.photo ? (
              <button type="button" className="mt-2 block w-full" onClick={() => nav.push({ name: "photo", id: item.photo!, title: item.title })}>
                <Photo id={item.photo} alt={item.title} className="h-36 w-full rounded-xl" />
              </button>
            ) : null}
            {item.kind === "incident" ? (
              <button type="button" className="mt-2 min-h-11 font-semibold text-[var(--teal-ink)]" onClick={() => nav.push({ name: "incident", id: "inc1" })}>
                {tx("Open incident report", "Abrir reporte")}
              </button>
            ) : null}
          </article>
        ))}
        <article className="rounded-2xl bg-surface p-4">
          <h2 className="font-semibold">{tx("Day summary", "Resumen del día")}</h2>
          <p className="text-[15px] text-muted-foreground">{items.length} {tx("updates", "avisos")} · {groupLabel(day, lang)}</p>
        </article>
      </div>
    </div>
  );
}

export function IncidentScreen() {
  const nav = useNav();
  const kiddo = useKiddo();
  const { tx } = useTx();
  const incident = kiddo.family?.incidents[0];
  const [signed, setSigned] = useState(false);
  if (!incident || !kiddo.family) return null;
  const provider = providerById(incident.providerId);
  return (
    <div className="h-full overflow-y-auto px-5 py-4">
      <BackButton />
      <h1 className="mt-2 text-[28px] font-bold">{tx("Incident report", "Reporte de incidente")}</h1>
      <p className="mt-1 text-muted-foreground">{incident.when}</p>
      <Photo id={incident.photo} alt="Classroom where the bump happened" className="mt-3 h-40 w-full rounded-2xl" />
      <Field label={tx("What happened", "Qué pasó")} value={incident.what} />
      <Field label={tx("Where", "Dónde")} value={incident.where} />
      <Field label={tx("Action taken", "Qué se hizo")} value={incident.action} />
      <Field label={tx("Staff", "Personal")} value={incident.staff} />
      <p className="mt-4 text-[13px] text-muted-foreground">{tx("Sign to acknowledge you have read this.", "Firma para confirmar que lo leíste.")}</p>
      <SignaturePad onChange={() => setSigned(true)} />
      <div className="mt-4 space-y-2 pb-8">
        <AppButton
          disabled={incident.acknowledged}
          onClick={() => {
            if (!signed && !incident.acknowledged) {
              nav.toast(tx("Add your signature", "Agrega tu firma"));
              return;
            }
            kiddo.acknowledgeIncident(incident.id);
            nav.toast(tx("Acknowledged", "Confirmado"));
          }}
        >
          {incident.acknowledged ? tx("Acknowledged", "Confirmado") : tx("Acknowledge", "Confirmar")}
        </AppButton>
        <AppButton variant="secondary" onClick={() => (window.location.href = `tel:${provider.phone.replace(/\D/g, "")}`)}>
          {tx("Call Provider", "Llamar al proveedor")}
        </AppButton>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <section className="mt-4">
      <h2 className="text-[13px] font-semibold text-muted-foreground">{label}</h2>
      <p className="text-[16px] leading-relaxed">{value}</p>
    </section>
  );
}

export function CheckinScreen() {
  const nav = useNav();
  const { family } = useKiddo();
  const { tx } = useTx();
  const [pin, setPin] = useState("4821");
  const [left, setLeft] = useState(60);
  useEffect(() => {
    const timer = window.setInterval(() => {
      setLeft((value) => {
        if (value <= 1) {
          setPin(String(1000 + Math.floor(Math.random() * 9000)));
          return 60;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);
  if (!family) return null;
  return (
    <div className="h-full overflow-y-auto px-5 py-4 text-center">
      <button type="button" className="min-h-11 font-semibold text-[var(--teal-ink)]" onClick={() => nav.pop()}>{tx("Close", "Cerrar")}</button>
      <h1 className="mt-2 text-[28px] font-bold">{tx("Check-in", "Entrada")}</h1>
      <p className="text-muted-foreground">{tx("Show this at the door. Refreshes every minute.", "Muéstralo en la puerta. Se actualiza cada minuto.")}</p>
      <div className="mt-4 flex justify-center"><QrBlock value={`${pin}-${left}`} /></div>
      <p className="mt-3 font-display text-[40px] font-bold tracking-[0.3em]">{pin}</p>
      <p className="text-[13px] text-muted-foreground">{left}s</p>
      <StatusBadge status={tx("Checked In", "Entró")} />
      <h2 className="mt-6 text-left text-[20px] font-semibold">{tx("Authorized pickup", "Autorizados")}</h2>
      <div className="mt-2 space-y-2 text-left">
        {family.pickups.map((person) => (
          <div key={person.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card">
            <img src={photoSrc(person.photo)} alt="" className="h-11 w-11 rounded-full object-cover" />
            <div>
              <p className="font-semibold">{person.name}</p>
              <p className="text-[13px] text-muted-foreground">{person.relationship} · PIN {person.pin}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 pb-8">
        <AppButton
          variant="destructive"
          onClick={async () => {
            const choice = await nav.actionSheet({
              title: tx("Emergency SOS", "Emergencia SOS"),
              actions: [
                { id: "provider", label: tx("Call provider", "Llamar al proveedor") },
                { id: "contact", label: tx("Call emergency contact", "Llamar al contacto") },
                { id: "911", label: tx("Call 911", "Llamar al 911"), destructive: true },
              ],
            });
            if (choice === "911") window.location.href = "tel:911";
            else if (choice === "provider") window.location.href = "tel:5125550142";
            else if (choice === "contact") window.location.href = "tel:5125550192";
          }}
        >
          {tx("Emergency SOS", "Emergencia SOS")}
        </AppButton>
      </div>
    </div>
  );
}

export function InvoicesScreen() {
  const nav = useNav();
  const kiddo = useKiddo();
  const { tx, lang } = useTx();
  const [tab, setTab] = useState<"Due" | "Paid" | "Overdue">("Due");
  const family = kiddo.family;
  if (!family) return null;
  const list = family.invoices.filter((invoice) => invoice.status === tab);
  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title={tx("Invoices", "Facturas")} />
      <div className="px-5">
        <ToggleRow label={tx("Auto-pay", "Pago automático")} checked={family.autopay} onChange={() => kiddo.toggleAutopay()} />
        <SegmentedControl ariaLabel="Invoices" value={tab} onChange={setTab} options={[{ id: "Due", label: tx("Due", "Por pagar") }, { id: "Paid", label: tx("Paid", "Pagadas") }, { id: "Overdue", label: tx("Overdue", "Vencidas") }]} />
      </div>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-5 py-4">
        {list.length === 0 ? <p className="text-center text-muted-foreground">{tx("Nothing in this tab.", "Nada en esta pestaña.")}</p> : null}
        {list.map((invoice) => (
          <button key={invoice.id} type="button" className="flex w-full items-center justify-between rounded-2xl bg-card p-4 text-left shadow-card" onClick={() => nav.push({ name: "invoice", id: invoice.id })}>
            <span>
              <span className="block font-semibold">{invoice.number}</span>
              <span className="text-[13px] text-muted-foreground">{providerById(invoice.providerId).name} · {formatLong(invoice.due, lang)}</span>
            </span>
            <span className="text-right">
              <span className="block font-semibold">{usd(total(invoice))}</span>
              <StatusBadge status={invoice.status} />
            </span>
          </button>
        ))}
        <AppButton variant="secondary" onClick={() => downloadPdf("kiddonest-dependent-care-2026.pdf", ["KiddoNest", "Dependent care tax statement", "Sarah Chen", "Tax year 2026", "Provider: Little Nest Academy", "Amount paid: $2,650.00", "This is a preview statement, not a filed tax form."])}>
          {tx("Dependent care tax statement", "Estado de cuenta para impuestos")}
        </AppButton>
      </div>
    </div>
  );
}

function total(invoice: Invoice) {
  return invoice.lines.reduce((sum, line) => sum + line.amount, 0);
}

export function InvoiceScreen() {
  const nav = useNav();
  const kiddo = useKiddo();
  const { tx, lang } = useTx();
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState("Apple Pay");
  const id = nav.route.name === "invoice" ? nav.route.id : "";
  const invoice = kiddo.family?.invoices.find((item) => item.id === id);
  if (!invoice || !kiddo.family) return null;
  const provider = providerById(invoice.providerId);
  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <BackButton />
        <h1 className="text-[28px] font-bold">{invoice.number}</h1>
        <p className="text-muted-foreground">{provider.name}</p>
        <StatusBadge status={invoice.status} />
        <p className="mt-3 text-[15px]">{tx("Due", "Vence")} {formatLong(invoice.due, lang)}</p>
        <div className="mt-4 divide-y divide-line rounded-2xl bg-card shadow-card">
          {invoice.lines.map((line) => (
            <div key={line.label} className="flex justify-between px-4 py-3">
              <span>{line.label}</span>
              <span>{usd(line.amount)}</span>
            </div>
          ))}
          <div className="flex justify-between px-4 py-3 font-semibold">
            <span>{tx("Total", "Total")}</span>
            <span>{usd(total(invoice))}</span>
          </div>
        </div>
      </div>
      {invoice.status !== "Paid" ? (
        <div className="px-5 py-3">
          <AppButton onClick={() => setOpen(true)}>{tx("Pay Now", "Pagar ahora")}</AppButton>
        </div>
      ) : (
        <div className="px-5 py-3">
          <AppButton variant="secondary" onClick={() => nav.push({ name: "receipt", id: invoice.id })}>{tx("View receipt", "Ver recibo")}</AppButton>
        </div>
      )}
      {open ? (
        <div className="absolute inset-x-0 bottom-0 z-30 rounded-t-3xl bg-card p-5 shadow-card">
          <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-line" />
          <h2 className="text-[20px] font-semibold">{tx("Pay", "Pagar")} {usd(total(invoice))}</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">{tx("You will not be charged until the provider confirms a new booking. Invoices charge now.", "Una reserva nueva no se cobra hasta que el proveedor confirme. Las facturas se cobran ahora.")}</p>
          {["Apple Pay", "Visa ···· 4242", "ACH bank"].map((item) => (
            <button key={item} type="button" className={`mt-2 min-h-11 w-full rounded-xl ${method === item ? "bg-surface font-semibold" : ""}`} onClick={() => setMethod(item)}>{item}</button>
          ))}
          <div className="mt-3">
            <AppButton
              onClick={async () => {
                await kiddo.payInvoice(invoice.id, method);
                setOpen(false);
                nav.push({ name: "receipt", id: invoice.id });
              }}
            >
              {tx("Confirm payment", "Confirmar pago")}
            </AppButton>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ReceiptScreen() {
  const nav = useNav();
  const { family } = useKiddo();
  const { tx } = useTx();
  const id = nav.route.name === "receipt" ? nav.route.id : "";
  const invoice = family?.invoices.find((item) => item.id === id);
  if (!invoice) return null;
  const lines = ["KiddoNest receipt", invoice.number, providerById(invoice.providerId).name, `Total ${usd(total(invoice))}`, `Paid ${invoice.paidAt || iso(0)}`];
  return (
    <div className="flex h-full flex-col items-center px-6 py-10 text-center">
      <h1 className="text-[28px] font-bold">{tx("Payment received", "Pago recibido")}</h1>
      <p className="mt-2 text-muted-foreground">{invoice.number}</p>
      <p className="mt-4 text-[34px] font-bold">{usd(total(invoice))}</p>
      <div className="mt-8 w-full space-y-2">
        <AppButton onClick={() => downloadPdf(`${invoice.number}.pdf`, lines)}>{tx("Download PDF", "Descargar PDF")}</AppButton>
        <AppButton variant="secondary" onClick={() => shareText("KiddoNest receipt", lines.join("\n"))}>{tx("Share", "Compartir")}</AppButton>
        <AppButton variant="tertiary" onClick={() => nav.pop()}>{tx("Done", "Listo")}</AppButton>
      </div>
    </div>
  );
}

export function DocumentsScreen() {
  const nav = useNav();
  const kiddo = useKiddo();
  const { tx } = useTx();
  const [folder, setFolder] = useState<DocFolder>("Enrollment");
  const family = kiddo.family;
  if (!family) return null;
  const docs = family.documents.filter((doc) => doc.folder === folder);
  const folders: DocFolder[] = ["Enrollment", "Medical", "Immunization", "Consent", "Receipts"];
  return (
    <div className="h-full overflow-y-auto px-5 py-4">
      <BackButton />
      <h1 className="text-[28px] font-bold">{tx("Documents", "Documentos")}</h1>
      <div className="mt-3 flex gap-2 overflow-x-auto">
        {folders.map((item) => (
          <button key={item} type="button" className={`min-h-11 shrink-0 rounded-full px-3 text-[13px] font-semibold ${folder === item ? "bg-primary text-white" : "bg-card"}`} onClick={() => setFolder(item)}>{item}</button>
        ))}
      </div>
      <div className="mt-4">
        <DocumentUploadTile
          label={tx("Upload from camera, scan, or files", "Subir desde cámara, escaneo o archivos")}
          onPick={async () => {
            const choice = await nav.actionSheet({
              title: tx("Add a document", "Agregar documento"),
              actions: [
                { id: "camera", label: tx("Camera", "Cámara") },
                { id: "scan", label: tx("Scan", "Escanear") },
                { id: "files", label: tx("Files", "Archivos") },
              ],
            });
            if (!choice) return;
            kiddo.addDocument({ id: uid("doc"), folder, name: `${choice} upload`, date: iso(0), expires: "", pendingSign: false });
            nav.toast(tx("Saved in your vault", "Guardado en tu archivo"));
          }}
        />
      </div>
      <div className="mt-4">
        {docs.length === 0 ? <p className="text-muted-foreground">{tx("This folder is empty.", "Esta carpeta está vacía.")}</p> : null}
        <Group>
          {docs.map((doc) => (
            <ListRow
              key={doc.id}
              title={doc.name}
              detail={`${doc.date}${doc.expires ? ` · ${tx("expires", "vence")} ${doc.expires}` : ""}${doc.pendingSign ? ` · ${tx("signature needed", "falta firma")}` : ""}`}
              onClick={() => {
                if (doc.pendingSign) kiddo.signDocument(doc.id);
                nav.toast(doc.pendingSign ? tx("Signed", "Firmado") : doc.name);
              }}
            />
          ))}
        </Group>
      </div>
    </div>
  );
}

export function PhotoScreen() {
  const nav = useNav();
  const { tx } = useTx();
  const route = nav.route.name === "photo" ? nav.route : null;
  if (!route) return null;
  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title={route.title} />
      <div className="grid flex-1 place-items-center">
        <Photo id={route.id} alt={route.title} className="max-h-[70%] w-full" />
      </div>
      <div className="grid grid-cols-2 gap-2 px-5 py-4">
        <button type="button" className="min-h-11 rounded-xl bg-card font-semibold text-[#F7F4EE]" onClick={() => nav.toast(tx("Saved to photos", "Guardada en fotos"))}>{tx("Save", "Guardar")}</button>
        <button type="button" className="min-h-11 rounded-xl bg-card font-semibold text-[#F7F4EE]" onClick={() => shareText(route.title, route.title)}>{tx("Share", "Compartir")}</button>
      </div>
    </div>
  );
}
