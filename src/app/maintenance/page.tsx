import Link from "next/link";
import { getSiteSettings } from "@/lib/cms/service";
import { ShieldAlert, Mail, ArrowRight } from "lucide-react";

export default async function MaintenancePage() {
  const settings = await getSiteSettings();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-center text-white sm:px-6">
      <div className="relative mx-auto max-w-xl rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-300">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          Maintenance Active
        </div>

        <h1 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {settings.maintenanceTitle || "Platform Under Scheduled Maintenance"}
        </h1>

        <p className="mt-4 text-sm text-slate-300 sm:text-base">
          {settings.maintenanceMessage ||
            "We are deploying performance enhancements and updates. Our team will be back online shortly."}
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={`mailto:${settings.primaryEmail}`}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow hover:bg-indigo-500 transition-colors"
          >
            <Mail className="h-4 w-4" />
            Contact Team ({settings.primaryEmail})
          </a>
          <Link
            href="/admin/login"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            Admin Access <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 border-t border-slate-800/80 pt-6 text-xs text-slate-500">
          © {new Date().getFullYear()} {settings.siteName}. All operational rails monitored 24/7.
        </div>
      </div>
    </div>
  );
}
