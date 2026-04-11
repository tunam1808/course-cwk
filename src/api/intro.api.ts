// api/intro.api.ts
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

export const introApi = {
  /**
   * Lấy tất cả intro (trả về mảng 3 slot)
   */
  getIntro() {
    return axios.get(`${BASE_URL}/intro`).then((r) => r.data);
  },

  /**
   * Chuẩn bị upload video (tạo video slot trên Bunny)
   */
  prepareUpload(): Promise<{ videoId: string }> {
    return axios.post(`${BASE_URL}/intro/prepare`).then((r) => r.data);
  },

  /**
   * Lấy signature để upload video bằng TUS lên Bunny
   */
  signUpload(videoId: string): Promise<{ signature: string; expire: number }> {
    return axios
      .post(`${BASE_URL}/intro/sign`, { videoId })
      .then((r) => r.data);
  },

  /**
   * Lưu thông tin videoId vào database theo slot
   * @param videoId - ID video từ Bunny
   * @param slot - Slot cần lưu (1, 2 hoặc 3)
   */
  saveIntro(videoId: string, slot: 1 | 2 | 3) {
    return axios
      .post(`${BASE_URL}/intro/save`, {
        videoId,
        slot,
      })
      .then((r) => r.data);
  },

  /**
   * Xóa intro theo slot (1 | 2 | 3)
   */
  deleteIntro(slot: 1 | 2 | 3) {
    return axios.delete(`${BASE_URL}/intro/${slot}`).then((r) => r.data);
  },
};
