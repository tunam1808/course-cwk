import { useAuth } from "@/contexts/auth.context";

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 px-8 py-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-yellow-400">
            Tài khoản của tôi
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Thông tin tài khoản của bạn
          </p>
        </div>

        <div className="p-8 space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-yellow-500">
              {user?.role === "ADMIN" ? (
                <img
                  src="/admin.jpg"
                  alt="Admin"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-yellow-500 flex items-center justify-center font-bold text-black text-3xl select-none">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p className="text-white font-semibold text-lg">{user?.email}</p>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  user?.role === "ADMIN"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                {user?.role}
              </span>
            </div>
          </div>

          {/* Thông tin */}
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-lg px-4 py-3">
              <p className="text-xs text-gray-400 mb-1">Email</p>
              <p className="text-white text-sm">{user?.email}</p>
            </div>

            <div className="bg-gray-800 rounded-lg px-4 py-3">
              <p className="text-xs text-gray-400 mb-1">Vai trò</p>
              <p className="text-white text-sm">{user?.role}</p>
            </div>

            <div className="bg-gray-800 rounded-lg px-4 py-3">
              <p className="text-xs text-gray-400 mb-1">ID tài khoản</p>
              <p className="text-white text-sm">#{user?.id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
