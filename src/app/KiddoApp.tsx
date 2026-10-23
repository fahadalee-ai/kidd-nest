import { useEffect, useRef, useState } from "react";
import { CalendarDays, House, LayoutGrid, MessageCircle, UserRound } from "lucide-react";
import { NavProvider, routeKey, useNav, type Tab } from "@/app/nav";
import { SplashScreen, OnboardingScreen, LoginScreen, RegisterScreen, ForgotScreen, OtpScreen, NewPasswordScreen, AuthSuccessScreen, VerifyEmailScreen, PermissionsScreen } from "@/screens/auth";
import { SetupScreen, SetupDoneScreen } from "@/screens/setup";
import { HomeScreen, ServiceScreen, NotificationsScreen } from "@/screens/home";
import { ChildScreen, DailyScreen, IncidentScreen, CheckinScreen, InvoicesScreen, InvoiceScreen, ReceiptScreen, DocumentsScreen, PhotoScreen } from "@/screens/care";
import { SearchScreen, ProviderScreen, FavoritesScreen } from "@/screens/search";
import { ProgramDetailScreen, ProgramsScreen, StaffScreen } from "@/screens/programs";
import { BookingsScreen, BookFlow, BookDoneScreen, BookingDetailScreen, RescheduleScreen, CancelScreen, TourScreen, WaitlistScreen, ReviewScreen } from "@/screens/booking";
import { MessagesScreen, ChatScreen } from "@/screens/inbox";
import { ProfileScreen, EditProfileScreen, ManageChildrenScreen, EmergencyScreen, PickupsScreen, PaymentsScreen, LanguageScreen, NotifPrefsScreen, PrivacyScreen, HelpScreen, SupportScreen, LegalScreen } from "@/screens/profile";
import { useKiddo, useTx } from "@/lib/store";
import type { Route } from "@/app/nav";

export function KiddoApp() {
  return (
    <NavProvider>
      <Frame />
    </NavProvider>
  );
}

function Frame() {
  const nav = useNav();
  const { tx } = useTx();
  const online = useOnline();
  const startX = useRef<number | null>(null);
  return (
    <div className="relative flex h-full min-h-0 flex-col bg-background pt-[env(safe-area-inset-top)] text-foreground">
      <StatusBar night />
      <div
        className="relative min-h-0 flex-1"
        onPointerDown={(event) => {
          if (event.clientX < 24) startX.current = event.clientX;
        }}
        onPointerUp={(event) => {
          if (startX.current != null && event.clientX - startX.current > 70 && nav.canPop) nav.pop();
          startX.current = null;
        }}
      >
        <div key={routeKey(nav.route)} className="h-full animate-screen">
          {renderRoute(nav.route)}
        </div>
      </div>
      {nav.showTabs ? <TabBar /> : null}
      {!online ? (
        <div className="bg-warning/20 px-4 py-2 text-center text-[13px] font-medium">
          {tx("You’re offline. Some actions will sync when you reconnect.", "Estás sin conexión. Algunas acciones se sincronizarán al reconectar.")}
        </div>
      ) : null}
      <div id="kiddo-overlay" className="pointer-events-none absolute inset-0 z-50" />
    </div>
  );
}

