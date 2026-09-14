import Link from "next/link";
import { navItems } from "@/config/nav";
import { getSiteSettings } from "@/lib/cms/service";

export async function Footer() {
  const settings = await getSiteSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div>
          <p className="text-lg font-bold text-slate-900">{settings.siteName}</p>
          <p className="mt-3 text-sm text-slate-600">{settings.tagline}</p>
          <a href={`mailto:${settings.primaryEmail}`} className="mt-4 inline-flex text-sm text-indigo-600 hover:underline">
            {settings.primaryEmail}
          </a>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Navigation</p>
          <ul className="mt-4 space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Social & Office</p>
          <ul className="mt-4 space-y-2">
            {settings.linkedinUrl && (
              <li>
                <a
                  href={settings.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                >
                  LinkedIn
                </a>
              </li>
            )}
            <li className="text-xs text-slate-500 pt-2">
              {settings.officeAddress1}, {settings.headquarters}
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200 py-4 text-center text-sm text-slate-500">
        © {year} {settings.siteName}. All rights reserved. • Powered by Catalyst CMS
      </div>
    </footer>
  );
}
