import Footer from "@/components/Footer";
import Form from "@/components/Form";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SecondSec from "@/components/SecondSec";
import Services from "@/components/Services";

export default function Home() {
   return (
      <>
         <Header />
         <Hero />
         <SecondSec />

         <section className="bg-[#C4C4C4]">
            <div className="custom-container py-20">
             
               {/* <h3 className="text-center font-semibold text-4xl mt-5 mb-7">Services</h3> */}

               <Services />
            </div>
         </section>

         <section className="bg-[#C4C4C4]">
            <Form />
         </section>

         <Footer />
      </>
   );
}
