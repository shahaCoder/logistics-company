"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import React, { useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { createFAQSchema } from "@/utils/structured-data";
import TermsPrivacyModal from "@/components/TermsPrivacyModal";

const Page = () => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleApplyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleAccept = () => {
    setIsModalOpen(false);
    router.push("/driver-application");
  };

  const jobFAQs = [
    {
      question: "What types of CDL driving positions are available?",
      answer:
        "We welcome both owner operators and company drivers. Whether you drive your own truck or join our fleet, we offer competitive rates, steady freight, and professional support. Positions are available for drivers with Class A CDL licenses and at least 1 year of experience.",
    },
    {
      question: "How much can I earn as a driver?",
      answer:
        "Our drivers can earn $10,000+ weekly depending on miles and routes. Owner operators receive 88% of gross revenue. We guarantee weekly pay with no delays, and offer additional bonuses and fuel card programs to help maximize your earnings.",
    },
    {
      question: "Do you provide steady freight and consistent miles?",
      answer:
        "Yes, we specialize in providing steady freight throughout the year. Our network of freight brokers and direct shippers ensures consistent loads, reducing empty miles and maximizing your revenue potential. We offer contract based loads and dedicated lanes for drivers seeking predictable schedules.",
    },
    {
      question: "What support do you provide to drivers?",
      answer:
        "Our 24/7 dispatch support team is always available to assist you. We provide real-time load tracking, transparent communication, and professional guidance throughout every trip. Our team is committed to keeping you moving and informed, ensuring a smooth driving experience.",
    },
    {
      question: "How quickly can I start driving?",
      answer:
        "Our fast onboarding process allows qualified drivers to start within 24 hours of application approval. We streamline the paperwork and ensure minimal delays, so you can get on the road quickly and start earning right away.",
    },
  ];

  const jobFAQSchema = createFAQSchema(jobFAQs);

  return (
    <section className="bg-gray-100 pb-20">
      <Script
        id="job-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jobFAQSchema),
        }}
      />

      {/* Top image hero */}
      <div className="h-[250px] md:h-[500px]" />
      <div className="absolute top-0 w-full h-[400px] md:h-[500px]">
        <Image
          src="/images/hiring.jpeg"
          alt="Apply for a job"
          fill
          sizes="100vw"
          quality={85}
          className="object-cover object-right-center brightness-[30%]"
          style={{ objectPosition: 'right center' }}
          priority
        />
        <div className="absolute inset-0 flex items-center justify-center max-md:mt-40">
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold text-white uppercase tracking-wide drop-shadow-lg"
          >
            Apply for a Job
          </motion.h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 -mt-20 md:-mt-32 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-2xl p-8 md:p-12"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Start Your Application Online
            </h2>
            <div className="w-24 h-1 bg-red-600 mx-auto mb-6"></div>
            <p className="text-gray-700 text-lg leading-relaxed max-w-3xl mx-auto mb-4">
              Global Cooperation LLC is always looking for professional and responsible CDL drivers.
              If you're looking for steady loads, on–time pay, and respectful dispatch, we'd be happy
              to review your application and welcome you to our growing fleet.
            </p>
            <p className="text-gray-800 font-semibold text-xl">
              Fill out the form today and be on the road tomorrow with guaranteed loads, fast onboarding,
              and a team that keeps you moving.
            </p>
          </div>

          {/* Grid Layout for Sections */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {/* Pay & Earnings */}
            <div className="bg-gradient-to-br from-red-50 to-white rounded-xl p-6 border-l-4 border-red-600 shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-red-600 rounded"></span>
                Pay & Earnings
              </h3>
              <ul className="text-gray-700 space-y-2.5">
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold mt-1">•</span>
                  <span>Our drivers make: <strong className="text-gray-900">$10,000+ weekly</strong> (depending on miles & routes)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold mt-1">•</span>
                  <span>88% of gross for Owner Operators</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold mt-1">•</span>
                  <span>On–time weekly payments</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold mt-1">•</span>
                  <span>Fuel cards & bonuses available</span>
                </li>
              </ul>
            </div>

            {/* Why Drive With Us */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border-l-4 border-gray-400 shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-gray-400 rounded"></span>
                Why Drive With GLCO?
              </h3>
              <ul className="text-gray-700 space-y-2.5">
                <li className="flex items-start gap-2">
                  <span className="text-gray-600 font-bold mt-1">•</span>
                  <span>Steady freight all year round</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-600 font-bold mt-1">•</span>
                  <span>No forced dispatch choose your loads</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-600 font-bold mt-1">•</span>
                  <span>Respectful & professional communication</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-600 font-bold mt-1">•</span>
                  <span>24/7 dispatch support</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-600 font-bold mt-1">•</span>
                  <span>Modern, well maintained equipment</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-600 font-bold mt-1">•</span>
                  <span>Fast onboarding process start driving within 24 hours</span>
                </li>
              </ul>
            </div>

            {/* Requirements */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border-l-4 border-blue-600 shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-blue-600 rounded"></span>
                Requirements
              </h3>
              <ul className="text-gray-700 space-y-2.5">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-1">•</span>
                  <span>Valid CDL Class A license</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-1">•</span>
                  <span>Minimum 1 year of experience</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-1">•</span>
                  <span>Clean driving record or minor violations only</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-1">•</span>
                  <span>Professional attitude & reliability</span>
                </li>
              </ul>
            </div>

            {/* Company Culture & Values */}
            <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-6 border-l-4 border-green-600 shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-green-600 rounded"></span>
                Company Culture & Values
              </h3>
              <ul className="text-gray-700 space-y-2.5">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">•</span>
                  <span>Family-oriented company that values your work-life balance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">•</span>
                  <span>Transparent communication and honest business practices</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">•</span>
                  <span>Long-term partnerships with drivers who grow with us</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">•</span>
                  <span>Safety-first approach with comprehensive insurance coverage</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">•</span>
                  <span>Recognition programs and driver appreciation initiatives</span>
                </li>
              </ul>
            </div>
          </div>

        {/* Button */}
        <div className="flex justify-center mt-6">
          <motion.button
            onClick={handleApplyClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-12 rounded-lg shadow-md transition-all text-lg"
          >
            Apply to Drive
          </motion.button>
        </div>
        <p className="text-center text-gray-600 text-sm mt-4">
          Fill out our secure online Driver Application form
        </p>
        </motion.div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 mt-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-2xl p-8 md:p-12"
        >
        <h2 className="text-3xl md:text-4xl font-semibold text-center text-gray-800 mb-8">
          Driver Job Application FAQs
        </h2>
        <div className="grid md:grid-cols-1 gap-6">
          {jobFAQs.map((faq, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-lg p-6 border border-gray-200"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {faq.question}
              </h3>
              <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
        </motion.div>
      </div>

      {/* Terms & Privacy Modal */}
      <TermsPrivacyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAccept={handleAccept}
      />
    </section>
  );
};

export default Page;


