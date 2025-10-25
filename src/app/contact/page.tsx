"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import React from "react";

const Page = () => {
   return (
      <section className="bg-gray-100 pb-20">
         {/* Верхняя фото-зона */}
         <div className="h-[250px] md:h-[500px]" />
         <div className="absolute top-0 w-full h-[400px] md:h-[500px]">
            <Image
               src="/images/brian-stalter-arotxe540N4-unsplash.jpg"
               alt="Apply for a job"
               fill
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

         {/* Форма */}
         <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-8 max-md:p-4"
         >
            <h2 className="text-2xl md:text-3xl font-semibold text-center text-gray-800 mb-8">
               Fill Out the Application Form
            </h2>

            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* First Name */}
               <div className="flex flex-col">
                  <label className="text-gray-700 mb-2 font-medium">
                     First Name
                  </label>
                  <input
                     type="text"
                     placeholder="Enter your first name"
                     className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                     required
                  />
               </div>

               {/* Last Name */}
               <div className="flex flex-col">
                  <label className="text-gray-700 mb-2 font-medium">
                     Last Name
                  </label>
                  <input
                     type="text"
                     placeholder="Enter your last name"
                     className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                     required
                  />
               </div>

               {/* Email */}
               <div className="flex flex-col">
                  <label className="text-gray-700 mb-2 font-medium">
                     E-mail
                  </label>
                  <input
                     type="email"
                     placeholder="Enter your email"
                     className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                     required
                  />
               </div>

               {/* Phone Number */}
               <div className="flex flex-col">
                  <label className="text-gray-700 mb-2 font-medium">
                     Phone Number
                  </label>
                  <input
                     type="tel"
                     placeholder="+1 (555) 123-4567"
                     className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                     required
                  />
               </div>

               {/* Experience */}
               <div className="md:col-span-2 flex flex-col">
                  <label className="text-gray-700 mb-2 font-medium">
                     Experience
                  </label>
                  <select
                     className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                     required
                  >
                     <option value="">Select experience</option>
                     <option value="1">1 year</option>
                     <option value="2">2 years</option>
                     <option value="3+">3+ years</option>
                  </select>
               </div>

               {/* Type */}
               <div className="md:col-span-2 flex flex-col">
                  <label className="text-gray-700 mb-2 font-medium">
                     Type of Driver
                  </label>
                  <select
                     className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                     required
                  >
                     <option value="">Select type</option>
                     <option value="owner">Owner Operator</option>
                     <option value="company">Company Driver</option>
                  </select>
               </div>

               {/* Submit Button */}
               <div className="md:col-span-2 flex justify-center mt-4">
                  <motion.button
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                     type="submit"
                     className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-10 rounded-lg shadow-md transition-all"
                  >
                     Submit Application
                  </motion.button>
               </div>
            </form>
         </motion.div>
      </section>
   );
};

export default Page;
