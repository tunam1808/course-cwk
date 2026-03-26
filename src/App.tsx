import { Routes, Route, Navigate } from "react-router-dom";

import Home from "@/pages/home";
import FreeCourses from "@/pages/free-courses";
import FreeSources from "@/pages/free-sources";
import VipSources from "@/pages/vip-sources";
import Contact from "@/pages/contact";
import ListCourses from "./pages/list-courses";
import LessonCapcut from "./layout/courses-premium/course-capcut/lesson-capcut";
import LessonBds from "./layout/courses-premium/course-bds/lesson-bds";
import Login from "@/pages/login";
import ManagePage from "@/admin/manage-page";
import AccountManage from "@/admin/acount-manage";
import CoursesManage from "@/admin/courses-manage";
import Profile from "@/pages/profile";

export default function App() {
  return (
    // 👈 xóa <Router> wrapper
    <Routes>
      {/* User pages */}
      <Route path="/" element={<Home />} />
      <Route path="/free-courses" element={<FreeCourses />} />
      <Route path="/free-sources" element={<FreeSources />} />
      <Route path="/vip-sources" element={<VipSources />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/list-courses" element={<ListCourses />} />
      <Route path="/lesson-capcut" element={<LessonCapcut />} />
      <Route path="/lesson-bds" element={<LessonBds />} />

      {/* Admin */}
      <Route path="/manage-page" element={<ManagePage />}>
        <Route index element={<Navigate to="/manage-page/account" replace />} />
        <Route path="account" element={<AccountManage />} />
        <Route path="courses" element={<CoursesManage />} />
      </Route>

      {/* 404 */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center bg-black text-white">
            <h1 className="text-6xl font-bold text-yellow-400">
              404 - Tính năng đang phát triển
            </h1>
          </div>
        }
      />
    </Routes>
  );
}
