"use client";
import { motion } from "framer-motion";
import {
   FaInstagram,
   FaFacebookF,
   FaTwitter,
   FaEnvelope,
} from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
   return (
      <footer className="bg-[#111] text-gray-300 border-t border-[#2c2c2c]">
         <div className="custom-container py-14 flex flex-col md:flex-row justify-between gap-10">
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5 }}
               className="space-y-4"
            >
               <Link href="/" className="flex items-center">
                  <Image
                     src="/images/logo.png"
                     alt="logo"
                     width={70}
                     height={70}
                     className="cursor-pointer"
                  />
                  <p className="text-gray-300 font-medium text-2xl">
                     Global Cooperation llc
                  </p>
               </Link>
               <p className="text-sm max-w-sm text-gray-400 leading-relaxed">
                  Reliable, fast, and safe transportation services across the
                  country. We deliver your cargo on time, every time.
               </p>
               <div className="flex gap-4 mt-4">
                  <a
                     href="#"
                     className="p-2 rounded-full bg-[#1f1f1f] hover:bg-red-600 transition-colors"
                  >
                     <FaInstagram />
                  </a>
                  <a
                     href="#"
                     className="p-2 rounded-full bg-[#1f1f1f] hover:bg-red-600 transition-colors"
                  >
                     <FaFacebookF />
                  </a>
                  <a
                     href="#"
                     className="p-2 rounded-full bg-[#1f1f1f] hover:bg-red-600 transition-colors"
                  >
                     <FaTwitter />
                  </a>
                  <a
                     href="mailto:info@truckmotion.com"
                     className="p-2 rounded-full bg-[#1f1f1f] hover:bg-red-600 transition-colors"
                  >
                     <FaEnvelope />
                  </a>
               </div>
            </motion.div>

            <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6 }}
               className="flex flex-col space-y-3"
            >
               <h3 className="text-lg font-semibold text-white mb-1">Links</h3>
               <Link
                  href="/"
                  className="hover:text-red-600 transition-colors text-sm"
               >
                  Home
               </Link>
               <Link
                  href="/about"
                  className="hover:text-red-600 transition-colors text-sm"
               >
                  About Us
               </Link>
               <Link
                  href="#services"
                  className="hover:text-red-600 transition-colors text-sm"
               >
                  Services
               </Link>
               <Link
                  href="/contact"
                  className="hover:text-red-600 transition-colors text-sm"
               >
                  Contact
               </Link>
            </motion.div>

            {/* Right contact info */}
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.7 }}
               className="space-y-3"
            >
               <h3 className="text-lg font-semibold text-white mb-1">
                  Contact Info
               </h3>
               <p className="text-sm text-gray-400">
                  10901 Reed Hartman Hwy, Blue Ash, OH 45242
               </p>
               <p className="text-sm text-gray-400">+1 (234) 567-890</p>
               <p className="text-sm text-gray-400">info@truckmotion.com</p>
            </motion.div>
         </div>

         <div className="border-t border-[#2c2c2c] text-center py-6 text-sm text-gray-500">
            © {new Date().getFullYear()} Global Cooperation llc. All rights
            reserved.
         </div>
      </footer>
   );
}
