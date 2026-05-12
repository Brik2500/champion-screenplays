import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Champion Screenplays",
  description: "Professional screenplay coverage for the streaming era.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-white antialiased" suppressHydrationWarning>
        <header className="border-b border-zinc-800 bg-zinc-950 px-6 py-4 print:hidden">
          <div className="mx-auto flex max-w-5xl items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <span className="text-lg font-bold tracking-tight text-white">Champion Screenplays</span>
            </Link>
            <nav className="ml-auto flex items-center gap-5">
              <Link href="/#pricing" className="text-sm font-medium text-zinc-400 transition hover:text-amber-400 hidden sm:block">
                Pricing
              </Link>
              <Link href="/faq" className="text-sm font-medium text-zinc-400 transition hover:text-amber-400 hidden sm:block">
                FAQ
              </Link>
              <Link
                href="/analyze"
                className="rounded-lg bg-amber-500 px-4 py-1.5 text-sm font-semibold text-black transition hover:bg-amber-400"
              >
                Get Coverage
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-6 pt-0 pb-10">{children}</main>
      </body>
    </html>
  );
}
