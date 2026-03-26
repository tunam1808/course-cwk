import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");

export const userApi = {
  createUser: async (
    email: string,
    password: string,
    fullName: string,
    purchasedCategories: string[] = [],
  ) => {
    const response = await axios.post(
      `${BASE_URL}/users`,
      { email, password, fullName, purchasedCategories },
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      },
    );
    return response.data;
  },

  getUsers: async () => {
    const response = await axios.get(`${BASE_URL}/users`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return response.data;
  },

  updateUser: async (
    id: number,
    data: {
      email?: string;
      fullName?: string;
      password?: string;
      role?: string;
      purchasedCategories?: string[];
    },
  ) => {
    const response = await axios.put(`${BASE_URL}/users/${id}`, data, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return response.data;
  },

  deleteUser: async (id: number) => {
    const response = await axios.delete(`${BASE_URL}/users/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return response.data;
  },
};
