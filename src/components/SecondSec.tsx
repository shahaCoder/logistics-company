"use client";
import { FaShieldAlt, FaHandshake, FaTruck } from "react-icons/fa";
import { motion } from "framer-motion";

const features = [
   {
      icon: <FaShieldAlt className="text-4xl text-red-600" />,
      title: "Safety",
      description:
         "We are certified in Quality Management Systems (ISO) to ensure safe and reliable energy operations.",
   },
   {
      icon: <FaHandshake className="text-4xl text-red-600" />,
      title: "Commitment",
      description:
         "We provide logistics services focused on the automotive industry, backed by over 7 years of experience.",
   },
   {
      icon: <FaTruck className="text-4xl text-red-600" />,
      title: "Nationwide Service",
      description:
         "We are a nationwide transport company operating across the United States.",
   },
];

export default function Features() {
   return (
      <section className="grid md:grid-cols-3 text-center text-white">
         {features.map((item, index) => (
            <div
               key={index}
               className="flex flex-col items-center justify-center p-10 bg-[#1f1f1f] border border-[#2e2e2e]"
            >
               <div className="mb-4">{item.icon}</div>

               <motion.h3
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-xl font-semibold text-red-500 mb-2 uppercase tracking-wide"
               >
                  {item.title}
               </motion.h3>

               <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-gray-300 text-sm max-w-xs"
               >
                  {item.description}
               </motion.p>
            </div>
         ))}
      </section>
   );
}
