"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Workflow" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/insights", label: "Insights" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-[#dadce0] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          {/* Google-style four-dot mark */}
          <span className="flex gap-0.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#4285F4]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#EA4335]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#FBBC04]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#34A853]" />
          </span>
          <span className="text-lg font-bold text-[#202124]">ProductX QA</span>
        </Link>
        <div className="flex items-center gap-6">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-medium transition-colors ${
                pathname === l.href
                  ? "text-[#4285F4] underline underline-offset-4 decoration-2"
                  : "text-[#5f6368] hover:text-[#202124]"
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
