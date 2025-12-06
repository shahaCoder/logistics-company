"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPortalRootPage() {
  const router = useRouter();

  useEffect(() => {
    const checkAndRedirect = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const response = await fetch(`${apiUrl}/api/auth/me`, {
          credentials: "include",
        });

        if (response.ok) {
          router.replace("/internal-driver-portal-7v92nx/applications");
        } else {
          router.replace("/internal-driver-portal-7v92nx/login");
        }
      } catch (error) {
        router.replace("/internal-driver-portal-7v92nx/login");
      }
    };

    checkAndRedirect();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-gray-600">Redirecting...</div>
    </div>
  );
}