import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export type ScoreWarningLevel = "NONE" | "MILD" | "SEVERE";

export interface ScoreReasonDto {
  id: number;
  label: string;
  defaultPoints: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ScoreLogDto {
  id: number;
  reasonLabel: string;
  points: number;
  note: string | null;
  createdAt: string;
  createdByName: string;
}

export interface ScoreSummaryDto {
  netScore: number;
  totalPositive: number;
  totalNegative: number;
  warningLevel: ScoreWarningLevel;
}

export interface ScoreDetailDto extends ScoreSummaryDto {
  userId: number;
  email: string;
  fullName: string | null;
  logs: ScoreLogDto[];
}

export interface StudentScoreListItemDto extends ScoreSummaryDto {
  userId: number;
  email: string;
  fullName: string | null;
}

export interface ScorePeriodDto {
  totalPositive: number;
  totalNegative: number;
  netChange: number;
  logCount: number;
}

export interface ScorePeriodDetailDto {
  userId: number;
  email: string;
  fullName: string | null;
  totalPositive: number;
  totalNegative: number;
  netChange: number;
  logs: ScoreLogDto[];
}

export const scoreApi = {
  // ─── Học viên xem điểm của chính mình ───────────────────────────────
  getMyScore(): Promise<ScoreSummaryDto & { logs: ScoreLogDto[] }> {
    return axios.get(`${BASE_URL}/scores/me`, authHeader()).then((r) => r.data);
  },

  // Học viên tự xem điểm của MÌNH trong 1 khoảng ngày (biểu đồ tuần/tháng)
  getMyPeriod(from: string, to: string): Promise<ScorePeriodDto> {
    const params = new URLSearchParams({ from, to });
    return axios
      .get(`${BASE_URL}/scores/me/period?${params.toString()}`, authHeader())
      .then((r) => r.data);
  },

  // ─── Quản lý danh sách lý do (admin) ─────────────────────────────────
  getReasons(): Promise<ScoreReasonDto[]> {
    return axios
      .get(`${BASE_URL}/scores/reasons`, authHeader())
      .then((r) => r.data);
  },

  // defaultPoints: bỏ trống (undefined) nếu muốn admin luôn tự nhập điểm
  // mỗi lần áp dụng lý do này; truyền số nếu muốn có điểm gợi ý sẵn.
  createReason(
    label: string,
    defaultPoints?: number,
  ): Promise<{ success: boolean; reason: ScoreReasonDto }> {
    return axios
      .post(
        `${BASE_URL}/scores/reasons`,
        { label, defaultPoints: defaultPoints ?? null },
        authHeader(),
      )
      .then((r) => r.data);
  },

  // Sửa lý do đã có — chỉ gửi field nào cần đổi. Không ảnh hưởng các lượt
  // chấm điểm đã áp dụng trước đó (points của log cũ vẫn giữ nguyên).
  updateReason(
    id: number,
    data: { label?: string; defaultPoints?: number | null },
  ): Promise<{ success: boolean; reason: ScoreReasonDto }> {
    return axios
      .put(`${BASE_URL}/scores/reasons/${id}`, data, authHeader())
      .then((r) => r.data);
  },

  deleteReason(id: number): Promise<{ success: boolean }> {
    return axios
      .delete(`${BASE_URL}/scores/reasons/${id}`, authHeader())
      .then((r) => r.data);
  },

  // ─── Admin xem tổng quan + chi tiết điểm học viên ───────────────────
  getStudentList(): Promise<StudentScoreListItemDto[]> {
    return axios
      .get(`${BASE_URL}/scores/students`, authHeader())
      .then((r) => r.data);
  },

  getStudentDetail(userId: number): Promise<ScoreDetailDto> {
    return axios
      .get(`${BASE_URL}/scores/students/${userId}`, authHeader())
      .then((r) => r.data);
  },

  // Tổng điểm cộng/trừ trong 1 khoảng ngày tuỳ chọn (from/to dạng YYYY-MM-DD,
  // bao gồm cả 2 đầu mút) — dùng cho biểu đồ theo tuần/tháng.
  getStudentPeriod(
    userId: number,
    from: string,
    to: string,
  ): Promise<ScorePeriodDto> {
    const params = new URLSearchParams({ from, to });
    return axios
      .get(
        `${BASE_URL}/scores/students/${userId}/period?${params.toString()}`,
        authHeader(),
      )
      .then((r) => r.data);
  },

  // Đầy đủ danh sách log trong khoảng ngày (dùng để xuất báo cáo PDF/ảnh)
  getStudentPeriodDetail(
    userId: number,
    from: string,
    to: string,
  ): Promise<ScorePeriodDetailDto> {
    const params = new URLSearchParams({ from, to });
    return axios
      .get(
        `${BASE_URL}/scores/students/${userId}/period/logs?${params.toString()}`,
        authHeader(),
      )
      .then((r) => r.data);
  },

  // ─── Áp dụng / xóa điểm (admin) ───────────────────────────────────────
  applyScore(data: {
    userId: number;
    reasonId: number;
    points: number;
    note?: string;
  }): Promise<{ success: boolean; summary: ScoreSummaryDto }> {
    return axios
      .post(`${BASE_URL}/scores/apply`, data, authHeader())
      .then((r) => r.data);
  },

  deleteLog(
    id: number,
  ): Promise<{ success: boolean; summary: ScoreSummaryDto }> {
    return axios
      .delete(`${BASE_URL}/scores/log/${id}`, authHeader())
      .then((r) => r.data);
  },
};
