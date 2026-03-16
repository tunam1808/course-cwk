import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/auth.context";

const navItems = [
  { label: "Trang chủ", href: "/" },
  { label: "Học miễn phí", href: "/free-courses" },
  { label: "Các khóa học", href: "/list-courses" },
  { label: "Tài nguyên VIP", href: "/vip-sources" },
  { label: "Tài nguyên free", href: "/free-sources" },
  { label: "Liên hệ", href: "/contact" },
] as const;

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-black text-white">
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

            {user ? (
              <div className="relative ml-4 group">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-yellow-500 cursor-pointer">
                  {user.role === "ADMIN" ? (
                    <img
                      src="/admin.jpg"
                      alt="Admin"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-yellow-500 flex items-center justify-center font-bold text-black text-lg select-none">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-52 bg-gray-900 border border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  {/* Thông tin user */}
                  <div className="px-4 py-3 border-b border-gray-700">
                    <p className="text-sm text-white font-semibold truncate">
                      {user.email}
                    </p>
                    <p className="text-xs text-yellow-400">{user.role}</p>
                  </div>

                  {/* Trang quản lý - chỉ hiện với ADMIN */}
                  {user.role === "ADMIN" && (
                    <NavLink
                      to="/manage-page"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-yellow-400 transition-colors"
                    >
                      🛠️ Trang quản lý
                    </NavLink>
                  )}

                  {/* Tài khoản của tôi */}
                  <NavLink
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-yellow-400 transition-colors"
                  >
                    👤 Tài khoản của tôi
                  </NavLink>

                  {/* Đăng xuất */}
                  <div className="border-t border-gray-700">
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-gray-800 transition-colors rounded-b-lg"
                    >
                      🚪 Đăng xuất
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <a
                href="/login"
                className="ml-4 px-4 py-2 rounded-md text-sm lg:text-lg font-semibold
                           bg-gradient-to-r from-yellow-500 to-yellow-600
                           hover:from-yellow-400 hover:to-yellow-500
                           text-black shadow-sm hover:shadow-md transition-all duration-200"
              >
                Đăng nhập
              </a>
            )}
          </div>

          <div className="md:hidden">
            <button className="text-yellow-400 hover:text-yellow-300">
              <span className="sr-only">Open menu</span>☰
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
