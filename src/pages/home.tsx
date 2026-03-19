import Header from "@/default/header";
import Search from "@/layout/courses/search";
import Introduce from "@/layout/home/introduce";
import Story from "@/layout/home/story";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Header />
      <Search />
      <Introduce />
      <Story />
    </div>
  );
}
