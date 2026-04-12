// src/pages/admin/AdminDashboard.tsx
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FiUsers,
  FiBookOpen,
  FiArrowLeft,
  FiLayout,
  FiClock,
} from "react-icons/fi";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="bg-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-yellow-400">
                Admin Dashboard
              </h1>
              <p className="mt-1 text-gray-400">
                Quản lý hệ thống Cursed with Knowledge
              </p>
            </div>

            <button
              onClick={handleGoBack}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg border border-gray-700 transition-all duration-200 hover:border-yellow-500/50 hover:shadow-yellow-500/20"
            >
              <FiArrowLeft className="w-5 h-5" />
              Quay lại
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-8">
        {/* Sidebar trái */}
        <aside className="w-64 hidden md:block bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-2">
          <h2 className="text-xl font-bold text-yellow-400 mb-6">Quản lý</h2>

          <NavLink
            to="/manage-page/account"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all
              ${
                isActive
                  ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40"
                  : "text-gray-300 hover:bg-gray-800 hover:text-yellow-400"
              }`
            }
          >
            <FiUsers className="w-6 h-6" />
            Quản lý tài khoản
          </NavLink>

          <NavLink
            to="/manage-page/courses"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all
              ${
                isActive
                  ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40"
                  : "text-gray-300 hover:bg-gray-800 hover:text-yellow-400"
              }`
            }
          >
            <FiBookOpen className="w-6 h-6" />
            Quản lý khóa học
          </NavLink>

          <NavLink
            to="/manage-page/intro-manage"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all
              ${
                isActive
                  ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40"
                  : "text-gray-300 hover:bg-gray-800 hover:text-yellow-400"
              }`
            }
          >
            <FiLayout className="w-6 h-6" />
            Quản lý intro
          </NavLink>

          <NavLink
            to="/manage-page/countdown-manage"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all
    ${
      isActive
        ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40"
        : "text-gray-300 hover:bg-gray-800 hover:text-yellow-400"
    }`
            }
          >
            <FiClock className="w-6 h-6" />
            Quản lý ưu đãi
          </NavLink>
        </aside>

        {/* Nội dung chính */}
        <main className="flex-1 bg-gray-900 rounded-xl border border-gray-800 p-6 shadow-lg shadow-black/30 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
