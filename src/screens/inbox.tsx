import { useState } from "react";
import { useNav } from "@/app/nav";
import { EmptyState, ScreenHeader, SwipeRow } from "@/components/ios";
import { carePlace, STAFF } from "@/data/center";
import { photoSrc } from "@/data/photos";
import { clockLabel, formatLong, iso } from "@/lib/dates";
import { useKiddo, useTx } from "@/lib/store";

function threadWho(providerId: string) {
  const place = carePlace(providerId);
  const person = STAFF.find((member) => member.name === place.teacher) ?? STAFF[0];
  return { name: person.name, role: `${person.role} · ${place.program}`, photo: person.photo };
}

function threadWhen(at: string) {
  const date = at.slice(0, 10);
  const time = at.slice(11, 16);
  if (!date) return "";
  if (date === iso(0)) return clockLabel(time);
  if (date === iso(-1)) return "Yesterday";
  return formatLong(date).replace(/,?\s*\d{4}$/, "");
}

export function MessagesScreen() {
  const nav = useNav();
  const kiddo = useKiddo();
  const { tx } = useTx();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"Chats" | "Announcements">("Chats");
  const threads = (kiddo.family?.threads ?? []).filter((thread) => {
    if (thread.archived) return false;
    const who = threadWho(thread.providerId);
    const last = thread.messages[thread.messages.length - 1]?.text ?? "";
    const haystack = `${who.name} ${who.role} ${thread.title} ${last}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });
  const seenPhotos = new Set<string>();
  return (
    <div className="flex h-full flex-col px-5 pt-3">
      <h1 className="text-[34px] font-bold">{tx("Messages", "Mensajes")}</h1>
      <input className="mt-2 min-h-11 rounded-lg px-3" placeholder={tx("Search", "Buscar")} value={query} onChange={(e) => setQuery(e.target.value)} aria-label={tx("Search messages", "Buscar mensajes")} />
      <div className="mt-3 grid grid-cols-2 rounded-lg bg-[#102033] p-1">
        {(["Chats", "Announcements"] as const).map((item) => (
          <button key={item} type="button" className={`min-h-11 rounded-md font-semibold ${tab === item ? "bg-[#259f94] text-white" : "text-[#D5E2EA]"}`} onClick={() => setTab(item)}>
            {tx(item, item === "Chats" ? "Chats" : "Avisos")}
          </button>
        ))}
      </div>
      <div className="mt-3 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pb-4">
        {tab === "Announcements" ? (
          <article className="rounded-lg bg-card p-4 shadow-card">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-[#8EE0D6]">{tx("Center", "Centro")}</p>
            <h2 className="mt-1 text-[17px] font-semibold text-[#F7F4EE]">{tx("Holiday closure", "Cierre festivo")}</h2>
            <p className="mt-1 text-[15px] leading-snug text-[#D5E2EA]">{tx("KiddoNest is closed Nov 26–27. Drop-in care stays open.", "KiddoNest cierra el 26 y 27 de nov. El cuidado extra sigue abierto.")}</p>
          </article>
        ) : threads.length === 0 ? (
          <EmptyState image="emptyMessages" title={tx("No messages", "Sin mensajes")} body={tx("Messages from your child's teacher, the director, the front office, and billing show up here.", "Aquí aparecen los mensajes del maestro, la directora, recepción y facturación.")} />
        ) : (
          threads.map((thread) => {
            const last = thread.messages[thread.messages.length - 1];
            const who = threadWho(thread.providerId);
            const src = photoSrc(who.photo);
            const showPhoto = !seenPhotos.has(src);
            seenPhotos.add(src);
            return (
              <SwipeRow key={thread.id} className="rounded-lg shadow-card" actions={[{ label: tx("Archive", "Archivar"), tone: "teal", onPress: () => kiddo.archiveThread(thread.id) }]}>
                <button type="button" className="flex w-full items-center gap-3 p-3 text-left" onClick={() => { kiddo.markThreadRead(thread.id); nav.push({ name: "chat", id: thread.id }); }}>
                  {showPhoto ? (
                    <img src={src} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                  ) : (
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-[#E6F7F4] text-[18px] font-bold text-[#14685f]">{who.name.slice(0, 1)}</span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span className="truncate text-[17px] font-semibold text-[#F7F4EE]">{who.name}</span>
                      <span className="shrink-0 text-[12px] font-semibold text-[#D5E2EA]">{last ? threadWhen(last.at) : ""}</span>
                    </span>
                    <span className="block truncate text-[13px] font-semibold text-[#8EE0D6]">{who.role}</span>
                    <span className="mt-0.5 block truncate text-[14px] text-[#D5E2EA]">{last?.text}</span>
                  </span>
                  {thread.unread > 0 ? <span className="grid h-6 min-w-6 shrink-0 place-items-center rounded-full bg-[#FF7A6B] px-1 text-[12px] font-bold text-[#1F2A44]">{thread.unread}</span> : null}
                </button>
              </SwipeRow>
            );
          })
        )}
      </div>
    </div>
  );
}

export function ChatScreen() {
  const nav = useNav();
  const kiddo = useKiddo();
  const { tx } = useTx();
  const id = nav.route.name === "chat" ? nav.route.id : "";
  const thread = kiddo.family?.threads.find((item) => item.id === id);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  if (!thread) return null;
  const send = (value: string) => {
    if (!value.trim()) return;
    kiddo.sendMessage(thread.id, value.trim());
    setText("");
    setTyping(true);
    window.setTimeout(() => setTyping(false), 1200);
  };
  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title={threadWho(thread.providerId).name} />
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-3">
        {thread.messages.map((message) => (
          <div key={message.id} className={`max-w-[80%] rounded-2xl px-3 py-2 text-[16px] ${message.from === "me" ? "ml-auto bg-primary text-white" : "bg-card shadow-card"}`}>
            <p>{message.text}</p>
            <p className={`text-[11px] ${message.from === "me" ? "text-white/80" : "text-muted-foreground"}`}>{message.from === "me" ? tx("Read", "Leído") : message.at.slice(11, 16)}</p>
          </div>
        ))}
        {typing ? <p className="text-[13px] text-muted-foreground">{tx("Typing…", "Escribiendo…")}</p> : null}
      </div>
      <form
        className="flex items-center gap-2 border-t border-line px-3 py-2"
        onSubmit={(event) => {
          event.preventDefault();
          send(text);
        }}
      >
        <input className="min-h-11 flex-1 rounded-xl bg-[#E6F7F4] px-4 text-[#1F2A44] placeholder:text-[#5C6578]" value={text} onChange={(e) => setText(e.target.value)} placeholder={tx("Message", "Mensaje")} aria-label={tx("Message", "Mensaje")} />
        <button type="submit" className="min-h-11 px-2 font-semibold text-[var(--teal-ink)]">{tx("Send", "Enviar")}</button>
      </form>
    </div>
  );
}
