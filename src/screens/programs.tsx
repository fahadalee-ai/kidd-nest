import { useNav } from "@/app/nav";
import { AppButton, BackButton } from "@/components/ios";
import { PROGRAMS, STAFF, programById, staffById } from "@/data/center";
import { centerDraft } from "@/screens/booking";
import { photoSrc } from "@/data/photos";
import { useKiddo, useTx } from "@/lib/store";

export function ProgramsScreen() {
  const nav = useNav();
  const { tx, lang } = useTx();
  return (
    <div className="h-full overflow-y-auto px-5 pb-8 pt-4">
      <h1 className="text-[34px] font-bold">{tx("Programs", "Programas")}</h1>
      <p className="mt-1 text-[16px] text-muted-foreground">{tx("Every program is taught by KiddoNest teachers at our Austin center.", "Todos los programas los dan maestros de KiddoNest en nuestro centro de Austin.")}</p>
      <div className="mt-5 flex flex-col gap-4">
        {PROGRAMS.map((program) => {
          const spots = program.availability === "Waitlist" ? tx("Waitlist", "Lista de espera") : `${program.spots} ${tx("left", "libres")}`;
          return (
            <button key={program.id} type="button" onClick={() => nav.push({ name: "program", id: program.id })} className="overflow-hidden rounded-lg bg-card text-left shadow-card">
              <img src={photoSrc(program.photo)} alt="" className="h-36 w-full object-cover" />
              <span className="block px-4 py-4">
                <span className="flex items-start justify-between gap-3">
                  <span className="text-[20px] font-semibold leading-tight text-[#F7F4EE]">{lang === "es" ? program.nameEs : program.name}</span>
                  <span className="shrink-0 rounded-md bg-[#14263e] px-2 py-1 text-[12px] font-semibold text-[#8EE0D6]">{program.availability}</span>
                </span>
                <span className="mt-1 block text-[15px] text-[#D5E2EA]">{program.ages}</span>
                <span className="mt-3 block text-[16px] leading-snug text-[#F7F4EE]">{lang === "es" ? program.blurbEs : program.blurb}</span>
                <span className="mt-3 grid grid-cols-3 gap-2">
                  {[
                    [tx("Tuition", "Colegiatura"), program.tuition.replace(" full-time", "")],
                    [tx("Hours", "Horario"), program.hours.replace("Mon–Fri ", "")],
                    [tx("Spots", "Lugares"), spots],
                  ].map(([label, value]) => (
                    <span key={label} className="rounded-md bg-[#14263e] px-2 py-2">
                      <span className="block text-[11px] font-semibold uppercase tracking-wide text-[#8EE0D6]">{label}</span>
                      <span className="mt-0.5 block text-[13px] font-semibold leading-tight text-[#F7F4EE]">{value}</span>
                    </span>
                  ))}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ProgramDetailScreen() {
  const nav = useNav();
  const kiddo = useKiddo();
  const { tx } = useTx();
  const id = nav.route.name === "program" ? nav.route.id : PROGRAMS[0].id;
  const program = programById(id);
  const teachers = STAFF.filter((person) => person.program === program.name);
  return (
    <div className="h-full overflow-y-auto pb-8">
      <div className="relative">
        <img src={photoSrc(program.photo)} alt="" className="h-56 w-full object-cover" />
        <div className="absolute left-4 top-4">
          <BackButton />
        </div>
      </div>
      <div className="space-y-4 px-5 pt-5">
        <p className="text-[15px] font-semibold text-[#8EE0D6]">{program.ages}</p>
        <h1 className="text-[28px] font-bold">{program.name}</h1>
        <p className="text-[17px] leading-relaxed">{program.description}</p>
        <p className="text-[16px] leading-relaxed text-[#D5E2EA]">{program.who}</p>
        <article className="overflow-hidden rounded-lg bg-card shadow-card">
          {[
            [tx("Hours", "Horario"), program.hours],
            [tx("Tuition", "Colegiatura"), program.tuition],
            [tx("Class size", "Tamaño del grupo"), program.ratio],
            [tx("Availability", "Disponibilidad"), program.availability === "Waitlist" ? tx("Waitlist", "Lista de espera") : `${program.availability} · ${program.spots} ${tx("spots left", "lugares libres")}`],
          ].map(([label, value]) => (
            <div key={label} className="border-t border-[#6D8EB8] px-4 py-3 first:border-0">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-[#8EE0D6]">{label}</p>
              <p className="mt-0.5 text-[16px] font-semibold leading-snug text-[#F7F4EE]">{value}</p>
            </div>
          ))}
        </article>
        <div>
          <h2 className="text-[22px] font-semibold">{tx("A typical day", "Un día típico")}</h2>
          <ul className="mt-2 space-y-2">
            {program.day.map((line) => {
              const match = line.match(/^(\d{1,2}:\d{2})\s+(.*)$/);
              return (
                <li key={line} className="flex items-center gap-3 rounded-lg bg-card px-3 py-3">
                  {match ? <span className="w-14 shrink-0 text-[15px] font-bold text-[#8EE0D6]">{match[1]}</span> : null}
                  <span className="text-[16px] font-semibold leading-snug text-[#F7F4EE]">{match ? match[2] : line}</span>
                </li>
              );
            })}
          </ul>
        </div>
        <p className="text-[16px]"><span className="font-semibold">{tx("Meals. ", "Comidas. ")}</span>{program.meals}</p>
        <p className="text-[16px]"><span className="font-semibold">{tx("What to bring. ", "Qué traer. ")}</span>{program.bring.join(", ")}</p>
        {teachers.length > 0 ? (
          <div>
            <h2 className="text-[22px] font-semibold">{tx("Lead teachers", "Maestros líderes")}</h2>
            {teachers.map((person) => (
              <button key={person.id} type="button" className="mt-3 flex w-full items-center gap-3 rounded-lg bg-card p-3 text-left shadow-card" onClick={() => nav.push({ name: "staff", id: person.id })}>
                <img src={photoSrc(person.photo)} alt="" className="h-12 w-12 rounded-full object-cover" />
                <span>
                  <span className="block font-semibold">{person.name}</span>
                  <span className="block text-[14px] text-muted-foreground">{person.certs}</span>
                </span>
              </button>
            ))}
          </div>
        ) : null}
        {program.faqs.map((faq) => (
          <details key={faq.q} className="rounded-2xl bg-card px-4 py-3 shadow-card">
            <summary className="min-h-11 cursor-pointer text-[17px] font-semibold">{faq.q}</summary>
            <p className="pt-2 text-[16px] text-muted-foreground">{faq.a}</p>
          </details>
        ))}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <AppButton variant="secondary" onClick={() => nav.push({ name: "tour", id: program.id })}>{tx("Tour", "Visita")}</AppButton>
          <AppButton onClick={() => { kiddo.setDraft(centerDraft(kiddo.family, "enrollment")); nav.push({ name: "book", step: 0 }); }}>{tx("Enroll", "Inscribir")}</AppButton>
        </div>
      </div>
    </div>
  );
}

export function StaffScreen() {
  const nav = useNav();
  const { tx } = useTx();
  const id = nav.route.name === "staff" ? nav.route.id : "";
  const person = staffById(id);
  return (
    <div className="h-full overflow-y-auto px-5 py-4">
      <BackButton />
      <img src={photoSrc(person.photo)} alt="" className="mt-4 h-28 w-28 rounded-lg object-cover" />
      <h1 className="mt-4 text-[28px] font-bold">{person.name}</h1>
      <p className="text-[16px] text-muted-foreground">{person.role} · {person.program}</p>
      <p className="mt-4 text-[17px] leading-relaxed">{person.bio}</p>
      <article className="mt-4 space-y-2 rounded-lg bg-card p-4 shadow-card">
        <p className="text-[16px]">{person.certs}</p>
        <p className="text-[16px] text-muted-foreground">{person.years} {tx("years at the center", "años en el centro")}</p>
        <p className="text-[16px] text-muted-foreground">{person.languages}</p>
      </article>
      <div className="mt-4">
        <AppButton onClick={() => nav.setTab("messages")}>{tx("Message the center", "Escribir al centro")}</AppButton>
      </div>
    </div>
  );
}
