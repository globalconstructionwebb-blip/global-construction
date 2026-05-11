import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Global Construction – Certifierad Totalentreprenad",
  description: "Bygg framtiden med oss. Vi levererar säkra och optimerade lösningar för konstruktion och skyddsrum.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" className={`${inter.variable} ${outfit.variable} h-full antialiased scroll-smooth`}>
      <body className="min-h-full font-sans text-slate-900 bg-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
