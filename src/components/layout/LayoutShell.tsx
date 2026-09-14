"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

interface LayoutShellProps {
  navbar: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}

export function LayoutShell({ navbar, footer, children }: LayoutShellProps) {
  const pathname = usePathname();
  const isStandalone = Boolean(
    pathname && (pathname.startsWith("/admin") || pathname.startsWith("/maintenance"))
  );

  if (isStandalone) {
    return <main className="min-h-full flex-1">{children}</main>;
  }

  return (
    <>
      {navbar}
      <main className="flex-1">{children}</main>
      {footer}
    </>
  );
}
