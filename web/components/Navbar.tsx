"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";

const links = [
  { href: "/", label: "Workflow" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/insights", label: "Insights" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-[#e5e7eb] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] shadow-sm">
            <ShieldCheck className="h-4 w-4 text-white" />
          </span>
          <span className="text-base sm:text-lg font-bold text-[#111827]">ProductX QA</span>
        </Link>
        <div className="flex items-center gap-3 sm:gap-6">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-medium transition-colors ${
                pathname === l.href
                  ? "text-[#4f46e5] underline underline-offset-4 decoration-2"
                  : "text-[#6b7280] hover:text-[#111827]"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
