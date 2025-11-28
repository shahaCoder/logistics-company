import type { Metadata, Viewport } from "next";
import { Montserrat, Cinzel } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const cinzel = Cinzel({
  weight: "400",
  variable: "--font-cinzel",
  subsets: ["latin"],
  display: "swap", // Optimize font loading
  preload: true,
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap", // Optimize font loading
  preload: true,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://glco.us"),
  title: "Global Cooperation LLC — Trucking & Freight Across the USA",
  description:
    "Reliable trucking & logistics company providing fast and safe freight delivery across the United States.",
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
  openGraph: {
    type: "website",
    url: "https://glco.us",
    title: "Global Cooperation LLC — Trucking & Freight Across the USA",
    description:
      "Reliable trucking & logistics company providing fast and safe freight delivery across the United States.",
    siteName: "Global Cooperation LLC",
    images: [
      {
        url: "/gls.png", // 👈 вот здесь подключаем твоё изображение
        width: 1200,
        height: 630,
        alt: "Global Cooperation LLC website preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Global Cooperation LLC — Trucking & Freight Across the USA",
    description:
      "Reliable trucking & logistics company providing fast and safe freight delivery across the United States.",
    images: ["/gls.png"], // 👈 тоже
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
