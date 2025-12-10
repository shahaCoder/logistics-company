import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Join Our Team | CDL Truck Driver Jobs | Global Cooperation LLC",
  description:
    "Apply for CDL trucking jobs at Global Cooperation LLC. Competitive weekly pay, steady freight, fast onboarding, and 24/7 dispatch support. Owner-operators and company drivers welcome. Become part of a company that values drivers.",
  alternates: {
    canonical: "https://glco.us/join-us",
  },
  openGraph: {
    type: "website",
    url: "https://glco.us/join-us",
    title: "Join Our Team | CDL Truck Driver Jobs | Global Cooperation LLC",
    description:
      "Apply for CDL trucking jobs at Global Cooperation LLC. Competitive weekly pay, steady freight, fast onboarding, and 24/7 dispatch support.",
    siteName: "Global Cooperation LLC",
    images: [
      {
        url: "https://glco.us/gls.png",
        width: 1200,
        height: 630,
        alt: "CDL Truck Driver Jobs at Global Cooperation LLC",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Join Our Team | CDL Truck Driver Jobs | Global Cooperation LLC",
    description:
      "Apply for CDL trucking jobs. Competitive pay, steady freight, fast onboarding. Owner-operators and company drivers welcome.",
    images: ["https://glco.us/gls.png"],
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

