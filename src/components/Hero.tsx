import Image from "next/image";
import React from "react";

const Hero = () => {
   return (
      <div className="py-36">
         <Image
            className="absolute -z-10 top-0 left-0 w-full h-[600px] object-cover brightness-50 pointer-events-none select-none"
            src="/images/truck.jpg"
            width={1000}
            height={1000}
            alt="her img"
         />
         <div className="custom-container h-full flex flex-col justify-center text-white">
            <p className="text-xl">Lorem, ipsum dolor.</p>
            <hr className="border-none w-14 h-[1px] my-4 bg-white" />
            <h1 className="text-4xl font-bold">Lorem ipsum dolor sit amet.</h1>

            <button className="w-fit py-2 px-8 mt-20 font-semibold rounded-sm bg-red-600">
               Lorem, ipsum.
            </button>
         </div>
      </div>
   );
};

export default Hero;
