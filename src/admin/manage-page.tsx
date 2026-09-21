// src/pages/admin/AdminDashboard.tsx
import { useEffect, useRef } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import type { IconType } from "react-icons";
import {
  FiUsers,
  FiBookOpen,
  FiArrowLeft,
  FiLayout,
  FiClock,
  FiFolder,
  FiCalendar,
  FiAward,
} from "react-icons/fi";

interface NavItem {
  to: string;
  label: string;
  icon: IconType;
}

// Một danh sách dùng chung cho sidebar (desktop) và thanh tab (mobile),
// thêm/bớt mục chỉ cần sửa ở đây.
const NAV_ITEMS: NavItem[] = [
  { to: "/manage-page/account", label: "Quản lý tài khoản", icon: FiUsers },
  { to: "/manage-page/courses", label: "Quản lý khóa học", icon: FiBookOpen },
  { to: "/manage-page/intro-manage", label: "Quản lý intro", icon: FiLayout },
  {
    to: "/manage-page/countdown-manage",
    label: "Quản lý ưu đãi",
    icon: FiClock,
  },
  {
    to: "/manage-page/resource-manage",
    label: "Quản lý tài nguyên",
    icon: FiFolder,
  },
  {
    to: "/manage-page/schedule-manage",
    label: "Thời khóa biểu",
    icon: FiCalendar,
  },
  {
    to: "/manage-page/score-manage",
    label: "Đánh giá thành viên",
    icon: FiAward,
  },
];

const sidebarLinkClass = ({ isActive }: { isActive: boolean }): string =>
  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
    isActive
      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40"
      : "text-gray-300 hover:bg-gray-800 hover:text-yellow-400"
  }`;

const pillLinkClass = ({ isActive }: { isActive: boolean }): string =>
  `flex shrink-0 items-center gap-2 whitespace-nowrap px-3.5 py-2 rounded-full border text-sm font-medium transition-all ${
    isActive
      ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/40"
      : "bg-gray-900 text-gray-300 border-gray-800 hover:text-yellow-400"
  }`;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const mobileNavRef = useRef<HTMLElement>(null);

  const handleGoBack = () => {
    navigate(-1);
  };

  // Khi đổi trang, cuộn thanh tab mobile để mục đang chọn nằm giữa màn hình
  // (chỉ cuộn bên trong thanh tab, không làm trang bị giật dọc).
  useEffect(() => {
    const nav = mobileNavRef.current;
    const active = nav?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!nav || !active) return;
    nav.scrollTo({
      left: active.offsetLeft - (nav.clientWidth - active.clientWidth) / 2,
      behavior: "smooth",
    });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="bg-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-3xl sm:text-3xl font-bold text-yellow-400 truncate">
                Admin Dashboard
              </h1>
              <p className="mt-0.5 sm:mt-1 text-sm sm:text-base text-gray-400 truncate">
                Quản lý hệ thống Cursed with Knowledge
              </p>
            </div>

            <button
              onClick={handleGoBack}
              aria-label="Quay lại"
              className="shrink-0 flex items-center gap-2 px-3 sm:px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg border border-gray-700 transition-all duration-200 hover:border-yellow-500/50 hover:shadow-yellow-500/20"
            >
              <FiArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Quay lại</span>
            </button>
          </div>
        </div>
      </header>

      {/* Thanh điều hướng mobile — thay cho sidebar bị ẩn dưới md */}
      <nav
        ref={mobileNavRef}
        aria-label="Điều hướng quản trị"
        className="md:hidden sticky top-0 z-20 bg-black/95 backdrop-blur border-b border-gray-800 px-4 sm:px-6 py-2.5 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={pillLinkClass}>
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 md:py-6 gap-8">
        {/* Sidebar trái (desktop) */}
        <aside className="w-64 shrink-0 hidden md:block self-start bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-2">
          <h2 className="text-xl font-bold text-yellow-400 mb-6">Quản lý</h2>

          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={sidebarLinkClass}>
              <Icon className="w-6 h-6" />
              {label}
            </NavLink>
          ))}
        </aside>

        {/* Nội dung chính */}
        <main className="flex-1 min-w-0 bg-gray-900 rounded-xl border border-gray-800 p-3 sm:p-6 shadow-lg shadow-black/30 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
