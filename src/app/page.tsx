import Form from "@/components/Form";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Image from "next/image";

export default function Home() {
   return (
      <>
         <Header />
         <Hero />

         <div className="flex items-center mt-1 ">
            <div className="relative flex flex-col gap-10 items-center justify-center py-14 px-10 text-white bg-[#1c1c1ddc]">
               <Image
                  className="w-full h-full absolute -z-10 top-0 left-0 object-cover brightness-50"
                  src={"/images/truck.jpg"}
                  width={100}
                  height={100}
                  alt="img"
               />
               <Image
                  src={"/images/handshake.png"}
                  width={80}
                  height={80}
                  alt="handshake"
               />

               <h2 className="text-xl font-medium">Lorem ipsum</h2>

               <p className="text-center text-sm text-gray-300">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Laboriosam perspiciatis a error enim tempora, quos vel
                  exercitationem minus ipsa numquam vitae sequi asperiores
                  ipsam! Molestias?
               </p>
            </div>
            <div className="relative flex flex-col gap-10 items-center justify-center py-14 px-10 text-white bg-[#3a3a3cdc]">
               <Image
                  className="w-full h-full absolute -z-10 top-0 left-0 object-cover brightness-50"
                  src={"/images/truck.jpg"}
                  width={100}
                  height={100}
                  alt="img"
               />
               <Image
                  src={"/images/handshake.png"}
                  width={80}
                  height={80}
                  alt="handshake"
               />

               <h2 className="text-xl font-medium">Lorem ipsum</h2>

               <p className="text-center text-sm text-gray-300">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Laboriosam perspiciatis a error enim tempora, quos vel
                  exercitationem minus ipsa numquam vitae sequi asperiores
                  ipsam! Molestias?
               </p>
            </div>
            <div className="relative flex flex-col gap-10 items-center justify-center py-14 px-10 text-white bg-[#565659dc]">
               <Image
                  className="w-full h-full absolute -z-10 top-0 left-0 object-cover brightness-50"
                  src={"/images/truck.jpg"}
                  width={100}
                  height={100}
                  alt="img"
               />
               <Image
                  src={"/images/handshake.png"}
                  width={80}
                  height={80}
                  alt="handshake"
               />

               <h2 className="text-xl font-medium">Lorem ipsum</h2>

               <p className="text-center text-sm text-gray-300">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Laboriosam perspiciatis a error enim tempora, quos vel
                  exercitationem minus ipsa numquam vitae sequi asperiores
                  ipsam! Molestias?
               </p>
            </div>
         </div>

         <section>
            <div className="custom-container py-20">
               <h2 className="text-5xl text-center font-bold text-red-600">
                  Service
               </h2>

               <div className="grid grid-cols-4 gap-y-10 gap-5 mt-10">
                  {[1, 2, 3, 4, 5, 6, 7].map((item) => (
                     <div key={item} className="flex flex-col ">
                        <Image
                           className="mb-5"
                           src={"/images/handshake.png"}
                           width={70}
                           height={70}
                           alt="img"
                        />
                        <p className="font-medium">Service</p>
                        <p>
                           Lorem ipsum dolor sit, amet consectetur adipisicing
                           elit. Neque suscipit, asperiores vitae dolore ab non.
                        </p>
                     </div>
                  ))}
               </div>
            </div>
         </section>

         <section>
            <Form />
         </section>
      </>
   );
}
