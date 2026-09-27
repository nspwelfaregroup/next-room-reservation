import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import NavLinks from "@/components/NavLinks";
import AppProvider from "@/providers/AppProvider";
import ToastProvider from "@/providers/ToastProvider";
import Bootstrapping from "@/components/Bootstrapping";
import { getCurrentUser } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "NSP Room Reservation",
  description: "ระบบจองห้องประชุม"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();

  return (
    <html lang="th" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body>
        <AppProvider initialUser={user}>
          <ToastProvider>
            <main className="min-h-screen flex flex-col max-w-lg mx-auto">
              <div className="flex-1 px-4 py-4">
                <Bootstrapping>{children}</Bootstrapping>
              </div>
              <NavLinks />
            </main>
          </ToastProvider>
        </AppProvider>
      </body>
    </html>
  );
}
