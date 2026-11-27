// api/new-page.api.ts
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";
const API = `${BASE_URL}/new-page`;

// Helper lấy token
const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

// ─── Types ──────────────────────────────────────────────────────────
export interface NewPageVideo {
  id: number;
  videoId: string;
  title: string;
  fileSize: number | null;
  introKey: number | null;
  industryId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Industry {
  id: number;
  name: string;
  videos: NewPageVideo[];
  createdAt: string;
  updatedAt: string;
}

export interface VideoPayload {
  videoId: string;
  title: string;
  fileSize?: number;
}

export const newPageApi = {
  // ─── Upload (dùng chung cho intro và video mẫu) ───────────────────
  prepareUpload(title: string): Promise<{ videoId: string }> {
    return axios
      .post(`${API}/prepare`, { title }, authHeader())
      .then((r) => r.data);
  },

  signUpload(videoId: string): Promise<{ signature: string; expire: number }> {
    return axios
      .post(`${API}/sign`, { videoId }, authHeader())
      .then((r) => r.data);
  },

  // ─── Video intro ──────────────────────────────────────────────────
  getIntro(): Promise<NewPageVideo | null> {
    return axios.get(`${API}/intro`).then((r) => r.data);
  },

  saveIntro(
    payload: VideoPayload,
  ): Promise<{ message: string; intro: NewPageVideo }> {
    return axios
      .post(`${API}/intro`, payload, authHeader())
      .then((r) => r.data);
  },

  deleteIntro(): Promise<{ message: string }> {
    return axios.delete(`${API}/intro`, authHeader()).then((r) => r.data);
  },

  // ─── Ngành nghề ───────────────────────────────────────────────────
  getIndustries(): Promise<Industry[]> {
    return axios.get(`${API}/industries`).then((r) => r.data);
  },

  createIndustry(name: string): Promise<Industry> {
    return axios
      .post(`${API}/industries`, { name }, authHeader())
      .then((r) => r.data);
  },

  updateIndustry(id: number, name: string): Promise<Industry> {
    return axios
      .put(`${API}/industries/${id}`, { name }, authHeader())
      .then((r) => r.data);
  },

  deleteIndustry(id: number): Promise<{ message: string }> {
    return axios
      .delete(`${API}/industries/${id}`, authHeader())
      .then((r) => r.data);
  },

  // ─── Video mẫu ────────────────────────────────────────────────────
  saveSampleVideo(
    industryId: number,
    payload: VideoPayload,
  ): Promise<NewPageVideo> {
    return axios
      .post(`${API}/industries/${industryId}/videos`, payload, authHeader())
      .then((r) => r.data);
  },

  /** id là id trong database, không phải videoId của Bunny */
  deleteSampleVideo(id: number): Promise<{ message: string }> {
    return axios
      .delete(`${API}/videos/${id}`, authHeader())
      .then((r) => r.data);
  },
};
