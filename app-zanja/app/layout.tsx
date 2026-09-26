import type { Viewport } from "next";
import "./globals.css";
import "./mobile.css";
import "./court.css";
import "./overlays.css";
import "./creator.css";
import "./motion.css";

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#21162f" };


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
