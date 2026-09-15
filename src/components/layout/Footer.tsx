import Link from "next/link";
import { navItems } from "@/config/nav";
import { getSiteSettings } from "@/lib/cms/service";

export async function Footer() {
  const settings = await getSiteSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-slate-50 pb-safe">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:py-14 sm:px-6 sm:grid-cols-2 lg:grid-cols-3 lg:px-8">
        {/* Brand Col */}
        <div>
          <p className="text-base sm:text-lg font-bold text-slate-900">{settings.siteName}</p>
          <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">{settings.tagline}</p>
          <a
            href={`mailto:${settings.primaryEmail}`}
            className="mt-3.5 inline-flex items-center text-xs sm:text-sm font-medium text-indigo-600 hover:text-indigo-500 py-1 transition-colors"
          >
            {settings.primaryEmail}
          </a>
        </div>

        {/* Navigation Col */}
        <div>
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-500">Navigation</p>
          <ul className="mt-3.5 space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-block py-1.5 text-xs sm:text-sm text-slate-600 hover:text-slate-900 transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Social & Office Col */}
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-500">Social & Office</p>
          <ul className="mt-3.5 space-y-1.5">
            {settings.linkedinUrl && (
              <li>
                <a
                  href={settings.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block py-1.5 text-xs sm:text-sm text-slate-600 hover:text-slate-900 transition-colors"
                >
                  LinkedIn ↗
                </a>
              </li>
            )}
            <li className="text-xs text-slate-500 pt-2 leading-relaxed">
              {settings.officeAddress1}, {settings.headquarters}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200/80 py-4 px-4 text-center text-xs text-slate-500">
        © {year} {settings.siteName}. All rights reserved. • Powered by Catalyst CMS
      </div>
    </footer>
  );
}
