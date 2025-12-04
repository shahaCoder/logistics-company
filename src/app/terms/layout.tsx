import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | Global Cooperation LLC",
  description:
    "Read the terms and conditions for using the Global Cooperation LLC website and submitting contact or job application forms. Understand your rights and responsibilities when using our services.",
  alternates: {
    canonical: "https://glco.us/terms",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    url: "https://glco.us/terms",
    title: "Terms & Conditions | Global Cooperation LLC",
    description:
      "Read the terms and conditions for using the Global Cooperation LLC website and submitting contact or job application forms.",
    siteName: "Global Cooperation LLC",
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

