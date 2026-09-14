import Link from "next/link";
import { ArrowLeft, Construction, Mail } from "lucide-react";

interface PageOfflineNoticeProps {
  pageTitle: string;
  offlineMessage?: string;
}

export function PageOfflineNotice({ pageTitle, offlineMessage }: PageOfflineNoticeProps) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/50 sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <Construction className="h-8 w-8 animate-pulse" />
        </div>

        <span className="mt-6 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-600">
          {pageTitle} • Temporarily Inactive
        </span>

        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Page Offline for Updates
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
          {offlineMessage ||
            "This section of our website has been temporarily taken offline by our editorial team for scheduled updates and service revisions."}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Homepage
          </Link>

          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Mail className="h-4 w-4" />
            Contact Support
          </Link>
        </div>

        <p className="mt-8 text-xs text-slate-400">
          Managed via Catalyst Digital CMS Engine
        </p>
      </div>
    </div>
  );
}
