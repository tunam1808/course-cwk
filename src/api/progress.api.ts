import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");

const authHeader = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

export const progressApi = {
  // Lấy danh sách courseId đã hoàn thành
  getProgress: async (): Promise<number[]> => {
    const response = await axios.get(`${BASE_URL}/progress`, authHeader());
    return response.data;
  },

  // Đánh dấu hoàn thành
  markComplete: async (courseId: number): Promise<void> => {
    await axios.post(`${BASE_URL}/progress/${courseId}`, {}, authHeader());
  },

  // Bỏ đánh dấu hoàn thành
  markIncomplete: async (courseId: number): Promise<void> => {
    await axios.delete(`${BASE_URL}/progress/${courseId}`, authHeader());
  },
};
