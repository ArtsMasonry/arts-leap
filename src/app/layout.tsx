import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Art’s Leap",
    template: "%s • Art’s Leap",
  },
  description: "Estimates, proposals, and jobs for Art’s Masonry.",
  metadataBase: new URL("https://arts-leap--arts-leap.us-central1.hosted.app"),
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            "-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif",
          background: "#f7f7f7",
          color: "#111",
        }}
      >
        {/* Top nav with logo */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            background: "white",
            borderBottom: "1px solid #eee",
          }}
        >
          <nav
            style={{
              maxWidth: 1000,
              margin: "0 auto",
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                textDecoration: "none",
                color: "#111",
                fontWeight: 700,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="Art’s Masonry logo"
                width={36}
                height={36}
                style={{ borderRadius: 6, objectFit: "cover" }}
              />
              <span>Art’s Leap</span>
            </Link>

            <div style={{ flex: 1 }} />

            <Link href="/" style={{ textDecoration: "none", color: "#333" }}>
              Home
            </Link>
            <Link
              href="/estimates"
              style={{ textDecoration: "none", color: "#333" }}
            >
              Estimates
            </Link>
            {/* later: /request-bid public page link if desired */}
          </nav>
        </header>

        <main style={{ maxWidth: 1000, margin: "16px auto", padding: "0 16px" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
