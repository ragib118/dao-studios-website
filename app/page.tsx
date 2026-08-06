import Hero from "@/components/home/Hero";
import Featured from "@/components/home/Featured";
import Stats from "@/components/home/Stats";
import FinalSection from "@/components/home/FinalSection";
import Footer from "@/components/Footer";

export default function Home() {
    return (
        <main>
            <Hero />
            <Featured />
            <Stats />
            <FinalSection />
            <Footer />
        </main>
    );
}