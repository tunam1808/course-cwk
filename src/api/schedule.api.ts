import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

// Helper lấy token
const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

// ─── Types ──────────────────────────────────────────────────────────────
export type ScheduleSession = "SANG" | "CHIEU" | "TOI";
export type ScheduleType = "HOC" | "CHOI";
export type ScheduleAccessType = "TEAM_MEMBER" | "NORMAL";

// Thành viên tham gia 1 buổi — giờ liên kết tài khoản User thật (không còn
// là tên tự nhập) để có thể gửi push notification đúng người.
export interface ScheduleMemberDto {
  id: number;
  scheduleItemId: number;
  userId: number;
  user: {
    id: number;
    email: string;
    fullName: string | null;
  };
  createdAt: string;
}

export interface ScheduleItemDto {
  id: number;
  date: string; // "YYYY-MM-DD" (ISO datetime từ Prisma, lấy phần ngày khi dùng)
  session: ScheduleSession;
  type: ScheduleType;
  title: string;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  allTeam: boolean;
  members: ScheduleMemberDto[];
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleItemInput {
  date: string; // "YYYY-MM-DD"
  type: ScheduleType;
  title: string;
  startTime: string;
  endTime: string;
  allTeam: boolean;
  members: number[]; // userId của các tài khoản được chọn tham gia
}

export interface ScheduleAccessDto {
  id: number;
  userId: number;
  type: ScheduleAccessType;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    email: string;
    fullName: string | null;
  };
}

export interface UserSearchResultDto {
  id: number;
  email: string;
  fullName: string | null;
  role: "ADMIN" | "USER";
}

export interface PendingFeedbackItemDto {
  id: number;
  date: string;
  type: ScheduleType;
  title: string;
  startTime: string;
  endTime: string;
}

export interface ScheduleAttendanceDto {
  id: number;
  scheduleItemId: number;
  userId: number;
  present: boolean | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    email: string;
    fullName: string | null;
  };
}

export interface AttendanceParticipantInput {
  userId: number;
  present: boolean | null;
}

export interface ScheduleFeedbackInput {
  scheduleItemId: number;
  moodScore: number; // 1-10
  moodReason?: string;
  understandScore?: number; // 1-5, chỉ khi buổi học
  understandNote?: string;
  energyScore: number; // 1-10
  difficulty?: string;
  suggestion?: string;
}

export interface ScheduleFeedbackDto {
  id: number;
  scheduleItemId: number;
  userId: number;
  moodScore: number;
  moodReason: string | null;
  understandScore: number | null;
  understandNote: string | null;
  energyScore: number;
  difficulty: string | null;
  suggestion: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    email: string;
    fullName: string | null;
  };
  scheduleItem: {
    id: number;
    date: string;
    type: ScheduleType;
    title: string;
    startTime: string;
    endTime: string;
  };
}

