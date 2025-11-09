"use client";

import Image from "next/image";
import React, { useMemo, useState } from "react";
import emailjs from "@emailjs/browser";
import Seo from "@/components/Seo";

/* ---------------- Field вынесен из компонента страницы ---------------- */
function Field({
   label,
   required,
   children,
   className = "",
}: {
   label: string;
   required?: boolean;
   children: React.ReactNode;
   className?: string;
}) {
   return (
      <div className={`flex flex-col ${className}`}>
         <label className="text-sm font-medium text-gray-800 mb-1">
            {label}
            {required && <span className="text-red-600 ml-1">*</span>}
         </label>
         {children}
      </div>
   );
}

/* ---------------- Страница ---------------- */
export default function FreightSolutionsPage() {
   const [form, setForm] = useState({
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
      isBroker: false,
      equipment: "",
      cargo: "",
      weight: "",
      pallets: "",
      pickupAddress: "",
      pickupDate: "",
      pickupTime: "",
      deliveryAddress: "",
      deliveryDate: "",
      deliveryTime: "",
      referenceId: "",
      notes: "",
      website: "", // honeypot (должен быть пустым)
   });

   const [loading, setLoading] = useState(false);
   const [status, setStatus] = useState<string | null>(null);

   // читаем env один раз (и красиво валидируем)
   const emailConfig = useMemo(() => {
      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "";
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "";
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "";
      const ok = Boolean(serviceId && templateId && publicKey);
      return { serviceId, templateId, publicKey, ok };
   }, []);

   const handleChange = (
      e: React.ChangeEvent<
         HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
   ) => {
      const target = e.target as HTMLInputElement;
      const { name, type } = target;
      const value =
         type === "checkbox"
            ? (target as HTMLInputElement).checked
            : target.value;

      // аккуратно обновляем только одно поле
      setForm((s) => ({ ...s, [name]: value }));
   };

   const onSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      // honeypot
      if (form.website.trim()) {
         setStatus("Spam detected. Submission ignored.");
         return;
      }

      // простая валидация
      const requiredFilled =
         form.companyName &&
         form.contactName &&
         form.email &&
         form.phone &&
         form.equipment &&
         form.cargo &&
         form.pickupAddress;

      if (!requiredFilled) {
         setStatus("Please fill in all required fields.");
         return;
      }

      if (!emailConfig.ok) {
         setStatus(
            "Email service is not configured. Please contact us by phone or try later."
         );
         return;
      }

      setLoading(true);
      setStatus(null);

      try {
         const templateParams = {
            companyName: form.companyName,
            contactName: form.contactName,
            email: form.email,
            phone: form.phone,
            isBroker: form.isBroker ? "Yes" : "No",
            equipment: form.equipment,
            cargo: form.cargo,
            weight: form.weight || "-",
            pallets: form.pallets || "-",
            pickupAddress: form.pickupAddress,
            pickupDate: form.pickupDate || "-",
            pickupTime: form.pickupTime || "-",
            deliveryAddress: form.deliveryAddress || "-",
            deliveryDate: form.deliveryDate || "-",
            deliveryTime: form.deliveryTime || "-",
            referenceId: form.referenceId || "-",
            notes: form.notes || "-",
            summary: `
Company: ${form.companyName}
Contact: ${form.contactName}
Email:   ${form.email}
Phone:   ${form.phone}
Broker:  ${form.isBroker ? "Yes" : "No"}

Equipment: ${form.equipment}
Cargo:     ${form.cargo}
Weight:    ${form.weight || "-"}
Pallets:   ${form.pallets || "-"}

Pickup:
  Address: ${form.pickupAddress}
  Date:    ${form.pickupDate || "-"}
  Time:    ${form.pickupTime || "-"}

Delivery:
  Address: ${form.deliveryAddress || "-"}
  Date:    ${form.deliveryDate || "-"}
  Time:    ${form.deliveryTime || "-"}

Ref/PO: ${form.referenceId || "-"}
Notes:  ${form.notes || "-"}
        `.trim(),
         };

         await emailjs.send(
            emailConfig.serviceId,
            emailConfig.templateId,
            templateParams,
            { publicKey: emailConfig.publicKey }
         );

         setStatus("Sent! Our dispatch will contact you shortly.");
         setForm({
            companyName: "",
            contactName: "",
            email: "",
            phone: "",
            isBroker: false,
            equipment: "",
            cargo: "",
            weight: "",
            pallets: "",
            pickupAddress: "",
            pickupDate: "",
            pickupTime: "",
            deliveryAddress: "",
            deliveryDate: "",
            deliveryTime: "",
            referenceId: "",
            notes: "",
            website: "",
         });
      } catch (err: any) {
         // более информативный лог
         const msg =
            err?.text ||
            err?.message ||
            (typeof err === "string" ? err : JSON.stringify(err));
         console.error("EmailJS send error:", msg);
         setStatus("Failed to send. Please try again or contact us by phone.");
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="">
         <Seo
            title="Move Your Freight Across the USA | Logistics Solutions by Global Cooperation LLC"
            description="Partner with Global Cooperation LLC to transport your freight safely and efficiently across the United States. Get customized logistics, 24/7 dispatch support, and real-time delivery tracking."
         />

         {/* HERO */}
         <section className="custom-container h-[80vh] max-lg:h-[500px] flex items-center text-white overflow-hidden">
            <div className="absolute inset-0 -z-10">
               <Image
                  src="/images/truckfreight.jpg"
                  alt="Truck background"
                  fill
                  priority
                  className=" min-h-[800px] fixed top-0 object-cover brightness-[0.45] -z-10"
               />
            </div>

            <div className="relative h-[52vh] flex items-center">
               <div className="w-full max-w-6xl mx-auto px-4 md:px-6">
                  <p className="uppercase tracking-[0.2em] text-gray-300 mb-2">
                     Reliable & Fast Trucking
                  </p>
                  <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
                     Freight Solutions for <br className="hidden md:block" />{" "}
                     Brokers & Businesses
                  </h1>
                  <p className="mt-4 max-w-2xl text-gray-200">
                     Whether you’re a freight broker or a company shipping goods
                     across the U.S., we provide secure and on-time
                     transportation, nationwide.
                  </p>
                  <a
                     href="#quote"
                     className="inline-block mt-6 rounded-lg bg-red-600 hover:bg-red-700 transition text-white px-6 py-3 font-semibold"
                  >
                     Get a Quote
                  </a>
               </div>
            </div>
         </section>

         {/* BADGES */}
         <section className="bg-[#363636] text-white">
            <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-6">
               <Badge
                  title="Safety"
                  desc="Certified processes and vetted carriers to keep your freight protected."
                  icon={<ShieldIcon />}
               />
               <Badge
                  title="Commitment"
                  desc="On-time delivery and transparent communication at every stage."
                  icon={<HandshakeIcon />}
               />
               <Badge
                  title="Nationwide"
                  desc="Coast-to-coast coverage across the United States, 24/7 dispatch."
                  icon={<MapIcon />}
               />
            </div>
         </section>

         {/* WHAT WE OFFER */}
         <section className="py-14">
            <div className="max-w-6xl mx-auto px-4 md:px-6">
               <h2 className="text-center text-3xl md:text-4xl font-extrabold text-red-600 mb-8">
                  WHAT WE OFFER
               </h2>

               <p className="text-center text-gray-800 max-w-3xl mx-auto mb-10">
                  We specialize in long-distance freight transportation and
                  dispatch management. Choose the solution that fits your load
                  and lane.
               </p>

               <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <ServiceCard
                     title="Full Truckload (FTL)"
                     desc="Dedicated truck capacity for your freight. Dry Van, Reefer, Flatbed."
                  />
                  <ServiceCard
                     title="Less-Than-Truckload (LTL)"
                     desc="Cost-effective option for smaller shipments and partial loads."
                  />
                  <ServiceCard
                     title="Expedited"
                     desc="When timing is critical — priority pickup & delivery with tracking."
                  />
                  <ServiceCard
                     title="Dedicated Lanes"
                     desc="Recurring lanes and schedules for consistent volume and pricing."
                  />
                  <ServiceCard
                     title="Dry Van"
                     desc="Standard dry van solutions across the U.S. Ideal for general freight, palletized goods, and non-perishable shipments."
                  />
                  <ServiceCard
                     title="Drop & Hook"
                     desc="Efficiency for high-volume operations — minimize dwell time."
                  />
               </div>
            </div>
         </section>

         {/* PROCESS */}
         <section className="py-14">
            <div className="max-w-6xl mx-auto px-4 md:px-6">
               <h3 className="text-2xl md:text-3xl font-extrabold text-red-600 text-center mb-10">
                  HOW IT WORKS
               </h3>
               <div className="grid gap-6 md:grid-cols-3">
                  <Step
                     number="01"
                     title="Request a Quote"
                     desc="Submit your load details. We confirm rate, equipment, and dates."
                  />
                  <Step
                     number="02"
                     title="Secure a Carrier"
                     desc="We assign vetted carrier and share live updates during transit."
                  />
                  <Step
                     number="03"
                     title="Deliver & Invoice"
                     desc="On-time delivery with documents provided for your records."
                  />
               </div>
            </div>
         </section>

         {/* QUOTE FORM */}
         <section id="quote" className="py-16">
            <div className="max-w-6xl mx-auto px-4 md:px-6">
               <h3 className="text-3xl md:text-4xl font-extrabold text-red-600 text-center mb-8">
                  Request a Freight Quote
               </h3>
               <p className="text-center text-gray-700 max-w-3xl mx-auto mb-10">
                  Fill out the form below. Our dispatch team will respond
                  quickly with pricing and availability.
               </p>

               <form
                  className="bg-[#f2f2f2] rounded-2xl shadow-md border border-gray-200 p-6 md:p-8"
                  onSubmit={onSubmit}
               >
                  {/* honeypot */}
                  <input
                     type="text"
                     name="website"
                     value={form.website}
                     onChange={handleChange}
                     className="hidden"
                     tabIndex={-1}
                     autoComplete="off"
                  />

                  {/* identity */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                     <Field label="Company Name" required>
                        <input
                           name="companyName"
                           value={form.companyName}
                           onChange={handleChange}
                           placeholder="Global Cooperation LLC"
                           autoComplete="organization"
                           className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all shadow-sm"
                        />
                     </Field>

                     <Field label="Contact Name" required>
                        <input
                           name="contactName"
                           value={form.contactName}
                           onChange={handleChange}
                           placeholder="John Doe"
                           autoComplete="name"
                           className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all shadow-sm"
                        />
                     </Field>

                     <Field label="Email" required>
                        <input
                           type="email"
                           name="email"
                           value={form.email}
                           onChange={handleChange}
                           placeholder="dispatch@company.com"
                           autoComplete="email"
                           className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all shadow-sm"
                        />
                     </Field>

                     <Field label="Phone" required>
                        <input
                           name="phone"
                           value={form.phone}
                           onChange={handleChange}
                           placeholder="+1 (555) 555-5555"
                           autoComplete="tel"
                           className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all shadow-sm"
                        />
                     </Field>

                     <Field label="I’m a freight broker">
                        <label className="inline-flex items-center gap-2 text-gray-700">
                           <input
                              type="checkbox"
                              name="isBroker"
                              checked={form.isBroker}
                              onChange={handleChange}
                              className="h-4 w-4 accent-red-600"
                           />
                           <span>Yes</span>
                        </label>
                     </Field>

                     <Field label="Equipment Type" required>
                        <select
                           name="equipment"
                           value={form.equipment}
                           onChange={handleChange}
                           className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all shadow-sm"
                        >
                           <option value="" disabled>
                              Select equipment
                           </option>
                           <option value="Dry Van">Dry Van</option>
                           <option value="Reefer">Reefer</option>
                           <option value="Flatbed">Flatbed</option>
                           <option value="Step Deck">Step Deck</option>
                           <option value="Power Only">Power Only</option>
                        </select>
                     </Field>
                  </div>

                  {/* cargo */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
                     <Field
                        label="Cargo Description"
                        required
                        className="md:col-span-2"
                     >
                        <input
                           name="cargo"
                           value={form.cargo}
                           onChange={handleChange}
                           placeholder="Auto parts on pallets"
                           className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all shadow-sm"
                        />
                     </Field>
                     <Field label="Weight (lbs)">
                        <input
                           name="weight"
                           value={form.weight}
                           onChange={handleChange}
                           placeholder="42000"
                           className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all shadow-sm"
                        />
                     </Field>
                     <Field label="Pallets / Pieces">
                        <input
                           name="pallets"
                           value={form.pallets}
                           onChange={handleChange}
                           placeholder="24 pallets"
                           className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all shadow-sm"
                        />
                     </Field>
                     <Field label="Reference / PO #">
                        <input
                           name="referenceId"
                           value={form.referenceId}
                           onChange={handleChange}
                           placeholder="PO-12458"
                           className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all shadow-sm"
                        />
                     </Field>
                  </div>

                  {/* pickup / delivery */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                     <div className="rounded-xl border border-gray-200 p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">
                           Pickup
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <Field
                              label="Address / City, State"
                              required
                              className="md:col-span-2"
                           >
                              <input
                                 name="pickupAddress"
                                 value={form.pickupAddress}
                                 onChange={handleChange}
                                 placeholder="Dallas, TX 75201"
                                 autoComplete="address-line1"
                                 className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all shadow-sm"
                              />
                           </Field>
                           <Field label="Date" required>
                              <input
                                 type="date"
                                 name="pickupDate"
                                 value={form.pickupDate}
                                 onChange={handleChange}
                                 className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all shadow-sm"
                              />
                           </Field>
                           <Field label="Time (optional)">
                              <input
                                 type="time"
                                 name="pickupTime"
                                 value={form.pickupTime}
                                 onChange={handleChange}
                                 className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all shadow-sm"
                              />
                           </Field>
                        </div>
                     </div>

                     <div className="rounded-xl border border-gray-200 p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">
                           Delivery
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <Field
                              label="Address / City, State"
                              className="md:col-span-2"
                           >
                              <input
                                 name="deliveryAddress"
                                 value={form.deliveryAddress}
                                 onChange={handleChange}
                                 placeholder="Atlanta, GA 30301"
                                 autoComplete="address-line1"
                                 className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all shadow-sm"
                              />
                           </Field>
                           <Field label="Date (optional)">
                              <input
                                 type="date"
                                 name="deliveryDate"
                                 value={form.deliveryDate}
                                 onChange={handleChange}
                                 className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all shadow-sm"
                              />
                           </Field>
                           <Field label="Time (optional)">
                              <input
                                 type="time"
                                 name="deliveryTime"
                                 value={form.deliveryTime}
                                 onChange={handleChange}
                                 className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all shadow-sm"
                              />
                           </Field>
                        </div>
                     </div>
                  </div>

                  {/* notes */}
                  <div className="mt-6">
                     <Field label="Additional Notes">
                        <textarea
                           name="notes"
                           value={form.notes}
                           onChange={handleChange}
                           placeholder="Appointment? Lumper? Accessorials?"
                           className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all shadow-sm min-h-[120px] resize-none"
                        />
                     </Field>
                  </div>

                  {/* actions/status */}
                  <div className="mt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                     <p className="text-sm text-gray-600">
                        By submitting, you agree to be contacted by our dispatch
                        team regarding your shipment details.
                     </p>
                     <button
                        type="submit"
                        disabled={loading}
                        className={`rounded-lg px-6 py-3 font-semibold shadow transition text-white ${
                           loading
                              ? "bg-red-400 cursor-not-allowed"
                              : "bg-red-600 hover:bg-red-700"
                        }`}
                     >
                        {loading ? "Sending..." : "Submit Request"}
                     </button>
                  </div>

                  {status && (
                     <p className="mt-4 text-sm text-gray-700">{status}</p>
                  )}
               </form>
            </div>
         </section>

         {/* BENEFITS */}
         <section className="py-16">
            <div className="max-w-6xl mx-auto px-4 md:px-6 grid gap-6 md:grid-cols-3">
               <Benefit
                  title="Transparent Pricing"
                  desc="Clear rates with no hidden fees. Quotes tailored to your lane."
               />
               <Benefit
                  title="Fast Response"
                  desc="We prioritize time-critical freight with 24/7 dispatch availability."
               />
               <Benefit
                  title="Documentation"
                  desc="All BOLs, PODs, and invoices delivered promptly to your inbox."
               />
            </div>

            <div className="max-w-6xl mx-auto px-4 md:px-6 text-center mt-12">
               <a
                  href="#quote"
                  className="inline-block rounded-lg bg-red-600 hover:bg-red-700 transition text-white px-8 py-3 font-semibold"
               >
                  Start Shipping Today
               </a>
            </div>
         </section>

         {/* FAQ */}
         <section className="py-16">
            <div className="max-w-6xl mx-auto px-4 md:px-6">
               <h3 className="text-2xl md:text-3xl font-extrabold text-red-600 text-center mb-10">
                  FAQ
               </h3>
               <div className="grid gap-6 md:grid-cols-2">
                  <FAQ
                     q="Do you work with both freight brokers and direct shippers?"
                     a='Yes. Our page and form are designed for both — select "I’m a freight broker" if it applies.'
                  />
                  <FAQ
                     q="Which equipment types do you provide?"
                     a="Dry Van, Reefer, Flatbed, Step Deck, and Power Only."
                  />
                  <FAQ
                     q="Do you operate nationwide?"
                     a="Yes, we cover all continental U.S. with 24/7 dispatch support."
                  />
                  <FAQ
                     q="How fast do you respond to requests?"
                     a="Usually within minutes during business hours — expedited loads get priority."
                  />
               </div>
            </div>
         </section>
      </div>
   );
}

/* --------- UI helpers --------- */
function Badge({
   title,
   desc,
   icon,
}: {
   title: string;
   desc: string;
   icon: React.ReactNode;
}) {
   return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 flex items-start gap-4">
         <div className="text-red-500">{icon}</div>
         <div>
            <h4 className="font-semibold text-white">{title}</h4>
            <p className="text-sm text-gray-300">{desc}</p>
         </div>
      </div>
   );
}

function ServiceCard({ title, desc }: { title: string; desc: string }) {
   return (
      <div className="rounded-2xl border border-gray-200 bg-[#f2f2f2] p-5 shadow-sm">
         <h4 className="font-semibold text-gray-900">{title}</h4>
         <p className="mt-2 text-gray-700 text-sm">{desc}</p>
      </div>
   );
}

function Step({
   number,
   title,
   desc,
}: {
   number: string;
   title: string;
   desc: string;
}) {
   return (
      <div className="rounded-2xl border border-gray-200 bg-[#f2f2f2] p-6">
         <div className="text-red-600 font-extrabold text-xl">{number}</div>
         <h4 className="mt-2 font-semibold text-gray-900">{title}</h4>
         <p className="mt-1 text-gray-700 text-sm">{desc}</p>
      </div>
   );
}

function Benefit({ title, desc }: { title: string; desc: string }) {
   return (
      <div className="rounded-2xl border border-gray-200 bg-[#f2f2f2] p-6 text-center">
         <h4 className="font-semibold text-gray-900">{title}</h4>
         <p className="mt-2 text-gray-700 text-sm">{desc}</p>
      </div>
   );
}

function FAQ({ q, a }: { q: string; a: string }) {
   return (
      <div className="rounded-2xl border border-gray-200 bg-[#f2f2f2] p-6">
         <h4 className="font-semibold text-gray-900">{q}</h4>
         <p className="mt-2 text-gray-700 text-sm">{a}</p>
      </div>
   );
}

/* --------- Icons --------- */
function ShieldIcon() {
   return (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
         <path d="M12 2l7 4v6c0 5-3.4 9.4-7 10-3.6-.6-7-5-7-10V6l7-4z" />
      </svg>
   );
}
function HandshakeIcon() {
   return (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
         <path d="M7.5 12l3.5 3.5a2 2 0 003 0l2-2 2 2 2-2-3.5-3.5a2 2 0 00-3 0l-2 2-2-2a2 2 0 00-3 0z" />
      </svg>
   );
}
function MapIcon() {
   return (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
         <path d="M9 3l6 2 6-2v16l-6 2-6-2-6 2V5l6-2zM9 5v14l6 2V7L9 5z" />
      </svg>
   );
}
