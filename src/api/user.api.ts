import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

// Lấy token từ storage
const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");

export const userApi = {
  // Tạo user mới (Admin only)
  createUser: async (email: string, password: string, fullName: string) => {
    const response = await axios.post(
      `${BASE_URL}/users`,
      { email, password, fullName },
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      },
    );
    return response.data;
  },

  // Lấy danh sách users (Admin only)
  getUsers: async () => {
    const response = await axios.get(`${BASE_URL}/users`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return response.data;
  },

  // Cập nhật user
  updateUser: async (
    id: number,
    data: {
      email?: string;
      fullName?: string;
      password?: string;
      role?: string;
    },
  ) => {
    const response = await axios.put(`${BASE_URL}/users/${id}`, data, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return response.data;
  },

  // Xóa user
  deleteUser: async (id: number) => {
    const response = await axios.delete(`${BASE_URL}/users/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return response.data;
  },
};
