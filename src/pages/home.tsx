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
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header />
      <Search />
      <IntroduceDestop />
      <Feedback />
      <div className="block md:hidden">
        {" "}
        {/* Hiện component này khi ở giao diện mobile */}
        <SourceMobile />
      </div>
      <div className="hidden md:block">
        {" "}
        {/* Ẩn component này khi ở giao diện mobile */}
        <Source />
      </div>
      <Commit />
      <div className="block md:hidden">
        {" "}
        {/* Hiện component này khi ở giao diện mobile */}
        <StoryMobile />
      </div>
      <div className="hidden md:block">
        {" "}
        {/* Ẩn component này khi ở giao diện mobile */}
        <Story />
      </div>
      <Offers />
      <Countdown />
      <QR />
      <Lucky />
    </div>
  );
}
