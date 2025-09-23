export const metadata = {
  title: "Art's Leap",
  description: "Self-hosted estimating & job management"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh antialiased">
        {children}
      </body>
    </html>
  );
}
