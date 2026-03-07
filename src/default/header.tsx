import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Trang chủ", href: "/" },
  { label: "Học miễn phí", href: "/free-courses" },
  { label: "Các khóa học", href: "/list-courses" },
  { label: "Tài nguyên VIP", href: "/vip-sources" },
  { label: "Tài nguyên free", href: "/free-sources" },
  { label: "Liên hệ", href: "/contact" },
] as const;

export default function Navbar() {
  return (
    <nav className="bg-black text-white'">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-6 h-16 max-w-fit mx-auto">
          <div className="flex items-center">
            <img
              src="/logo.png"
              alt="Cursed with Knowledge Logo"
              className="h-10 sm:h-40 w-auto object-contain"
            />
          </div>
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm lg:text-lg font-medium transition-colors duration-150
                  ${
                    isActive
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "text-gray-300 hover:text-yellow-400 hover:bg-gray-800/40"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}

            {/* Tài khoản (nếu muốn giữ) */}
            <a
              href="/login"
              className="ml-4 px-4 py-2 rounded-md text-sm lg:text-lg font-semibold
                         bg-gradient-to-r from-yellow-500 to-yellow-600
                         hover:from-yellow-400 hover:to-yellow-500
                         text-black shadow-sm hover:shadow-md transition-all duration-200"
            >
              Đăng nhập
            </a>
          </div>

          {/* Mobile menu button (nếu muốn responsive) */}
          <div className="md:hidden">
            {/* Bạn có thể thêm hamburger menu ở đây nếu cần */}
            <button className="text-yellow-400 hover:text-yellow-300">
              <span className="sr-only">Open menu</span>☰
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
