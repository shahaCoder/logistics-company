import Footer from "@/components/Footer";
import Form from "@/components/Form";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Reviews from "@/components/Reviews";
import SecondSec from "@/components/SecondSec";
import Seo from "@/components/Seo";
import Services from "@/components/Services";

export default function Home() {
   return (
      <>
      <Seo
  title="Professional Trucking & Freight Services | Global Cooperation LLC"
  description="Reliable trucking company providing fast and safe freight delivery across the USA. Global Cooperation LLC offers nationwide logistics, dispatch, and transport services for businesses of all sizes."
/>
         <Hero />
         <SecondSec />

         <section className="bg-[#C4C4C4]">
            <div className="custom-container py-20">
               <Services />
            </div>
         </section>
         <section className="w-full custom-container bg-[#C4C4C4] py-20">
            <Reviews />
         </section>

         <section className="bg-[#C4C4C4]" id="contact-form">
            <Form />
         </section>
      </>
   );
}