"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BriefcaseBusiness, Building2, LayoutDashboard, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/companies", label: "企業一覧", icon: Building2 },
  { href: "/settings", label: "設定", icon: Settings },
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-zinc-800 bg-background/95 backdrop-blur lg:hidden">
        <div className="flex min-h-14 w-full flex-col gap-2 px-4 py-3">
          <Brand />
          <Nav pathname={pathname} compact />
        </div>
      </header>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-zinc-800 bg-zinc-950/95 lg:flex lg:flex-col">
        <div className="px-4 py-5">
          <Brand />
        </div>
        <div className="px-3">
          <p className="px-2 text-[11px] font-medium uppercase text-zinc-500">Workspace</p>
          <Nav pathname={pathname} />
        </div>
        <div className="mt-auto border-t border-zinc-800 px-4 py-4 text-xs leading-5 text-zinc-500">
          企業、選考、締切をひとつのワークスペースで管理
        </div>
      </aside>
    </>
  );
}

function Brand() {
  return (
    <Link href="/" className="focus-ring flex items-center gap-2 rounded-md font-semibold">
      <span className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 text-zinc-100">
        <BriefcaseBusiness className="h-4 w-4" aria-hidden />
      </span>
      <span className="truncate">shukatsu-app</span>
    </Link>
  );
}

function Nav({ pathname, compact = false }: { pathname: string; compact?: boolean }) {
  return (
    <nav className={cn("flex gap-1", compact ? "flex-wrap" : "mt-3 flex-col")}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const active =
          item.href === "/"
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "focus-ring inline-flex h-9 items-center gap-2 rounded-md px-2.5 text-sm text-muted-foreground transition-colors hover:bg-zinc-900 hover:text-foreground",
              active && "bg-zinc-900 text-foreground",
              compact && "px-3",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
