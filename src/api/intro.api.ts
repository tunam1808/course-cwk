import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

// Helper lấy token
const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const introApi = {
  getIntro() {
    return axios.get(`${BASE_URL}/intro`).then((r) => r.data);
  },

  prepareUpload(): Promise<{ videoId: string }> {
    return axios
      .post(`${BASE_URL}/intro/prepare`, {}, authHeader())
      .then((r) => r.data);
  },

  signUpload(videoId: string): Promise<{ signature: string; expire: number }> {
    return axios
      .post(`${BASE_URL}/intro/sign`, { videoId }, authHeader())
      .then((r) => r.data);
  },

  saveIntro(videoId: string, slot: 1 | 2 | 3 | 4 | 5 | 6) {
    return axios
      .post(`${BASE_URL}/intro/save`, { videoId, slot }, authHeader())
      .then((r) => r.data);
  },

  deleteIntro(slot: 1 | 2 | 3 | 4 | 5 | 6) {
    return axios
      .delete(`${BASE_URL}/intro/${slot}`, authHeader())
      .then((r) => r.data);
  },
};
