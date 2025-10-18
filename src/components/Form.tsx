import Image from "next/image";
import React from "react";

const Form = () => {
   return (
      <div className="custom-container flex items-center pb-20">
         <div className="w-2/5">
            <h2 className="text-4xl font-bold mb-2">Form</h2>
            <p className="text-sm leading-6 text-gray-800">
               Lorem ipsum dolor sit amet consectetur adipisicing elit. Saepe
               quo veniam consequuntur reprehenderit accusantium, maxime quam
               eos porro similique at.
            </p>

            <form className="mt-4 flex flex-col gap-3">
               <input
                  type="text"
                  id="city"
                  className="peer w-full rounded-lg border-2 border-gray-300 bg-white px-4 pb-2 pt-2.5 text-gray-900 focus:border-gray-600 focus:ring-1 focus:ring-gray-600 focus:outline-none transition-all duration-300"
                  placeholder="Name"
               />
               <input
                  type="text"
                  id="city"
                  className="peer w-full rounded-lg border-2 border-gray-300 bg-white px-4 pb-2 pt-2.5 text-gray-900 focus:border-gray-600 focus:ring-1 focus:ring-gray-600 focus:outline-none transition-all duration-300"
                  placeholder="Name"
               />
               <input
                  type="text"
                  id="city"
                  className="peer w-full rounded-lg border-2 border-gray-300 bg-white px-4 pb-2 pt-2.5 text-gray-900 focus:border-gray-600 focus:ring-1 focus:ring-gray-600 focus:outline-none transition-all duration-300"
                  placeholder="Name"
               />
               <input
                  type="text"
                  id="city"
                  className="peer w-full rounded-lg border-2 border-gray-300 bg-white px-4 pb-2 pt-2.5 text-gray-900 focus:border-gray-600 focus:ring-1 focus:ring-gray-600 focus:outline-none transition-all duration-300"
                  placeholder="Name"
               />
               <button className="py-3 rounded-lg font-medium bg-red-600 text-white">
                  Отправить
               </button>
            </form>
         </div>
         <div className="w-3/5 relative">
            <Image
               className="w-[400px] absolute right-1/4 top-1/3"
               src={"/images/truck-icon.png"}
               width={100}
               height={100}
               alt="img"
            />
            <Image
               className="w-[350px] float-right"
               src="/images/road.jpg"
               width={100}
               height={100}
               alt="img"
            />
         </div>
      </div>
   );
};

export default Form;
