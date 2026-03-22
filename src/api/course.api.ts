import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");

const authHeader = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

export const courseApi = {
  getCourses: async () => {
    const response = await axios.get(`${BASE_URL}/courses`);
    return response.data;
  },

  reorderCourses: async (orders: { id: number; order: number }[]) => {
    const response = await axios.put(
      `${BASE_URL}/courses/reorder`,
      { orders },
      authHeader(),
    );
    return response.data;
  },

  prepareUpload: async (title: string) => {
    const response = await axios.post(
      `${BASE_URL}/courses/prepare-upload`,
      { title },
      authHeader(),
    );
    return response.data;
  },

  signUpload: async (videoId: string) => {
    const response = await axios.post(
      `${BASE_URL}/courses/sign-upload`,
      { videoId },
      authHeader(),
    );
    return response.data;
  },

  saveCourse: async (data: {
    title: string;
    category: string;
    duration: number;
    fileSize: number;
    videoId: string;
  }) => {
    const response = await axios.post(
      `${BASE_URL}/courses/save`,
      data,
      authHeader(),
    );
    return response.data;
  },

  saveUpdateCourse: async (
    id: number,
    data: {
      title: string;
      category: string;
      duration: number;
      fileSize: number;
      videoId?: string;
    },
  ) => {
    const response = await axios.put(
      `${BASE_URL}/courses/${id}`,
      data,
      authHeader(),
    );
    return response.data;
  },

  createCourse: async (
    data: {
      title: string;
      category: string;
      duration: number;
      fileSize: number;
      video?: File;
    },
    onProgress?: (percent: number) => void,
    signal?: AbortSignal,
  ) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("category", data.category);
    formData.append("duration", String(data.duration));
    formData.append("fileSize", String(data.fileSize));
    if (data.video) {
      formData.append("video", data.video);
    }

    const response = await axios.post(`${BASE_URL}/courses`, formData, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "multipart/form-data",
      },
      signal,
      onUploadProgress: (e) => {
        if (e.total) {
          const percent = Math.round((e.loaded * 100) / e.total);
          onProgress?.(percent);
        }
      },
    });
    return response.data;
  },

  updateCourse: async (
    id: number,
    data: {
      title?: string;
      category?: string;
      duration?: number;
      fileSize?: number;
      video?: File;
    },
    onProgress?: (percent: number) => void,
    signal?: AbortSignal,
  ) => {
    const formData = new FormData();
    if (data.title) formData.append("title", data.title);
    if (data.category) formData.append("category", data.category);
    if (data.duration) formData.append("duration", String(data.duration));
    if (data.fileSize) formData.append("fileSize", String(data.fileSize));
    if (data.video) formData.append("video", data.video);

    const response = await axios.put(`${BASE_URL}/courses/${id}`, formData, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "multipart/form-data",
      },
      signal,
      onUploadProgress: (e) => {
        if (e.total) {
          const percent = Math.round((e.loaded * 100) / e.total);
          onProgress?.(percent);
        }
      },
    });
    return response.data;
  },

  deleteCourse: async (id: number) => {
    const response = await axios.delete(
      `${BASE_URL}/courses/${id}`,
      authHeader(),
    );
    return response.data;
  },
};
