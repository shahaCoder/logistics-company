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
      name: "John Doe",
      role: "CEO, Example Corp",
      text: "The service was outstanding! Communication was fast and professional. Definitely recommend this company for anyone looking for reliable solutions.",
      date: "October 2025",
      avatar: "/images/user.jpg",
    },
    {
      name: "Sarah Smith",
      role: "Manager, Logistic Pro",
      text: "Very reliable team. Everything was smooth and on time. Loved working with them!",
      date: "September 2025",
      avatar: "/images/user.jpg",
    },
    {
      name: "Michael Lee",
      role: "Driver, USA Freight",
      text: "Best company I’ve worked with — clear communication and fair pay!",
      date: "August 2025",
      avatar: "/images/user.jpg",
    },
    {
      name: "Michael Lee",
      role: "Driver, USA Freight",
      text: "Best company I’ve worked with — clear communication and fair pay!",
      date: "August 2025",
      avatar: "/images/user.jpg",
    },
    {
      name: "Michael Lee",
      role: "Driver, USA Freight",
      text: "Best company I’ve worked with — clear communication and fair pay!",
      date: "August 2025",
      avatar: "/images/user.jpg",
    },
    {
      name: "Michael Lee",
      role: "Driver, USA Freight",
      text: "Best company I’ve worked with — clear communication and fair pay!",
      date: "August 2025",
      avatar: "/images/user.jpg",
    },
  ];

  return (
    <section className="w-full ">
      <motion.h2 initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.1 }} className="text-center text-3xl md:text-4xl font-extrabold text-red-600 mb-10">
        REVIEWS FROM BELOVED CUSTOMERS
      </motion.h2>

      <motion.div initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.1 }}>
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
              <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 h-full flex flex-col justify-between">
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
    </section>
  );
}
