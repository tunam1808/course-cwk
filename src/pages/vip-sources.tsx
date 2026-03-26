import Header from "@/default/header";
import Search from "@/layout/courses/search";

export default function VipSources() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Header />
      <Search />
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <h1 className="text-6xl font-bold text-yellow-400">
          404 - Tính năng đang phát triển
        </h1>
      </div>
    </div>
  );
}
