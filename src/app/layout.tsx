import "./globals.css";
import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import SwRegister from "./sw-register";

export const metadata: Metadata = {
  title: "Okul QR Sistemi",
  description: "Okul QR mesajlaşma uygulaması",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Okul QR Sistemi"
  },
  formatDetection: {
    telephone: false
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1a56db"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <SwRegister />
        <main>{children}</main>
      </body>
    </html>
  );
}