// ─── API ────────────────────────────────────────────────────────────────
export const scheduleApi = {
  // Kiểm tra xem tài khoản đang đăng nhập có được phép xem lịch không (dùng cho Navbar)
  checkMyAccess(): Promise<{ hasAccess: boolean }> {
    return axios
      .get(`${BASE_URL}/schedule/my-access`, authHeader())
      .then((r) => r.data);
  },

  // Xem thời khóa biểu — cần đăng nhập, backend tự kiểm tra whitelist/role.
  // Truyền from/to (YYYY-MM-DD) để lọc theo tuần/khoảng ngày; bỏ trống thì lấy hết.
  getSchedule(range?: {
    from?: string;
    to?: string;
  }): Promise<ScheduleItemDto[]> {
    const params = new URLSearchParams();
    if (range?.from) params.set("from", range.from);
    if (range?.to) params.set("to", range.to);
    const query = params.toString() ? `?${params.toString()}` : "";

    return axios
      .get(`${BASE_URL}/schedule${query}`, authHeader())
      .then((r) => r.data);
  },

  createScheduleItem(
    data: ScheduleItemInput,
  ): Promise<{ success: boolean; item: ScheduleItemDto }> {
    return axios
      .post(`${BASE_URL}/schedule`, data, authHeader())
      .then((r) => r.data);
  },

  updateScheduleItem(
    id: number,
    data: ScheduleItemInput,
  ): Promise<{ success: boolean; item: ScheduleItemDto }> {
    return axios
      .put(`${BASE_URL}/schedule/${id}`, data, authHeader())
      .then((r) => r.data);
  },

  deleteScheduleItem(id: number): Promise<{ success: boolean }> {
    return axios
      .delete(`${BASE_URL}/schedule/${id}`, authHeader())
      .then((r) => r.data);
  },

  // ─── Điểm danh buổi học ────────────────────────────────────────────
  getAttendance(scheduleItemId: number): Promise<ScheduleAttendanceDto[]> {
    return axios
      .get(`${BASE_URL}/schedule/${scheduleItemId}/attendance`, authHeader())
      .then((r) => r.data);
  },

  // Lưu điểm danh. Nếu buổi đã qua ngày (đã "điểm danh hoàn tất"), backend sẽ
  // yêu cầu adminPassword đúng của tài khoản admin đang đăng nhập mới cho sửa.
  saveAttendance(
    scheduleItemId: number,
    participants: AttendanceParticipantInput[],
    adminPassword?: string,
  ): Promise<{ success: boolean; attendance: ScheduleAttendanceDto[] }> {
    return axios
      .put(
        `${BASE_URL}/schedule/${scheduleItemId}/attendance`,
        { participants, adminPassword },
        authHeader(),
      )
      .then((r) => r.data);
  },

  // ─── Quản lý whitelist email được xem lịch ───────────────────────────
  getScheduleAccessList(): Promise<ScheduleAccessDto[]> {
    return axios
      .get(`${BASE_URL}/schedule/access`, authHeader())
      .then((r) => r.data);
  },

  // Tìm kiếm tài khoản theo email/tên để chọn cấp quyền
  searchUsers(q: string): Promise<UserSearchResultDto[]> {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    return axios
      .get(
        `${BASE_URL}/schedule/access/search-users?${params.toString()}`,
        authHeader(),
      )
      .then((r) => r.data);
  },

  grantScheduleAccess(
    email: string,
    type: ScheduleAccessType = "NORMAL",
  ): Promise<{ success: boolean; access: ScheduleAccessDto }> {
    return axios
      .post(`${BASE_URL}/schedule/access`, { email, type }, authHeader())
      .then((r) => r.data);
  },

  revokeScheduleAccess(id: number): Promise<{ success: boolean }> {
    return axios
      .delete(`${BASE_URL}/schedule/access/${id}`, authHeader())
      .then((r) => r.data);
  },

  // ─── Đánh giá buổi học / buổi đi chơi ─────────────────────────────────
  getPendingFeedback(): Promise<PendingFeedbackItemDto[]> {
    return axios
      .get(`${BASE_URL}/schedule/feedback/pending`, authHeader())
      .then((r) => r.data);
  },

  // Danh sách id các buổi mà user hiện tại đã đánh giá (không giới hạn hôm nay)
  getMySubmittedFeedbackIds(): Promise<number[]> {
    return axios
      .get(`${BASE_URL}/schedule/feedback/mine`, authHeader())
      .then((r) => r.data);
  },

  submitFeedback(
    data: ScheduleFeedbackInput,
  ): Promise<{ success: boolean; feedback: ScheduleFeedbackDto }> {
    return axios
      .post(`${BASE_URL}/schedule/feedback`, data, authHeader())
      .then((r) => r.data);
  },

  // Admin xem toàn bộ đánh giá, có thể lọc theo khoảng ngày
  getFeedbackList(range?: {
    from?: string;
    to?: string;
  }): Promise<ScheduleFeedbackDto[]> {
    const params = new URLSearchParams();
    if (range?.from) params.set("from", range.from);
    if (range?.to) params.set("to", range.to);
    const query = params.toString() ? `?${params.toString()}` : "";
    return axios
      .get(`${BASE_URL}/schedule/feedback${query}`, authHeader())
      .then((r) => r.data);
  },

  // Xóa 1 đánh giá cụ thể (admin)
  deleteFeedback(id: number): Promise<{ success: boolean }> {
    return axios
      .delete(`${BASE_URL}/schedule/feedback/${id}`, authHeader())
      .then((r) => r.data);
  },

  // Xóa TẤT CẢ đánh giá (admin) — thao tác không thể hoàn tác
  deleteAllFeedback(): Promise<{ success: boolean; count: number }> {
    return axios
      .delete(`${BASE_URL}/schedule/feedback/all`, authHeader())
      .then((r) => r.data);
  },

  // ─── Push notification (PWA) ──────────────────────────────────────────
  subscribePush(subscription: {
    endpoint: string;
    keys: { p256dh: string; auth: string };
  }): Promise<{ success: boolean }> {
    return axios
      .post(`${BASE_URL}/push/subscribe`, subscription, authHeader())
      .then((r) => r.data);
  },

  unsubscribePush(endpoint: string): Promise<{ success: boolean }> {
    return axios
      .delete(`${BASE_URL}/push/subscribe`, {
        ...authHeader(),
        data: { endpoint },
      })
      .then((r) => r.data);
  },

  sendTestPush(): Promise<{ success: boolean }> {
    return axios
      .post(`${BASE_URL}/push/test`, {}, authHeader())
      .then((r) => r.data);
  },
};
