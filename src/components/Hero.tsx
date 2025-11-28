"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import React from "react";
import Link from "next/link";

const Hero = () => {
   return (
      <section className="custom-container h-[80vh] max-lg:h-[500px] flex items-center text-white overflow-hidden">
         <Image
            src="/images/truck2.jpg"
            alt="Truck background"
            fill
            priority
            sizes="100vw"
            quality={85}
            className="w-full min-h-[800px] bg-[red] fixed top-0 object-cover brightness-[0.45] -z-10"
         />

         <div className="min-h-[800px] absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 -z-10" />

         <div className="text-center md:text-left max-md:mx-auto">
            <motion.p
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6 }}
               className="text-lg tracking-wide uppercase text-gray-200"
            >
               Reliable & Fast Trucking
            </motion.p>

            <motion.hr
               initial={{ scaleX: 0 }}
               animate={{ scaleX: 1 }}
               transition={{ duration: 0.5, delay: 0.3 }}
               className="w-16 h-[2px] bg-red-500 border-none my-5 origin-left mx-auto md:mx-0"
            />

            <motion.h1
               initial={{ opacity: 0, y: 40 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.7, delay: 0.4 }}
               className="text-4xl md:text-6xl font-bold leading-tight"
            >
               Professional Logistics <br /> For Your Business
            </motion.h1>

            <motion.p
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.6 }}
               className="mt-6 max-w-md text-gray-300 mx-auto md:mx-0"
            >
               We provide safe and efficient transport services across the
               country. Trusted by hundreds of clients.
            </motion.p>

            <motion.div
               className="mt-10"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.8 }}
            >
               <Link
                  href="/contact"
                  className="py-3 px-10 bg-red-600 hover:bg-red-700 transition-all duration-300 font-semibold rounded-sm shadow-md"
               >
                  Join us
               </Link>
            </motion.div>
         </div>
      </section>
   );
};

export default Hero;
