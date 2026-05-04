import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  tone?: "default" | "muted" | "success" | "warning" | "danger";
  className?: string;
};

const tones: Record<NonNullable<BadgeProps["tone"]>, string> = {
  default: "border-sky-400/40 bg-sky-400/10 text-sky-200",
  muted: "border-border bg-muted text-muted-foreground",
  success: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  warning: "border-amber-400/40 bg-amber-400/10 text-amber-200",
  danger: "border-red-400/40 bg-red-400/10 text-red-200",
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
