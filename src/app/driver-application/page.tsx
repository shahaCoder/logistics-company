"use client";

import DriverApplicationForm from "@/components/DriverApplicationForm";

export default function DriverApplicationPage() {
  return (
    <div className="min-h-screen bg-[#f2f2f2] pb-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-white border-b border-gray-200 py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="max-w-4xl">
            <div className="inline-block mb-6">
              <span className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-full uppercase tracking-wide">
                Apply Now
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-gray-900 leading-tight">
              Driver Application
            </h1>
            <div className="w-20 h-1 bg-red-600 mb-6"></div>
            <p className="text-xl md:text-2xl text-gray-700 leading-relaxed max-w-3xl">
              Fill out this DOT-compliant application to drive for Global Cooperation LLC.
              <span className="block mt-2 text-lg text-gray-600">
                Your information is transmitted securely.
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-10">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <DriverApplicationForm />
        </div>
      </section>
    </div>
  );
}

