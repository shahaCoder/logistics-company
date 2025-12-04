// src/components/Form.tsx
"use client";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { FaEnvelope, FaUser, FaCommentDots } from "react-icons/fa";
import {
  validateName,
  validateEmail,
  validateMessage,
  getValidationError,
} from "@/utils/validation";

export default function Form() {
  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    const error = getValidationError(name, value);
    if (error) {
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus(null);

    // Validate all fields
    const newErrors: { [key: string]: string } = {};

    if (!validateName(form.name)) {
      newErrors.name =
        getValidationError("name", form.name) || "Invalid name";
    }
    if (!validateEmail(form.email)) {
      newErrors.email =
        getValidationError("email", form.email) || "Invalid email";
    }
    if (!validateMessage(form.message)) {
      newErrors.message =
        getValidationError("message", form.message) || "Invalid message";
    }
    if (!consent) {
      newErrors.consent =
        "Please confirm that you agree with our terms before sending.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const res = await fetch("/api/contact-telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `Request failed: ${res.status}`);
      }

      setStatus("Message sent ✅");
      setForm({ name: "", email: "", message: "" });
      setConsent(false);
      formRef.current?.reset();
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("Form submission error:", err);
      }
      setStatus("Failed to send. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex flex-col lg:flex-row min-h-screen bg-[#363636] text-white" id="contact-us">
      <div className="lg:w-1/2 w-full flex items-center justify-center px-6 md:px-16 py-20 bg-[#363636]">
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
            ref={formRef}
            onSubmit={handleSubmit}
            className="flex flex-col gap-6 text-left bg-[#1c1c1c]/70 p-10 rounded-2xl shadow-lg backdrop-blur-md border border-[#2c2c2c]"
          >
            {/* Name */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-400 mb-2">Full Name</label>
              <div className="relative group">
                <FaUser className="absolute left-3 top-3 text-gray-500 group-focus-within:text-red-500 transition-all" />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder="Your name"
                  pattern="[a-zA-Zа-яА-ЯёЁ\s'-]{2,50}"
                  className={`w-full bg-transparent border-b py-2 pl-10 pr-3 text-white placeholder-gray-500 focus:outline-none transition-all ${
                    errors.name
                      ? "border-red-500"
                      : "border-gray-600 focus:border-red-600"
                  }`}
                />
              </div>
              {errors.name && (
                <p className="text-red-400 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="flex flex-col">
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
                  onBlur={handleBlur}
                  required
                  placeholder="your@email.com"
                  pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
                  className={`w-full bg-transparent border-b py-2 pl-10 pr-3 text-white placeholder-gray-500 focus:outline-none transition-all ${
                    errors.email
                      ? "border-red-500"
                      : "border-gray-600 focus:border-red-600"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Message */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-400 mb-2">Message</label>
              <div className="relative group">
                <FaCommentDots className="absolute left-3 top-3 text-gray-500 group-focus-within:text-red-500 transition-all" />
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder="Write your message..."
                  rows={5}
                  minLength={10}
                  maxLength={2000}
                  className={`w-full bg-transparent border-b py-2 pl-10 pr-3 text-white placeholder-gray-500 focus:outline-none transition-all resize-none ${
                    errors.message
                      ? "border-red-500"
                      : "border-gray-600 focus:border-red-600"
                  }`}
                />
              </div>
              {errors.message && (
                <p className="text-red-400 text-xs mt-1">{errors.message}</p>
              )}
            </div>

            {/* Consent checkbox */}
            <div className="flex flex-col gap-1 text-xs text-gray-400">
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    if (errors.consent) {
                      setErrors((prev) => ({ ...prev, consent: "" }));
                    }
                  }}
                  className="mt-0.5 h-4 w-4 rounded border-gray-500 text-red-600 focus:ring-red-600"
                />
                <span>
                  I agree that Global Cooperation LLC may store my contact
                  details and use them to respond to my inquiry. I have read and
                  accept the{" "}
                  <a
                    href="/privacy-policy"
                    className="text-red-500 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Privacy Policy
                  </a>{" "}
                  and{" "}
                  <a
                    href="/terms"
                    className="text-red-500 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Terms &amp; Conditions
                  </a>
                  .
                </span>
              </label>
              {errors.consent && (
                <p className="text-red-400 text-xs mt-1">{errors.consent}</p>
              )}
            </div>

            {status && (
              <p
                className={`text-sm ${
                  status.includes("✅") ? "text-green-400" : "text-red-400"
                }`}
                role="status"
              >
                {status}
              </p>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="mt-2 bg-red-600 hover:bg-red-700 transition-all text-white py-2 rounded-lg font-semibold shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Message"}
            </motion.button>
          </form>
        </div>
      </div>

      {/* Right side stays the same */}
      <div className="relative lg:w-1/2 w-full flex flex-col justify-center items-end px-10 py-20 bg-[#2a2a2a] overflow-hidden">
        <Image
          src="/images/taylor-GbdJqpft8X0-unsplash.jpg"
          alt="Contact background"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          quality={80}
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
            Have a question or want to work with us? Fill out the form, and we’ll
            respond as soon as possible.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
