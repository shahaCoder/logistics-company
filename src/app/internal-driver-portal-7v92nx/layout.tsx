"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Skip auth check for root page and login page
    if (pathname === "/internal-driver-portal-7v92nx" || pathname === "/internal-driver-portal-7v92nx/login") {
      setIsChecking(false);
      if (pathname === "/internal-driver-portal-7v92nx") {
        setIsAuthenticated(false); // Will be handled by page.tsx redirect
      } else {
        setIsAuthenticated(false);
      }
      return;
    }

    const checkAuth = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const response = await fetch(`${apiUrl}/api/auth/me`, {
          credentials: "include",
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          router.push("/internal-driver-portal-7v92nx/login");
        }
      } catch (error) {
        setIsAuthenticated(false);
        router.push("/internal-driver-portal-7v92nx/login");
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  // Show loading while checking auth (only for protected routes)
  if (isChecking && pathname !== "/internal-driver-portal-7v92nx" && pathname !== "/internal-driver-portal-7v92nx/login") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
        <div className="text-slate-600 text-sm">Loading...</div>
      </div>
    );
  }

  // Show login page if not authenticated (only for protected routes)
  if (!isAuthenticated && pathname !== "/internal-driver-portal-7v92nx/login" && pathname !== "/internal-driver-portal-7v92nx") {
    return null; // Will redirect
  }

  // Don't show sidebar on login page
  const showSidebar = pathname !== "/internal-driver-portal-7v92nx/login" && 
                      pathname !== "/internal-driver-portal-7v92nx" && 
                      isAuthenticated;

  const menuItems = [
    {
      href: "/internal-driver-portal-7v92nx/applications",
      label: "Applications",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      isActive: pathname?.includes("/applications") && !pathname?.includes("/freight") && !pathname?.includes("/contact"),
    },
    {
      href: "/internal-driver-portal-7v92nx/freight-requests",
      label: "Freight Requests",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      isActive: pathname?.includes("/freight-requests"),
    },
    {
      href: "/internal-driver-portal-7v92nx/contact-requests",
      label: "Contact Messages",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      isActive: pathname?.includes("/contact-requests"),
    },
    {
      href: "/internal-driver-portal-7v92nx/oil-change",
      label: "Oil Change",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      isActive: pathname?.includes("/oil-change"),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      {/* Desktop Sidebar - Compact Dark Design */}
      {showSidebar && (
        <aside className="hidden md:block w-56 flex-shrink-0 bg-slate-900 border-r border-slate-800 min-h-screen sticky top-0 overflow-y-auto">
          <div className="p-4">
            {/* Logo/Brand */}
            <div className="mb-6 pt-2">
              <h2 className="text-sm font-semibold text-slate-100 tracking-wide uppercase">Admin</h2>
              <p className="text-xs text-slate-400 mt-0.5">Control Panel</p>
            </div>
            
            {/* Navigation */}
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-all duration-150 ${
                    item.isActive
                      ? "bg-red-600 text-white shadow-sm"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </aside>
      )}

      {/* Mobile Header with Burger Menu */}
      {showSidebar && (
        <div className="md:hidden bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center justify-between px-4 py-2.5">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Admin Panel</h2>
              <p className="text-xs text-slate-500">Control Panel</p>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-red-600"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="border-t border-slate-200 bg-white shadow-lg">
              <nav className="px-2 py-2 space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm transition-colors ${
                      item.isActive
                        ? "bg-red-600 text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </div>
      )}

      <main className="flex-1 min-w-0 overflow-x-hidden bg-slate-50">{children}</main>
    </div>
  );
}

