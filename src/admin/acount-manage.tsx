import { useEffect, useState } from "react";
import { userApi } from "@/api/user.api";
import { useAuth } from "@/contexts/auth.context";
import { showSuccess, showError } from "@/common/toast";
import ConfirmDialog from "@/common/ConfirmDialog";
import axios from "axios";

const COURSES = [
  { id: "CAPCUT_AI", label: "Edit video CapCut nâng cao + AI" },
  { id: "BAT_DONG_SAN", label: "Edit video bất động sản" },
];

interface User {
  id: number;
  email: string;
  fullName: string | null;
  role: string;
  createdAt: string;
  purchasedCategories?: string[];
}

interface FormData {
  email: string;
  fullName: string;
  password: string;
  role: string;
  purchasedCategories: string[];
}

export default function AccountManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    fullName: "",
    password: "",
    role: "USER",
    purchasedCategories: [],
  });
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const fetchUsers = async () => {
    try {
      const data = await userApi.getUsers();
      setUsers(data);
    } catch {
      showError("Không thể tải danh sách user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenCreate = () => {
    setEditUser(null);
    setFormData({
      email: "",
      fullName: "",
      password: "",
      role: "USER",
      purchasedCategories: [],
    });
    setShowPassword(false);
    setError("");
    setShowModal(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditUser(user);
    setFormData({
      email: user.email,
      fullName: user.fullName || "",
      password: "",
      role: user.role,
      purchasedCategories: user.purchasedCategories || [],
    });
    setShowPassword(false);
    setError("");
    setShowModal(true);
  };

  const handleToggleCourse = (courseId: string) => {
    setFormData((prev) => {
      const already = prev.purchasedCategories.includes(courseId);
      return {
        ...prev,
        purchasedCategories: already
          ? prev.purchasedCategories.filter((id) => id !== courseId)
          : [...prev.purchasedCategories, courseId],
      };
    });
  };

  const handleSubmit = async () => {
    try {
      if (editUser) {
        const dataToUpdate =
          editUser.id === currentUser?.id
            ? { ...formData, role: editUser.role }
            : formData;
        await userApi.updateUser(editUser.id, dataToUpdate);
        showSuccess("Cập nhật tài khoản thành công!");
      } else {
        await userApi.createUser(
          formData.email,
          formData.password,
          formData.fullName,
          formData.purchasedCategories,
        );
        showSuccess("Tạo tài khoản thành công!");
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || "Có lỗi xảy ra"
        : "Có lỗi xảy ra";
      setError(message);
      showError(message);
    }
  };

  const handleDeleteClick = (id: number) => {
    if (currentUser?.id === id) {
      showError("Bạn không thể xóa chính mình!");
      return;
    }
    setDeleteId(id);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await userApi.deleteUser(deleteId);
      showSuccess("Xóa tài khoản thành công!");
      fetchUsers();
    } catch {
      showError("Xóa tài khoản thất bại!");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-yellow-400 mb-6">
        Quản lý tài khoản
      </h2>

      {loading ? (
        <p className="text-gray-400">Đang tải...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead>
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                  Tên
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                  Vai trò
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                  Quyền truy cập
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                  Ngày tạo
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-gray-300">
                    #{user.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {user.fullName || "—"}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        user.role === "ADMIN"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-gray-700 text-gray-300"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {/* ✅ ADMIN thì hiện badge "Tất cả khóa học" */}
                    {user.role === "ADMIN" ? (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-500/20 text-yellow-400">
                        Tất cả khóa học
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {user.purchasedCategories &&
                        user.purchasedCategories.length > 0 ? (
                          user.purchasedCategories.map((categoryId) => {
                            const course = COURSES.find(
                              (c) => c.id === categoryId,
                            );
                            return (
                              <span
                                key={categoryId}
                                className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400"
                              >
                                {course?.label || categoryId}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-gray-600 text-xs">Chưa có</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => handleOpenEdit(user)}
                      className="text-yellow-400 hover:text-yellow-300 mr-3"
                    >
                      Sửa
                    </button>
                    {currentUser?.id !== user.id && (
                      <button
                        onClick={() => handleDeleteClick(user.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Xóa
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleOpenCreate}
          className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-all"
        >
          Thêm tài khoản mới
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-yellow-400 mb-4">
              {editUser ? "Sửa tài khoản" : "Thêm tài khoản mới"}
            </h3>

            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
              />
              <input
                type="text"
                placeholder="Họ tên"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={
                    editUser
                      ? "Mật khẩu mới (để trống nếu không đổi)"
                      : "Mật khẩu"
                  }
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    // Icon mắt gạch (ẩn)
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    // Icon mắt (hiện)
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              <div>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  disabled={editUser?.id === currentUser?.id}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
                {editUser?.id === currentUser?.id && (
                  <p className="text-yellow-400 text-xs mt-1">
                    ⚠️ Bạn không thể thay đổi role của chính mình
                  </p>
                )}
              </div>

              {/* ✅ Ẩn checkbox nếu role là ADMIN */}
              {formData.role !== "ADMIN" && (
                <div className="border border-gray-700 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-300 mb-3">
                    Khóa học đã mua
                  </p>
                  <div className="space-y-2">
                    {COURSES.map((course) => {
                      const checked = formData.purchasedCategories.includes(
                        course.id,
                      );
                      return (
                        <label
                          key={course.id}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleToggleCourse(course.id)}
                              className="sr-only"
                            />
                            <div
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                checked
                                  ? "bg-yellow-500 border-yellow-500"
                                  : "border-gray-600 group-hover:border-yellow-500/50"
                              }`}
                            >
                              {checked && (
                                <svg
                                  className="w-3 h-3 text-black"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={3}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </div>
                          </div>
                          <span
                            className={`text-sm transition-colors ${
                              checked
                                ? "text-white"
                                : "text-gray-400 group-hover:text-gray-200"
                            }`}
                          >
                            {course.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ✅ Hiện thông báo nếu role là ADMIN */}
              {formData.role === "ADMIN" && (
                <div className="border border-yellow-500/30 rounded-lg p-4 bg-yellow-500/5">
                  <p className="text-yellow-400 text-sm">
                    Admin có quyền truy cập tất cả khóa học
                  </p>
                </div>
              )}
            </div>

            {error && <p className="text-red-400 text-sm mt-3">{error}</p>}

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-all"
              >
                {editUser ? "Cập nhật" : "Tạo"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa tài khoản"
        description="Bạn có chắc muốn xóa tài khoản này không? Hành động này không thể hoàn tác."
      />
    </div>
  );
}
