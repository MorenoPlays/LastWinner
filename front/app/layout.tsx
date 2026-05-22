import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/features/auth/useAuth";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "LastWinner — Plataforma de Torneios",
  description: "Plataforma de organização e gestão de torneios",
  icons: {
    icon: "/nav-logo1.png",
    apple: "/nav-logo1.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" className="h-full antialiased">
      <head>
        <link rel="icon" href="/nav-logo1.png" />
        <link rel="apple-touch-icon" href="/nav-logo1.png" />
      </head>
      <body className="min-h-full flex flex-col bg-transparent text-zinc-100" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
        <AuthProvider>
          <Navbar />
          <main className="flex-1 pt-24">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
