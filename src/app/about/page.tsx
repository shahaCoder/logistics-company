"use client";
import { motion } from "framer-motion";
import Image from "next/image";

const Page = () => {
   return (
      <section id="about" className="bg-[#1b1b1b]  text-white">
         {/* ==== Background Image ==== */}
         <div className="absolute top-0 -z-0 w-full h-[500px]">
            <Image
               src="/images/brian-stalter-arotxe540N4-unsplash.jpg"
               alt="About our trucking company"
               fill
               className="object-cover brightness-[30%]"
               priority
            />
         </div>

         {/* ==== Overlay Content ==== */}
         <div className="relative z-10 flex flex-col items-center justify-center text-center h-[400px] md:h-[500px]">
            <motion.h1
               initial={{ opacity: 0, y: 40 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8 }}
               className="text-5xl md:text-6xl font-bold uppercase tracking-widest text-white drop-shadow-lg"
            >
               About Us
            </motion.h1>
         </div>

         {/* ==== Info Section ==== */}
         <div className="relative z-20 bg-[#1b1b1b] mt-[-50px] rounded-t-3xl shadow-lg">
            <div className="custom-container py-16 px-6 md:px-0 max-w-4xl mx-auto text-center">
               <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-3xl font-semibold text-red-600 mb-6"
               >
                  Who We Are
               </motion.h2>

               <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="text-gray-300 leading-relaxed mb-6"
               >
                  We are a professional trucking and logistics company providing
                  nationwide transportation solutions. With years of experience
                  in freight delivery, our mission is to offer secure,
                  efficient, and on-time services for every client we serve.
               </motion.p>

               <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-gray-300 leading-relaxed"
               >
                  From small packages to full truckloads, our team is dedicated
                  to ensuring that every delivery is handled with precision and
                  care. We value trust, safety, and commitment — the three
                  pillars that define our company.
               </motion.p>
            </div>

            {/* ==== Map Section ==== */}
            <div className="w-full h-[400px] md:h-[500px]">
               <iframe
                  title="Company Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7983.078315738132!2d-84.38277025641398!3d39.264101980382456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x884053d948eb01c7%3A0x9b3a80cc5349cb71!2zMTA5MDEgUmVlZCBIYXJ0bWFuIEh3eSwgQmx1ZSBBc2gsIE9IIDQ1MjQyLCDQodCo0JA!5e0!3m2!1sru!2s!4v1761347817836!5m2!1sru!2s"
                  width="100%"
                  height="100%"
                  allowFullScreen
                  loading="lazy"
                  className="border-none"
               ></iframe>
            </div>
         </div>
      </section>
   );
};

export default Page;
