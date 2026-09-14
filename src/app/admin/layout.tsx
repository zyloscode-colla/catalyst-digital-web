import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { getSiteSettings } from "@/lib/cms/service";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopNav } from "@/components/admin/AdminTopNav";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  const settings = await getSiteSettings();

  // On login page or unauthenticated state, render clean container
  if (!user) {
    return <div className="min-h-screen bg-slate-950 text-slate-100">{children}</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-900 text-slate-100">
      <AdminSidebar user={user} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminTopNav user={user} settings={settings} />
        <main className="flex-1 overflow-y-auto bg-slate-900 p-8">{children}</main>
      </div>
    </div>
  );
}
