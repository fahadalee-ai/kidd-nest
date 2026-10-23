import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNav } from "@/app/nav";
import { BrandLogo } from "@/components/BrandLogo";
import { KidsStage } from "@/components/KidsStage";
import { AppButton, AppInput, BackButton, CheckRow, OtpInput, PageDots, Photo, SuccessMark } from "@/components/ios";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/data/seed";
import { useKiddo, useTx } from "@/lib/store";
import { PASSWORD_RULES, passwordScore, validEmailOrPhone, validPassword } from "@/lib/validate";
export function SplashScreen() {
  const nav = useNav();
  const { hydrated } = useKiddo();
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(media.matches);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const timer = window.setTimeout(() => {
      nav.resetAuth({ name: "onboarding" });
    }, media.matches ? 700 : 2800);
    return () => window.clearTimeout(timer);
  }, [hydrated]);
  return (
    <KidsStage>
      <div className="grid h-full place-items-center px-8 text-center">
        <BrandLogo variant="white" className={`mx-auto h-auto w-[min(300px,82vw)] object-center ${reduce ? "" : "splash-circle"}`} />
      </div>
    </KidsStage>
  );
}

const SLIDES = [
  {
    image: "onboarding1",
    title: "Find Trusted Care Near You",
    titleEs: "Encuentra cuidado de confianza cerca de ti",
    body: "Discover verified daycares, nannies, and babysitters in your neighborhood. Every provider is background-checked and licensed.",
    bodyEs: "Descubre guarderías, niñeras y canguros verificados en tu vecindario. Cada proveedor tiene verificación de antecedentes y licencia.",
  },
  {
    image: "onboarding2",
    title: "Stay Connected All Day",
    titleEs: "Mantente conectado todo el día",
    body: "Get real-time updates on meals, naps, activities, and photos. Know your little one is happy, even when you're away.",
    bodyEs: "Recibe avisos de comidas, siestas, actividades y fotos. Sabe que tu pequeño está bien, aunque no estés.",
  },
  {
    image: "onboarding3",
    title: "Book, Pay, and Relax",
    titleEs: "Reserva, paga y descansa",
    body: "Schedule care in seconds, pay securely, and manage everything in one simple, safe app.",
    bodyEs: "Programa el cuidado en segundos, paga con seguridad y administra todo en una app simple.",
  },
];

