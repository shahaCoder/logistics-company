"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import React from "react";
import Script from "next/script";
import { createFAQSchema } from "@/utils/structured-data";

const Page = () => {
  const applicationUrl = "https://www.cognitoforms.com/GlobalCooperationLLC/ApplicationForEmployment"; // <-- replace

  const jobFAQs = [
    {
      question: "What types of CDL driving positions are available?",
      answer:
        "We welcome both owner-operators and company drivers. Whether you drive your own truck or join our fleet, we offer competitive rates, steady freight, and professional support. Positions are available for drivers with Class A CDL licenses and at least 1 year of experience.",
    },
    {
      question: "How much can I earn as a driver?",
      answer:
        "Our drivers can earn $10,000+ weekly depending on miles and routes. Owner-operators receive 88% of gross revenue. We guarantee weekly pay with no delays, and offer additional bonuses and fuel card programs to help maximize your earnings.",
    },
    {
      question: "Do you provide steady freight and consistent miles?",
      answer:
        "Yes, we specialize in providing steady freight throughout the year. Our network of freight brokers and direct shippers ensures consistent loads, reducing empty miles and maximizing your revenue potential. We offer contract-based loads and dedicated lanes for drivers seeking predictable schedules.",
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
          className="object-cover brightness-[30%]"
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
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-10 max-md:p-6"
      >
        {/* Header */}
        <h2 className="text-3xl md:text-4xl font-semibold text-center text-gray-800 mb-6">
          Start Your Application Online
        </h2>

        {/* Intro paragraph */}
        <p className="text-gray-700 text-center mb-4 leading-relaxed">
          Global Cooperation LLC is always looking for professional and responsible CDL drivers.
          If you're looking for steady loads, on–time pay, and respectful dispatch, we'd be happy
          to review your application and welcome you to our growing fleet.
        </p>

        {/* Motivation line */}
        <p className="text-gray-800 text-center font-medium text-lg mb-8">
          Fill out the form today and be on the road tomorrow with guaranteed loads, fast onboarding,
          and a team that keeps you moving.
        </p>

        {/* Salary Section */}
        <div className="bg-gray-50 rounded-xl p-6 shadow-sm mb-10">
          <h3 className="text-2xl font-semibold text-gray-800 mb-3">💰 Pay & Earnings</h3>
          <ul className="text-gray-700 space-y-2">
            <li>• Our drivers make: <strong>$10,000+ weekly</strong> (depending on miles & routes)</li>
            <li>• 88% of gross for Owner Operators</li>
            <li>• On–time weekly payments</li>
            <li>• Fuel cards & bonuses available</li>
          </ul>
        </div>

        {/* Why Drive With Us */}
        <div className="mb-10">
          <h3 className="text-2xl font-semibold text-gray-800 mb-3">🚚 Why Drive With GLCO?</h3>
          <ul className="text-gray-700 space-y-2">
            <li>• Steady freight all year round</li>
            <li>• No forced dispatch choose your loads</li>
            <li>• Respectful & professional communication</li>
            <li>• 24/7 dispatch support</li>
            <li>• Modern, well maintained equipment</li>
            <li>• Fast onboarding process start driving within 24 hours</li>
          </ul>
        </div>

        {/* Requirements */}
        <div className="mb-10">
          <h3 className="text-2xl font-semibold text-gray-800 mb-3">📄 Requirements</h3>
          <ul className="text-gray-700 space-y-2">
            <li>• Valid CDL Class A license</li>
            <li>• Minimum 1 year of experience</li>
            <li>• Clean driving record or minor violations only</li>
            <li>• Professional attitude & reliability</li>
          </ul>
        </div>

        {/* What We Offer */}
        <div className="mb-10">
          <h3 className="text-2xl font-semibold text-gray-800 mb-3">⭐ What We Offer</h3>
          <ul className="text-gray-700 space-y-2">
            <li>• Competitive weekly pay</li>
            <li>• Reliable freight and consistent miles</li>
            <li>• Fuel discounts & company support</li>
            <li>• Flexible home time (depending on route)</li>
            <li>• Fast hiring, minimal paperwork</li>
          </ul>
        </div>

        {/* Button */}
        <div className="flex justify-center mt-6">
          <motion.a
            href={applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-12 rounded-lg shadow-md transition-all text-lg"
          >
            Go to Application Form
          </motion.a>
        </div>
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-10 max-md:p-6 mt-10"
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
    </section>
  );
};

export default Page;


