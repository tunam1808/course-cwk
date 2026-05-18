import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "@/default/header";
import Search from "@/layout/courses/search";
import IntroduceDestop from "@/layout/home/introduce";
import Source from "@/layout/home/source";
import Story from "@/layout/home/story";
import Feedback from "@/layout/home/feeback";
import Commit from "@/layout/home/commit";
import Offers from "@/layout/home/offers";
import Countdown from "@/layout/home/countdown";
import SourceMobile from "@/layout/home/source-mobile";
import StoryMobile from "@/layout/home/story-mobile";
import QR from "@/layout/home/qr";
import Lucky from "@/layout/home/lucky-number";

export default function Home() {
  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollTo) {
      const el = document.getElementById(location.state.scrollTo);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
      }
    }
  }, [location.state]);

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header />
      <Search />
      <IntroduceDestop />
      <Feedback />
      <div className="block md:hidden">
        <SourceMobile />
      </div>
      <div className="hidden md:block">
        <Source />
      </div>
      <Commit />
      <div className="block md:hidden">
        <StoryMobile />
      </div>
      <div className="hidden md:block">
        <Story />
      </div>
      <Offers />
      <Countdown />
      <div id="qr">
        <QR />
      </div>
      <Lucky />
    </div>
  );
}
