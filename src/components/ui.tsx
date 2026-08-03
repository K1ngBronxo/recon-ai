import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function Spinner({ size = 16, className }: { size?: number; className?: string }) {
  return <Loader2 size={size} className={cn("animate-spin", className ?? "text-gold-400")} />;
}

export function Card({
  children,
  className,
  onClick,
  title,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  title?: string;
}) {
  return (
    <div
      onClick={onClick}
      title={title}
      className={cn(
        "rounded-2xl border border-white/5 bg-white/[0.03] shadow-card",
        onClick && "cursor-pointer transition hover:border-gold-500/30 hover:bg-white/[0.05]",
        className
      )}
    >
      {children}
    </div>
  );
}

export type Tone = "gold" | "green" | "red" | "amber" | "blue" | "gray";

const TONES: Record<Tone, string> = {
  gold: "bg-gold-500/15 text-gold-300 border-gold-500/30",
  green: "bg-emerald-500/10 text-emerald-300 border-emerald-500/25",
  red: "bg-red-500/10 text-red-300 border-red-500/25",
  amber: "bg-amber-500/10 text-amber-300 border-amber-500/25",
  blue: "bg-sky-500/10 text-sky-300 border-sky-500/25",
  gray: "bg-white/5 text-zinc-300 border-white/10",
};

export function Badge({
  tone = "gray",
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

type BtnVariant = "primary" | "ghost" | "outline" | "danger";

export function Btn({
  variant = "outline",
  size = "md",
  icon,
  children,
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: BtnVariant;
  size?: "sm" | "md";
  icon?: ReactNode;
}) {
  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-xl font-medium transition-all duration-150 disabled:pointer-events-none disabled:opacity-40 select-none";
  const sizes = { sm: "px-2.5 py-1.5 text-xs", md: "px-3.5 py-2 text-sm" };
  const variants: Record<BtnVariant, string> = {
    primary:
      "bg-gradient-to-b from-gold-400 to-gold-600 text-ink-950 hover:from-gold-300 hover:to-gold-500 shadow-gold",
    outline:
      "border border-white/10 bg-white/[0.04] text-zinc-200 hover:border-gold-500/40 hover:text-gold-200",
    ghost: "text-zinc-400 hover:bg-white/5 hover:text-zinc-100",
    danger: "border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20",
  };
  return (
    <button {...rest} className={cn(base, sizes[size], variants[variant], className)}>
      {icon}
      {children}
    </button>
  );
}

export function Stat({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-zinc-500">
        {icon}
        <span className="text-[11px] font-medium uppercase tracking-wider">{label}</span>
      </div>
      <div className="mt-1.5 text-2xl font-semibold text-zinc-100 tabular-nums">{value}</div>
      {sub ? <div className="mt-0.5 text-xs text-zinc-500">{sub}</div> : null}
    </Card>
  );
}

export function Chip({
  active,
  onClick,
  children,
  icon,
}: {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
        active
          ? "border-gold-500/50 bg-gold-500/15 text-gold-200"
          : "border-white/10 bg-white/[0.04] text-zinc-300 hover:border-gold-500/30 hover:text-gold-200"
      )}
    >
      {icon}
      {children}
    </button>
  );
}

export function SectionTitle({
  icon,
  title,
  right,
}: {
  icon?: ReactNode;
  title: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
        {icon}
        {title}
      </div>
      {right}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: ReactNode;
  title: string;
  body?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="rounded-2xl border border-gold-500/20 bg-gold-500/10 p-4 text-gold-400">{icon}</div>
      <div className="text-lg font-semibold text-zinc-100">{title}</div>
      {body ? <div className="max-w-md text-sm text-zinc-400">{body}</div> : null}
      {action}
    </div>
  );
}

export function ProgressBar({ pct, label }: { pct: number; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 w-full max-w-[260px] overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-gold-600 via-gold-400 to-gold-300 transition-all duration-300"
          style={{ width: `${Math.max(3, Math.min(100, pct))}%` }}
        />
      </div>
      <span className="whitespace-nowrap text-xs text-zinc-400">{label}</span>
    </div>
  );
}
