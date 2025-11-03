"use client";

import GlintLogo from "@/components/GlintLogo";
import { motion } from "framer-motion";

const Page = () => {
  return (
    <section id="about" className="bg-[#1b1b1b] text-white">
      {/* HERO */}
      <div className="relative h-[540px] md:h-[620px] overflow-hidden" data-hero>
        {/* Если нужна фон-картинка — раскомментируй блок ниже */}
        {/*
        <Image
          src="/images/brian-stalter-arotxe540N4-unsplash.jpg"
          alt="About Global Cooperation LLC"
          fill
          priority
          className="object-cover brightness-[0.35]"
        />
        */}
        {/* Контент hero */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
          <GlintLogo src="/images/logo.png" size={160} intervalMs={4500} />
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mt-6 text-5xl md:text-6xl font-extrabold uppercase tracking-widest"
          >
            About Us
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-4 max-w-2xl text-gray-300"
          >
            Reliable logistics and nationwide trucking solutions.
          </motion.p>
        </div>
        {/* Подложка, если фон-картинка отключена */}
        <div className="absolute inset-0 bg-[#1b1b1b]" aria-hidden="true" />
      </div>

      {/* CONTENT */}
      <div className="relative z-20 -mt-12 md:-mt-16 rounded-t-3xl bg-[#1b1b1b] shadow-2xl">
        <section className="custom-container max-w-4xl mx-auto px-6 md:px-0 py-14 md:py-16 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-semibold text-red-600 mb-6"
          >
            Who We Are
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.05 }}
            className="text-gray-200 text-lg md:text-xl leading-relaxed mb-6"
          >
            We are a professional trucking and logistics company providing
            nationwide transportation solutions across all 48 continental states.
            With years of hands-on experience in freight delivery and dispatch
            management, our mission is to offer secure, efficient, and on-time
            services for every client we serve. We take pride in being a trusted
            logistics partner to brokers, shippers, and carriers — ensuring
            consistent communication and reliability on every lane we operate.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="text-gray-300 text-lg md:text-xl leading-relaxed mb-6"
          >
            From small parcels to full truckloads, our dedicated team ensures
            that each shipment is handled with precision and care. Safety,
            transparency, and commitment form the three pillars that define our
            company. We invest in modern equipment, digital dispatch tools, and
            real-time tracking to keep operations smooth and customers informed.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.15 }}
            className="text-gray-400 leading-relaxed"
          >
            Our promise is simple: move freight smarter, faster, and safer —
            while treating people with respect. That applies to our customers,
            our drivers, and our partners on every mile of the journey.
          </motion.p>
        </section>

        {/* MAP */}
        <section className="custom-container px-0 md:px-0 pb-16">
          <div className="mx-auto max-w-6xl">
            {/* Респонсив-обёртка для карты */}
            <div className="relative w-full aspect-[16/10] md:aspect-[16/9] overflow-hidden rounded-2xl ring-1 ring-white/10">
              <iframe
                title="Company Location — Global Cooperation LLC"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7983.078315738132!2d-84.38277025641398!3d39.264101980382456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x884053d948eb01c7%3A0x9b3a80cc5349cb71!2zMTA5MDEgUmVlZCBIYXJ0bWFuIEh3eSwgQmx1ZSBBc2gsIE9IIDQ1MjQyLCDQodCo0JA!5e0!3m2!1sru!2s!4v1761347817836!5m2!1sru!2s"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 h-full w-full border-0"
                aria-label="Interactive map with our office location"
              />
            </div>
          </div>
        </section>
      </div>
    </section>
  );
};

export default Page;
