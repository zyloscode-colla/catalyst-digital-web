import Link from "next/link";
import { navItems } from "@/config/nav";
import { getSiteSettings } from "@/lib/cms/service";
import { MobileNav } from "./MobileNav";

export async function Navbar() {
  const settings = await getSiteSettings();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate max-w-[200px] sm:max-w-none"
        >
          {settings.siteName}
        </Link>

        {/* Desktop Navigation Links */}
        <ul className="hidden items-center gap-5 lg:gap-7 md:flex">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors py-1"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Action Controls & Mobile Drawer Trigger */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/admin"
            className="hidden sm:inline-flex rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            Admin CMS
          </Link>
          <Link
            href="/contact"
            className="hidden sm:inline-flex rounded-xl bg-indigo-600 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
          >
            Let&apos;s talk
          </Link>

          {/* Mobile Drawer Navigation */}
          <MobileNav
            siteName={settings.siteName}
            navItems={navItems}
            primaryEmail={settings.primaryEmail}
            phone={settings.phone}
          />
        </div>
      </nav>
    </header>
  );
}
