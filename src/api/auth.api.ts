import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email,
      password,
    });
    return response.data;
  },
};
