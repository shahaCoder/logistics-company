import type { Metadata } from "next";
import { Montserrat, Bungee, Cinzel } from "next/font/google";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://glco.us"),
  title: {
    default: "Global Cooperation LLC — Trucking & Freight Across the USA",
    template: "%s | Global Cooperation LLC",
  },
  description:
    "Reliable trucking & logistics company providing fast and safe freight delivery across the United States.",
  // иконки берутся из app/icon.png и app/apple-icon.png автоматически,
  // но можно явно:
  icons: {
    icon: "/images/logo.png", // путь из public/
    apple: "/images/logo.png",
  },
  openGraph: {
    type: "website",
    url: "https://glco.us",
    siteName: "Global Cooperation LLC",
    title: "Global Cooperation LLC — Trucking & Freight Across the USA",
    description:
      "Reliable trucking & logistics company providing fast and safe freight delivery across the United States.",
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Global Cooperation LLC — Trucking & Freight",
    description:
      "Reliable trucking & logistics company providing fast and safe freight delivery across the US.",
    images: ["/twitter-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <body className={`${montserrat.variable} ${cinzel.variable} antialiased`}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
