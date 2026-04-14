import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Okul QR Sistemi",
    short_name: "Okul QR",
    description: "Okul icinde QR ile hizli mesaj iletimi uygulamasi",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f6f7fb",
    theme_color: "#1a56db",
    lang: "tr",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any"
      }
    ]
  };
}
