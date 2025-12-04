import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";
import Footer from "@/components/Footer";
import Form from "@/components/Form";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Reviews from "@/components/Reviews";
import SecondSec from "@/components/SecondSec";
import Services from "@/components/Services";
import {
  organizationSchema,
  websiteSchema,
  localBusinessSchema,
  createFAQSchema,
} from "@/utils/structured-data";

export const metadata: Metadata = {
  title:
    "Professional Trucking & Freight Services | Global Cooperation LLC",
  description:
    "Reliable trucking company providing fast and safe freight delivery across the USA. Global Cooperation LLC offers nationwide logistics, dispatch, and transport services. Specializing in dry van, power only, reefer, and flatbed transportation.",
  alternates: {
    canonical: "https://glco.us/",
  },
  openGraph: {
    type: "website",
    url: "https://glco.us/",
    title:
      "Professional Trucking & Freight Services | Global Cooperation LLC",
    description:
      "Reliable trucking company providing fast and safe freight delivery across the USA. Global Cooperation LLC offers nationwide logistics, dispatch, and transport services.",
    siteName: "Global Cooperation LLC",
    images: [
      {
        url: "https://glco.us/gls.png",
        width: 1200,
        height: 630,
        alt: "Global Cooperation LLC - Professional Trucking Services",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Professional Trucking & Freight Services | Global Cooperation LLC",
    description:
      "Reliable trucking company providing fast and safe freight delivery across the USA. Nationwide logistics and transportation services.",
    images: ["https://glco.us/gls.png"],
  },
};

const homeFAQs = [
  {
    question:
      "What types of freight transportation services does Global Cooperation LLC offer?",
    answer:
      "We specialize in dry van, power only, reefer (refrigerated), and flatbed transportation across the United States. Our nationwide trucking services include full truckload (FTL), less-than-truckload (LTL), expedited delivery, and dedicated lane options for consistent freight needs.",
  },
  {
    question: "How quickly can I get a freight quote?",
    answer:
      "Our dispatch team typically responds to freight quote requests within minutes during business hours. For expedited loads, we prioritize your request and can provide same-day quotes. Simply fill out our freight quote form with your pickup and delivery details, and we'll get back to you promptly with competitive rates.",
  },
  {
    question:
      "Does Global Cooperation LLC operate nationwide across all US states?",
    answer:
      "Yes, we provide nationwide freight transportation services across all 48 continental United States. Our network of professional drivers and logistics team ensures reliable delivery whether you're shipping from coast to coast or within specific regions. We're based in Ohio but serve customers throughout the entire country.",
  },
  {
    question:
      "What equipment types are available for freight transportation?",
    answer:
      "We offer a full range of equipment including dry van trailers for general freight, reefer units for temperature-controlled shipments, flatbed trailers for oversized or heavy loads, step deck trailers, and power only services. Our fleet is well-maintained and our drivers are experienced with various cargo types.",
  },
  {
    question:
      "Are you looking for CDL drivers? What positions are available?",
    answer:
      "Yes, we're always seeking professional CDL drivers, both owner-operators and company drivers. We offer competitive weekly pay, steady freight, 24/7 dispatch support, and excellent communication. Whether you're an experienced driver or looking to start a career in trucking, we'd love to hear from you. Visit our job application page to learn more about current opportunities.",
  },
];

const homeFAQSchema = createFAQSchema(homeFAQs);

export default function Home() {
  return (
    <>
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
      <Script
        id="localbusiness-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema),
        }}
      />
      <Script
        id="home-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homeFAQSchema),
        }}
      />
      <Hero />
      <SecondSec />

         <section className="bg-[#C4C4C4]">
            <div className="custom-container py-20">
               <Services />
            </div>
         </section>
         <section className="w-full custom-container bg-[#C4C4C4] py-20">
            <Reviews />
         </section>

         {/* FAQ Section */}
         <section className="bg-[#C4C4C4] py-20">
            <div className="custom-container">
               <h2 className="text-4xl md:text-5xl font-bold text-center text-red-600 mb-12">
                  Frequently Asked Questions
               </h2>
               <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                  {homeFAQs.map((faq, index) => (
                     <div
                        key={index}
                        className="bg-white rounded-lg p-6 shadow-md border border-gray-200"
                     >
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                           {faq.question}
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                           {faq.answer}
                        </p>
                     </div>
                  ))}
               </div>
               <div className="text-center mt-10">
                  <p className="text-gray-700 mb-4">
                     Still have questions? Get in touch with our team.
                  </p>
                  <Link
                     href="/contact"
                     className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-lg transition-all"
                  >
                     Contact Us
                  </Link>
               </div>
            </div>
         </section>

         <section className="bg-[#C4C4C4]" id="contact-form">
            <Form />
         </section>
      </>
   );
}