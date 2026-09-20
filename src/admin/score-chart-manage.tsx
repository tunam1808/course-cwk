import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  X,
  Search,
  AlertTriangle,
  AlertCircle,
  Clock,
  ChevronRight,
  ChevronLeft,
  Check,
  BarChart3,
  Download,
  Image as ImageIcon,
} from "lucide-react";
import {
  scoreApi,
  type ScoreReasonDto,
  type StudentScoreListItemDto,
  type ScoreDetailDto,
  type ScorePeriodDto,
  type ScorePeriodDetailDto,
} from "@/api/score.api";
import { showSuccess, showError } from "@/common/toast";
import ScoreDonutChart from "@/components/score-donut-chart";
import { isAxiosError } from "axios";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

const getErrorMessage = (err: unknown, fallback: string): string => {
  if (isAxiosError<{ message?: string }>(err)) {
    return err.response?.data?.message ?? fallback;
  }
  return fallback;
};

const formatDateTime = (iso: string): string => {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const displayName = (u: { email: string; fullName: string | null }): string =>
  u.fullName || u.email;

// ─── Hàng hiển thị + sửa 1 lý do (label + defaultPoints) ─────────────────
function ReasonRow({
  reason,
  onUpdated,
  onDeleted,
}: {
  reason: ScoreReasonDto;
  onUpdated: () => void;
  onDeleted: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(reason.label);
  const [defaultPoints, setDefaultPoints] = useState(
    reason.defaultPoints !== null ? String(reason.defaultPoints) : "",
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async (): Promise<void> => {
    if (!label.trim()) {
      showError("Vui lòng nhập nội dung lý do");
      return;
    }
    const dp = defaultPoints.trim() === "" ? null : Number(defaultPoints);
    if (dp !== null && (!Number.isInteger(dp) || dp === 0)) {
      showError("Điểm mặc định phải là số nguyên khác 0, hoặc để trống");
      return;
    }
    setSaving(true);
    try {
      await scoreApi.updateReason(reason.id, {
        label: label.trim(),
        defaultPoints: dp,
      });
      showSuccess("Đã lưu thay đổi!");
      setEditing(false);
      onUpdated();
    } catch (err: unknown) {
      showError(getErrorMessage(err, "Có lỗi xảy ra"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    try {
      await scoreApi.deleteReason(reason.id);
      showSuccess("Đã xóa lý do");
      onDeleted();
    } catch (err: unknown) {
      showError(getErrorMessage(err, "Không thể xóa"));
    }
  };

  if (editing) {
    return (
      <div className="flex items-center gap-2 bg-gray-800 border border-yellow-400/40 rounded-lg px-3 py-2">
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="flex-1 bg-gray-900 border border-gray-700 rounded-md px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-yellow-400 min-w-0"
        />
        <input
          type="number"
          value={defaultPoints}
          onChange={(e) => setDefaultPoints(e.target.value)}
          placeholder="Điểm mặc định"
          className="w-28 bg-gray-900 border border-gray-700 rounded-md px-2.5 py-1.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="p-1.5 text-green-400 hover:bg-green-500/10 rounded-md transition-colors disabled:opacity-40"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setEditing(false);
            setLabel(reason.label);
            setDefaultPoints(
              reason.defaultPoints !== null ? String(reason.defaultPoints) : "",
            );
          }}
          disabled={saving}
          className="p-1.5 text-gray-500 hover:bg-gray-700 rounded-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 text-gray-200 text-sm pl-3 pr-1.5 py-1.5 rounded-lg">
      <span className="flex-1">{reason.label}</span>
      {reason.defaultPoints !== null && (
        <span
          className={`text-xs font-bold px-1.5 py-0.5 rounded ${
            reason.defaultPoints > 0
              ? "bg-green-500/15 text-green-400"
              : "bg-red-500/15 text-red-400"
          }`}
        >
          {reason.defaultPoints > 0 ? "+" : ""}
          {reason.defaultPoints}
        </span>
      )}
      <button
        onClick={() => setEditing(true)}
        className="text-gray-500 hover:text-yellow-400 transition-colors p-1"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={handleDelete}
        className="text-gray-500 hover:text-red-400 transition-colors p-1"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Modal áp dụng điểm cho 1 học viên ────────────────────────────────────
function ApplyScoreModal({
  student,
  reasons,
  onClose,
  onApplied,
}: {
  student: StudentScoreListItemDto;
  reasons: ScoreReasonDto[];
  onClose: () => void;
  onApplied: () => void;
}) {
  const [reasonId, setReasonId] = useState<string>("");
  const [points, setPoints] = useState<string>("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const handleReasonChange = (value: string): void => {
    setReasonId(value);
    const r = reasons.find((x) => String(x.id) === value);
    if (r?.defaultPoints !== null && r?.defaultPoints !== undefined) {
      setPoints(String(r.defaultPoints));
    }
  };

  const handleSubmit = async (): Promise<void> => {
    const p = Number(points);
    if (!reasonId) {
      showError("Vui lòng chọn lý do");
      return;
    }
    if (!Number.isInteger(p) || p === 0) {
      showError("Điểm phải là số nguyên khác 0");
      return;
    }
    setSaving(true);
    try {
      await scoreApi.applyScore({
        userId: student.userId,
        reasonId: Number(reasonId),
        points: p,
        note: note.trim() || undefined,
      });
      showSuccess(`Đã ${p > 0 ? "cộng" : "trừ"} ${Math.abs(p)} điểm!`);
      onApplied();
    } catch (err: unknown) {
      showError(getErrorMessage(err, "Có lỗi xảy ra"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-yellow-400">
            Chấm điểm: {displayName(student)}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Lý do
            </label>
            <select
              value={reasonId}
              onChange={(e) => handleReasonChange(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400 transition-colors"
            >
              <option value="">— Chọn lý do —</option>
              {reasons.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                  {r.defaultPoints !== null
                    ? ` (${r.defaultPoints > 0 ? "+" : ""}${r.defaultPoints})`
                    : ""}
                </option>
              ))}
            </select>
            {reasons.length === 0 && (
              <p className="text-[11px] text-gray-500 mt-1.5">
                Chưa có lý do nào — thêm ở danh sách bên dưới trước.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Điểm (dương để cộng, âm để trừ)
            </label>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              placeholder="VD: 10 hoặc -5"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400 transition-colors"
            />
            <p className="text-[11px] text-gray-500 mt-1.5">
              Tự điền theo điểm mặc định của lý do (nếu có) — bạn vẫn có thể sửa
              lại trước khi xác nhận.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Ghi chú (tuỳ chọn)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Chi tiết thêm nếu cần"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400 transition-colors"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-all disabled:opacity-40"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !reasonId || !points}
            className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 text-black font-bold rounded-lg transition-all"
          >
            {saving ? "Đang lưu..." : "Xác nhận"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal xem chi tiết + lịch sử điểm 1 học viên ─────────────────────────
function StudentDetailModal({
  userId,
  onClose,
  onChanged,
}: {
  userId: number;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [detail, setDetail] = useState<ScoreDetailDto | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async (): Promise<void> => {
    setLoading(true);
    try {
      const data = await scoreApi.getStudentDetail(userId);
      setDetail(data);
    } catch {
      showError("Không thể tải chi tiết điểm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleDeleteLog = async (logId: number): Promise<void> => {
    try {
      await scoreApi.deleteLog(logId);
      showSuccess("Đã xóa lượt chấm điểm");
      load();
      onChanged();
    } catch (err: unknown) {
      showError(getErrorMessage(err, "Không thể xóa"));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-yellow-400">
            {detail ? displayName(detail) : "Đang tải..."}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-10 text-center text-gray-500 text-sm">
            Đang tải...
          </div>
        ) : detail ? (
          <>
            {detail.warningLevel === "SEVERE" && (
              <div className="flex items-center gap-2 mb-4 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <p className="text-xs text-red-300">
                  Thái độ đang ở ngưỡng cảnh báo (điểm: {detail.netScore})
                </p>
              </div>
            )}
            {detail.warningLevel === "MILD" && (
              <div className="flex items-center gap-2 mb-4 px-3 py-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
                <p className="text-xs text-yellow-300">
                  Điểm đang thấp (điểm: {detail.netScore})
                </p>
              </div>
            )}

            <div className="flex justify-center mb-5">
              <ScoreDonutChart
                totalPositive={detail.totalPositive}
                totalNegative={detail.totalNegative}
                netScore={detail.netScore}
                size={150}
              />
            </div>

            <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              Lịch sử chấm điểm
            </h4>
            {detail.logs.length === 0 ? (
              <p className="text-sm text-gray-600 text-center py-6">
                Chưa có lượt chấm điểm nào.
              </p>
            ) : (
              <div className="space-y-2">
                {detail.logs.map((log) => (
                  <div
                    key={log.id}
                    className={`rounded-lg border px-3.5 py-2.5 ${
                      log.points > 0
                        ? "bg-green-500/5 border-green-500/20"
                        : "bg-red-500/5 border-red-500/20"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm text-white font-medium">
                        {log.reasonLabel}
                      </p>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-sm font-bold ${
                            log.points > 0 ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {log.points > 0 ? "+" : ""}
                          {log.points}
                        </span>
                        <button
                          onClick={() => handleDeleteLog(log.id)}
                          className="text-gray-600 hover:text-red-400 transition-colors"
                          title="Xóa lượt này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {log.note && (
                      <p className="text-xs text-gray-500 mt-1">{log.note}</p>
                    )}
                    <div className="flex items-center gap-1 mt-1.5 text-[11px] text-gray-600">
                      <Clock className="w-3 h-3" />
                      {formatDateTime(log.createdAt)} · {log.createdByName}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}

// ─── Tiện ích ngày tháng cho biểu đồ tuần/tháng ──────────────────────────
const startOfDay = (d: Date): Date => {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
};

const getMonday = (d: Date): Date => {
  const date = startOfDay(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date;
};

const addDays = (d: Date, days: number): Date => {
  const r = new Date(d);
  r.setDate(r.getDate() + days);
  return r;
};

const toDateInputValue = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const formatShortDate = (d: Date): string =>
  `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

interface WeekRange {
  label: string;
  from: string;
  to: string;
}

// Danh sách các tuần (Thứ 2 → Chủ nhật) có giao với tháng được chọn. Mỗi
// tuần lấy trọn vẹn Thứ 2 → Chủ nhật kể cả khi lấn sang tháng trước/sau, để
// khớp đúng cách chia tuần đang dùng ở trang thời khóa biểu.
function getWeeksInMonth(year: number, month1to12: number): WeekRange[] {
  const firstDay = new Date(year, month1to12 - 1, 1);
  const lastDay = new Date(year, month1to12, 0);
  const weeks: WeekRange[] = [];
  let cursor = getMonday(firstDay);
  while (cursor.getTime() <= lastDay.getTime()) {
    const end = addDays(cursor, 6);
    weeks.push({
      label: `${formatShortDate(cursor)} - ${formatShortDate(end)}`,
      from: toDateInputValue(cursor),
      to: toDateInputValue(end),
    });
    cursor = addDays(cursor, 7);
  }
  return weeks;
}

// Biểu đồ nhỏ hiển thị điểm cộng/trừ trong 1 khoảng ngày cụ thể — tách riêng
// khỏi ScoreDonutChart (vốn dùng netScore tính từ mốc 100) vì ở đây chỉ quan
// tâm phần TĂNG/GIẢM trong khoảng đó, không cộng dồn với điểm nền 100.
function PeriodChart({
  title,
  data,
  loading,
  size = 130,
}: {
  title: string;
  data: ScorePeriodDto | null;
  loading: boolean;
  size?: number;
}) {
  return (
    <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-4 flex flex-col items-center gap-2">
      <p className="text-xs font-medium text-gray-300 text-center">{title}</p>
      {loading ? (
        <div
          className="flex items-center justify-center text-gray-600 text-xs"
          style={{ width: size, height: size }}
        >
          Đang tải...
        </div>
      ) : data ? (
        <>
          <ScoreDonutChart
            totalPositive={data.totalPositive}
            totalNegative={data.totalNegative}
            netScore={data.netChange}
            size={size}
          />
          <p className="text-[11px] text-gray-500">
            {data.logCount} lượt chấm điểm
          </p>
        </>
      ) : (
        <p
          className="flex items-center justify-center text-gray-600 text-xs text-center"
          style={{ width: size, height: size }}
        >
          Không có dữ liệu
        </p>
      )}
    </div>
  );
}

// ─── Khối báo cáo dùng để chụp ảnh / xuất PDF ─────────────────────────────
// QUAN TRỌNG: dựng bằng DOM API thuần (document.createElement), KHÔNG dùng
// React để render — vì nếu render trong cây React, mỗi lần re-render (do
// setExporting/setExportDetail hay bất kỳ state nào khác thay đổi) có thể
// làm html2canvas mất tham chiếu tới đúng node giữa lúc đang xử lý bất đồng
// bộ, gây lỗi "Unable to find element in cloned iframe". Dùng textContent
// (không phải innerHTML) để an toàn với dữ liệu người dùng nhập (ghi chú...).
function buildScoreReportElement(
  studentName: string,
  studentEmail: string,
  periodLabel: string,
  detail: ScorePeriodDetailDto,
): HTMLElement {
  const wrap = document.createElement("div");
  Object.assign(wrap.style, {
    width: "800px",
    background: "#ffffff",
    color: "#111827",
    padding: "32px",
    fontFamily: "Arial, sans-serif",
  });

  const h1 = document.createElement("h1");
  h1.textContent = "Báo cáo điểm đánh giá";
  Object.assign(h1.style, {
    fontSize: "20px",
    fontWeight: "700",
    margin: "0 0 4px",
  });
  wrap.appendChild(h1);

  const pPeriod = document.createElement("p");
  pPeriod.textContent = periodLabel;
  Object.assign(pPeriod.style, {
    fontSize: "13px",
    color: "#4b5563",
    margin: "0 0 16px",
  });
  wrap.appendChild(pPeriod);

  const infoRow = document.createElement("div");
  Object.assign(infoRow.style, {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
    fontSize: "13px",
  });

  const left = document.createElement("div");
  const nameEl = document.createElement("p");
  nameEl.textContent = studentName;
  Object.assign(nameEl.style, { fontWeight: "600", margin: "0" });
  const emailEl = document.createElement("p");
  emailEl.textContent = studentEmail;
  Object.assign(emailEl.style, { color: "#4b5563", margin: "0" });
  left.appendChild(nameEl);
  left.appendChild(emailEl);

  const right = document.createElement("div");
  Object.assign(right.style, { textAlign: "right" });

  const mkStatLine = (
    label: string,
    value: string,
    color: string,
  ): HTMLElement => {
    const p = document.createElement("p");
    p.style.margin = "0";
    p.appendChild(document.createTextNode(`${label}: `));
    const b = document.createElement("b");
    b.style.color = color;
    b.textContent = value;
    p.appendChild(b);
    return p;
  };
  right.appendChild(
    mkStatLine("Điểm cộng", `+${detail.totalPositive}`, "#16a34a"),
  );
  right.appendChild(
    mkStatLine("Điểm trừ", `-${detail.totalNegative}`, "#dc2626"),
  );
  right.appendChild(
    mkStatLine(
      "Chênh lệch",
      `${detail.netChange > 0 ? "+" : ""}${detail.netChange}`,
      "#111827",
    ),
  );

  infoRow.appendChild(left);
  infoRow.appendChild(right);
  wrap.appendChild(infoRow);

  const table = document.createElement("table");
  Object.assign(table.style, {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "12px",
  });

  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  headRow.style.background = "#f3f4f6";
  ["#", "Ngày", "Lý do", "Điểm", "Ghi chú", "Người chấm"].forEach((h) => {
    const th = document.createElement("th");
    th.textContent = h;
    Object.assign(th.style, {
      padding: "8px",
      border: "1px solid #d1d5db",
      textAlign: "left",
    });
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  if (detail.logs.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 6;
    td.textContent = "Không có lượt chấm điểm nào trong khoảng thời gian này";
    Object.assign(td.style, {
      padding: "16px",
      textAlign: "center",
      color: "#6b7280",
      border: "1px solid #d1d5db",
    });
    tr.appendChild(td);
    tbody.appendChild(tr);
  } else {
    detail.logs.forEach((log, i) => {
      const tr = document.createElement("tr");
      const cells = [
        String(i + 1),
        formatDateTime(log.createdAt),
        log.reasonLabel,
        `${log.points > 0 ? "+" : ""}${log.points}`,
        log.note || "—",
        log.createdByName,
      ];
      cells.forEach((text, idx) => {
        const td = document.createElement("td");
        td.textContent = text;
        Object.assign(td.style, {
          padding: "8px",
          border: "1px solid #d1d5db",
        });
        if (idx === 3) {
          td.style.color = log.points > 0 ? "#16a34a" : "#dc2626";
          td.style.fontWeight = "600";
        }
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  }
  table.appendChild(tbody);
  wrap.appendChild(table);

  return wrap;
}

// ─── Modal xem biểu đồ theo tuần / theo tháng ─────────────────────────────
function PeriodChartModal({
  students,
  onClose,
}: {
  students: StudentScoreListItemDto[];
  onClose: () => void;
}) {
  const today = startOfDay(new Date());

  const [studentId, setStudentId] = useState<string>(
    students[0] ? String(students[0].userId) : "",
  );
  const [mode, setMode] = useState<"week" | "month">("week");

  const [weekAnchor, setWeekAnchor] = useState<Date>(getMonday(today));
  const [weekData, setWeekData] = useState<ScorePeriodDto | null>(null);
  const [weekLoading, setWeekLoading] = useState(false);

  const [monthYear, setMonthYear] = useState(today.getFullYear());
  const [monthNum, setMonthNum] = useState(today.getMonth() + 1); // 1-12
  const [weeksData, setWeeksData] = useState<
    { range: WeekRange; data: ScorePeriodDto | null }[]
  >([]);
  const [monthTotal, setMonthTotal] = useState<ScorePeriodDto | null>(null);
  const [monthLoading, setMonthLoading] = useState(false);

  const [exporting, setExporting] = useState<"png" | "pdf" | null>(null);

  const weekEnd = addDays(weekAnchor, 6);

  // ── Tải dữ liệu tuần ──
  useEffect(() => {
    if (mode !== "week" || !studentId) return;
    let cancelled = false;
    setWeekLoading(true);
    scoreApi
      .getStudentPeriod(
        Number(studentId),
        toDateInputValue(weekAnchor),
        toDateInputValue(weekEnd),
      )
      .then((d) => {
        if (!cancelled) setWeekData(d);
      })
      .catch(() => {
        if (!cancelled) setWeekData(null);
      })
      .finally(() => {
        if (!cancelled) setWeekLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, studentId, weekAnchor.getTime()]);

  // ── Tải dữ liệu tháng (từng tuần + tổng cả tháng) ──
  useEffect(() => {
    if (mode !== "month" || !studentId) return;
    let cancelled = false;
    setMonthLoading(true);

    const weeks = getWeeksInMonth(monthYear, monthNum);
    const firstDay = toDateInputValue(new Date(monthYear, monthNum - 1, 1));
    const lastDay = toDateInputValue(new Date(monthYear, monthNum, 0));

    Promise.all([
      Promise.all(
        weeks.map((range) =>
          scoreApi
            .getStudentPeriod(Number(studentId), range.from, range.to)
            .then((data) => ({ range, data }))
            .catch(() => ({ range, data: null })),
        ),
      ),
      scoreApi
        .getStudentPeriod(Number(studentId), firstDay, lastDay)
        .catch(() => null),
    ]).then(([weeksResult, totalResult]) => {
      if (cancelled) return;
      setWeeksData(weeksResult);
      setMonthTotal(totalResult);
      setMonthLoading(false);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, studentId, monthYear, monthNum]);

  const selectedStudent = students.find((s) => String(s.userId) === studentId);

  const goPrevWeek = (): void => setWeekAnchor((d) => addDays(d, -7));
  const goNextWeek = (): void => setWeekAnchor((d) => addDays(d, 7));

  const goPrevMonth = (): void => {
    if (monthNum === 1) {
      setMonthNum(12);
      setMonthYear((y) => y - 1);
    } else {
      setMonthNum((m) => m - 1);
    }
  };
  const goNextMonth = (): void => {
    if (monthNum === 12) {
      setMonthNum(1);
      setMonthYear((y) => y + 1);
    } else {
      setMonthNum((m) => m + 1);
    }
  };

  // Khoảng ngày + nhãn của kỳ đang xem, dùng chung cho cả xuất ảnh và PDF
  const currentPeriodRange = (): {
    from: string;
    to: string;
    label: string;
  } => {
    if (mode === "week") {
      return {
        from: toDateInputValue(weekAnchor),
        to: toDateInputValue(weekEnd),
        label: `Tuần ${formatShortDate(weekAnchor)} - ${formatShortDate(weekEnd)}`,
      };
    }
    return {
      from: toDateInputValue(new Date(monthYear, monthNum - 1, 1)),
      to: toDateInputValue(new Date(monthYear, monthNum, 0)),
      label: `Tháng ${monthNum}/${monthYear}`,
    };
  };

  const handleExport = async (type: "png" | "pdf"): Promise<void> => {
    if (!selectedStudent) return;
    setExporting(type);

    // Container gắn trực tiếp vào document.body, NẰM NGOÀI cây React — nên
    // không bị ảnh hưởng bởi bất kỳ re-render nào xảy ra trong lúc html2canvas
    // đang xử lý bất đồng bộ (nguyên nhân gây lỗi "Unable to find element in
    // cloned iframe" khi trước đây render khối báo cáo bằng React).
    let container: HTMLDivElement | null = null;

    try {
      const { from, to } = currentPeriodRange();
      const detail = await scoreApi.getStudentPeriodDetail(
        selectedStudent.userId,
        from,
        to,
      );

      const reportEl = buildScoreReportElement(
        displayName(selectedStudent),
        selectedStudent.email,
        currentPeriodRange().label,
        detail,
      );

      container = document.createElement("div");
      Object.assign(container.style, {
        position: "fixed",
        top: "0",
        left: "0",
        zIndex: "-1",
        pointerEvents: "none",
      });
      container.appendChild(reportEl);
      document.body.appendChild(container);

      // Chờ 1 nhịp để trình duyệt hoàn tất layout trước khi chụp
      await new Promise((resolve) => setTimeout(resolve, 50));

      const canvas = await html2canvas(reportEl, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
      });

      const fileBase = `diem-${displayName(selectedStudent).replace(/\s+/g, "_")}-${from}_${to}`;

      if (type === "png") {
        const link = document.createElement("a");
        link.download = `${fileBase}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      } else {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "pt",
          format: "a4",
        });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const imgWidth = pageWidth - 40;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 20, 20, imgWidth, imgHeight);
        pdf.save(`${fileBase}.pdf`);
      }
      showSuccess("Đã xuất báo cáo!");
    } catch (err) {
      console.error("[export-score-report] Lỗi:", err);
      showError("Không thể xuất báo cáo, thử lại sau");
    } finally {
      if (container) document.body.removeChild(container);
      setExporting(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-yellow-400 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Biểu đồ theo tuần / tháng
          </h3>
          <div className="flex items-center gap-2">
            {selectedStudent && (
              <>
                <button
                  onClick={() => handleExport("png")}
                  disabled={exporting !== null}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 transition-all disabled:opacity-40"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  {exporting === "png" ? "Đang xuất..." : "Xuất ảnh"}
                </button>
                <button
                  onClick={() => handleExport("pdf")}
                  disabled={exporting !== null}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 transition-all disabled:opacity-40"
                >
                  <Download className="w-3.5 h-3.5" />
                  {exporting === "pdf" ? "Đang xuất..." : "Xuất PDF"}
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chọn học viên + chế độ */}
        <div className="flex flex-wrap gap-3 mb-5">
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="flex-1 min-w-[200px] bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400 transition-colors"
          >
            {students.map((s) => (
              <option key={s.userId} value={s.userId}>
                {displayName(s)}
              </option>
            ))}
          </select>

          <div className="flex rounded-lg border border-gray-700 overflow-hidden shrink-0">
            <button
              onClick={() => setMode("week")}
              className={`px-4 py-2.5 text-sm font-medium transition-all ${
                mode === "week"
                  ? "bg-yellow-500 text-black"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              Tuần
            </button>
            <button
              onClick={() => setMode("month")}
              className={`px-4 py-2.5 text-sm font-medium transition-all ${
                mode === "month"
                  ? "bg-yellow-500 text-black"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              Tháng
            </button>
          </div>
        </div>

        {!selectedStudent ? (
          <p className="text-sm text-gray-600 text-center py-10">
            Chưa có học viên nào.
          </p>
        ) : mode === "week" ? (
          <div>
            <div className="flex items-center justify-center gap-3 mb-5">
              <button
                onClick={goPrevWeek}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-white font-medium px-3 py-2 bg-gray-800/60 rounded-lg border border-gray-800">
                Tuần {formatShortDate(weekAnchor)} - {formatShortDate(weekEnd)}
              </span>
              <button
                onClick={goNextWeek}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex justify-center">
              <PeriodChart
                title={`Điểm ${displayName(selectedStudent)} trong tuần`}
                data={weekData}
                loading={weekLoading}
                size={180}
              />
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-center gap-3 mb-5">
              <button
                onClick={goPrevMonth}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-white font-medium px-3 py-2 bg-gray-800/60 rounded-lg border border-gray-800">
                Tháng {monthNum}/{monthYear}
              </span>
              <button
                onClick={goNextMonth}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-center mb-5">
              <PeriodChart
                title={`Tổng cả tháng ${monthNum}/${monthYear}`}
                data={monthTotal}
                loading={monthLoading}
                size={180}
              />
            </div>

            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 text-center">
              Chi tiết từng tuần
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {weeksData.map(({ range, data }) => (
                <PeriodChart
                  key={range.from}
                  title={`Tuần ${range.label}`}
                  data={data}
                  loading={monthLoading}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Trang chính ──────────────────────────────────────────────────────────
export default function StudentScoreManagement() {
  const [students, setStudents] = useState<StudentScoreListItemDto[]>([]);
  const [reasons, setReasons] = useState<ScoreReasonDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [newReasonLabel, setNewReasonLabel] = useState("");
  const [newReasonPoints, setNewReasonPoints] = useState("");
  const [addingReason, setAddingReason] = useState(false);

  const [applyTarget, setApplyTarget] =
    useState<StudentScoreListItemDto | null>(null);
  const [detailUserId, setDetailUserId] = useState<number | null>(null);
  const [showPeriodModal, setShowPeriodModal] = useState(false);

  const fetchStudents = async (): Promise<void> => {
    setLoading(true);
    try {
      const list = await scoreApi.getStudentList();
      setStudents(list);
    } catch {
      showError("Không thể tải danh sách học viên");
    } finally {
      setLoading(false);
    }
  };

  const fetchReasons = async (): Promise<void> => {
    try {
      const list = await scoreApi.getReasons();
      setReasons(list);
    } catch {
      showError("Không thể tải danh sách lý do");
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchReasons();
  }, []);

  const handleAddReason = async (): Promise<void> => {
    if (!newReasonLabel.trim()) return;
    const dp =
      newReasonPoints.trim() === "" ? undefined : Number(newReasonPoints);
    if (dp !== undefined && (!Number.isInteger(dp) || dp === 0)) {
      showError("Điểm mặc định phải là số nguyên khác 0, hoặc để trống");
      return;
    }
    setAddingReason(true);
    try {
      await scoreApi.createReason(newReasonLabel.trim(), dp);
      setNewReasonLabel("");
      setNewReasonPoints("");
      showSuccess("Đã thêm lý do!");
      fetchReasons();
    } catch (err: unknown) {
      showError(getErrorMessage(err, "Có lỗi xảy ra"));
    } finally {
      setAddingReason(false);
    }
  };

  const filteredStudents = students.filter((s) =>
    displayName(s).toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-yellow-400">
              Đánh giá điểm học viên
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Chỉ áp dụng cho học viên có quyền xem lịch
            </p>
          </div>
          <button
            onClick={() => setShowPeriodModal(true)}
            disabled={students.length === 0}
            className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-gray-800 hover:bg-gray-700 border border-gray-700 text-yellow-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <BarChart3 className="w-4 h-4" />
            Biểu đồ theo tuần/tháng
          </button>
        </div>

        {/* ====== DANH SÁCH LÝ DO ====== */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
            Danh sách lý do
          </h3>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newReasonLabel}
              onChange={(e) => setNewReasonLabel(e.target.value)}
              placeholder="VD: Đi trễ, Giúp đỡ bạn học..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400 transition-colors"
            />
            <input
              type="number"
              value={newReasonPoints}
              onChange={(e) => setNewReasonPoints(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddReason();
              }}
              placeholder="Điểm mặc định (tuỳ chọn)"
              className="w-48 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400 transition-colors"
            />
            <button
              onClick={handleAddReason}
              disabled={addingReason || !newReasonLabel.trim()}
              className="px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 text-black font-bold rounded-lg transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[11px] text-gray-500 -mt-2 mb-4">
            Để trống "Điểm mặc định" nếu muốn tự nhập điểm mỗi lần áp dụng lý do
            này.
          </p>

          {reasons.length === 0 ? (
            <p className="text-sm text-gray-600 text-center py-3">
              Chưa có lý do nào.
            </p>
          ) : (
            <div className="space-y-2">
              {reasons.map((r) => (
                <ReasonRow
                  key={r.id}
                  reason={r}
                  onUpdated={fetchReasons}
                  onDeleted={fetchReasons}
                />
              ))}
            </div>
          )}
        </div>

        {/* ====== DANH SÁCH HỌC VIÊN ====== */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
              Học viên ({students.length})
            </h3>
            <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 w-64">
              <Search className="w-3.5 h-3.5 text-gray-500 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm học viên..."
                className="bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none w-full"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-10 text-center text-gray-500 text-sm">
              Đang tải...
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-10 text-center text-gray-500 text-sm">
              Không tìm thấy học viên nào.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredStudents.map((s) => (
                <div
                  key={s.userId}
                  className="flex items-center justify-between gap-3 rounded-lg border border-gray-800 bg-gray-900 hover:bg-gray-800/50 px-4 py-3 transition-all"
                >
                  <button
                    onClick={() => setDetailUserId(s.userId)}
                    className="flex items-center gap-3 min-w-0 flex-1 text-left"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-white truncate flex items-center gap-1.5">
                        {displayName(s)}
                        {s.warningLevel === "SEVERE" && (
                          <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        )}
                        {s.warningLevel === "MILD" && (
                          <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                        )}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate">
                        {s.email}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-600 shrink-0 ml-auto" />
                  </button>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">
                        {s.netScore}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        +{s.totalPositive} / -{s.totalNegative}
                      </p>
                    </div>
                    <button
                      onClick={() => setApplyTarget(s)}
                      className="px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-yellow-400 text-xs font-semibold rounded-lg transition-all"
                    >
                      Chấm điểm
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {applyTarget && (
        <ApplyScoreModal
          student={applyTarget}
          reasons={reasons}
          onClose={() => setApplyTarget(null)}
          onApplied={() => {
            setApplyTarget(null);
            fetchStudents();
          }}
        />
      )}

      {detailUserId !== null && (
        <StudentDetailModal
          userId={detailUserId}
          onClose={() => setDetailUserId(null)}
          onChanged={fetchStudents}
        />
      )}

      {showPeriodModal && (
        <PeriodChartModal
          students={students}
          onClose={() => setShowPeriodModal(false)}
        />
      )}
    </div>
  );
}
