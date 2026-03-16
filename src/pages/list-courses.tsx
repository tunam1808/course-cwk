import Header from "@/default/header";
import Search from "@/layout/courses/search";
import SelectCourses from "@/layout/courses/select-courses";

export default function ListCourses() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Search />
      <SelectCourses />
    </div>
  );
}
