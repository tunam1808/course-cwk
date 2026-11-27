import Feedback from "@/layout/promotional-page/Feedback";
import Final from "@/layout/promotional-page/Final";
import Footer from "@/layout/promotional-page/Footer";
import Hero from "@/layout/promotional-page/Hero";
import Nav from "@/layout/promotional-page/Nav";
import Pain from "@/layout/promotional-page/Pain";
import Pricing from "@/layout/promotional-page/Pricing";
import Stats from "@/layout/promotional-page/Stats";
import StickyBar from "@/layout/promotional-page/StickyBar";
import Terms from "@/layout/promotional-page/Terms";
import Videos from "@/layout/promotional-page/Videos";
import { useReveal } from "@/hooks/useReveal";

export default function Promotional() {
  useReveal();
  return (
    <div className="promo">
      <Nav />
      <main>
        <Hero />
        <Pain />
        <Videos />
        <Stats />
        <Feedback />
        <Pricing />
        <Terms />
        <Final />
      </main>
      <Footer />
      <StickyBar />
    </div>
  );
}
