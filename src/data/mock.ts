// Dữ liệu mẫu cho Giai đoạn 1 (chưa nối Supabase): hiện khung như bản mẫu.
export const ZALO_PHONE = "0335529408";
export const ZALO_URL = "https://zalo.me/0335529408";

export type Nganh = { id: string; name: string };

export const NGANH: Nganh[] = [
  { id: "fnb", name: "F&B" },
  { id: "spa", name: "Spa · Làm đẹp" },
  { id: "thoitrang", name: "Thời trang" },
  { id: "bds", name: "Bất động sản" },
  { id: "chuyengia", name: "Chuyên gia" },
];

// Số khung video mẫu mỗi ngành
export const SO_VIDEO_MAU = 4;

export const FEEDBACK_MAU = ["Tin nhắn thật, đã xin phép", "Che tên nếu khách muốn", "Thêm sau"];
