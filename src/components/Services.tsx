"use client";
import React from "react";

import { motion } from "framer-motion";
import {
   FaTruck,
   FaHeadset,
   FaFileContract,
   FaRoute,
   FaDollarSign,
   FaUsers,
} from "react-icons/fa";

const services = [
   {
      icon: FaTruck,
      title: "Interstate Trucking",
      description:
         "We provide safe and reliable long-distance freight transportation across the United States. Our drivers handle every load with precision, ensuring on-time delivery every mile.",
   },
   {
      icon: FaHeadset,
      title: "24/7 Dispatch Support",
      description:
         "Our dispatch team is available around the clock — no missed calls, no delays. You'll always have someone ready to guide you, track loads, and keep communication open.",
   },
   {
      icon: FaFileContract,
      title: "Contract-Based Loads",
      description:
         "We work with trusted partners and long-term contracts, offering consistent freight and fair rates. No empty miles — just steady, reliable work for professionals.",
   },
   {
      icon: FaRoute,
      title: "Dedicated Lines",
      description:
         "We offer dedicated routes for our regular partners, giving you stability and predictable income. Stay focused on driving — we'll handle the logistics.",
   },
   {
      icon: FaDollarSign,
      title: "Weekly Pay — No Delays",
      description:
         "You deliver, we pay — it's that simple. All drivers receive their payments weekly, without excuses or waiting periods.",
   },
   {
      icon: FaUsers,
      title: "Owner Operators & Company Drivers Welcome",
      description:
         "Whether you run your own truck or drive as part of our fleet, we value every professional behind the wheel. Join a company that respects your time and effort.",
   },
];

const Services = () => {
   return (
      <div id="services" className="relative py-16 md:py-24 overflow-hidden">
         {/* Background decorative elements on sides */}
         <div className="absolute inset-0 pointer-events-none">
            {/* Left side decorative elements */}
            <div className="absolute left-0 top-1/4 w-48 h-48 opacity-5">
               <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                  className="w-full h-full"
               >
                  <FaTruck className="w-full h-full text-red-600" />
               </motion.div>
            </div>
            
            {/* Right side decorative elements */}
            <div className="absolute right-0 bottom-1/4 w-48 h-48 opacity-5">
               <motion.div
                  initial={{ rotate: 360 }}
                  animate={{ rotate: 0 }}
                  transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                  className="w-full h-full"
               >
                  <FaRoute className="w-full h-full text-red-600" />
               </motion.div>
            </div>

            {/* Side accent lines */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-red-600/30 to-transparent"></div>
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-red-600/30 to-transparent"></div>
         </div>

         <div className="relative mx-auto w-full max-w-[1440px] px-4 lg:px-10">
            {/* Header */}
            <motion.div
               className="text-center mb-16"
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, amount: 0.3 }}
               transition={{ duration: 0.6 }}
            >
               <motion.h2
                  className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
               >
                  <span className="text-red-600">WHAT WE OFFER</span>
               </motion.h2>
               <div className="w-24 h-1 bg-red-600 mx-auto mb-6"></div>
               <motion.p
                  className="text-lg md:text-xl text-gray-800 max-w-6xl mx-auto leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
               >
                  We focus on long-distance freight transportation and dispatch
                  management. Our team operates across the North, East, and South
                  regions — keeping your wheels turning 24/7.
               </motion.p>
            </motion.div>

            {/* Services Grid - Full Width */}
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
               {services.map((service, index) => {
                  const IconComponent = service.icon;
                  return (
                     <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="group relative h-full w-full rounded-2xl border border-red-200 bg-white/90 shadow-sm p-8 flex flex-col overflow-hidden"
                     >
                        {/* Decorative corner element */}
                        <div className="absolute top-0 right-0 w-40 h-40 bg-red-600/5 rounded-bl-full"></div>
                        
                        {/* Content wrapper */}
                        <div className="relative flex flex-col gap-4 flex-1">
                           {/* Icon */}
                           <div className="flex-shrink-0">
                              <div className="w-16 h-16 md:w-20 md:h-20 bg-red-600 rounded-lg flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                                 <IconComponent className="w-8 h-8 md:w-10 md:h-10" />
                              </div>
                           </div>

                           {/* Text content */}
                           <div className="flex-1">
                              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors duration-300">
                                 {service.title}
                              </h3>
                              <p className="text-gray-700 leading-relaxed text-[15px] md:text-base">
                                 {service.description}
                              </p>
                           </div>
                        </div>

                        {/* Hover accent line */}
                        <div className="absolute bottom-0 left-0 h-1 bg-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                     </motion.div>
                  );
               })}
            </div>
         </div>
      </div>
   );
};

export default Services;
