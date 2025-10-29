"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";

const Header = () => {
   const router = useRouter();
   const pathname = usePathname();

   const handleScrollTo = (e: React.MouseEvent, href: string) => {
      e.preventDefault();

      if (href.startsWith("#")) {
         // Если уже на главной, просто скроллим
         if (pathname === "/") {
            const target = document.querySelector(href);
            if (target) {
               target.scrollIntoView({ behavior: "smooth" });
            }
         } else {
            // Если на другой странице — перейдём на главную и потом доскроллим
            router.push("/" + href);
         }
      } else {
         router.push(href);
      }
   };

   const navItems = [
      { name: "Home", href: "/" },
      { name: "Services", href: "#services" },
      { name: "About Us", href: "/about" },
      { name: "Join", href: "/contact" },
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
                        <a
                           href={item.href}
                           onClick={(e) => handleScrollTo(e, item.href)}
                           className="relative hover:text-red-600 transition-colors duration-300 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-red-600 after:transition-all after:duration-300 hover:after:w-full"
                        >
                           {item.name}
                        </a>
                     </motion.li>
                  ))}
               </ul>
            </nav>
         </div>

         {/* Mobile */}
         <div className="flex flex-col items-center justify-center py-4 md:hidden">
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

            <nav className="mt-4">
               <ul className="flex gap-8 text-sm uppercase text-gray-200 font-medium tracking-wide max-md:mt-10">
                  {navItems.map((item, i) => (
                     <motion.li
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 200 }}
                     >
                        <a
                           href={item.href}
                           onClick={(e) => handleScrollTo(e, item.href)}
                           className="relative hover:text-red-600 transition-colors duration-300 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-red-600 after:transition-all after:duration-300 hover:after:w-full"
                        >
                           {item.name}
                        </a>
                     </motion.li>
                  ))}
               </ul>
            </nav>
         </div>
      </header>
   );
};

export default Header;