export function OnboardingScreen() {
  const nav = useNav();
  const { markOnboarding } = useKiddo();
  const { tx } = useTx();
  const [index, setIndex] = useState(0);
  const [drag, setDrag] = useState(0);
  const slide = SLIDES[index];
  const finish = (to: "login" | "register") => {
    markOnboarding();
    nav.resetAuth({ name: to });
  };
  return (
    <div
      className="relative h-full overflow-hidden bg-[#0B1524] text-white"
      onPointerDown={(event) => setDrag(event.clientX)}
      onPointerUp={(event) => {
        const delta = event.clientX - drag;
        if (delta < -40) setIndex((i) => Math.min(2, i + 1));
        if (delta > 40) setIndex((i) => Math.max(0, i - 1));
      }}
    >
      <Photo key={slide.image} id={slide.image} alt="" priority className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.5)_0%,rgba(0,0,0,0.08)_26%,transparent_42%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%] bg-[linear-gradient(to_top,#0B1524_0%,#0B1524_34%,rgba(11,21,36,0.78)_62%,transparent_100%)]" />
      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-start justify-between gap-3 px-5 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <BrandLogo className="h-14 drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)]" />
          <button
            type="button"
            className="min-h-11 shrink-0 rounded-full bg-black/45 px-4 font-semibold text-white shadow-sm backdrop-blur-sm"
            onClick={() => finish("login")}
          >
            {tx("Skip", "Omitir")}
          </button>
        </div>
        <div className="mt-auto px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <h1 className="font-display text-[32px] font-bold leading-[1.15] text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.55)]">
            {tx(slide.title, slide.titleEs)}
          </h1>
          <p className="mt-3 text-[17px] leading-relaxed text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.45)]">
            {tx(slide.body, slide.bodyEs)}
          </p>
          <div className="mt-6 space-y-4">
            <PageDots count={3} index={index} light />
            {index < 2 ? (
              <AppButton onClick={() => setIndex(index + 1)}>{tx("Next", "Siguiente")}</AppButton>
            ) : (
              <>
                <AppButton onClick={() => finish("login")}>{tx("Log in", "Entrar")}</AppButton>
                <button type="button" className="min-h-11 w-full font-semibold text-white" onClick={() => finish("register")}>
                  {tx("Create an account", "Crear una cuenta")}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LoginScreen() {
  const nav = useNav();
  const kiddo = useKiddo();
  const { tx } = useTx();
  const [email, setEmail] = useState(kiddo.rememberEmail);
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(Boolean(kiddo.rememberEmail));
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    const typed = email.trim();
    const result = typed ? await kiddo.login(typed, password) : "invalid";
    if (result !== "ok") await kiddo.login(DEMO_EMAIL, DEMO_PASSWORD);
    setLoading(false);
    if (remember && typed) kiddo.setRememberEmail(typed.toLowerCase());
    else kiddo.setRememberEmail("");
    nav.enterApp(result === "ok" && typed.toLowerCase() !== DEMO_EMAIL && !kiddo.family?.setupComplete);
  };

  return (
    <KidsStage>
      <div className="h-full overflow-y-auto">
      <div className="space-y-4 px-5 pb-6 pt-8">
        <BrandLogo variant="white" className="h-[72px]" />
        <h1 className="text-[28px] font-bold">{tx("Welcome back", "Qué gusto verte")}</h1>
        <p className="text-[15px] text-muted-foreground">{tx("Log in to continue to KiddoNest", "Entra para continuar en KiddoNest")}</p>
        <AppInput label={tx("Email or Phone", "Correo o teléfono")} autoComplete="username" inputMode="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <div className="relative">
          <AppInput label={tx("Password", "Contraseña")} type={show ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} />
          <button type="button" aria-label={show ? "Hide password" : "Show password"} className="absolute right-2 top-8 grid h-12 w-12 place-items-center text-[#1F2A44]" onClick={() => setShow((v) => !v)}>
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <div className="flex items-center justify-between">
          <label className="flex min-h-11 items-center gap-2 text-[15px]">
            <input type="checkbox" className="h-5 w-5 accent-[var(--primary)]" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
            {tx("Remember me", "Recordarme")}
          </label>
          <button type="button" className="min-h-11 font-semibold text-[var(--teal-ink)]" onClick={() => nav.push({ name: "forgot" })}>
            {tx("Forgot password?", "¿Olvidaste tu contraseña?")}
          </button>
        </div>
        <AppButton loading={loading} onClick={submit}>
          {tx("Log In", "Entrar")}
        </AppButton>
        <div className="flex items-center gap-3 text-[13px] text-muted-foreground">
          <span className="h-px flex-1 bg-line" />
          {tx("or continue with", "o continúa con")}
          <span className="h-px flex-1 bg-line" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <AppButton variant="apple" className="px-2 text-[15px]" onClick={() => social(nav, kiddo, tx)}>
            {tx("Apple", "Apple")}
          </AppButton>
          <AppButton variant="secondary" className="px-2 text-[15px]" onClick={() => social(nav, kiddo, tx)}>
            {tx("Google", "Google")}
          </AppButton>
        </div>
        <button type="button" className="min-h-11 w-full text-[13px] text-muted-foreground" onClick={() => { setEmail(DEMO_EMAIL); setPassword(DEMO_PASSWORD); }}>
          {tx("Use Sarah’s demo family", "Usar la familia de demostración de Sarah")}
        </button>
        <p className="pb-6 text-center text-[15px]">
          {tx("New to KiddoNest?", "¿Nuevo en KiddoNest?")}{" "}
          <button type="button" className="font-semibold text-[var(--teal-ink)]" onClick={() => nav.push({ name: "register" })}>
            {tx("Create account", "Crear cuenta")}
          </button>
        </p>
      </div>
      </div>
    </KidsStage>
  );
}

async function social(nav: ReturnType<typeof useNav>, kiddo: ReturnType<typeof useKiddo>, tx: (en: string, es: string) => string) {
  const ok = await nav.confirm({
    title: tx("Preview sign-in", "Inicio de vista previa"),
    message: tx("This preview signs you into Sarah Chen’s family in Austin.", "Esta vista previa entra a la familia de Sarah Chen en Austin."),
    confirmLabel: tx("Continue", "Continuar"),
  });
  if (!ok) return;
  await kiddo.login(DEMO_EMAIL, DEMO_PASSWORD);
  nav.enterApp(false);
}

export function ForgotScreen() {
  const nav = useNav();
  const { tx } = useTx();
  const [contact, setContact] = useState("");
  const [error, setError] = useState("");
  return (
    <KidsStage>
    <div className="flex h-full flex-col px-5 py-6">
      <BackButton />
      <BrandLogo variant="white" className="mt-2 h-14" />
      <h1 className="mt-4 text-[28px] font-bold">{tx("Reset password", "Restablecer contraseña")}</h1>
      <p className="mt-2 text-[15px] text-muted-foreground">{tx("We’ll text or email a 4-digit code.", "Te enviaremos un código de 4 dígitos.")}</p>
      <div className="mt-6">
        <AppInput label={tx("Email or phone", "Correo o teléfono")} value={contact} onChange={(event) => setContact(event.target.value)} autoComplete="username" />
      </div>
      {error ? <p className="mt-2 text-[13px] text-destructive">{error}</p> : null}
      <div className="mt-6">
        <AppButton
          onClick={() => {
            if (!validEmailOrPhone(contact)) {
              setError(tx("Enter a valid email or phone.", "Ingresa un correo o teléfono válido."));
              return;
            }
            nav.push({ name: "otp", mode: "reset", contact });
          }}
        >
          {tx("Send Code", "Enviar código")}
        </AppButton>
      </div>
    </div>
    </KidsStage>
  );
}

export function OtpScreen() {
  const nav = useNav();
  const kiddo = useKiddo();
  const { tx } = useTx();
  const route = nav.route.name === "otp" ? nav.route : null;
  const [code, setCode] = useState("");
  const [seconds, setSeconds] = useState(30);
  useEffect(() => {
    const timer = window.setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => window.clearInterval(timer);
  }, []);
  if (!route) return null;
  return (
    <KidsStage>
    <div className="flex h-full flex-col px-5 py-6">
      <BackButton />
      <BrandLogo variant="white" className="mt-2 h-14" />
      <h1 className="mt-4 text-[28px] font-bold">{tx("Enter the code", "Ingresa el código")}</h1>
      <p className="mt-2 text-[15px] text-muted-foreground">
        {tx("Sent to", "Enviado a")} {route.contact}
      </p>
      <div className="mt-6">
        <OtpInput value={code} onChange={setCode} />
      </div>
      <button type="button" disabled={seconds > 0} className="mt-4 min-h-11 self-start font-semibold text-[var(--teal-ink)] disabled:opacity-40" onClick={() => setSeconds(30)}>
        {seconds > 0 ? tx(`Resend in ${seconds}s`, `Reenviar en ${seconds}s`) : tx("Resend code", "Reenviar código")}
      </button>
      <div className="mt-6">
        <AppButton
          onClick={async () => {
            if (route.mode === "reset") nav.push({ name: "new-password", contact: route.contact });
            else if (route.mode === "phone") {
              await kiddo.login(DEMO_EMAIL, DEMO_PASSWORD);
              nav.enterApp(false);
            } else nav.push({ name: "verify-email" });
          }}
        >
          {tx("Verify", "Verificar")}
        </AppButton>
      </div>
    </div>
    </KidsStage>
  );
}

export function NewPasswordScreen() {
  const nav = useNav();
  const kiddo = useKiddo();
  const { tx, lang } = useTx();
  const contact = nav.route.name === "new-password" ? nav.route.contact : "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const score = passwordScore(password);
  return (
    <KidsStage>
    <div className="flex h-full flex-col overflow-y-auto px-5 py-6">
      <BrandLogo variant="white" className="h-14" />
      <h1 className="mt-4 text-[28px] font-bold">{tx("Create a new password", "Crea una contraseña nueva")}</h1>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-primary" style={{ width: `${(score / 4) * 100}%` }} />
      </div>
      <ul className="mt-3 space-y-1 text-[13px]">
        {PASSWORD_RULES.map((rule) => (
          <li key={rule.id} className={rule.test(password) ? "text-success" : "text-muted-foreground"}>
            {rule.test(password) ? "✓" : "○"} {lang === "es" ? rule.es : rule.en}
          </li>
        ))}
      </ul>
      <div className="mt-4 space-y-3">
        <AppInput label={tx("New password", "Nueva contraseña")} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
        <AppInput label={tx("Confirm password", "Confirmar contraseña")} type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
      </div>
      {error ? <p className="mt-2 text-[13px] text-destructive">{error}</p> : null}
      <div className="mt-6">
        <AppButton
          onClick={() => {
            if (!validPassword(password)) {
              setError(tx("Meet every requirement.", "Cumple todos los requisitos."));
              return;
            }
            if (password !== confirm) {
              setError(tx("Passwords do not match.", "Las contraseñas no coinciden."));
              return;
            }
            const email = contact.includes("@") ? contact : DEMO_EMAIL;
            kiddo.resetPassword(email, password);
            nav.resetAuth({
              name: "auth-success",
              title: tx("Password updated", "Contraseña actualizada"),
              body: tx("You can log in with the new password.", "Ya puedes entrar con la nueva contraseña."),
              next: "login",
            });
          }}
        >
          {tx("Save password", "Guardar contraseña")}
        </AppButton>
      </div>
    </div>
    </KidsStage>
  );
}

export function AuthSuccessScreen() {
  const nav = useNav();
  const { tx } = useTx();
  const route = nav.route.name === "auth-success" ? nav.route : null;
  if (!route) return null;
  return (
    <KidsStage>
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <BrandLogo variant="white" className="mb-6 h-14 object-center" />
      <SuccessMark />
      <h1 className="mt-6 text-[28px] font-bold">{route.title}</h1>
      <p className="mt-2 text-[15px] text-muted-foreground">{route.body}</p>
      <div className="mt-8 w-full">
        <AppButton onClick={() => (route.next === "login" ? nav.resetAuth({ name: "login" }) : nav.push({ name: "verify-email" }))}>
          {tx("Continue", "Continuar")}
        </AppButton>
      </div>
    </div>
    </KidsStage>
  );
}

export function VerifyEmailScreen() {
  const nav = useNav();
  const { tx } = useTx();
  const { user } = useKiddo();
  return (
    <KidsStage>
    <div className="flex h-full flex-col px-5 py-8">
      <BrandLogo variant="white" className="h-14" />
      <h1 className="mt-4 text-[28px] font-bold">{tx("Check your email", "Revisa tu correo")}</h1>
      <p className="mt-2 text-[15px] text-muted-foreground">
        {tx("We sent a confirmation link to", "Enviamos un enlace de confirmación a")} {user?.email ?? "your inbox"}.
      </p>
      <div className="mt-8 space-y-3">
        <AppButton onClick={() => nav.toast(tx("Mail app", "Correo"), tx("Open Mail is ready when a mail app is installed.", "Abrir correo funciona cuando hay una app de correo."))}>
          {tx("Open Mail", "Abrir correo")}
        </AppButton>
        <AppButton variant="secondary" onClick={() => nav.toast(tx("Sent again", "Enviado de nuevo"))}>
          {tx("Resend", "Reenviar")}
        </AppButton>
        <AppButton variant="tertiary" onClick={() => nav.push({ name: "permissions", step: 0 })}>
          {tx("I’ve confirmed my email", "Ya confirmé mi correo")}
        </AppButton>
      </div>
    </div>
    </KidsStage>
  );
}

const PERMS = [
  { art: "bell", title: "Notifications", titleEs: "Notificaciones", body: "Hear about check-in, pickup, and invoices. You can fine-tune this later.", bodyEs: "Avisos de entrada, salida y facturas. Puedes ajustarlo después." },
  { art: "pin", title: "Location while using the app", titleEs: "Ubicación al usar la app", body: "Show daycares near your ZIP and the distance on each card.", bodyEs: "Muestra guarderías cerca de tu código postal y la distancia en cada tarjeta." },
  { art: "camera", title: "Camera and Photos", titleEs: "Cámara y fotos", body: "Add a profile photo, pickup IDs, and documents.", bodyEs: "Agrega foto de perfil, identificaciones y documentos." },
] as const;

function PermArt({ art }: { art: (typeof PERMS)[number]["art"] }) {
  return (
    <svg viewBox="0 0 160 160" className="h-40 w-40" aria-hidden="true">
      <circle cx="80" cy="80" r="74" fill="#1c3a52" />
      <circle cx="80" cy="80" r="58" fill="#E6F7F4" />
      {art === "bell" ? (
        <>
          <path d="M80 42c-16 0-28 12.5-28 29v16l-7 10c-1.4 2-.2 5 2.4 5h65.2c2.6 0 3.8-3 2.4-5l-7-10V71c0-16.5-12-29-28-29z" fill="#259f94" />
          <path d="M70 106a10 10 0 0 0 20 0" fill="none" stroke="#0F6E64" strokeWidth="4" strokeLinecap="round" />
          <circle cx="104" cy="52" r="12" fill="#FF7A6B" />
          <circle cx="104" cy="52" r="5" fill="#fff" />
        </>
      ) : null}
      {art === "pin" ? (
        <>
          <path d="M80 38c-16.5 0-30 13.2-30 29.5C50 86 80 124 80 124s30-38 30-56.5C110 51.2 96.5 38 80 38z" fill="#259f94" />
          <circle cx="80" cy="67" r="12" fill="#fff" />
          <circle cx="80" cy="67" r="6" fill="#FF7A6B" />
        </>
      ) : null}
      {art === "camera" ? (
        <>
          <rect x="38" y="58" width="34" height="28" rx="6" fill="#FFC94D" />
          <rect x="46" y="66" width="18" height="14" rx="2" fill="#fff" />
          <rect x="70" y="52" width="54" height="40" rx="10" fill="#1F2A44" />
          <circle cx="97" cy="72" r="12" fill="#259f94" />
          <circle cx="97" cy="72" r="6" fill="#E6F7F4" />
          <rect x="108" y="58" width="10" height="5" rx="2" fill="#FF7A6B" />
        </>
      ) : null}
    </svg>
  );
}

export function PermissionsScreen() {
  const nav = useNav();
  const { tx } = useTx();
  const step = nav.route.name === "permissions" ? nav.route.step : 0;
  const item = PERMS[step] ?? PERMS[0];
  const go = () => {
    if (step < PERMS.length - 1) nav.push({ name: "permissions", step: step + 1 });
    else nav.enterApp(true);
  };
  return (
    <KidsStage>
    <div className="flex h-full flex-col px-6 py-10">
      <BrandLogo variant="white" className="mb-4 h-14" />
      <p className="text-[13px] font-semibold text-primary">
        {step + 1} / {PERMS.length}
      </p>
      <h1 className="mt-3 text-[28px] font-bold">{tx(item.title, item.titleEs)}</h1>
      <p className="mt-3 text-[17px] leading-relaxed text-muted-foreground">{tx(item.body, item.bodyEs)}</p>
      <div className="flex flex-1 items-center justify-center">
        <PermArt art={item.art} />
      </div>
      <div className="space-y-3">
        <AppButton onClick={go}>{tx("Allow", "Permitir")}</AppButton>
        <AppButton variant="tertiary" onClick={go}>
          {tx("Not now", "Ahora no")}
        </AppButton>
      </div>
    </div>
    </KidsStage>
  );
}

export function RegisterScreen() {
  const nav = useNav();
  const kiddo = useKiddo();
  const { tx } = useTx();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    terms: false,
  });
  const set = (key: string, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));

  const submit = () => {
    const email = form.email.trim() || `parent-${Date.now()}@kiddonest.app`;
    kiddo.register({
      firstName: form.firstName,
      lastName: form.lastName,
      email,
      phone: "",
      password: form.password,
      dob: "1990-01-01",
      relationship: "Parent",
      zip: "",
      city: "Austin",
      state: "TX",
      marketing: false,
      hearAbout: "",
    });
    nav.push({ name: "otp", mode: "register", contact: email });
  };

  return (
    <KidsStage>
    <div className="h-full overflow-y-auto">
      <div className="space-y-3 px-5 py-4">
        <BackButton />
        <BrandLogo variant="white" className="h-28" />
        <h1 className="text-[28px] font-bold">{tx("Create your account", "Crea tu cuenta")}</h1>
        <div className="grid grid-cols-2 gap-3">
          <AppInput label={tx("First name", "Nombre")} value={form.firstName} autoComplete="given-name" onChange={(e) => set("firstName", e.target.value)} />
          <AppInput label={tx("Last name", "Apellido")} value={form.lastName} autoComplete="family-name" onChange={(e) => set("lastName", e.target.value)} />
        </div>
        <AppInput label={tx("Email", "Correo")} type="email" autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
        <AppInput label={tx("Password", "Contraseña")} type="password" autoComplete="new-password" value={form.password} onChange={(e) => set("password", e.target.value)} />
        <CheckRow
          checked={form.terms}
          onChange={(v) => set("terms", v)}
          label={
            <span>
              {tx("I agree to the", "Acepto los")}{" "}
              <button type="button" className="font-semibold text-[var(--teal-ink)]" onClick={() => nav.push({ name: "legal", doc: "terms" })}>
                {tx("Terms of Service", "Términos")}
              </button>{" "}
              {tx("and", "y la")}{" "}
              <button type="button" className="font-semibold text-[var(--teal-ink)]" onClick={() => nav.push({ name: "legal", doc: "privacy" })}>
                {tx("Privacy Policy", "Política de privacidad")}
              </button>
            </span>
          }
        />
        <AppButton onClick={submit}>{tx("Create Account", "Crear cuenta")}</AppButton>
        <div className="grid grid-cols-2 gap-3 pb-8">
          <AppButton variant="apple" className="px-2 text-[15px]" onClick={() => social(nav, kiddo, tx)}>
            {tx("Apple", "Apple")}
          </AppButton>
          <AppButton variant="secondary" className="px-2 text-[15px]" onClick={() => social(nav, kiddo, tx)}>
            {tx("Google", "Google")}
          </AppButton>
        </div>
      </div>
    </div>
    </KidsStage>
  );
}
