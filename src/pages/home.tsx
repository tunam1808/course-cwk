import Header from "@/default/header";
import Search from "@/layout/courses/search";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Header />
      <Search />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-white">
        Tính năng đang phát triển
      </div>
    </div>
  );
}
