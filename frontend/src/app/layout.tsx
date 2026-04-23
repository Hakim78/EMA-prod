import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import QueryProvider from "@/lib/providers/QueryProvider";
import MainLayout from "@/components/MainLayout";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAFA" },
    { media: "(prefers-color-scheme: dark)",  color: "#0A0A0A" },
  ],
};

export const metadata: Metadata = {
  title: "EdRCF 6.0 — M&A Intelligence",
  description: "Plateforme d'origination M&A — Intelligence artificielle sur 16M cibles.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <QueryProvider>
            <MainLayout>{children}</MainLayout>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
