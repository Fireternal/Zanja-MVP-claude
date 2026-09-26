import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./mobile.css";
import "./court.css";
import "./overlays.css";
import "./creator.css";
import "./motion.css";

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#21162f" };

export const metadata: Metadata = {
  title: "ZANJA · Tu criterio entra en juego",
  description: "Dos versiones. Tu criterio. Entra en la Arena y zanja los dilemas de cada día.",
  manifest: "/manifest.webmanifest",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
