import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  tone?: "default" | "muted" | "success" | "warning" | "danger";
  className?: string;
};

const tones: Record<NonNullable<BadgeProps["tone"]>, string> = {
  default: "border-zinc-600 bg-zinc-800 text-zinc-100",
  muted: "border-zinc-800 bg-zinc-900 text-zinc-400",
  success: "border-emerald-800 bg-emerald-950 text-emerald-200",
  warning: "border-amber-800 bg-amber-950 text-amber-200",
  danger: "border-red-800 bg-red-950 text-red-200",
};

export function Badge({ children, tone = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
