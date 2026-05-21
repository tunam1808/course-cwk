import Header from "@/default/header";
import Footer from "@/default/footer";
import Search from "@/layout/courses/search";
import Lesson from "@/layout/courses/lessons";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Search />
      <Lesson />
      <Footer />
    </div>
  );
}
