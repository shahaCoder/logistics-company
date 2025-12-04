import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Global Cooperation LLC | Trusted USA Trucking Company",
  description:
    "Learn more about Global Cooperation LLC — a professional logistics and freight company operating across the United States. Based in Ohio, we provide nationwide trucking services with over 7 years of experience in safe, on-time deliveries.",
  alternates: {
    canonical: "https://glco.us/about",
  },
  openGraph: {
    type: "website",
    url: "https://glco.us/about",
    title: "About Global Cooperation LLC | Trusted USA Trucking Company",
    description:
      "Learn more about Global Cooperation LLC — a professional logistics and freight company operating across the United States. Discover our mission, experience, and dedication to safe, on-time deliveries.",
    siteName: "Global Cooperation LLC",
    images: [
      {
        url: "https://glco.us/gls.png",
        width: 1200,
        height: 630,
        alt: "About Global Cooperation LLC",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Global Cooperation LLC | Trusted USA Trucking Company",
    description:
      "Professional logistics and freight company operating across the United States. Over 7 years of experience in safe, on-time deliveries.",
    images: ["https://glco.us/gls.png"],
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

