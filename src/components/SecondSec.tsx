"use client";
import { FaShieldAlt, FaHandshake, FaTruck } from "react-icons/fa";
import { motion } from "framer-motion";

const features = [
   {
      icon: <FaShieldAlt className="text-4xl text-red-600" />,
      title: "Seguridad",
      description:
         "Realizamos la Certificación del Sistema de Gestión de Calidad de Operaciones de energía (ISO) junto al timel.",
   },
   {
      icon: <FaHandshake className="text-4xl text-red-600" />,
      title: "Compromiso",
      description:
         "Brindamos servicios logísticos orientados a la industria Automotriz, con más de 40 años en el mercado.",
   },
   {
      icon: <FaTruck className="text-4xl text-red-600" />,
      title: "A todo el país",
      description:
         "Somos una empresa de transporte internacional que opera principalmente en el corredor Argentino.",
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
