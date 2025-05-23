import type { Metadata } from "next";
import { Geist } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const geist = Geist({
  variable: "--font-sans-geist",
  fallback: ["Inter", "sans-serif"],
});

export const metadata: Metadata = {
  title: "YAC",
  description: "Yet Another Chat | Because the world needed one more",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} bg-black text-white`}>
        {children}
      </body>
    </html>
  );
}
