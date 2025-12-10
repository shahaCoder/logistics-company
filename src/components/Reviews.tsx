"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { motion } from "framer-motion";
import "swiper/css";
import "swiper/css/pagination";
import { FaUserCircle } from "react-icons/fa";

export default function Reviews() {
  const reviews = [
    {
      name: "ryanm12",
      role: "Ch Robinson Company",
      text: "I've worked with Global Cooperation for a while now and its been an enjoyable experience. Easy to communicate with and understanding and cooperative whenever issues arise. I wish more carries were like Global Cooperation!",
      date: "November 2025",
      avatar: "/images/user.jpg",
    },
    {
      name: "sofirc",
      role: "Hazen Transfer LLC",
      text: "We work with them frequently, and I can confidently say they are very responsible, have excellent communication, and are always on time. Overall, just great service in general.",
      date: "June 2025",
      avatar: "/images/user.jpg",
    },
    {
      name: "Nataliya BSB",
      role: "Blue Sky Brokerage Lic",
      text: "Excellent service! Global Co LLC delivered my shipment promptly and with the utmost care. Professional, courteous, and efficient - they exceeded my expectations. I highly recommend Global Co LLC for reliable and top-notch transportation services. Grateful for a smooth experience!",
      date: "November 2024",
      avatar: "/images/user.jpg",
    },
    {
      name: "Forward Air",
      role: "Forward Air Logistics Services",
      text: "Have been working with Global Cooperations for months and they have been great to work with! Always happy to provide updates and keep the broker informed.",
      date: "November 2025",
      avatar: "/images/user.jpg",
    },
    {
      name: "Chicken Little",
      role: "J&J Transportation",
      text: "Have worked with Sindor for many years. Great service and communication.",
      date: "November 2025",
      avatar: "/images/user.jpg",
    },
    {
      name: "Alex",
      role: "M&P Logistics",
      text: "I have worked with Global Cooperation several times on NY to NJ dry van shipments. They are always on time and keep me updated. Highly recommend booking this carrier.",
      date: "November 2025",
      avatar: "/images/user.jpg",
    },
  ];

  return (
    <section className="w-full">
      <div className="mx-auto w-full max-w-[1440px] px-4 lg:px-10">
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.1 }} 
          className="text-center text-3xl md:text-4xl font-extrabold text-red-600 mb-10"
        >
          REVIEWS FROM BELOVED CUSTOMERS
        </motion.h2>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Swiper
            modules={[Pagination]}
            spaceBetween={30}
            slidesPerView={1}
            pagination={{ clickable: true }}
            breakpoints={{
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
          >
          {reviews.map((r, i) => (
            <SwiperSlide key={i}>
              <div className="no-select bg-white rounded-2xl p-6 shadow-md border border-gray-200 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    {/* <img
                      src={r.avatar}
                      alt={r.name}
                      className="w-12 h-12 rounded-full object-cover"
                    /> */}
                    <FaUserCircle className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {r.name}
                      </h3>
                      <p className="text-sm text-gray-500">{r.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-5">
                    “{r.text}”
                  </p>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-red-600">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <svg
                          key={i}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-4 h-4"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.174c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.286 3.966c.3.921-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.785.57-1.84-.197-1.54-1.118l1.286-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.174a1 1 0 00.95-.69l1.287-3.967z" />
                        </svg>
                      ))}
                  </div>
                  <span className="text-gray-500">{r.date}</span>
                </div>
              </div>
            </SwiperSlide>
          ))}
          </Swiper>
        </motion.div>
      </div>
    </section>
  );
}
