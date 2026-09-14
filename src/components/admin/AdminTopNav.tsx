"use client";

import Link from "next/link";
import { ExternalLink, ShieldAlert, User } from "lucide-react";
import type { AdminUser, SiteSettings } from "@/types/cms";

interface AdminTopNavProps {
  user: AdminUser;
  settings: SiteSettings;
}

export function AdminTopNav({ user, settings }: AdminTopNavProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950 px-8 text-slate-300">
      <div className="flex items-center gap-3">
        <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
        <p className="text-xs font-medium text-slate-400">
          Connected to <span className="text-slate-200 font-semibold">{settings.siteName} CMS</span>
        </p>
      </div>

      <div className="flex items-center gap-4">
        {settings.maintenanceMode ? (
          <Link
            href="/admin/settings"
            className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-300 animate-pulse hover:bg-amber-500/20 transition-all"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            Maintenance Mode Active
          </Link>
        ) : (
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Site Live
          </div>
        )}

        <div className="hidden items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 md:flex">
          <User className="h-3.5 w-3.5 text-indigo-400" />
          <span>{user.fullName}</span>
        </div>

        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5 text-indigo-400" />
          Visit Live Site
        </Link>
      </div>
    </header>
  );
}
