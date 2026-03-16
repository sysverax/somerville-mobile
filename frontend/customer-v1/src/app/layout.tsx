import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/src/components/ui/toaster";

export const metadata: Metadata = {
  title: "Somerville Mobile",

  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}