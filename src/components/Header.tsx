"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const Header = () => {
   const navItems = [
      { name: "Home", href: "/" },
      { name: "Services", href: "#services" },
      { name: "About Us", href: "/about" },
      { name: "Contact", href: "/contact" },
   ];

   return (
      <header className="w-full relative z-50 bg-transparent text-white">
         {/* Desktop */}
         <div className="hidden md:flex custom-container items-center justify-between py-6">
            <Link href={"/"} className="flex items-center gap-2">
               <Image
                  src={"/images/logo.png"}
                  width={70}
                  height={70}
                  alt="logo"
                  className="cursor-pointer"
               />
               <p className="text-gray-300 font-medium">
                  Global Cooperation llc
               </p>
            </Link>

            <nav className="w-1/2">
               <ul className="flex items-center justify-between text-gray-200 font-medium tracking-wide">
                  {navItems.map((item, i) => (
                     <motion.li
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 200 }}
                     >
                        <Link
                           href={item.href}
                           className="relative hover:text-red-600 transition-colors duration-300 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-red-600 after:transition-all after:duration-300 hover:after:w-full"
                        >
                           {item.name}
                        </Link>
                     </motion.li>
                  ))}
               </ul>
            </nav>
         </div>

         {/* Mobile */}
         <div className="flex flex-col items-center justify-center py-4 md:hidden">
            <motion.div
               initial={{ opacity: 0, y: -10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5 }}
            >
               <Link href="/" className="flex flex-col items-center">
                  <Image
                     src="/images/logo.png"
                     alt="logo"
                     width={70}
                     height={70}
                     className="cursor-pointer"
                  />
                  <p className="text-gray-300 font-medium">
                     Global Cooperation llc
                  </p>
               </Link>
            </motion.div>

            <motion.nav
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.2 }}
               className="mt-4"
            >
               <ul className="flex gap-8 text-sm uppercase text-gray-200 font-medium tracking-wide max-md:mt-10">
                  {navItems.map((item, i) => (
                     <motion.li
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 200 }}
                     >
                        <Link
                           href={item.href}
                           className="relative hover:text-red-600 transition-colors duration-300 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-red-600 after:transition-all after:duration-300 hover:after:w-full"
                        >
                           {item.name}
                        </Link>
                     </motion.li>
                  ))}
               </ul>
            </motion.nav>
         </div>
      </header>
   );
};

export default Header;
