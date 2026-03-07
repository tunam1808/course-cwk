import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "@/pages/home";
import FreeCourses from "@/pages/free-courses";
import Login from "@/pages/login";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/free-courses" element={<FreeCourses />} />
        <Route path="/login" element={<Login />} />
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
    </Router>
  );
}
