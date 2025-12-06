import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apply to Drive — Global Cooperation LLC",
  description:
    "Submit your driver application to Global Cooperation LLC. Secure online form for CDL drivers, employment history, and required DOT authorizations.",
};

export default function DriverApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

