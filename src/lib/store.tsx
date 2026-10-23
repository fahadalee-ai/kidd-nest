import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type {
  Booking,
  BookingDraft,
  CarePrefs,
  Child,
  Consents,
  EmergencyContact,
  Family,
  Invoice,
  Parent,
  PayCard,
  PickupPerson,
  Review,
  VaultDoc,
} from "@/data/types";
import { DEMO_EMAIL, DEMO_PASSWORD, emptyFamily, seedFamily } from "@/data/seed";
import { backend } from "@/services/api";
import type { Lang } from "@/data/types";

const KEY = "kiddonest-v1";

type Account = { password: string; family: Family };

type Persisted = {
  onboardingSeen: boolean;
  rememberEmail: string;
  lang: Lang;
  accounts: Record<string, Account>;
  activeEmail: string | null;
};

export type RegisterInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  dob: string;
  relationship: string;
  zip: string;
  city: string;
  state: string;
  marketing: boolean;
  hearAbout: string;
};

type KiddoStore = {
  hydrated: boolean;
  onboardingSeen: boolean;
  markOnboarding: () => void;
  rememberEmail: string;
  setRememberEmail: (email: string) => void;
  lang: Lang;
  setLang: (lang: Lang) => void;
  user: Parent | null;
  family: Family | null;
  login: (email: string, password: string) => Promise<"ok" | "invalid" | "locked">;
  register: (input: RegisterInput) => "ok" | "exists";
  logout: () => void;
  deleteAccount: () => void;
  resetPassword: (email: string, password: string) => boolean;
  failedLogins: number;
  lockedUntil: number;
  updateUser: (patch: Partial<Parent>) => void;
  upsertChild: (child: Child) => void;
  removeChild: (id: string) => void;
  setContacts: (contacts: EmergencyContact[]) => void;
  setPickups: (pickups: PickupPerson[]) => void;
  setPrefs: (prefs: CarePrefs) => void;
  addCard: (card: PayCard) => void;
  removeCard: (id: string) => void;
  setDefaultCard: (id: string) => void;
  setConsents: (consents: Consents) => void;
  toggleFavorite: (id: string) => void;
  addBooking: (booking: Booking) => void;
  updateBooking: (id: string, patch: Partial<Booking>) => void;
  sendMessage: (threadId: string, text: string, image?: string) => void;
  markThreadRead: (id: string) => void;
  archiveThread: (id: string) => void;
  markNoteRead: (id: string) => void;
  deleteNote: (id: string) => void;
  markAllNotes: () => void;
  payInvoice: (id: string, method: string) => Promise<void>;
  toggleAutopay: () => void;
  addDocument: (doc: VaultDoc) => void;
  signDocument: (id: string) => void;
  addReview: (review: Review) => void;
  acknowledgeIncident: (id: string) => void;
  setSelectedChild: (id: string) => void;
  setFaceId: (on: boolean) => void;
  toggleNotif: (key: string) => void;
  setSetupComplete: (on: boolean) => void;
  draft: BookingDraft | null;
  setDraft: (draft: BookingDraft | null) => void;
  patchDraft: (patch: Partial<BookingDraft>) => void;
  completion: { percent: number; tasks: { id: string; en: string; es: string; done: boolean }[] };
};

const Ctx = createContext<KiddoStore | null>(null);

function freshAccounts(): Record<string, Account> {
  return { [DEMO_EMAIL]: { password: DEMO_PASSWORD, family: seedFamily() } };
}

