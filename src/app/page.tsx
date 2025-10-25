import Footer from "@/components/Footer";
import Form from "@/components/Form";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SecondSec from "@/components/SecondSec";
import Services from "@/components/Services";

export default function Home() {
   return (
      <>
         <Hero />
         <SecondSec />

         <section className="bg-[#C4C4C4]">
            <div className="custom-container py-20">
               <Services />
            </div>
         </section>

         <section className="bg-[#C4C4C4]">
            <Form />
         </section>
      </>
   );
}
