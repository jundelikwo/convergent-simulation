import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Startup Simulator",
  description: "A turn-based startup business simulation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
