// src/api/resourceApi.ts
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");

const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });

// ── Types ────────────────────────────────────────────────────────────

export interface ResourceCategory {
  id: number;
  name: string;
  slug: string;
  isVip: boolean;
  order: number;
  thumbnailKey: string | null;
  thumbnailUrl: string | null;
  createdAt: string;
  updatedAt: string;
  subFolders: ResourceSubFolder[];
  _count?: { subFolders: number };
}

export interface ResourceSubFolder {
  id: number;
  name: string;
  slug: string;
  order: number;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
  _count?: { files: number };
}

export interface ResourceFile {
  id: number;
  name: string;
  description: string | null;
  subFolderId: number;
  fileName: string;
  fileKey: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  fileType: "MP3" | "MP4" | "FONT" | "OTHER";
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ════════════════════════════════════════════════════════════════════
// PUBLIC — FE hiển thị tài nguyên cho user
// ════════════════════════════════════════════════════════════════════
export const resourcePublicApi = {
  /** Lấy tất cả category kể cả VIP (public, không cần auth) */
  getAllCategories: async (): Promise<ResourceCategory[]> => {
    const res = await axios.get(`${BASE_URL}/resource-categories/all`, {
      headers: authHeader(),
    });
    return res.data.data;
  },

  /** Lấy toàn bộ cây folder cấp 1 + 2 (chỉ FREE) */
  getCategories: async (): Promise<ResourceCategory[]> => {
    const res = await axios.get(`${BASE_URL}/resource-categories`, {
      headers: authHeader(),
    });
    return res.data.data;
  },

  /** Lấy danh sách file theo subfolder */
  getFiles: async (
    subFolderId: number,
    page = 1,
    limit = 30,
  ): Promise<{ items: ResourceFile[]; pagination: Pagination }> => {
    const res = await axios.get(`${BASE_URL}/resource-files`, {
      headers: authHeader(),
      params: { subFolderId, page, limit },
    });
    return res.data.data;
  },

  /** Đếm lượt tải (gọi trước khi redirect download) */
  trackDownload: async (fileId: number): Promise<void> => {
    await axios.post(
      `${BASE_URL}/resource-files/${fileId}/download`,
      {},
      { headers: authHeader() },
    );
  },
};

// ════════════════════════════════════════════════════════════════════
// ADMIN — quản lý tài nguyên
// ════════════════════════════════════════════════════════════════════
export const resourceAdminApi = {
  // ── CẤP 1: Category ───────────────────────────────────────────────

  getCategories: async (): Promise<ResourceCategory[]> => {
    const res = await axios.get(`${BASE_URL}/admin/resource-categories`, {
      headers: authHeader(),
    });
    return res.data.data;
  },

  getCategory: async (id: number): Promise<ResourceCategory> => {
    const res = await axios.get(`${BASE_URL}/admin/resource-categories/${id}`, {
      headers: authHeader(),
    });
    return res.data.data;
  },

  createCategory: async (
    name: string,
    isVip?: boolean,
  ): Promise<ResourceCategory> => {
    const res = await axios.post(
      `${BASE_URL}/admin/resource-categories`,
      { name, isVip },
      { headers: authHeader() },
    );
    return res.data.data;
  },

  updateCategory: async (
    id: number,
    data: { name?: string; isVip?: boolean },
  ): Promise<ResourceCategory> => {
    const res = await axios.patch(
      `${BASE_URL}/admin/resource-categories/${id}`,
      data,
      { headers: authHeader() },
    );
    return res.data.data;
  },

  /** Upload / thay ảnh đại diện folder cấp 1 */
  updateThumbnail: async (
    id: number,
    file: File,
  ): Promise<ResourceCategory> => {
    const form = new FormData();
    form.append("thumbnail", file);
    const res = await axios.patch(
      `${BASE_URL}/admin/resource-categories/${id}/thumbnail`,
      form,
      { headers: { ...authHeader(), "Content-Type": "multipart/form-data" } },
    );
    return res.data.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await axios.delete(`${BASE_URL}/admin/resource-categories/${id}`, {
      headers: authHeader(),
    });
  },

  // ── CẤP 2: SubFolder ──────────────────────────────────────────────

  getSubFolders: async (categoryId: number): Promise<ResourceSubFolder[]> => {
    const res = await axios.get(`${BASE_URL}/admin/resource-subfolders`, {
      headers: authHeader(),
      params: { categoryId },
    });
    return res.data.data;
  },

  createSubFolder: async (
    name: string,
    categoryId: number,
  ): Promise<ResourceSubFolder> => {
    const res = await axios.post(
      `${BASE_URL}/admin/resource-subfolders`,
      { name, categoryId },
      { headers: authHeader() },
    );
    return res.data.data;
  },

  updateSubFolder: async (
    id: number,
    data: { name?: string; order?: number },
  ): Promise<ResourceSubFolder> => {
    const res = await axios.patch(
      `${BASE_URL}/admin/resource-subfolders/${id}`,
      data,
      { headers: authHeader() },
    );
    return res.data.data;
  },

  deleteSubFolder: async (id: number): Promise<void> => {
    await axios.delete(`${BASE_URL}/admin/resource-subfolders/${id}`, {
      headers: authHeader(),
    });
  },

  // ── CẤP 3: File ───────────────────────────────────────────────────

  getFiles: async (
    subFolderId: number,
    page = 1,
    limit = 30,
  ): Promise<{ items: ResourceFile[]; pagination: Pagination }> => {
    const res = await axios.get(`${BASE_URL}/admin/resource-files`, {
      headers: authHeader(),
      params: { subFolderId, page, limit },
    });
    return res.data.data;
  },

  /** Upload file tài nguyên (mp3/mp4/font) */
  uploadFile: async (
    subFolderId: number,
    name: string,
    file: File,
    description?: string,
    onProgress?: (percent: number) => void,
  ): Promise<ResourceFile> => {
    const form = new FormData();
    form.append("file", file);
    form.append("name", name);
    form.append("subFolderId", String(subFolderId));
    if (description) form.append("description", description);

    const res = await axios.post(`${BASE_URL}/admin/resource-files`, form, {
      headers: { ...authHeader(), "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
      },
    });
    return res.data.data;
  },

  updateFile: async (
    id: number,
    data: { name?: string; description?: string },
  ): Promise<ResourceFile> => {
    const res = await axios.patch(
      `${BASE_URL}/admin/resource-files/${id}`,
      data,
      { headers: authHeader() },
    );
    return res.data.data;
  },

  deleteFile: async (id: number): Promise<void> => {
    await axios.delete(`${BASE_URL}/admin/resource-files/${id}`, {
      headers: authHeader(),
    });
  },
};
