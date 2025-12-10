"use client";

import Script from "next/script";
import Image from "next/image";
import Link from "next/link";
import GlintLogo from "@/components/GlintLogo";
import { motion } from "framer-motion";
import { localBusinessSchema } from "@/utils/structured-data";
import {
  FaShieldAlt,
  FaTruck,
  FaHandshake,
  FaMapMarkerAlt,
  FaClock,
  FaUsers,
  FaRoute,
} from "react-icons/fa";

const Page = () => {
  const values = [
    {
      icon: <FaShieldAlt className="text-5xl text-red-600" />,
      title: "Safety First",
      description:
        "We prioritize safety above all. Our drivers are certified professionals, and our equipment meets the highest industry standards to ensure every shipment arrives safely.",
    },
    {
      icon: <FaHandshake className="text-5xl text-red-600" />,
      title: "Commitment",
      description:
        "With over 5 years of experience, we've built lasting partnerships with freight brokers, shippers, and carriers. Our commitment to reliability defines everything we do.",
    },
    {
      icon: <FaTruck className="text-5xl text-red-600" />,
      title: "Nationwide Reach",
      description:
        "Operating across all 48 continental states, we connect businesses from coast to coast with efficient, on-time freight transportation services.",
    },
  ];

  const stats = [
    { number: "48", label: "States Covered", icon: <FaMapMarkerAlt /> },
    { number: "5+", label: "Years Experience", icon: <FaClock /> },
    { number: "24/7", label: "Dispatch Support", icon: <FaUsers /> },
    { number: "1000+", label: "Miles Daily", icon: <FaRoute /> },
  ];

  return (
    <section id="about" className="bg-[#1b1b1b] text-white">
      <Script
        id="about-localbusiness-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema),
        }}
      />

      {/* HERO */}
      <div className="relative h-[540px] md:h-[650px] overflow-hidden" data-hero>
        <Image
          src="/images/about-us-page.jpg"
          alt="About Global Cooperation LLC - Professional trucking and logistics company"
          fill
          priority
          sizes="100vw"
          quality={90}
          className="object-cover brightness-[0.4]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/60 to-black/40 z-0" />
        {/* Контент hero */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
          <GlintLogo src="/images/logo.png" size={160} intervalMs={4500} />
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mt-6 text-5xl md:text-6xl font-extrabold uppercase tracking-widest"
          >
            About Us
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-4 max-w-2xl text-gray-300 text-lg"
          >
            Reliable logistics and nationwide trucking solutions across the United States.
          </motion.p> 
        </div>
      </div>

      {/* CONTENT */}
      <div className="relative z-20 -mt-12 md:-mt-16 rounded-t-3xl bg-[#363636] shadow-2xl">
        {/* STATS SECTION */}
        <section className="bg-gradient-to-r from-red-600/20 via-red-700/20 rounded-t-3xl to-red-600/20 border-y border-red-600/30 py-14 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/images/road.jpg')] opacity-5 bg-cover bg-center" />
          <div className="custom-container max-w-6xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center bg-[#363636]/50 backdrop-blur-sm rounded-xl p-6 border border-red-600/20 hover:border-red-600/50 transition-all duration-300 hover:bg-[#363636]/70"
                >
                  <div className="text-red-600 mb-4 flex justify-center text-4xl">
                    {stat.icon}
                  </div>
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm md:text-base text-gray-300 font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* WHO WE ARE */}
        <section className="custom-container max-w-5xl mx-auto px-6 md:px-0 py-16 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-red-600 mb-4">
              Who We Are
            </h2>
            <div className="w-24 h-1 bg-red-600 mx-auto"></div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 items-center mb-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <p className="text-gray-200 text-lg md:text-xl leading-relaxed">
                We are a professional trucking and logistics company providing
                nationwide transportation solutions across all 48 continental states.
                Based in Ohio, our experienced team handles freight delivery and dispatch
                management with a mission to offer secure, efficient, and on-time
                services for every client.
              </p>
              <p className="text-gray-300 text-base leading-relaxed">
                As a trusted logistics partner to freight brokers, shippers, and carriers,
                we ensure consistent communication and reliability on every lane we operate.
                Our services include <strong className="text-white">dry van</strong> throughout the United States.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative h-[300px] md:h-[400px] rounded-2xl overflow-hidden shadow-2xl"
            >
              <Image
                src="/images/truck2.jpg"
                alt="Professional trucking fleet - Global Cooperation LLC"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                quality={85}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-[#2a2a2a] rounded-2xl p-8 md:p-10 border border-[#444444]"
          >
            <p className="text-gray-300 text-lg leading-relaxed mb-4">
              From small parcels to full truckloads, our dedicated team ensures
              that each shipment is handled with precision and care. We invest in modern equipment,
              digital dispatch tools, and real-time tracking to keep operations smooth and customers informed.
            </p>
            <p className="text-gray-400 leading-relaxed italic">
              "Our promise is simple: move freight smarter, faster, and safer
              while treating people with respect. That applies to our customers,
              our drivers, and our partners on every mile of the journey."
            </p>
          </motion.div>
        </section>

        {/* VALUES SECTION */}
        <section className="bg-[#2a2a2a] py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent"></div>
          <div className="custom-container max-w-6xl mx-auto px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold text-red-600 mb-4">
                Our Core Values
              </h2>
              <div className="w-24 h-1 bg-red-600 mx-auto"></div>
              <p className="text-gray-400 mt-6 max-w-2xl mx-auto">
                The principles that guide everything we do
              </p>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  className="bg-[#363636] rounded-2xl p-8 border border-[#444444] hover:border-red-600/70 hover:shadow-xl hover:shadow-red-600/20 transition-all duration-300 group"
                >
                  <div className="flex justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    {value.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 text-center">
                    {value.title}
                  </h3>
                  <p className="text-gray-300 text-center leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* OUR LOCATION */}
        <section className="py-20">
          <div className="custom-container max-w-6xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-5xl font-bold text-red-600 mb-4">
                Our Location
              </h2>
              <div className="w-24 h-1 bg-red-600 mx-auto mb-6"></div>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                Based in Blue Ash, Ohio, we operate nationwide but remain connected to our local roots.
                Visit us or get in touch with our team.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative w-full aspect-[16/10] md:aspect-[16/9] overflow-hidden rounded-2xl ring-2 ring-red-600/40 shadow-2xl"
            >
              <iframe
                title="Company Location — Global Cooperation LLC"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d957.1970720201883!2d-84.38187095060668!3d39.26418706331613!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x884053d948eb01c7%3A0x9b3a80cc5349cb71!2s10901%20Reed%20Hartman%20Hwy%2C%20Blue%20Ash%2C%20OH%2045242!5e0!3m2!1sru!2sus!4v1762183735189!5m2!1sen!2sus"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 h-full w-full border-0"
                aria-label="Interactive map with our office location"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 text-center bg-[#2a2a2a] rounded-xl p-6 border border-[#444444] max-w-2xl mx-auto"
            >
              <p className="text-gray-300 mb-2 text-lg">
                <strong className="text-white text-xl">Global Cooperation LLC</strong>
              </p>
              <p className="text-gray-400 mb-4">
                10901 Reed Hartman Hwy, Blue Ash, OH 45242
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a
                  href="tel:+15139930921"
                  className="text-red-600 hover:text-red-500 transition-colors font-medium"
                >
                  +1 (513) 993-0921
                </a>
                <span className="text-gray-600 hidden sm:inline">•</span>
                <a
                  href="mailto:operations@glco.us"
                  className="text-red-600 hover:text-red-500 transition-colors font-medium"
                >
                  operations@glco.us
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="bg-gradient-to-r from-red-600 via-red-700 to-red-600 py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/images/road.jpg')] opacity-10 bg-cover bg-center"></div>
          <div className="custom-container max-w-4xl mx-auto px-6 text-center relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-5xl font-bold text-white mb-6"
            >
              Ready to Work With Us?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-gray-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Whether you need to ship freight or join our team as a driver,
              we're here to help. Get in touch today and let's get started.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                href="/freights"
                className="inline-block bg-white text-red-600 hover:bg-gray-100 font-semibold py-4 px-10 rounded-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105 transform duration-300"
              >
                Request a Freight Quote
              </Link>
              <Link
                href="/join-us"
                className="inline-block bg-transparent border-2 border-white text-white hover:bg-white/20 font-semibold py-4 px-10 rounded-lg transition-all shadow-lg hover:shadow-xl hover:scale-105 transform duration-300"
              >
                Apply as a Driver
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </section>
  );
};

export default Page;

