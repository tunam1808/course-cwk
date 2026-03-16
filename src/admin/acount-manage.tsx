// src/pages/admin/AccountManagement.tsx
import { useEffect, useState } from "react";
import { userApi } from "@/api/user.api";
import { useAuth } from "@/contexts/auth.context";
import { showSuccess, showError } from "@/common/toast";
import ConfirmDialog from "@/common/ConfirmDialog";

interface User {
  id: number;
  email: string;
  fullName: string | null;
  role: string;
  createdAt: string;
}

interface FormData {
  email: string;
  fullName: string;
  password: string;
  role: string;
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
  });
  const [error, setError] = useState("");

  // 👇 State cho confirm dialog
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

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
    setFormData({ email: "", fullName: "", password: "", role: "USER" });
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
    });
    setError("");
    setShowModal(true);
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
        );
        showSuccess("Tạo tài khoản thành công!");
      }
      setShowModal(false);
      fetchUsers();
    } catch (err: any) {
      const message = err.response?.data?.message || "Có lỗi xảy ra";
      setError(message);
      showError(message);
    }
  };

  // 👇 Mở confirm dialog thay vì confirm() thô
  const handleDeleteClick = (id: number) => {
    if (currentUser?.id === id) {
      showError("Bạn không thể xóa chính mình!");
      return;
    }
    setDeleteId(id);
    setShowConfirm(true);
  };

  // 👇 Thực hiện xóa sau khi confirm
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

      {/* Modal thêm / sửa */}
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
              <input
                type="password"
                placeholder={
                  editUser
                    ? "Mật khẩu mới (để trống nếu không đổi)"
                    : "Mật khẩu"
                }
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
              />
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

      {/* 👇 Confirm dialog xóa */}
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