function completionOf(family: Family | null) {
  if (!family) return { percent: 0, tasks: [] };
  const tasks = [
    { id: "parent", en: "Parent information", es: "Datos del padre o madre", done: Boolean(family.user.street && family.user.phone) },
    { id: "children", en: "Add a child", es: "Agregar un niño", done: family.children.length > 0 },
    { id: "emergency", en: "Emergency contacts", es: "Contactos de emergencia", done: family.contacts.length > 0 },
  ];
  const percent = Math.round((tasks.filter((task) => task.done).length / tasks.length) * 100);
  return { percent, tasks };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [onboardingSeen, setOnboardingSeen] = useState(false);
  const [rememberEmail, setRememberEmailState] = useState("");
  const [lang, setLangState] = useState<Lang>("en");
  const [accounts, setAccounts] = useState<Record<string, Account>>(freshAccounts);
  const [activeEmail, setActiveEmail] = useState<string | null>(null);
  const [failedLogins, setFailedLogins] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [draft, setDraft] = useState<BookingDraft | null>(null);
  const emailRef = useRef<string | null>(null);
  emailRef.current = activeEmail;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Persisted;
        if (saved.accounts && saved.accounts[DEMO_EMAIL]) {
          setAccounts(saved.accounts);
          setActiveEmail(saved.activeEmail);
          setOnboardingSeen(Boolean(saved.onboardingSeen));
          setRememberEmailState(saved.rememberEmail ?? "");
          setLangState("en");
        }
      }
    } catch {
      /* keep seed */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const payload: Persisted = { onboardingSeen, rememberEmail, lang, accounts, activeEmail };
    localStorage.setItem(KEY, JSON.stringify(payload));
  }, [hydrated, onboardingSeen, rememberEmail, lang, accounts, activeEmail]);

  useEffect(() => {
    if (!activeEmail) return;
    let timer = window.setTimeout(() => setActiveEmail(null), 30 * 60 * 1000);
    const bump = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setActiveEmail(null), 30 * 60 * 1000);
    };
    window.addEventListener("pointerdown", bump);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointerdown", bump);
    };
  }, [activeEmail]);

  const family = activeEmail ? (accounts[activeEmail]?.family ?? null) : null;

  const patch = (fn: (current: Family) => Family) => {
    const email = emailRef.current;
    if (!email) return;
    setAccounts((all) => {
      const account = all[email];
      if (!account) return all;
      return { ...all, [email]: { ...account, family: fn(account.family) } };
    });
  };

  const value = useMemo<KiddoStore>(() => {
    return {
      hydrated,
      onboardingSeen,
      markOnboarding: () => setOnboardingSeen(true),
      rememberEmail,
      setRememberEmail: setRememberEmailState,
      lang,
      setLang: () => {
        setLangState("en");
        document.documentElement.lang = "en";
      },
      user: family?.user ?? null,
      family,
      failedLogins,
      lockedUntil,
      login: async (email, password) => {
        const key = email.trim().toLowerCase();
        const account = accounts[key];
        await backend.signIn(email, password);
        if (!account) return "invalid";
        setFailedLogins(0);
        setLockedUntil(0);
        emailRef.current = key;
        setActiveEmail(key);
        return "ok";
      },
      register: (input) => {
        const email = input.email.trim().toLowerCase();
        if (accounts[email]) return "exists";
        const familyNext = emptyFamily({
          id: `p-${Date.now()}`,
          firstName: input.firstName.trim(),
          lastName: input.lastName.trim(),
          preferredName: input.firstName.trim(),
          email,
          phone: input.phone,
          dob: input.dob,
          relationship: input.relationship,
          street: "",
          apt: "",
          city: input.city,
          state: input.state,
          zip: input.zip,
          employer: "",
          workPhone: "",
          hearAbout: input.hearAbout,
          marketing: input.marketing,
        });
        setAccounts((all) => ({ ...all, [email]: { password: input.password, family: familyNext } }));
        setActiveEmail(email);
        return "ok";
      },
      logout: () => setActiveEmail(null),
      deleteAccount: () => {
        const email = emailRef.current;
        if (!email || email === DEMO_EMAIL) {
          setActiveEmail(null);
          return;
        }
        setAccounts((all) => {
          const next = { ...all };
          delete next[email];
          return next;
        });
        setActiveEmail(null);
      },
      resetPassword: (email, password) => {
        const key = email.trim().toLowerCase();
        if (!accounts[key]) return false;
        setAccounts((all) => ({ ...all, [key]: { ...all[key], password } }));
        return true;
      },
      updateUser: (userPatch) => patch((current) => ({ ...current, user: { ...current.user, ...userPatch } })),
      upsertChild: (child) =>
        patch((current) => {
          const exists = current.children.some((item) => item.id === child.id);
          return {
            ...current,
            children: exists ? current.children.map((item) => (item.id === child.id ? child : item)) : [...current.children, child],
          };
        }),
      removeChild: (id) => patch((current) => ({ ...current, children: current.children.filter((child) => child.id !== id) })),
      setContacts: (contacts) => patch((current) => ({ ...current, contacts })),
      setPickups: (pickups) => patch((current) => ({ ...current, pickups })),
      setPrefs: (prefs) => patch((current) => ({ ...current, prefs })),
      addCard: (card) =>
        patch((current) => ({
          ...current,
          cards: [...current.cards.map((item) => ({ ...item, isDefault: card.isDefault ? false : item.isDefault })), card],
        })),
      removeCard: (id) => patch((current) => ({ ...current, cards: current.cards.filter((card) => card.id !== id) })),
      setDefaultCard: (id) =>
        patch((current) => ({ ...current, cards: current.cards.map((card) => ({ ...card, isDefault: card.id === id })) })),
      setConsents: (consents) => patch((current) => ({ ...current, consents })),
      toggleFavorite: (id) =>
        patch((current) => ({
          ...current,
          favorites: current.favorites.includes(id) ? current.favorites.filter((item) => item !== id) : [...current.favorites, id],
        })),
      addBooking: (booking) => patch((current) => ({ ...current, bookings: [booking, ...current.bookings] })),
      updateBooking: (id, bookingPatch) =>
        patch((current) => ({
          ...current,
          bookings: current.bookings.map((booking) => (booking.id === id ? { ...booking, ...bookingPatch } : booking)),
        })),
      sendMessage: (threadId, text, image) =>
        patch((current) => ({
          ...current,
          threads: current.threads.map((thread) =>
            thread.id === threadId
              ? {
                  ...thread,
                  messages: [
                    ...thread.messages,
                    { id: `msg-${Date.now()}`, from: "me" as const, text, at: new Date().toISOString(), image },
                  ],
                }
              : thread,
          ),
        })),
      markThreadRead: (id) =>
        patch((current) => ({
          ...current,
          threads: current.threads.map((thread) => (thread.id === id ? { ...thread, unread: 0 } : thread)),
        })),
      archiveThread: (id) =>
        patch((current) => ({
          ...current,
          threads: current.threads.map((thread) => (thread.id === id ? { ...thread, archived: true } : thread)),
        })),
      markNoteRead: (id) =>
        patch((current) => ({
          ...current,
          notifications: current.notifications.map((note) => (note.id === id ? { ...note, read: true } : note)),
        })),
      deleteNote: (id) =>
        patch((current) => ({ ...current, notifications: current.notifications.filter((note) => note.id !== id) })),
      markAllNotes: () =>
        patch((current) => ({ ...current, notifications: current.notifications.map((note) => ({ ...note, read: true })) })),
      payInvoice: async (id, method) => {
        const invoice = family?.invoices.find((item) => item.id === id);
        const amount = invoice?.lines.reduce((sum, line) => sum + line.amount, 0) ?? 0;
        await backend.createPaymentIntent(amount, method);
        patch((current) => ({
          ...current,
          invoices: current.invoices.map((item) =>
            item.id === id ? { ...item, status: "Paid" as const, paidAt: new Date().toISOString().slice(0, 10) } : item,
          ),
        }));
      },
      toggleAutopay: () => patch((current) => ({ ...current, autopay: !current.autopay })),
      addDocument: (doc) => patch((current) => ({ ...current, documents: [doc, ...current.documents] })),
      signDocument: (id) =>
        patch((current) => ({
          ...current,
          documents: current.documents.map((doc) => (doc.id === id ? { ...doc, pendingSign: false } : doc)),
        })),
      addReview: (review) => patch((current) => ({ ...current, reviews: [review, ...current.reviews] })),
      acknowledgeIncident: (id) =>
        patch((current) => ({
          ...current,
          incidents: current.incidents.map((incident) => (incident.id === id ? { ...incident, acknowledged: true } : incident)),
        })),
      setSelectedChild: (id) => patch((current) => ({ ...current, selectedChild: id })),
      setFaceId: (on) => patch((current) => ({ ...current, faceId: on })),
      toggleNotif: (key) =>
        patch((current) => ({ ...current, notifPrefs: { ...current.notifPrefs, [key]: !current.notifPrefs[key] } })),
      setSetupComplete: (on) => patch((current) => ({ ...current, setupComplete: on })),
      draft,
      setDraft,
      patchDraft: (draftPatch) => setDraft((current) => (current ? { ...current, ...draftPatch } : current)),
      completion: completionOf(family),
    };
  }, [hydrated, onboardingSeen, rememberEmail, lang, accounts, activeEmail, family, failedLogins, lockedUntil, draft]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useKiddo() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("KiddoNest store is missing");
  return ctx;
}

export function useTx() {
  const { lang } = useKiddo();
  const tx = (en: string, es: string) => (lang === "es" ? es : en);
  return { lang, tx };
}
