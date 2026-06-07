"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/submit-report", label: "Submit Report" },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const active =
          pathname === item.href || pathname?.startsWith(item.href + "/");

        return (
          <Link
            key={item.href}
            href={item.href}
            className={[
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
              "transition-colors",
              active
                ? "bg-white/10 text-white"
                : "text-zinc-300 hover:bg-white/5 hover:text-white",
            ].join(" ")}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

