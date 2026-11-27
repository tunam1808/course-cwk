// api/feedback.api.ts
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";
const API = `${BASE_URL}/new-page/feedback`;

// Helper lấy token
const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export interface FeedbackImage {
  id: number;
  imageKey: string;
  imageUrl: string;
  createdAt: string;
}

export const feedbackApi = {
  getAll(): Promise<FeedbackImage[]> {
    return axios.get(API).then((r) => r.data);
  },

  upload(file: File): Promise<FeedbackImage> {
    const form = new FormData();
    form.append("image", file); // tên field phải khớp multer ở backend
    return axios.post(API, form, authHeader()).then((r) => r.data);
  },

  remove(id: number): Promise<{ message: string }> {
    return axios.delete(`${API}/${id}`, authHeader()).then((r) => r.data);
  },
};
