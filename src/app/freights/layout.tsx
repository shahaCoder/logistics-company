import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Move Your Freight Across the USA | Freight Quote Request | Global Cooperation LLC",
  description:
    "Request a freight quote for nationwide trucking services. Global Cooperation LLC provides dry van, power only, reefer, and flatbed transportation across the USA. Get competitive rates and 24/7 dispatch support for your freight shipping needs.",
  alternates: {
    canonical: "https://glco.us/freights",
  },
  openGraph: {
    type: "website",
    url: "https://glco.us/freights",
    title:
      "Move Your Freight Across the USA | Freight Quote Request | Global Cooperation LLC",
    description:
      "Request a freight quote for nationwide trucking services. Dry van, power only, reefer, and flatbed transportation across the USA. Competitive rates and 24/7 dispatch support.",
    siteName: "Global Cooperation LLC",
    images: [
      {
        url: "https://glco.us/gls.png",
        width: 1200,
        height: 630,
        alt: "Freight Quote Request - Global Cooperation LLC",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Move Your Freight Across the USA | Freight Quote Request | Global Cooperation LLC",
    description:
      "Request a freight quote for nationwide trucking services. Dry van, power only, reefer, and flatbed transportation with competitive rates.",
    images: ["https://glco.us/gls.png"],
  },
};

export default function FreightsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

