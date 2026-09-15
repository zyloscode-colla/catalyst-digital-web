"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight, Shield, Mail, Phone } from "lucide-react";
import type { NavItem } from "@/types";

interface MobileNavProps {
  siteName: string;
  navItems: readonly NavItem[];
  primaryEmail?: string;
  phone?: string;
}

export function MobileNav({
  siteName,
  navItems,
  primaryEmail = "hello@catalystdigital.com",
  phone = "+1 (800) 555-0199",
}: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer whenever route changes without cascading render effects
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
  }

  // Handle ESC key to dismiss drawer
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <div className="md:hidden">
      {/* Accessible Hamburger Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 active:scale-95"
        aria-expanded={isOpen}
        aria-controls="mobile-navigation-drawer"
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Slide-in Drawer & Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <div
            id="mobile-navigation-drawer"
            className="relative ml-auto flex h-full w-full max-w-xs flex-col justify-between bg-white px-6 py-6 shadow-2xl ring-1 ring-slate-900/10 pt-safe pb-safe z-50 overflow-y-auto"
          >
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className="text-base font-bold text-slate-900 tracking-tight"
                >
                  {siteName}
                </Link>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="mt-6 flex flex-col space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex min-h-[48px] items-center justify-between rounded-xl px-4 text-base font-medium transition-colors ${
                        isActive
                          ? "bg-indigo-50 text-indigo-600 font-semibold"
                          : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <span>{item.label}</span>
                      {isActive && <div className="h-1.5 w-1.5 rounded-full bg-indigo-600" />}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Actions & Quick Contact */}
            <div className="border-t border-slate-100 pt-6 space-y-4">
              <Link
                href="/contact"
                onClick={() => setIsOpen(false)}
                className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 active:scale-[0.98] transition-all"
              >
                Let&apos;s talk
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-center text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <Shield className="h-3.5 w-3.5 text-indigo-600" />
                Administrator CMS
              </Link>

              <div className="pt-2 text-xs text-slate-500 space-y-1.5">
                <a
                  href={`mailto:${primaryEmail}`}
                  className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors py-1"
                >
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  {primaryEmail}
                </a>
                <a
                  href={`tel:${phone}`}
                  className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors py-1"
                >
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  {phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
