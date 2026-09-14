import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { LayoutShell } from "@/components/layout/LayoutShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Catalyst Digital | Engineering & Digital Product Studio",
  description: "Enterprise software engineering, modern cloud architectures, and digital product delivery.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <LayoutShell navbar={<Navbar />} footer={<Footer />}>
          {children}
        </LayoutShell>
      </body>
    </html>
  );
}
