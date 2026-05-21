import Header from "@/default/header";
import Footer from "@/default/footer";
import Search from "@/layout/courses/search";
import SourceFree from "@/layout/vip-sources/source-vip";

export default function VipSources() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Header />
      <Search />
      <SourceFree />
      <Footer />
    </div>
  );
}
