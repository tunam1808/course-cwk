import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");

export const videoApi = {
  getSignedUrl: async (videoId: string): Promise<string> => {
    const response = await axios.get(
      `${BASE_URL}/videos/${videoId}/signed-url`,
      {
        headers: { Authorization: `Bearer ${getToken()}` },
      },
    );
    return response.data.url;
  },

  getDownloadUrl: async (videoId: string): Promise<string> => {
    const response = await axios.get(
      `${BASE_URL}/videos/${videoId}/download-url`,
      {
        headers: { Authorization: `Bearer ${getToken()}` },
      },
    );
    return response.data.url;
  },

  downloadVideo: async (videoId: string): Promise<void> => {
    const response = await axios.get(`${BASE_URL}/videos/${videoId}/download`, {
      headers: { Authorization: `Bearer ${getToken()}` },
      responseType: "blob", // 👈 quan trọng
    });

    // Lấy tên file từ header
    const disposition = response.headers["content-disposition"];
    const fileName = disposition
      ? decodeURIComponent(disposition.split('filename="')[1].replace('"', ""))
      : "video.mp4";

    const url = URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};
