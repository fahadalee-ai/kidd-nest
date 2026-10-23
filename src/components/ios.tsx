import { createPortal } from "react-dom";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { photoSrc } from "@/data/photos";
import { useNav } from "@/app/nav";

export function haptic() {
  try {
    navigator.vibrate?.(12);
  } catch {
    /* ignore */
  }
}

export function AppButton({
  children,
  variant = "primary",
  loading,
  disabled,
  type = "button",
  onClick,
  className,
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "tertiary" | "destructive" | "apple";
  loading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
  className?: string;
}) {
  const styles = {
    primary: "bg-coral text-white",
    secondary: "bg-surface text-[var(--teal-ink)]",
    tertiary: "bg-transparent text-[var(--teal-ink)] h-11",
    destructive: "bg-transparent text-destructive h-11",
    apple: "bg-black text-white",
  }[variant];
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={() => {
        haptic();
        onClick?.();
      }}
      className={cn(
        "inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-lg px-4 text-[17px] font-semibold transition active:scale-[0.99] disabled:opacity-40",
        styles,
        className,
      )}
    >
      {loading ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : children}
    </button>
  );
}

export function AppInput({
  label,
  error,
  hint,
  multiline,
  ...props
}: {
  label?: string;
  error?: string;
  hint?: string;
  multiline?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement> &
  React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = props.id || props.name;
  const field =
    "min-h-[52px] w-full rounded-xl bg-surface px-3.5 text-[17px] text-ink outline-none placeholder:text-[#5C6578]";
  return (
    <label className="block" htmlFor={id}>
      {label ? <span className="mb-1 block text-[15px] font-medium text-foreground">{label}</span> : null}
      {multiline ? (
        <textarea id={id} className={cn(field, "min-h-28 py-3")} {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)} />
      ) : (
        <input id={id} className={field} {...(props as React.InputHTMLAttributes<HTMLInputElement>)} />
      )}
      {error ? <span className="mt-1 block text-[13px] text-destructive">{error}</span> : null}
      {!error && hint ? <span className="mt-1 block text-[12px] text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

export function AppSelect({
  label,
  value,
  options,
  onChange,
  placeholder = "Select",
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (next: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const current = options.find((option) => option.value === value);
  return (
    <div>
      {label ? <span className="mb-1 block text-[15px] font-medium text-foreground">{label}</span> : null}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        className="flex min-h-[52px] w-full items-center justify-between rounded-xl bg-surface px-3.5 text-left text-[17px] text-ink"
        onClick={() => setOpen(true)}
      >
        <span>{current?.label || placeholder}</span>
        <ChevronDown size={20} aria-hidden />
      </button>
      <BottomSheet open={open} onClose={() => setOpen(false)} title={label} detent="medium">
        <div role="listbox" aria-label={label} className="overflow-hidden rounded-2xl" style={{ backgroundColor: "#F4EEE6" }}>
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <button
                key={option.value || "empty"}
                type="button"
                role="option"
                aria-selected={selected}
                className="flex min-h-[52px] w-full items-center justify-between border-b border-[#E8E2D9] px-4 text-left text-[17px] font-semibold last:border-0"
                style={{ color: selected ? "#0F6E64" : "#1F2A44", backgroundColor: selected ? "#E6F7F4" : "#F4EEE6" }}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                {option.label}
                {selected ? <Check size={18} aria-hidden /> : null}
              </button>
            );
          })}
        </div>
      </BottomSheet>
    </div>
  );
}

export function OtpInput({ value, onChange, length = 4 }: { value: string; onChange: (next: string) => void; length?: number }) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const chars = value.padEnd(length, " ").slice(0, length).split("");
  return (
    <div className="grid grid-cols-4 gap-3" role="group" aria-label="Verification code">
      {chars.map((char, index) => (
        <input
          key={index}
          ref={(node) => {
            refs.current[index] = node;
          }}
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${index + 1}`}
          maxLength={1}
          value={char.trim()}
          className="h-[72px] w-full rounded-2xl border-2 border-transparent bg-white text-center text-[32px] font-bold text-[#1F2A44] shadow-card outline-none focus:border-[#259f94]"
          onChange={(event) => {
            const digit = event.target.value.replace(/\D/g, "").slice(-1);
            const next = value.padEnd(length, " ").split("");
            next[index] = digit || " ";
            const joined = next.join("").replace(/\s/g, "").slice(0, length);
            onChange(joined);
            if (digit && index < length - 1) refs.current[index + 1]?.focus();
          }}
          onKeyDown={(event) => {
            if (event.key === "Backspace" && !chars[index].trim() && index > 0) refs.current[index - 1]?.focus();
          }}
          onPaste={(event) => {
            const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
            if (!pasted) return;
            event.preventDefault();
            onChange(pasted);
            refs.current[Math.min(length - 1, pasted.length)]?.focus();
          }}
        />
      ))}
    </div>
  );
}

export function BackButton({ className }: { className?: string }) {
  const nav = useNav();
  if (!nav.canPop) return null;
  return (
    <button
      type="button"
      aria-label={nav.tx("Back", "Atrás")}
      onClick={() => nav.pop()}
      className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#E6F7F4] text-[#1F2A44]", className)}
    >
      <ChevronLeft size={22} strokeWidth={2.5} />
    </button>
  );
}

export function ScreenHeader({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <header className="relative flex h-14 shrink-0 items-center px-4">
      <BackButton />
      <h1 className="pointer-events-none absolute inset-x-16 truncate text-center text-[17px] font-bold leading-tight text-[#F7F4EE]">{title}</h1>
      <div className="ml-auto flex min-h-11 min-w-11 items-center justify-end">{right}</div>
    </header>
  );
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
  ariaLabel: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="grid rounded-2xl bg-[#102033] p-1"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => (
        <button
          key={option.id}
          role="tab"
          aria-selected={value === option.id}
          className={cn(
            "min-h-12 rounded-xl px-2 text-[15px] font-semibold",
            value === option.id ? "bg-[#259f94] text-white" : "text-[#F7F4EE]",
          )}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function ToggleRow({
  label,
  detail,
  checked,
  onChange,
}: {
  label: string;
  detail?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex min-h-11 w-full items-center gap-3 py-2 text-left"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-[17px]">{label}</span>
        {detail ? <span className="block text-[13px] text-muted-foreground">{detail}</span> : null}
      </span>
      <span className={cn("h-[31px] w-[51px] rounded-full p-0.5 transition", checked ? "bg-primary" : "bg-[#D5D0C8]")}>
        <span className={cn("block h-[27px] w-[27px] rounded-full bg-white shadow transition", checked && "translate-x-5")} />
      </span>
    </button>
  );
}

export function ChipGroup({
  options,
  value,
  onChange,
  multiple,
}: {
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
  multiple?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const on = value.includes(option);
        return (
          <button
            key={option}
            type="button"
            aria-pressed={on}
            onClick={() => {
              if (!multiple) {
                onChange(on ? [] : [option]);
                return;
              }
              onChange(on ? value.filter((item) => item !== option) : [...value, option]);
            }}
            className={cn(
              "min-h-11 rounded-full px-4 text-[15px] font-medium",
              on ? "bg-primary text-white" : "bg-surface text-ink",
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "Paid" || status === "Confirmed" || status === "Checked In" || status === "Completed" || status === "Enrolled" || status === "Active"
      ? "bg-[#143d32] text-[#B8F5D8]"
      : status === "Pending" || status === "Due" || status === "Submitted" || status === "Under Review" || status === "Offered"
        ? "bg-[#4A3510] text-[#FFE3A6]"
        : status === "Overdue" || status === "Cancelled"
          ? "bg-[#4A1C22] text-[#FFD0D2]"
          : "bg-[#E6F7F4] text-[#1F2A44]";
  return <span className={cn("inline-flex min-h-7 items-center rounded-full px-2.5 text-[12px] font-semibold", tone)}>{status}</span>;
}

export function RatingStars({ value, count }: { value: number; count?: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-ink">
      <Star size={14} className="fill-sun text-sun" aria-hidden />
      {value.toFixed(1)}
      {count != null ? <span className="font-normal text-muted-foreground">({count})</span> : null}
    </span>
  );
}

export function StarsInput({ value, onChange }: { value: number; onChange: (next: number) => void }) {
  return (
    <div className="flex gap-2" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" aria-label={`${star} stars`} className="grid h-11 w-11 place-items-center" onClick={() => onChange(star)}>
          <Star size={28} className={star <= value ? "fill-sun text-sun" : "text-line"} />
        </button>
      ))}
    </div>
  );
}

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="mb-3 flex items-end justify-between">
      <h2 className="text-[22px] font-semibold tracking-tight">{title}</h2>
      {action ? (
        <button type="button" onClick={onAction} className="min-h-11 text-[15px] font-semibold text-[var(--teal-ink)]">
          {action}
        </button>
      ) : null}
    </div>
  );
}

export function ListRow({
  title,
  detail,
  icon,
  onClick,
  trailing,
  destructive,
}: {
  title: string;
  detail?: string;
  icon?: ReactNode;
  onClick?: () => void;
  trailing?: ReactNode;
  destructive?: boolean;
}) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className="flex min-h-[52px] w-full items-center gap-3 px-4 py-2 text-left"
    >
      {icon ? <span className="grid h-9 w-9 place-items-center rounded-xl bg-surface text-primary">{icon}</span> : null}
      <span className="min-w-0 flex-1">
        <span className={cn("block truncate text-[17px]", destructive && "text-destructive")}>{title}</span>
        {detail ? <span className="block truncate text-[13px] text-muted-foreground">{detail}</span> : null}
      </span>
      {trailing}
    </Comp>
  );
}

export function Group({ children }: { children: ReactNode }) {
  return <div className="divide-y divide-line overflow-hidden rounded-2xl bg-card shadow-card">{children}</div>;
}

export function EmptyState({
  image,
  title,
  body,
  action,
  onAction,
}: {
  image: string;
  title: string;
  body: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="px-4 py-10 text-center">
      <img src={photoSrc(image)} alt="" className="mx-auto h-36 w-auto" />
      <h2 className="mt-4 text-[22px] font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-[280px] text-[15px] leading-relaxed text-muted-foreground">{body}</p>
      {action ? (
        <div className="mx-auto mt-5 max-w-[240px]">
          <AppButton onClick={onAction}>{action}</AppButton>
        </div>
      ) : null}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-card">
      <p className="text-[15px] text-destructive">{message}</p>
      <button type="button" onClick={onRetry} className="mt-3 min-h-11 font-semibold text-[var(--teal-ink)]">
        Retry
      </button>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl bg-card shadow-card">
      <div className="skeleton h-28" />
      <div className="space-y-2 p-4">
        <div className="skeleton h-4 w-2/3 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}

export function StepProgressBar({ step, total, label }: { step: number; total: number; label: string }) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-[13px] font-medium text-muted-foreground">
        <span>{label}</span>
        <span>
          {step}/{total}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
        <div className="h-full rounded-full bg-primary" style={{ width: `${(step / total) * 100}%` }} />
      </div>
    </div>
  );
}

export function PageDots({ count, index, light = false }: { count: number; index: number; light?: boolean }) {
  return (
    <div className="flex justify-center gap-2" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={cn(
            "h-2 rounded-full",
            light
              ? i === index
                ? "w-5 bg-white"
                : "w-2 bg-white/50"
              : i === index
                ? "w-5 bg-primary"
                : "w-2 bg-line",
          )}
        />
      ))}
    </div>
  );
}

export function Photo({
  id,
  alt,
  className,
  priority = false,
}: {
  id: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const src = photoSrc(id);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <div className={cn("skeleton", className)} role="img" aria-label={alt} />;
  }
  return (
    <span className={cn("relative block overflow-hidden bg-surface", className)}>
      {!loaded ? <span className="skeleton absolute inset-0" /> : null}
      <picture>
        <source srcSet={`${src} 1x, ${src} 2x, ${src} 3x`} />
        <img
          src={src}
          srcSet={`${src} 1x, ${src} 2x, ${src} 3x`}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn("h-full w-full object-cover transition duration-300", loaded ? "opacity-100" : "scale-105 opacity-0 blur-sm")}
        />
      </picture>
    </span>
  );
}

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  detent = "large",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  detent?: "medium" | "large";
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!open || !mounted) return null;
  const root = document.getElementById("kiddo-overlay");
  if (!root) return null;
  return createPortal(
    <div className="pointer-events-auto absolute inset-0 z-50 flex items-end">
      <button type="button" aria-label="Dismiss" className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className={cn("relative flex w-full flex-col rounded-t-3xl shadow-card", detent === "medium" ? "max-h-[58%]" : "max-h-[88%]")}
        style={{ backgroundColor: "#ffffff", color: "#1F2A44" }}
      >
        <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-[#E8E2D9]" />
        {title ? (
          <h2 className="px-5 pb-2 pt-3 text-[20px] font-semibold" style={{ color: "#1F2A44" }}>
            {title}
          </h2>
        ) : null}
        <div className="overflow-y-auto px-5 pb-8">{children}</div>
      </div>
    </div>,
    root,
  );
}

export function WheelColumn({ options, value, onChange }: { options: string[]; value: string; onChange: (next: string) => void }) {
  const scroller = useRef<HTMLDivElement>(null);
  const settle = useRef<number | null>(null);

  useLayoutEffect(() => {
    const root = scroller.current;
    if (!root) return;
    const selected = root.querySelector<HTMLElement>("[data-selected='true']");
    if (!selected) return;
    root.scrollTop = selected.offsetTop - (root.clientHeight - selected.offsetHeight) / 2;
  }, [value, options]);

  useEffect(() => () => {
    if (settle.current) window.clearTimeout(settle.current);
  }, []);

  const onScroll = () => {
    const root = scroller.current;
    if (!root) return;
    if (settle.current) window.clearTimeout(settle.current);
    settle.current = window.setTimeout(() => {
      const item = root.querySelector<HTMLElement>("button");
      if (!item) return;
      const height = item.offsetHeight || 44;
      const index = Math.min(options.length - 1, Math.max(0, Math.round(root.scrollTop / height)));
      const next = options[index];
      if (next && next !== value) onChange(next);
    }, 80);
  };

  return (
    <div className="relative h-44 flex-1 overflow-hidden">
      <div ref={scroller} onScroll={onScroll} className="no-scrollbar h-full snap-y snap-mandatory overflow-y-auto py-[66px]">
        {options.map((option) => {
          const selected = option === value;
          return (
            <button
              key={option}
              type="button"
              data-selected={selected}
              onClick={() => onChange(option)}
              className="flex h-11 w-full snap-center items-center justify-center rounded-xl text-[22px]"
              style={{
                color: selected ? "#1F2A44" : "#3E4A63",
                fontWeight: selected ? 700 : 500,
                backgroundColor: selected ? "#E6F7F4" : "transparent",
              }}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function DateWheel({ value, onChange, minYear, maxYear }: { value: string; onChange: (iso: string) => void; minYear: number; maxYear: number }) {
  const parsed = value ? new Date(`${value}T12:00:00`) : new Date(1992, 5, 14);
  const month = MONTHS[parsed.getMonth()] ?? "Jan";
  const day = String(parsed.getDate());
  const year = String(parsed.getFullYear());
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => String(maxYear - i));
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1));
  const commit = (m: string, d: string, y: string) => {
    const monthIndex = MONTHS.indexOf(m) + 1;
    onChange(`${y}-${String(monthIndex).padStart(2, "0")}-${d.padStart(2, "0")}`);
  };
  return (
    <div className="flex gap-2">
      <WheelColumn options={MONTHS} value={month} onChange={(next) => commit(next, day, year)} />
      <WheelColumn options={days} value={day} onChange={(next) => commit(month, next, year)} />
      <WheelColumn options={years} value={year} onChange={(next) => commit(month, day, next)} />
    </div>
  );
}

export function CalendarMonth({ value, onChange, disablePast }: { value: string; onChange: (iso: string) => void; disablePast?: boolean }) {
  const base = value ? new Date(`${value}T12:00:00`) : new Date();
  const [cursor, setCursor] = useState(new Date(base.getFullYear(), base.getMonth(), 1));
  const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const gridStart = new Date(start);
  gridStart.setDate(1 - start.getDay());
  const days = Array.from({ length: 42 }, (_, i) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + i);
    return date;
  }).filter((_, index, all) => {
    const week = all.slice(Math.floor(index / 7) * 7, Math.floor(index / 7) * 7 + 7);
    return week.some((day) => day.getMonth() === cursor.getMonth());
  });
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  return (
    <div className="rounded-2xl bg-card px-2 py-3 shadow-card">
      <div className="mb-2 flex items-center justify-between px-1">
        <button type="button" aria-label="Previous month" className="grid h-10 w-10 place-items-center rounded-full bg-[#14263e] text-[#F7F4EE]" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>
          <ChevronLeft size={20} strokeWidth={2.5} />
        </button>
        <p className="text-[17px] font-semibold text-[#F7F4EE]">{cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
        <button type="button" aria-label="Next month" className="grid h-10 w-10 place-items-center rounded-full bg-[#14263e] text-[#F7F4EE]" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>
          <ChevronRight size={20} strokeWidth={2.5} />
        </button>
      </div>
      <div className="grid grid-cols-7 text-center text-[11px] font-semibold uppercase tracking-wide text-[#8EE0D6]">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
          <span key={`${day}${i}`} className="py-1">
            {day}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((date) => {
          const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
          const outside = date.getMonth() !== cursor.getMonth();
          const disabled = Boolean(disablePast && date < today);
          const selected = iso === value;
          const isToday = iso === todayIso;
          const color = selected ? "#ffffff" : outside || disabled ? "#9BB0C7" : "#F7F4EE";
          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              aria-current={isToday ? "date" : undefined}
              aria-pressed={selected}
              onClick={() => {
                if (outside) setCursor(new Date(date.getFullYear(), date.getMonth(), 1));
                onChange(iso);
              }}
              className={cn(
                "mx-auto grid h-10 w-10 place-items-center rounded-full text-[15px] font-semibold disabled:opacity-100",
                selected && "bg-[#259f94]",
                !selected && isToday && "ring-2 ring-[#8EE0D6]",
              )}
              style={{ color }}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SliderField({
  label,
  min,
  max,
  value,
  onChange,
  format,
}: {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (next: number) => void;
  format: (n: number) => string;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between text-[15px]">
        <span>{label}</span>
        <span className="font-semibold text-[var(--teal-ink)]">{format(value)}</span>
      </span>
      <input className="w-full" type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

export function Stepper({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <div className="flex min-h-11 items-center justify-between">
      <span className="text-[17px]">{label}</span>
      <span className="flex items-center gap-3">
        <button type="button" aria-label="Decrease" className="grid h-11 w-11 place-items-center rounded-full bg-surface text-xl" onClick={() => onChange(Math.max(min, value - 1))}>
          –
        </button>
        <span className="w-6 text-center font-semibold">{value}</span>
        <button type="button" aria-label="Increase" className="grid h-11 w-11 place-items-center rounded-full bg-surface text-xl" onClick={() => onChange(Math.min(max, value + 1))}>
          +
        </button>
      </span>
    </div>
  );
}

export function CheckRow({ label, checked, onChange }: { label: ReactNode; checked: boolean; onChange: (next: boolean) => void }) {
  return (
    <label className="flex min-h-11 items-start gap-3 py-1 text-[15px] leading-snug">
      <input type="checkbox" className="mt-1 h-5 w-5 accent-[var(--primary)]" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

export function SignaturePad({ onChange }: { onChange: (data: string) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(2, 2);
    ctx.strokeStyle = "#1F2A44";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
  }, []);
  const pos = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = ref.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };
  return (
    <canvas
      ref={ref}
      className="h-32 w-full touch-none rounded-xl bg-white"
      aria-label="Signature"
      onPointerDown={(event) => {
        drawing.current = true;
        const ctx = ref.current?.getContext("2d");
        const p = pos(event);
        ctx?.beginPath();
        ctx?.moveTo(p.x, p.y);
      }}
      onPointerMove={(event) => {
        if (!drawing.current) return;
        const ctx = ref.current?.getContext("2d");
        const p = pos(event);
        ctx?.lineTo(p.x, p.y);
        ctx?.stroke();
      }}
      onPointerUp={() => {
        drawing.current = false;
        if (ref.current) onChange(ref.current.toDataURL());
      }}
    />
  );
}

export function QrBlock({ value }: { value: string }) {
  const cells = useMemo(() => {
    const size = 21;
    const grid = Array.from({ length: size }, () => Array(size).fill(false));
    const finder = (x: number, y: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const edge = r === 0 || c === 0 || r === 6 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
          grid[y + r][x + c] = edge;
        }
      }
    };
    finder(0, 0);
    finder(14, 0);
    finder(0, 14);
    let hash = 0;
    for (const ch of value) hash = (hash * 33 + ch.charCodeAt(0)) >>> 0;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c]) continue;
        if ((r < 8 && c < 8) || (r < 8 && c > 12) || (c < 8 && r > 12)) continue;
        hash = (hash * 1664525 + 1013904223) >>> 0;
        grid[r][c] = hash % 3 !== 0;
      }
    }
    return grid;
  }, [value]);
  return (
    <svg viewBox="0 0 21 21" className="h-48 w-48 rounded-xl bg-white p-2" role="img" aria-label="Check-in QR code">
      {cells.map((row, y) =>
        row.map((on, x) => (on ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#1F2A44" /> : null)),
      )}
    </svg>
  );
}

export function SuccessMark() {
  return (
    <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-surface" aria-hidden>
      <svg viewBox="0 0 48 48" className="h-12 w-12">
        <circle className="success-ring" cx="24" cy="24" r="18" fill="none" stroke="#259f94" strokeWidth="3" />
        <path className="success-check" d="M15 25 l6 6 12-14" fill="none" stroke="#259f94" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function MenuButton({ label, options, onSelect }: { label: string; options: string[]; onSelect: (option: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="inline-flex min-h-11 items-center gap-1 rounded-full bg-card px-3 text-[15px] font-semibold shadow-card">
        {label}
        <span aria-hidden>▾</span>
      </button>
      {open ? (
        <div role="menu" className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl bg-card py-1 shadow-card">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              role="menuitem"
              className="block min-h-11 w-full px-4 text-left text-[15px]"
              onClick={() => {
                onSelect(option);
                setOpen(false);
              }}
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function SwipeRow({
  children,
  actions,
  className,
}: {
  children: ReactNode;
  actions: { label: string; tone: "teal" | "danger"; onPress: () => void }[];
  className?: string;
}) {
  const [x, setX] = useState(0);
  const start = useRef(0);
  const width = actions.length * 84;
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div className="absolute inset-y-0 right-0 flex">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => {
              setX(0);
              action.onPress();
            }}
            className={cn("w-[84px] text-[12px] font-semibold text-white", action.tone === "danger" ? "bg-destructive" : "bg-primary")}
          >
            {action.label}
          </button>
        ))}
      </div>
      <div
        className="relative bg-card"
        style={{ transform: `translateX(${x}px)` }}
        onPointerDown={(event) => {
          start.current = event.clientX - x;
        }}
        onPointerMove={(event) => {
          if (event.buttons === 0 && event.pointerType === "mouse") return;
          const next = Math.min(0, Math.max(-width, event.clientX - start.current));
          setX(next);
        }}
        onPointerUp={() => setX(x < -width / 2 ? -width : 0)}
        onContextMenu={(event) => {
          event.preventDefault();
          setX(x === 0 ? -width : 0);
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function Screen({
  title,
  large,
  back = true,
  right,
  children,
  footer,
  onRefresh,
}: {
  title?: string;
  large?: boolean;
  back?: boolean;
  right?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  onRefresh?: () => Promise<void> | void;
}) {
  const nav = useNav();
  const [scrolled, setScrolled] = useState(false);
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const start = useRef<number | null>(null);
  const showBack = back && nav.canPop;
  return (
    <div className="flex h-full flex-col">
      <header className="relative flex h-14 shrink-0 items-center px-4">
        {showBack ? <BackButton /> : <span className="h-11 w-11" />}
        <h1 className={cn("pointer-events-none absolute inset-x-16 truncate text-center text-[17px] font-bold leading-tight text-[#F7F4EE]", large && !scrolled && "opacity-0")}>{title}</h1>
        <div className="ml-auto flex min-h-11 min-w-11 items-center justify-end">{right}</div>
      </header>
      <div
        className="min-h-0 flex-1 overflow-y-auto"
        onScroll={(event) => setScrolled(event.currentTarget.scrollTop > 24)}
        onPointerDown={(event) => {
          if (event.currentTarget.scrollTop <= 0) start.current = event.clientY;
        }}
        onPointerMove={(event) => {
          if (start.current == null || event.currentTarget.scrollTop > 0) return;
          setPull(Math.max(0, Math.min(72, event.clientY - start.current)));
        }}
        onPointerUp={async () => {
          if (pull > 56 && onRefresh) {
            setRefreshing(true);
            try {
              if (!navigator.onLine) setError(nav.tx("You’re offline. Pull again when you reconnect.", "Estás sin conexión. Desliza de nuevo al reconectar."));
              else {
                setError("");
                await onRefresh();
              }
            } finally {
              setRefreshing(false);
            }
          }
          start.current = null;
          setPull(0);
        }}
      >
        {(pull > 8 || refreshing) && (
          <p className="pb-1 text-center text-[12px] text-muted-foreground">{refreshing ? nav.tx("Refreshing…", "Actualizando…") : nav.tx("Release to refresh", "Suelta para actualizar")}</p>
        )}
        <div className="px-5 pb-8">
          {large && title ? <h2 className="mb-4 text-[34px] font-bold leading-none tracking-tight">{title}</h2> : null}
          {error ? (
            <div className="mb-4">
              <ErrorState message={error} onRetry={() => onRefresh?.()} />
            </div>
          ) : null}
          {children}
        </div>
      </div>
      {footer ? <div className="shrink-0 border-t border-line bg-background/95 px-5 py-3 backdrop-blur">{footer}</div> : null}
    </div>
  );
}

export function DocumentUploadTile({ label, onPick }: { label: string; onPick: () => void }) {
  return (
    <button
      type="button"
      onClick={onPick}
      className="flex min-h-[72px] w-full items-center justify-center rounded-2xl border border-dashed border-line bg-surface px-4 text-center text-[15px] font-semibold text-[var(--teal-ink)]"
    >
      {label}
    </button>
  );
}

export function useBootSkeleton() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 650);
    return () => window.clearTimeout(t);
  }, []);
  return loading;
}
