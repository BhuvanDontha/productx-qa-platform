import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ProductX QA Command Center",
  description: "Multi-Agent QA Platform powered by Gemini 2.5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#0F172A] min-h-screen text-slate-100 antialiased`}>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
