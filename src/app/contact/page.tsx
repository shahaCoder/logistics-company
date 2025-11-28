"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import React, { useState } from "react";
import emailjs from "@emailjs/browser";
import { ToastContainer, toast } from 'react-toastify';
import Seo from "@/components/Seo";
import { validateName, validateEmail, validatePhone, getValidationError } from "@/utils/validation";

const Page = () => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const notify = () => toast("Your application has been successfully sent");

    // Достаём поля
    const fd = new FormData(form);
    const firstName = String(fd.get("firstName") || "");
    const lastName = String(fd.get("lastName") || "");
    const email = String(fd.get("email") || "");
    const phone = String(fd.get("phone") || "");
    const experience = String(fd.get("experience") || "");
    const driverType = String(fd.get("driverType") || "");

    // Validate fields
    const newErrors: { [key: string]: string } = {};
    
    if (!validateName(firstName)) {
      newErrors.firstName = getValidationError("firstName", firstName) || "Invalid first name";
    }
    if (!validateName(lastName)) {
      newErrors.lastName = getValidationError("lastName", lastName) || "Invalid last name";
    }
    if (!validateEmail(email)) {
      newErrors.email = getValidationError("email", email) || "Invalid email";
    }
    if (!validatePhone(phone)) {
      newErrors.phone = getValidationError("phone", phone) || "Invalid phone number";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fix the errors in the form.");
      return;
    }

    setErrors({});

    // Формируем переменные под твой шаблон EmailJS
    const title = "Job Application";
    const name = `${firstName} ${lastName}`.trim();
    const time = new Date().toLocaleString(); // можно в нужной локали/таймзоне

    // Склеиваем «человеческое» сообщение
    const message =
      `New job application:\n` +
      `— Name: ${name}\n` +
      `— Email: ${email}\n` +
      `— Phone: ${phone}\n` +
      `— Experience: ${experience}\n` +
      `— Driver Type: ${driverType}\n`;

    setLoading(true);
    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID_SECOND!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID_SECOND!,
        {
          title,
          name,
          time,
          message,
          email,
        },
        { publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY! }
      );
      notify()
      form.reset();
    } catch (err) {
      // Log error in development only
      if (process.env.NODE_ENV === "development") {
        console.error("Job application error:", err);
      }
      alert("Failed to send. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-gray-100 pb-20">
      <Seo
  title="Join Our Team | Truck Driver and Logistics Jobs | Global Cooperation LLC"
  description="Apply for trucking and logistics jobs at Global Cooperation LLC. We offer competitive pay, reliable routes, and growth opportunities for professional drivers and logistics specialists across the USA."
/>

      {/* Верхняя фото-зона */}
      <div className="h-[250px] md:h-[500px]" />
      <div className="absolute top-0 w-full h-[400px] md:h-[500px]">
        <Image
          src="/images/hiring.jpeg"
          alt="Apply for a job"
          fill
          sizes="100vw"
          quality={85}
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

        <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
          {/* скрытые поля под шаблон */}
          <input type="hidden" name="title" value="Job Application" />
          <input type="hidden" name="time" value={new Date().toISOString()} />

          {/* First Name */}
          <div className="flex flex-col">
            <label className="text-gray-700 mb-2 font-medium">First Name</label>
            <input
              type="text"
              name="firstName"
              placeholder="Enter your first name"
              pattern="[a-zA-Zа-яА-ЯёЁ\s'-]{2,50}"
              onBlur={(e) => {
                const error = getValidationError("firstName", e.target.value);
                setErrors((prev) => ({ ...prev, firstName: error || "" }));
              }}
              className={`border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all ${
                errors.firstName ? "border-red-500" : "border-gray-300"
              }`}
              required
            />
            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
          </div>

          {/* Last Name */}
          <div className="flex flex-col">
            <label className="text-gray-700 mb-2 font-medium">Last Name</label>
            <input
              type="text"
              name="lastName"
              placeholder="Enter your last name"
              pattern="[a-zA-Zа-яА-ЯёЁ\s'-]{2,50}"
              onBlur={(e) => {
                const error = getValidationError("lastName", e.target.value);
                setErrors((prev) => ({ ...prev, lastName: error || "" }));
              }}
              className={`border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all ${
                errors.lastName ? "border-red-500" : "border-gray-300"
              }`}
              required
            />
            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label className="text-gray-700 mb-2 font-medium">E-mail</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
              onBlur={(e) => {
                const error = getValidationError("email", e.target.value);
                setErrors((prev) => ({ ...prev, email: error || "" }));
              }}
              className={`border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              required
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Phone Number */}
          <div className="flex flex-col">
            <label className="text-gray-700 mb-2 font-medium">Phone Number</label>
            <input
              type="tel"
              name="phone"
              placeholder="+1 (555) 123-4567"
              onBlur={(e) => {
                const error = getValidationError("phone", e.target.value);
                setErrors((prev) => ({ ...prev, phone: error || "" }));
              }}
              className={`border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all ${
                errors.phone ? "border-red-500" : "border-gray-300"
              }`}
              required
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          {/* Experience */}
          <div className="md:col-span-2 flex flex-col">
            <label className="text-gray-700 mb-2 font-medium">Experience</label>
            <select
              name="experience"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
              required
            >
              <option value="">Select experience</option>
              <option value="1 year">1 year</option>
              <option value="2 years">2 years</option>
              <option value="3+ years">3+ years</option>
            </select>
          </div>

          {/* Type */}
          <div className="md:col-span-2 flex flex-col">
            <label className="text-gray-700 mb-2 font-medium">Type of Driver</label>
            <select
              name="driverType"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
              required
            >
              <option value="">Select type</option>
              <option value="Owner Operator">Owner Operator</option>
              <option value="Company Driver">Company Driver</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2 flex justify-center mt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-10 rounded-lg shadow-md transition-all disabled:opacity-60"
            >
              {loading ? "Sending..." : "Submit Application"}
            </motion.button>
          </div>
        </form>
      </motion.div>
      <ToastContainer />
    </section>
  );
};

export default Page;