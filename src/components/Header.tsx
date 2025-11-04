"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import clsx from "clsx"; // если не установлен — npm i clsx


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
      { name: "Move your Freight", href: "/freights" },
   ];

   return (
      <header  className={clsx(
      "w-full relative z-50 text-white",
      pathname === "/about"
        ? "bg-[#1b1b1b]" // ← фон для страницы About
        : "bg-transparent" // ← прозрачный для остальных
    )}>
         {/* Desktop */}
         {/* Desktop */}
<div className="hidden md:flex custom-container items-center justify-between py-6">
  <Link href={"/"} className="flex items-center gap-2">
    <Image src={"/images/logo.png"} width={70} height={70} alt="logo" className="cursor-pointer" />
    <p className="text-gray-300 font-medium">Global Cooperation llc</p>
  </Link>

  <nav className="flex-1">
    <ul className="flex flex-nowrap items-center justify-end gap-6 lg:gap-8 xl:gap-10 text-gray-200 font-medium tracking-wide">
      {navItems.map((item, i) => (
        <motion.li key={i} whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 200 }}>
          <a
            href={item.href}
            onClick={(e) => handleScrollTo(e, item.href)}
            className="relative whitespace-nowrap hover:text-red-600 transition-colors duration-300
                       after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px]
                       after:bg-red-600 after:transition-all after:duration-300 hover:after:w-full"
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
    <Image src="/images/logo.png" alt="logo" width={70} height={70} className="cursor-pointer" />
    <p className="text-gray-300 font-medium">Global Cooperation llc</p>
  </Link>

  <nav className="mt-4">
    <ul className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm uppercase text-gray-200 font-medium tracking-wide max-md:mt-10">
      {navItems.map((item, i) => (
        <motion.li key={i} whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 200 }}>
          <a
            href={item.href}
            onClick={(e) => handleScrollTo(e, item.href)}
            className="relative hover:text-red-600 transition-colors duration-300
                       after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px]
                       after:bg-red-600 after:transition-all after:duration-300 hover:after:w-full"
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