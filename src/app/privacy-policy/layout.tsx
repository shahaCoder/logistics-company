import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Global Cooperation LLC",
  description:
    "Learn how Global Cooperation LLC collects, uses and protects your personal information when you contact us or apply for a job. Read our privacy policy to understand how we handle your data.",
  alternates: {
    canonical: "https://glco.us/privacy-policy",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    url: "https://glco.us/privacy-policy",
    title: "Privacy Policy | Global Cooperation LLC",
    description:
      "Learn how Global Cooperation LLC collects, uses and protects your personal information when you contact us or apply for a job.",
    siteName: "Global Cooperation LLC",
  },
};

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

