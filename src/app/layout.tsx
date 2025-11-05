// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Montserrat, Cinzel } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const cinzel = Cinzel({
  weight: "400",
  variable: "--font-cinzel",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

/** ✅ Вьюпорт задаём так (а не <meta> в разметке) */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#000000",
};

/**
 * ✅ Глобальные метаданные
 * favicon берём из public/favicon.ico (у тебя он есть),
 * плюс укажем apple-touch-icon и OpenGraph/Twitter с превью
 */
export const metadata: Metadata = {
  metadataBase: new URL("https://glco.us"),
  title: {
    default: "Global Cooperation LLC — Trucking & Freight Across the USA",
    template: "%s | Global Cooperation LLC",
  },
  description:
    "Reliable trucking & logistics company providing fast and safe freight delivery across the United States.",
  keywords: [
    "trucking company",
    "logistics",
    "freight",
    "transportation",
    "USA",
    "Ohio",
    "freight delivery",
  ],
  alternates: {
    canonical: "https://glco.us",
  },
  /** ✅ Favicon и иконки */
  icons: {
    icon: [
      { url: "/favicon.ico" }, // из public/
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    url: "https://glco.us",
    siteName: "Global Cooperation LLC",
    title: "Global Cooperation LLC — Trucking & Freight Across the USA",
    description:
      "Reliable trucking & logistics company providing fast and safe freight delivery across the United States.",
    images: [
      {
        url: "/images/preview.jpg", // положи 1200x630 в /public/images/preview.jpg
        width: 1200,
        height: 630,
        alt: "Global Cooperation LLC trucks",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Global Cooperation LLC — Trucking & Freight",
    description:
      "Reliable trucking & logistics company providing fast and safe freight delivery across the US.",
    images: ["/images/preview.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      {/* head заполняется автоматически из metadata/viewport */}
      <body className={`${montserrat.variable} ${cinzel.variable} antialiased`}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
