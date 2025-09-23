import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Art’s Leap",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        {/* Top nav */}
        <header className="border-b bg-white">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span role="img" aria-label="bricks">🧱</span> Art’s Leap
            </Link>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/" className="hover:underline">Home</Link>
              <Link href="/estimates" className="hover:underline">Estimates</Link>
              <Link href="/customers" className="hover:underline">Customers</Link>
              <Link href="/documents" className="hover:underline">Documents</Link>
            </div>
          </nav>
        </header>

        {/* Page */}
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
