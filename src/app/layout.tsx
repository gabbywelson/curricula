import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Instrument_Serif } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: {
    default: "Curricula - Curated Educational Resources",
    template: "%s | Curricula",
  },
  description:
    "Discover the best courses, books, podcasts, and educational content—handpicked and organized for your learning journey.",
  metadataBase: new URL("https://curricula-v8bl.vercel.app"),
  openGraph: {
    title: "Curricula - Curated Educational Resources",
    description:
      "Discover the best courses, books, podcasts, and educational content—handpicked and organized for your learning journey.",
    url: "https://curricula-v8bl.vercel.app",
    siteName: "Curricula",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Curricula - Learn from the best. Curated for you.",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Curricula - Curated Educational Resources",
    description:
      "Discover the best courses, books, podcasts, and educational content—handpicked and organized for your learning journey.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased`}
      >
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
