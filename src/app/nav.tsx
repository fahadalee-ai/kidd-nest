import { createContext, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import type { CareType } from "@/data/types";
import { useKiddo } from "@/lib/store";

export type Tab = "home" | "programs" | "schedule" | "messages" | "profile";

export type Route =
  | { name: "splash" }
  | { name: "onboarding" }
  | { name: "login" }
  | { name: "register" }
  | { name: "forgot" }
  | { name: "otp"; mode: "reset" | "register" | "phone"; contact: string }
  | { name: "new-password"; contact: string }
  | { name: "auth-success"; title: string; body: string; next: "login" | "verify-email" }
  | { name: "verify-email" }
  | { name: "permissions"; step: number }
  | { name: "setup"; step: number }
  | { name: "setup-done" }
  | { name: "home" }
  | { name: "service"; id: CareType }
  | { name: "notifications" }
  | { name: "child"; id: string }
  | { name: "daily"; id: string }
  | { name: "incident"; id: string }
  | { name: "checkin" }
  | { name: "invoices" }
  | { name: "invoice"; id: string }
  | { name: "receipt"; id: string }
  | { name: "documents" }
  | { name: "photo"; id: string; title: string }
  | { name: "programs" }
  | { name: "program"; id: string }
  | { name: "staff"; id: string }
  | { name: "search" }
  | { name: "provider"; id: string }
  | { name: "favorites" }
  | { name: "schedule" }
  | { name: "bookings" }
  | { name: "book"; step: number }
  | { name: "book-done"; id: string }
  | { name: "booking"; id: string }
  | { name: "reschedule"; id: string }
  | { name: "cancel"; id: string }
  | { name: "tour"; id: string }
  | { name: "waitlist"; id: string }
  | { name: "review"; id: string }
  | { name: "messages" }
  | { name: "chat"; id: string }
  | { name: "profile" }
  | { name: "edit-profile" }
  | { name: "manage-children" }
  | { name: "emergency" }
  | { name: "pickups" }
  | { name: "payment-methods" }
  | { name: "language" }
  | { name: "notif-prefs" }
  | { name: "privacy" }
  | { name: "help" }
  | { name: "support" }
  | { name: "legal"; doc: "terms" | "privacy" | "about" };

type ConfirmOpts = { title: string; message: string; confirmLabel?: string; cancelLabel?: string; destructive?: boolean };
type SheetOpts = { title?: string; actions: { id: string; label: string; destructive?: boolean }[] };
type Toast = { id: number; title: string; body?: string };

type NavApi = {
  route: Route;
  tab: Tab;
  phase: "splash" | "auth" | "app";
  canPop: boolean;
  showTabs: boolean;
  push: (route: Route) => void;
  pop: () => void;
  replace: (route: Route) => void;
  setTab: (tab: Tab) => void;
  resetAuth: (route: Route) => void;
  enterApp: (setup?: boolean) => void;
  resetHome: () => void;
  confirm: (opts: ConfirmOpts) => Promise<boolean>;
  actionSheet: (opts: SheetOpts) => Promise<string | null>;
  toast: (title: string, body?: string) => void;
  tx: (en: string, es: string) => string;
};

const Ctx = createContext<NavApi | null>(null);

const HIDE_TABS = new Set(["book", "book-done", "chat", "tour", "photo", "setup", "setup-done", "pay"]);

function emptyStacks(): Record<Tab, Route[]> {
  return {
    home: [{ name: "home" }],
    programs: [{ name: "programs" }],
    schedule: [{ name: "schedule" }],
    messages: [{ name: "messages" }],
    profile: [{ name: "profile" }],
  };
}

export function routeKey(route: Route) {
  return JSON.stringify(route);
}

export function NavProvider({ children }: { children: ReactNode }) {
  const { lang } = useKiddo();
  const [phase, setPhase] = useState<"splash" | "auth" | "app">("splash");
  const [authStack, setAuthStack] = useState<Route[]>([{ name: "splash" }]);
  const [tab, setTabState] = useState<Tab>("home");
  const [stacks, setStacks] = useState(emptyStacks);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [dialog, setDialog] = useState<
    | { kind: "confirm"; opts: ConfirmOpts }
    | { kind: "sheet"; opts: SheetOpts }
    | null
  >(null);
  const resolver = useRef<(value: unknown) => void>(() => undefined);

  const route: Route =
    phase === "splash" ? { name: "splash" } : phase === "auth" ? (authStack[authStack.length - 1] ?? { name: "login" }) : (stacks[tab][stacks[tab].length - 1] ?? { name: "home" });

  const tx = (en: string, es: string) => (lang === "es" ? es : en);

  const api = useMemo<NavApi>(() => {
    const push = (next: Route) => {
      if (phase === "auth") setAuthStack((stack) => [...stack, next]);
      else setStacks((current) => ({ ...current, [tab]: [...current[tab], next] }));
    };
    const pop = () => {
      if (phase === "auth") setAuthStack((stack) => (stack.length > 1 ? stack.slice(0, -1) : stack));
      else setStacks((current) => ({ ...current, [tab]: current[tab].length > 1 ? current[tab].slice(0, -1) : current[tab] }));
    };
    const replace = (next: Route) => {
      if (phase === "auth") setAuthStack((stack) => [...stack.slice(0, -1), next]);
      else setStacks((current) => ({ ...current, [tab]: [...current[tab].slice(0, -1), next] }));
    };
    return {
      route,
      tab,
      phase,
      canPop: (phase === "auth" && authStack.length > 1) || (phase === "app" && stacks[tab].length > 1),
      showTabs: phase === "app" && !HIDE_TABS.has(route.name),
      push,
      pop,
      replace,
      setTab: (next) => {
        setStacks((current) => {
          const roots = emptyStacks();
          let changed = false;
          const nextStacks = { ...current };
          (Object.keys(nextStacks) as Tab[]).forEach((id) => {
            if (nextStacks[id].some((item) => item.name === "book" || item.name === "book-done")) {
              nextStacks[id] = roots[id];
              changed = true;
            }
          });
          return changed ? nextStacks : current;
        });
        setTabState(next);
      },
      resetAuth: (next) => {
        setPhase("auth");
        setAuthStack([next]);
      },
      enterApp: (setup) => {
        setPhase("app");
        setTabState("home");
        setStacks({ ...emptyStacks(), home: setup ? [{ name: "setup", step: 0 }] : [{ name: "home" }] });
      },
      resetHome: () => {
        setPhase("app");
        setTabState("home");
        setStacks(emptyStacks());
      },
      confirm: (opts) =>
        new Promise<boolean>((resolve) => {
          resolver.current = resolve as (value: unknown) => void;
          setDialog({ kind: "confirm", opts });
        }),
      actionSheet: (opts) =>
        new Promise<string | null>((resolve) => {
          resolver.current = resolve as (value: unknown) => void;
          setDialog({ kind: "sheet", opts });
        }),
      toast: (title, body) => {
        const id = Date.now() + Math.random();
        setToasts((list) => [...list, { id, title, body }]);
        window.setTimeout(() => setToasts((list) => list.filter((item) => item.id !== id)), 3600);
      },
      tx,
    };
  }, [route, tab, phase, authStack, stacks, lang]);

  const close = (value: unknown) => {
    resolver.current(value);
    setDialog(null);
  };

  return (
    <Ctx.Provider value={api}>
      <div className="relative flex h-full flex-col">
        {children}
        <div className="pointer-events-none absolute inset-x-0 bottom-6 z-[80] flex flex-col items-center gap-2 px-4">
          {toasts.map((toast) => (
            <div key={toast.id} role="status" className="pointer-events-auto animate-toast w-full rounded-2xl border-l-4 border-[#259f94] bg-[#102033] px-4 py-3 text-white shadow-[0_12px_32px_rgba(0,0,0,0.45)] ring-1 ring-white/15">
              <p className="text-[15px] font-semibold text-white">{toast.title}</p>
              {toast.body ? <p className="mt-0.5 text-[13px] leading-snug text-[#D5E2EA]">{toast.body}</p> : null}
            </div>
          ))}
        </div>
        {dialog?.kind === "confirm" ? (
          <div className="absolute inset-0 z-[70] grid place-items-center bg-black/40 px-8">
            <div className="w-full max-w-[300px] rounded-2xl bg-white p-4 text-center text-[#1F2A44] shadow-card">
              <h2 className="text-[17px] font-semibold text-[#1F2A44]">{dialog.opts.title}</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-[#5C6578]">{dialog.opts.message}</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button type="button" className="min-h-11 rounded-xl bg-[#F4EEE6] font-semibold text-[#1F2A44]" onClick={() => close(false)}>
                  {dialog.opts.cancelLabel ?? tx("Cancel", "Cancelar")}
                </button>
                <button
                  type="button"
                  className={`min-h-11 rounded-xl font-semibold text-white ${dialog.opts.destructive ? "bg-destructive" : "bg-primary"}`}
                  onClick={() => close(true)}
                >
                  {dialog.opts.confirmLabel ?? tx("OK", "OK")}
                </button>
              </div>
            </div>
          </div>
        ) : null}
        {dialog?.kind === "sheet" ? (
          <div className="absolute inset-0 z-[70] flex items-end bg-black/40">
            <button type="button" aria-label="Dismiss" className="absolute inset-0" onClick={() => close(null)} />
            <div className="relative w-full rounded-t-3xl bg-white px-4 pb-6 pt-3 text-[#1F2A44] shadow-card">
              <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-[#E8E2D9]" />
              {dialog.opts.title ? <p className="mb-3 text-center text-[15px] font-semibold text-[#1F2A44]">{dialog.opts.title}</p> : null}
              <div className="overflow-hidden rounded-2xl bg-[#F4EEE6]">
                {dialog.opts.actions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    className={`block min-h-[52px] w-full border-b border-[#E8E2D9] text-[17px] font-semibold last:border-0 ${action.destructive ? "text-[#E5484D]" : "text-[#0F6E64]"}`}
                    onClick={() => close(action.id)}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
              <button type="button" className="mt-2 min-h-[52px] w-full rounded-2xl bg-[#F4EEE6] text-[17px] font-semibold text-[#1F2A44]" onClick={() => close(null)}>
                {tx("Cancel", "Cancelar")}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </Ctx.Provider>
  );
}

export function useNav() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("Navigation is missing");
  return ctx;
}
