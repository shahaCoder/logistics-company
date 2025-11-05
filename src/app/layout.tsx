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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

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
  /** ✅ Все иконки — одна из logo.png */
  icons: {
    icon: [
      { url: "/images/logo.png", type: "image/png" },
      { url: "/manifest-icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/manifest-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    url: "https://glco.us",
    siteName: "Global Cooperation LLC",
    title: "Global Cooperation LLC — Trucking & Freight Across the USA",
    description:
      "Reliable trucking & logistics company providing fast and safe freight delivery across the United States.",
    images: [
      {
        url: "/images/logo.png",
        width: 1200,
        height: 630,
        alt: "Global Cooperation LLC logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Global Cooperation LLC — Trucking & Freight",
    description:
      "Reliable trucking & logistics company providing fast and safe freight delivery across the US.",
    images: ["/images/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} ${cinzel.variable} antialiased`}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
