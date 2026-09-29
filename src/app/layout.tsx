import type { Metadata } from "next";
import { preconnect } from "react-dom";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Murder Party",
  description: "Murder Party 1900 — Qui a tué la Comtesse ?",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  preconnect("https://fonts.googleapis.com");
  preconnect("https://fonts.gstatic.com", { crossOrigin: "anonymous" });
  return (
    <html lang="fr" className="dark">
      <body className="min-h-screen">
        <Toaster theme="dark" position="top-center" richColors />
        {children}
      </body>
    </html>
  );
}
