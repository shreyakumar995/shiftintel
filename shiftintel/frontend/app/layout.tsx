import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarNav } from "./_components/SidebarNav";
import ChatWidget from "@/components/Chatwidget";
import { Toaster } from "react-hot-toast";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShiftIntel",
  description: "Internal steel plant operations tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-zinc-950 text-zinc-50">
        <div className="min-h-full grid grid-cols-[260px_1fr] print:grid-cols-1">
          <aside className="no-print border-r border-white/10 bg-zinc-950">
            <div className="flex h-14 items-center px-5 border-b border-white/10">
              <div className="text-sm font-semibold tracking-wide text-zinc-100">
                ShiftIntel
              </div>
            </div>
            <div className="p-3">
              <SidebarNav />
            </div>
          </aside>


          <div className="min-w-0 bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
            <header className="no-print h-14 border-b border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-950/60 backdrop-blur supports-[backdrop-filter]:bg-white/50 supports-[backdrop-filter]:dark:bg-zinc-950/40">
              <div className="h-full flex items-center px-6 text-sm text-zinc-600 dark:text-zinc-300">
                Internal steel plant tool
              </div>
            </header>
            <main className="p-6">{children}</main>
          </div>
          <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#18181b",
              color: "#f4f4f5",
              border: '1px solid rgba(255,255,255,0.1)',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
          />

        </div>
        <ChatWidget />
      </body>
    </html>
  );
}
