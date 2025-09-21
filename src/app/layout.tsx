import type { Metadata } from "next";
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
        {children}
      </body>
    </html>
  );
}