function renderRoute(route: Route) {
  switch (route.name) {
    case "splash":
      return <SplashScreen />;
    case "onboarding":
      return <OnboardingScreen />;
    case "login":
      return <LoginScreen />;
    case "register":
      return <RegisterScreen />;
    case "forgot":
      return <ForgotScreen />;
    case "otp":
      return <OtpScreen />;
    case "new-password":
      return <NewPasswordScreen />;
    case "auth-success":
      return <AuthSuccessScreen />;
    case "verify-email":
      return <VerifyEmailScreen />;
    case "permissions":
      return <PermissionsScreen />;
    case "setup":
      return <SetupScreen />;
    case "setup-done":
      return <SetupDoneScreen />;
    case "home":
      return <HomeScreen />;
    case "service":
      return <ServiceScreen />;
    case "notifications":
      return <NotificationsScreen />;
    case "child":
      return <ChildScreen />;
    case "daily":
      return <DailyScreen />;
    case "incident":
      return <IncidentScreen />;
    case "checkin":
      return <CheckinScreen />;
    case "invoices":
      return <InvoicesScreen />;
    case "invoice":
      return <InvoiceScreen />;
    case "receipt":
      return <ReceiptScreen />;
    case "documents":
      return <DocumentsScreen />;
    case "photo":
      return <PhotoScreen />;
    case "programs":
      return <ProgramsScreen />;
    case "program":
      return <ProgramDetailScreen />;
    case "staff":
      return <StaffScreen />;
    case "search":
      return <SearchScreen />;
    case "provider":
      return <ProviderScreen />;
    case "favorites":
      return <FavoritesScreen />;
    case "schedule":
    case "bookings":
      return <BookingsScreen />;
    case "book":
      return <BookFlow />;
    case "book-done":
      return <BookDoneScreen />;
    case "booking":
      return <BookingDetailScreen />;
    case "reschedule":
      return <RescheduleScreen />;
    case "cancel":
      return <CancelScreen />;
    case "tour":
      return <TourScreen />;
    case "waitlist":
      return <WaitlistScreen />;
    case "review":
      return <ReviewScreen />;
    case "messages":
      return <MessagesScreen />;
    case "chat":
      return <ChatScreen />;
    case "profile":
      return <ProfileScreen />;
    case "edit-profile":
      return <EditProfileScreen />;
    case "manage-children":
      return <ManageChildrenScreen />;
    case "emergency":
      return <EmergencyScreen />;
    case "pickups":
      return <PickupsScreen />;
    case "payment-methods":
      return <PaymentsScreen />;
    case "language":
      return <LanguageScreen />;
    case "notif-prefs":
      return <NotifPrefsScreen />;
    case "privacy":
      return <PrivacyScreen />;
    case "help":
      return <HelpScreen />;
    case "support":
      return <SupportScreen />;
    case "legal":
      return <LegalScreen />;
    default:
      return <HomeScreen />;
  }
}

function TabBar() {
  const nav = useNav();
  const { tx } = useTx();
  const { family } = useKiddo();
  const unread = family?.threads.reduce((sum, thread) => sum + thread.unread, 0) ?? 0;
  const items: { id: Tab; label: string; icon: typeof House; badge?: number }[] = [
    { id: "home", label: tx("Home", "Inicio"), icon: House },
    { id: "programs", label: tx("Programs", "Programas"), icon: LayoutGrid },
    { id: "schedule", label: tx("Schedule", "Agenda"), icon: CalendarDays },
    { id: "messages", label: tx("Messages", "Mensajes"), icon: MessageCircle, badge: unread },
    { id: "profile", label: tx("Profile", "Perfil"), icon: UserRound },
  ];
  return (
    <nav className="mx-3 mb-[max(0.75rem,env(safe-area-inset-bottom))] mt-2 flex rounded-xl bg-[#F7F4EE] px-1 py-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.35)]" aria-label="Tabs">
      {items.map((item) => {
        const Icon = item.icon;
        const active = nav.tab === item.id;
        return (
          <button key={item.id} type="button" aria-current={active ? "page" : undefined} className="relative flex min-h-14 flex-1 flex-col items-center justify-center gap-1 px-1 py-1 text-[12px] font-semibold text-[#1F2A44]" onClick={() => nav.setTab(item.id)}>
            <span className={`grid h-8 w-11 place-items-center rounded-full ${active ? "bg-[#259f94] text-white" : "text-[#1F2A44]"}`}>
              <Icon size={20} strokeWidth={2.25} />
            </span>
            <span className={active ? "text-[#14685f]" : "text-[#1F2A44]"}>{item.label}</span>
            {item.badge ? <span className="absolute right-2 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-[#FF7A6B] px-1 text-[10px] font-bold text-[#1F2A44]">{item.badge}</span> : null}
          </button>
        );
      })}
    </nav>
  );
}

function StatusBar({ night }: { night: boolean }) {
  const [time, setTime] = useState("9:41");
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
    tick();
    const id = window.setInterval(tick, 30000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div className="hidden h-12 shrink-0 items-end justify-between px-7 pb-1 text-[14px] font-semibold sm:flex" aria-hidden>
      <span>{time}</span>
      <span className={`mb-1 h-[22px] w-[92px] rounded-full ${night ? "bg-black" : "bg-ink"}`} />
      <span className="text-[12px]">5G</span>
    </div>
  );
}

function useOnline() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);
  return online;
}
