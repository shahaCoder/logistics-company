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
      icon: <FaTruck className="w-24 text-red-500" />,
      title: "Interstate Trucking",
      description:
         "We provide safe and reliable long-distance freight transportation across the United States. Our drivers handle every load with precision, ensuring on-time delivery every mile.",
   },
   {
      icon: <FaHeadset className="w-24 text-red-500" />,
      title: "24/7 Dispatch Support",
      description:
         "Our dispatch team is available around the clock — no missed calls, no delays. You’ll always have someone ready to guide you, track loads, and keep communication open.",
   },
   {
      icon: <FaFileContract className="w-24 text-red-500" />,
      title: "Contract-Based Loads",
      description:
         "We work with trusted partners and long-term contracts, offering consistent freight and fair rates. No empty miles — just steady, reliable work for professionals.",
   },
   {
      icon: <FaRoute className="w-24 text-red-500" />,
      title: "Dedicated Lines",
      description:
         "We offer dedicated routes for our regular partners, giving you stability and predictable income. Stay focused on driving — we’ll handle the logistics.",
   },
   {
      icon: <FaDollarSign className="w-24 text-red-500" />,
      title: "Weekly Pay — No Delays",
      description:
         "You deliver, we pay — it’s that simple. All drivers receive their payments weekly, without excuses or waiting periods.",
   },
   {
      icon: <FaUsers className="w-24 text-red-500" />,
      title: "Owner Operators & Company Drivers Welcome",
      description:
         "Whether you run your own truck or drive as part of our fleet, we value every professional behind the wheel. Join a company that respects your time and effort.",
   },
];

const Services = () => {
   return (
      <div id="services">
         <motion.h2
            className="text-5xl text-center font-bold text-red-600"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.1 }}
         >
            What We Offer
         </motion.h2>
         <motion.p
            className="text-lg font-medium text-center mt-3"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.1 }}
         >
            We focus on long-distance freight transportation and dispatch
            management. Our team operates across the North, East, and South
            regions — keeping your wheels turning 24/7.
         </motion.p>

         <div className="flex flex-col gap-20 mt-10">
            {services.map((service, index) => (
               <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`flex flex-col md:flex-row items-center justify-between gap-8 ${
                     index % 2 === 1 ? "md:flex-row-reverse" : ""
                  }`}
               >
                  {/* Icon */}
                  <div className="flex-shrink-0 font-black text-gray-900 text-6xl md:w-1/3 flex justify-center">
                     {service.icon}
                  </div>

                  {/* Text */}
                  <div className="md:w-2/3 text-center md:text-left">
                     <h3 className="text-2xl font-bold mb-2">
                        {service.title}
                     </h3>
                     <p className="text-[15px] leading-relaxed text-gray-800">
                        {service.description}
                     </p>
                  </div>
               </motion.div>
            ))}
         </div>
      </div>
   );
};

export default Services;
