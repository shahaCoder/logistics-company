   "use client";
   import { motion } from "framer-motion";
   import Image from "next/image";
   import { useState } from "react";
   import { FaEnvelope, FaUser, FaCommentDots } from "react-icons/fa";

   export default function ContactForm() {
      const [form, setForm] = useState({ name: "", email: "", message: "" });

      const handleChange = (
         e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => {
         setForm({ ...form, [e.target.name]: e.target.value });
      };
      

      const handleSubmit = (e: React.FormEvent) => {
         e.preventDefault();
         console.log(form);
         
      };

      return (
         <section className="flex flex-col md:flex-row min-h-screen bg-[#1b1b1b] text-white">
            <div className="md:w-1/2 w-full flex items-center justify-center px-6 md:px-16 py-20 bg-[#1f1f1f]">
               <div className="w-full max-w-md">
                  <motion.h3
                     initial={{ opacity: 0, y: 20 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.5 }}
                     className="text-3xl font-semibold text-center mb-8"
                  >
                     Contact Us
                  </motion.h3>

                  <form
                     onSubmit={handleSubmit}
                     className="flex flex-col gap-6 text-left bg-[#1c1c1c]/70 p-10 rounded-2xl shadow-lg backdrop-blur-md border border-[#2c2c2c]"
                  >
                     <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="flex flex-col"
                     >
                        <label className="text-sm text-gray-400 mb-2">
                           Full Name
                        </label>
                        <div className="relative group">
                           <FaUser className="absolute left-3 top-3 text-gray-500 group-focus-within:text-red-500 transition-all" />
                           <input
                              type="text"
                              name="name"
                              value={form.name}
                              onChange={handleChange}
                              required
                              placeholder="Your name"
                              className="w-full bg-transparent border-b border-gray-600 py-2 pl-10 pr-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-all"
                           />
                        </div>
                     </motion.div>

                     <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="flex flex-col"
                     >
                        <label className="text-sm text-gray-400 mb-2">
                           Email Address
                        </label>
                        <div className="relative group">
                           <FaEnvelope className="absolute left-3 top-3 text-gray-500 group-focus-within:text-red-500 transition-all" />
                           <input
                              type="email"
                              name="email"
                              value={form.email}
                              onChange={handleChange}
                              required
                              placeholder="your@email.com"
                              className="w-full bg-transparent border-b border-gray-600 py-2 pl-10 pr-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-all"
                           />
                        </div>
                     </motion.div>

                     <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="flex flex-col"
                     >
                        <label className="text-sm text-gray-400 mb-2">
                           Message
                        </label>
                        <div className="relative group">
                           <FaCommentDots className="absolute left-3 top-3 text-gray-500 group-focus-within:text-red-500 transition-all" />
                           <textarea
                              name="message"
                              value={form.message}
                              onChange={handleChange}
                              required
                              placeholder="Write your message..."
                              rows={5}
                              className="w-full bg-transparent border-b border-gray-600 py-2 pl-10 pr-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-all resize-none"
                           />
                        </div>
                     </motion.div>

                     <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.97 }}
                        type="submit"
                        className="mt-4 bg-red-600 hover:bg-red-700 transition-all text-white py-2 rounded-lg font-semibold shadow-md"
                     >
                        Send Message
                     </motion.button>
                  </form>
               </div>
            </div>
            <div className="relative md:w-1/2 w-full flex flex-col justify-center items-end px-10 py-20 bg-[#2a2a2a] overflow-hidden">
               <Image
                  src="/images/taylor-GbdJqpft8X0-unsplash.jpg"
                  alt="Contact background"
                  fill
                  className="absolute inset-0 object-cover opacity-40"
               />

               <div className="relative z-10 max-w-md text-end">
                  <motion.h2
                     initial={{ opacity: 0, y: 20 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.6 }}
                     className="text-4xl font-bold mb-4 text-red-600"
                  >
                     Get in Touch
                  </motion.h2>
                  <motion.p
                     initial={{ opacity: 0, y: 20 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.8, delay: 0.1 }}
                     className="text-gray-300 text-lg leading-relaxed"
                  >
                     Have a question or want to work with us? Fill out the form,
                     and we’ll respond as soon as possible.
                  </motion.p>
               </div>
            </div>
         </section>
      );
   }
