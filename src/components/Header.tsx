import Image from "next/image";
import Link from "next/link";
import React from "react";

const Header = () => {
   return (
      <header>
         <div className="custom-container flex items-center justify-between py-2">
            <Link href={"/"}>
               <Image
                  src={"/images/logo.png"}
                  width={70}
                  height={70}
                  alt="logo"
               />
            </Link>

            <nav className="w-1/4">
               <ul className="flex items-center justify-between text-white">
                  <li>lorem</li>
                  <li>lorem</li>
                  <li>lorem</li>
                  <li>lorem</li>
               </ul>
            </nav>
         </div>
      </header>
   );
};

export default Header;
