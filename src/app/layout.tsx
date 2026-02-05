import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Okul QR Sistemi",
  description: "Okul QR mesajlaşma uygulaması"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
