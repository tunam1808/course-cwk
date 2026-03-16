import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/auth.api";
import { useAuth } from "../contexts/auth.context";
import { showError } from "@/common/toast";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await authApi.login(email, password);
      login(data.user, data.token, rememberMe);
      navigate("/");
    } catch (err: any) {
      showError(err.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-800 shadow-2xl shadow-yellow-900/20 overflow-hidden">
        <div className="pt-4 text-center border-gray-800">
          <h1 className="text-4xl font-bold text-black mb-2">Đăng nhập</h1>
          <p className="text-gray-400 text-sm italic">
            Sử dụng email và mật khẩu của bạn
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
              className="w-full px-4 py-3 italic bg-yellow-100 border border-gray-700 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 transition-all"
              required
            />
          </div>

          {/* 👈 Thêm icon hiển thị mật khẩu */}
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu của bạn"
              className="w-full px-4 py-3 italic bg-yellow-100 border border-gray-700 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 transition-all pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              {showPassword ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-5 h-5 rounded border-gray-700 bg-gray-900 text-yellow-500 focus:ring-yellow-500/30"
              />
              <span className="text-sm text-gray-300">Ghi nhớ đăng nhập</span>
            </label>

            <Link
              to="/forgot-password"
              className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              Bạn quên mật khẩu ?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold text-lg rounded-lg shadow-lg hover:shadow-yellow-500/30 transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

          <div className="flex justify-center">
            <span
              onClick={() => navigate(-1)}
              className="text-sm text-gray-400 hover:text-gray-300 cursor-pointer transition-colors"
            >
              Hủy đăng nhập
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
