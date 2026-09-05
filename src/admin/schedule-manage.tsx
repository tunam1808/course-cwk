import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
  Clock,
  Users,
  CalendarDays,
  Sun,
  Cloud,
  Moon,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  UserCheck,
  CheckCircle2,
} from "lucide-react";
import {
  scheduleApi,
  type ScheduleItemDto,
  type ScheduleItemInput,
  type ScheduleAccessDto,
  type ScheduleType as ApiScheduleType,
} from "@/api/schedule.api";
import { showSuccess, showError } from "@/common/toast";
import ScheduleAccessManagement from "@/admin/member-team.manage";
import ScheduleAttendanceModal from "@/pages/schedule-attendance";
import { isAxiosError } from "axios";

const getErrorMessage = (err: unknown, fallback: string): string => {
  if (isAxiosError<{ message?: string }>(err)) {
    return err.response?.data?.message ?? fallback;
  }
  return fallback;
};

// ─── Bộ chọn giờ 24h tùy chỉnh (thay input type="time" mặc định) ───────────
const HOURS_24 = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, "0"),
);
const MINUTES_60 = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, "0"),
);

function TimeSelect({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  const [hh, mm] = value.split(":");

  return (
    <div className="flex-1">
      <label className="block text-[11px] text-gray-500 mb-1">{label}</label>
      <div className="flex items-center gap-1.5 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 focus-within:border-yellow-400 transition-colors">
        <Clock className="w-3.5 h-3.5 text-gray-500 shrink-0" />
        <select
          value={hh}
          onChange={(e) => onChange(`${e.target.value}:${mm}`)}
          className="bg-transparent text-white text-sm font-medium focus:outline-none appearance-none cursor-pointer w-8"
        >
          {HOURS_24.map((h) => (
            <option key={h} value={h} className="bg-gray-800 text-white">
              {h}
            </option>
          ))}
        </select>
        <span className="text-gray-500 font-bold">:</span>
        <select
          value={mm}
          onChange={(e) => onChange(`${hh}:${e.target.value}`)}
          className="bg-transparent text-white text-sm font-medium focus:outline-none appearance-none cursor-pointer w-8"
        >
          {MINUTES_60.map((m) => (
            <option key={m} value={m} className="bg-gray-800 text-white">
              {m}
            </option>
          ))}
        </select>
        <span className="text-[10px] text-gray-600 ml-auto shrink-0">24h</span>
      </div>
    </div>
  );
}

// ─── Kiểu dữ liệu local ─────────────────────────────────────────────────
type SessionKey = "sang" | "chieu" | "toi";
type TypeKey = "hoc" | "choi";

interface LocalMember {
  userId: number;
  name: string; // fullName || email, chỉ để hiển thị
}

interface LocalItem {
  id: number;
  date: string; // "YYYY-MM-DD"
  type: TypeKey;
  title: string;
  start: string; // "HH:mm"
  end: string; // "HH:mm"
  members: LocalMember[];
  allTeam: boolean;
}

type LocalForm = Omit<LocalItem, "id">;

interface SessionConfig {
  key: SessionKey;
  label: string;
  icon: typeof Sun;
  range: [number, number];
}

interface TypeConfig {
  label: string;
  dot: string;
  bg: string;
  text: string;
  border: string;
}

const WEEKDAY_LABELS = [
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
  "Chủ nhật",
];

const SESSIONS: SessionConfig[] = [
  { key: "sang", label: "Sáng", icon: Sun, range: [0, 12] },
  { key: "chieu", label: "Chiều", icon: Cloud, range: [12, 17] },
  { key: "toi", label: "Tối", icon: Moon, range: [17, 24] },
];

const TYPES: Record<TypeKey, TypeConfig> = {
  hoc: {
    label: "Buổi học",
    dot: "bg-yellow-400",
    bg: "bg-yellow-400/10",
    text: "text-yellow-300",
    border: "border-yellow-400/30",
  },
  choi: {
    label: "Buổi đi chơi",
    dot: "bg-teal-400",
    bg: "bg-teal-400/10",
    text: "text-teal-300",
    border: "border-teal-400/30",
  },
};

// Suy ra buổi (sáng/chiều/tối) từ giờ bắt đầu
const sessionFromTime = (start: string): SessionKey => {
  if (!start) return "sang";
  const hour = parseInt(start.split(":")[0], 10);
  const found = SESSIONS.find((s) => hour >= s.range[0] && hour < s.range[1]);
  return found ? found.key : "toi";
};

const sessionLabel = (key: SessionKey): string =>
  SESSIONS.find((s) => s.key === key)?.label ?? key;

const displayName = (u: { email: string; fullName: string | null }): string =>
  u.fullName || u.email;

// ─── Chuyển đổi dữ liệu API <-> local ───────────────────────────────────
// Backend trả date dạng ISO đầy đủ (vd "2026-08-25T00:00:00.000Z") — chỉ lấy phần ngày
const apiDateToLocal = (isoDate: string): string => isoDate.slice(0, 10);

const fromApiItem = (dto: ScheduleItemDto): LocalItem => ({
  id: dto.id,
  date: apiDateToLocal(dto.date),
  type: dto.type.toLowerCase() as TypeKey,
  title: dto.title,
  start: dto.startTime,
  end: dto.endTime,
  members: dto.members.map((m) => ({
    userId: m.userId,
    name: displayName(m.user),
  })),
  allTeam: dto.allTeam,
});

const toApiInput = (form: LocalForm): ScheduleItemInput => ({
  date: form.date,
  type: form.type.toUpperCase() as ApiScheduleType,
  title: form.title.trim(),
  startTime: form.start,
  endTime: form.end,
  allTeam: form.allTeam,
  members: form.members.map((m) => m.userId),
});

const sortItems = (items: LocalItem[]): LocalItem[] =>
  [...items].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.start.localeCompare(b.start);
  });

// ─── Tiện ích chọn tuần ─────────────────────────────────────────────────
const LOOKUP_RANGE_DAYS = 30; // giới hạn tra cứu: 1 tháng trước/sau hôm nay

const startOfDay = (d: Date): Date => {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
};

// Trả về thứ 2 của tuần chứa ngày d
const getMonday = (d: Date): Date => {
  const date = startOfDay(d);
  const day = date.getDay(); // 0 = CN
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date;
};

const addDays = (d: Date, days: number): Date => {
  const r = new Date(d);
  r.setDate(r.getDate() + days);
  return r;
};

const formatShortDate = (d: Date): string =>
  `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

// "YYYY-MM-DD" — dùng cho input type="date" và query from/to
const toDateInputValue = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const today = startOfDay(new Date());
const MIN_WEEK_START = getMonday(addDays(today, -LOOKUP_RANGE_DAYS));
const MAX_WEEK_START = getMonday(addDays(today, LOOKUP_RANGE_DAYS));

const clampWeekStart = (d: Date): Date => {
  const monday = getMonday(d);
  if (monday.getTime() < MIN_WEEK_START.getTime()) return MIN_WEEK_START;
  if (monday.getTime() > MAX_WEEK_START.getTime()) return MAX_WEEK_START;
  return monday;
};

const makeEmptyForm = (defaultDate: string): LocalForm => ({
  date: defaultDate,
  type: "hoc",
  title: "",
  start: "07:00",
  end: "08:00",
  members: [],
  allTeam: false,
});

type Mode = "add" | "edit" | "delete" | null;

export default function ScheduleManagement() {
  const navigate = useNavigate();
  const [items, setItems] = useState<LocalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [weekStart, setWeekStart] = useState<Date>(clampWeekStart(today));
  const [attendanceTarget, setAttendanceTarget] = useState<LocalItem | null>(
    null,
  );

  // Danh sách tài khoản được cấp quyền xem lịch — dùng để chọn thành viên
  // tham gia từng buổi (thay cho việc gõ tên tự do trước đây).
  const [accounts, setAccounts] = useState<ScheduleAccessDto[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);

  const todayStr = toDateInputValue(today);

  const [mode, setMode] = useState<Mode>(null);
  const [selectedId, setSelectedId] = useState<string>("");
  const [form, setForm] = useState<LocalForm>(() =>
    makeEmptyForm(toDateInputValue(clampWeekStart(today))),
  );

  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);

  const weekDates = useMemo(
    () => WEEKDAY_LABELS.map((_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const canGoPrevWeek = weekStart.getTime() > MIN_WEEK_START.getTime();
  const canGoNextWeek = weekStart.getTime() < MAX_WEEK_START.getTime();

  const fetchSchedule = async (start: Date, end: Date): Promise<void> => {
    setLoading(true);
    try {
      const data = await scheduleApi.getSchedule({
        from: toDateInputValue(start),
        to: toDateInputValue(end),
      });
      setItems(data.map(fromApiItem));
    } catch {
      showError("Không thể tải thời khóa biểu");
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async (): Promise<void> => {
    setAccountsLoading(true);
    try {
      const list = await scheduleApi.getScheduleAccessList();
      setAccounts(list);
    } catch {
      showError("Không thể tải danh sách tài khoản được cấp quyền");
    } finally {
      setAccountsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    fetchSchedule(weekStart, weekEnd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart]);

  const sorted = useMemo(() => sortItems(items), [items]);

  const grid = useMemo(() => {
    const map: Record<string, LocalItem[]> = {};
    for (const it of items) {
      const key = `${it.date}-${sessionFromTime(it.start)}`;
      if (!map[key]) map[key] = [];
      map[key].push(it);
    }
    for (const key in map)
      map[key].sort((a, b) => a.start.localeCompare(b.start));
    return map;
  }, [items]);

  // ── Điều hướng tuần ──
  const goPrevWeek = (): void => {
    if (!canGoPrevWeek) return;
    setWeekStart(clampWeekStart(addDays(weekStart, -7)));
  };

  const goNextWeek = (): void => {
    if (!canGoNextWeek) return;
    setWeekStart(clampWeekStart(addDays(weekStart, 7)));
  };

  const goThisWeek = (): void => setWeekStart(clampWeekStart(today));

  const handlePickFromDate = (value: string): void => {
    if (!value) return;
    setWeekStart(clampWeekStart(new Date(value)));
  };

  // ── Điều khiển chế độ ──
  const openMode = (m: Mode): void => {
    setMode(m);
    setSelectedId("");
    if (m === "add") setForm(makeEmptyForm(toDateInputValue(weekStart)));
  };

  const closePanel = (): void => {
    setMode(null);
    setSelectedId("");
    setForm(makeEmptyForm(toDateInputValue(weekStart)));
  };

  const selectItemToEdit = (id: string): void => {
    const it = items.find((i) => String(i.id) === String(id));
    if (!it) return;
    setSelectedId(id);
    setForm({
      date: it.date,
      type: it.type,
      title: it.title,
      start: it.start,
      end: it.end,
      members: it.members,
      allTeam: it.allTeam,
    });
  };

  // ── Thành viên — chọn từ danh sách tài khoản được cấp quyền ──
  const toggleMember = (account: ScheduleAccessDto): void => {
    setForm((f) => {
      const exists = f.members.some((m) => m.userId === account.userId);
      return {
        ...f,
        allTeam: false,
        members: exists
          ? f.members.filter((m) => m.userId !== account.userId)
          : [
              ...f.members,
              { userId: account.userId, name: displayName(account.user) },
            ],
      };
    });
  };

  const toggleAllTeam = (): void => {
    setForm((f) => ({
      ...f,
      allTeam: !f.allTeam,
      members: !f.allTeam ? [] : f.members,
    }));
  };

  // ── Lưu / Xóa ──
  const handleSubmit = async (): Promise<void> => {
    if (!form.title.trim() || !form.date) return;
    setSaving(true);
    try {
      if (mode === "add") {
        await scheduleApi.createScheduleItem(toApiInput(form));
        showSuccess("Đã thêm vào lịch!");
      } else if (mode === "edit" && selectedId) {
        await scheduleApi.updateScheduleItem(
          Number(selectedId),
          toApiInput(form),
        );
        showSuccess("Đã lưu thay đổi!");
      }
      closePanel();
      fetchSchedule(weekStart, weekEnd);
    } catch (err: unknown) {
      showError(getErrorMessage(err, "Có lỗi xảy ra"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!selectedId) return;
    setSaving(true);
    try {
      await scheduleApi.deleteScheduleItem(Number(selectedId));
      showSuccess("Đã xóa khỏi lịch!");
      closePanel();
      fetchSchedule(weekStart, weekEnd);
    } catch (err: unknown) {
      showError(getErrorMessage(err, "Có lỗi xảy ra"));
    } finally {
      setSaving(false);
    }
  };

  const selectedItem = items.find((i) => String(i.id) === String(selectedId));

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ====== HEADER ====== */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-yellow-400">
              Thời khóa biểu
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {loading
                ? "Đang tải..."
                : `${items.length} buổi trong tuần ${formatShortDate(weekStart)} – ${formatShortDate(weekEnd)}`}
            </p>
          </div>
          <button
            onClick={() => navigate("/manage-page/schedule-list-feedback")}
            className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 hover:text-yellow-400 transition-all"
          >
            <ClipboardList className="w-4 h-4" />
            Xem đánh giá
          </button>
        </div>

        {/* ====== THANH CHỌN TUẦN ====== */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 flex flex-wrap items-center gap-3">
          <button
            onClick={goPrevWeek}
            disabled={!canGoPrevWeek}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-gray-300 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">Từ ngày</span>
            <input
              type="date"
              value={toDateInputValue(weekStart)}
              min={toDateInputValue(MIN_WEEK_START)}
              max={toDateInputValue(MAX_WEEK_START)}
              onChange={(e) => handlePickFromDate(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-yellow-400 transition-colors"
            />
            <span className="text-gray-400">đến ngày</span>
            <span className="text-white font-medium px-2.5 py-1.5 bg-gray-800/60 rounded-lg border border-gray-800">
              {formatShortDate(weekEnd)}
            </span>
          </div>

          <button
            onClick={goNextWeek}
            disabled={!canGoNextWeek}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-gray-300 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={goThisWeek}
            className="ml-auto px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 transition-all"
          >
            Tuần này
          </button>

          <span className="w-full text-[11px] text-gray-500">
            Chỉ tra cứu được trong khoảng ±1 tháng kể từ hôm nay
          </span>
        </div>

        {/* ====== PHẦN 1: BẢNG THỜI KHÓA BIỂU ====== */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-500 text-sm">
              Đang tải thời khóa biểu...
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <div className="min-w-[1000px]">
                  <div className="grid grid-cols-[100px_repeat(7,1fr)] border-b border-gray-700">
                    <div className="p-4 flex items-center">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Buổi
                      </span>
                    </div>
                    {WEEKDAY_LABELS.map((label, i) => (
                      <div
                        key={label}
                        className="p-4 text-center border-l border-gray-800"
                      >
                        <span className="text-sm font-semibold text-white block">
                          {label}
                        </span>
                        <span className="text-[11px] text-gray-500">
                          {formatShortDate(weekDates[i])}
                        </span>
                      </div>
                    ))}
                  </div>

                  {SESSIONS.map((session) => {
                    const Icon = session.icon;
                    return (
                      <div
                        key={session.key}
                        className="grid grid-cols-[100px_repeat(7,1fr)] border-b border-gray-800 last:border-b-0"
                      >
                        <div className="p-4 flex flex-col gap-1 justify-center bg-gray-900/60">
                          <div className="flex items-center gap-1.5 text-gray-200">
                            <Icon className="w-3.5 h-3.5 text-yellow-400" />
                            <span className="text-sm font-medium">
                              {session.label}
                            </span>
                          </div>
                        </div>

                        {weekDates.map((date) => {
                          const dateStr = toDateInputValue(date);
                          const key = `${dateStr}-${session.key}`;
                          const cellItems = grid[key] ?? [];
                          return (
                            <div
                              key={key}
                              className="p-2 border-l border-gray-800 min-h-[92px] flex flex-col gap-1.5"
                            >
                              {cellItems.length === 0 ? (
                                <div className="flex-1 flex items-center justify-center">
                                  <span className="text-gray-700 text-xs">
                                    —
                                  </span>
                                </div>
                              ) : (
                                cellItems.map((item) => {
                                  const t = TYPES[item.type];
                                  const isToday = item.date === todayStr;
                                  const isPast = item.date < todayStr;
                                  return (
                                    <div
                                      key={item.id}
                                      className={`rounded-lg border ${t.border} ${t.bg} px-2.5 py-1.5`}
                                    >
                                      <p
                                        className={`text-xs font-semibold ${t.text} leading-snug`}
                                      >
                                        {item.title}
                                      </p>
                                      <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400">
                                        <Clock className="w-2.5 h-2.5" />
                                        <span>
                                          {item.start} – {item.end}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1 mt-0.5 text-[10px] text-gray-400">
                                        <Users className="w-2.5 h-2.5" />
                                        <span className="truncate">
                                          {item.allTeam
                                            ? "Cả team"
                                            : item.members
                                                .map((m) => m.name)
                                                .join(", ") || "Chưa có"}
                                        </span>
                                      </div>
                                      {isToday && (
                                        <button
                                          onClick={() =>
                                            setAttendanceTarget(item)
                                          }
                                          className="flex items-center gap-1 mt-1.5 text-[10px] font-semibold text-yellow-400 hover:text-yellow-300 transition-colors"
                                        >
                                          <UserCheck className="w-3 h-3" />
                                          Điểm danh
                                        </button>
                                      )}
                                      {isPast && (
                                        <button
                                          onClick={() =>
                                            setAttendanceTarget(item)
                                          }
                                          className="flex items-center gap-1 mt-1.5 text-[10px] font-medium text-gray-500 hover:text-gray-300 transition-colors"
                                        >
                                          <CheckCircle2 className="w-3 h-3" />
                                          Điểm danh hoàn tất
                                        </button>
                                      )}
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chú thích loại buổi */}
              <div className="flex items-center gap-5 px-4 py-3 border-t border-gray-800">
                {(Object.entries(TYPES) as [TypeKey, TypeConfig][]).map(
                  ([key, t]) => (
                    <div key={key} className="flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${t.dot}`} />
                      <span className="text-xs text-gray-400">{t.label}</span>
                    </div>
                  ),
                )}
              </div>
            </>
          )}
        </div>

        {/* ====== PHẦN 2: THÊM / SỬA / XÓA ====== */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
            Quản lý buổi học / buổi đi chơi
          </h3>

          {/* Tab chọn thao tác */}
          <div className="flex gap-3 mb-5">
            <button
              onClick={() => openMode("add")}
              disabled={loading}
              className={`flex-1 py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                mode === "add"
                  ? "bg-yellow-500 text-black"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              <Plus className="w-4 h-4" /> Thêm
            </button>
            <button
              onClick={() => openMode("edit")}
              disabled={loading}
              className={`flex-1 py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                mode === "edit"
                  ? "bg-yellow-500 text-black"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              <Pencil className="w-4 h-4" /> Sửa
            </button>
            <button
              onClick={() => openMode("delete")}
              disabled={loading}
              className={`flex-1 py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                mode === "delete"
                  ? "bg-red-500 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              <Trash2 className="w-4 h-4" /> Xóa
            </button>
          </div>

          {!mode && (
            <p className="text-gray-500 text-sm text-center py-6">
              Chọn "Thêm", "Sửa" hoặc "Xóa" để bắt đầu quản lý lịch.
              <br />
              Chỉ hiển thị các buổi trong tuần đang xem ở trên.
            </p>
          )}

          {/* ── Chọn buổi cần sửa / xóa ── */}
          {(mode === "edit" || mode === "delete") && (
            <div className="mb-5">
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Chọn buổi trong tuần đang xem
              </label>
              <select
                value={selectedId}
                onChange={(e) =>
                  mode === "edit"
                    ? selectItemToEdit(e.target.value)
                    : setSelectedId(e.target.value)
                }
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400 transition-colors"
              >
                <option value="">— Chọn một buổi —</option>
                {sorted.map((it) => (
                  <option key={it.id} value={it.id}>
                    {formatShortDate(new Date(it.date))} ·{" "}
                    {sessionLabel(sessionFromTime(it.start))} · {it.title} (
                    {it.start}–{it.end})
                  </option>
                ))}
              </select>
              {sorted.length === 0 && (
                <p className="text-[11px] text-gray-500 mt-1.5">
                  Tuần này chưa có buổi nào để {mode === "edit" ? "sửa" : "xóa"}
                  .
                </p>
              )}
            </div>
          )}

          {/* ── Form Thêm / Sửa ── */}
          {(mode === "add" || (mode === "edit" && selectedId)) && (
            <div className="space-y-4">
              {/* Ngày + Loại buổi */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Ngày
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    min={toDateInputValue(MIN_WEEK_START)}
                    max={toDateInputValue(addDays(MAX_WEEK_START, 6))}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Loại
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.entries(TYPES) as [TypeKey, TypeConfig][]).map(
                      ([key, t]) => (
                        <button
                          key={key}
                          onClick={() => setForm({ ...form, type: key })}
                          className={`py-2.5 rounded-lg text-xs font-medium border transition-all ${
                            form.type === key
                              ? `${t.bg} ${t.text} ${t.border}`
                              : "bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700"
                          }`}
                        >
                          {t.label}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              </div>

              {/* Tên buổi */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Tên {form.type === "choi" ? "buổi đi chơi" : "buổi học"}
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder={
                    form.type === "choi" ? "VD: Đi cắm trại" : "VD: Yoga cơ bản"
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400 transition-colors"
                />
              </div>

              {/* Thời gian */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Thời gian
                </label>
                <div className="flex items-end gap-2">
                  <TimeSelect
                    label="Giờ bắt đầu"
                    value={form.start}
                    onChange={(v) => setForm({ ...form, start: v })}
                  />
                  <span className="text-gray-500 text-sm pb-3">đến</span>
                  <TimeSelect
                    label="Giờ kết thúc"
                    value={form.end}
                    onChange={(v) => setForm({ ...form, end: v })}
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-1.5">
                  Buổi tương ứng: {sessionLabel(sessionFromTime(form.start))}
                </p>
              </div>

              {/* Thành viên — chọn từ danh sách tài khoản được cấp quyền xem lịch,
                  để gửi push notification đúng người khi buổi sắp diễn ra */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Thành viên tham gia
                </label>

                <button
                  onClick={toggleAllTeam}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border transition-all mb-2 ${
                    form.allTeam
                      ? "bg-yellow-500 text-black border-yellow-500"
                      : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
                  }`}
                >
                  {form.allTeam && <Check className="w-4 h-4" />}
                  <Users className="w-4 h-4" /> Cả team
                </button>

                {!form.allTeam && (
                  <>
                    {accountsLoading ? (
                      <p className="text-xs text-gray-500 py-2">
                        Đang tải danh sách tài khoản...
                      </p>
                    ) : accounts.length === 0 ? (
                      <p className="text-xs text-gray-500 py-2">
                        Chưa có tài khoản nào được cấp quyền xem lịch. Cấp quyền
                        ở phần "Quyền xem lịch" bên dưới trước.
                      </p>
                    ) : (
                      <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                        {accounts.map((a) => {
                          const selected = form.members.some(
                            (m) => m.userId === a.userId,
                          );
                          return (
                            <label
                              key={a.userId}
                              className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 cursor-pointer transition-all ${
                                selected
                                  ? "bg-gray-800/80 border-gray-700"
                                  : "bg-gray-900 border-gray-800 hover:bg-gray-800/40"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() => toggleMember(a)}
                                className="w-4 h-4 accent-yellow-500 shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="text-sm text-white truncate">
                                  {displayName(a.user)}
                                </p>
                                <p className="text-[11px] text-gray-500 truncate">
                                  {a.user.email}
                                </p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}
                    {form.members.length > 0 && (
                      <p className="text-[11px] text-gray-500 mt-1.5">
                        Đã chọn {form.members.length} người
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Nút hành động */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={closePanel}
                  disabled={saving}
                  className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-all disabled:opacity-40"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!form.title.trim() || !form.date || saving}
                  className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold rounded-lg transition-all"
                >
                  {saving
                    ? "Đang lưu..."
                    : mode === "edit"
                      ? "Lưu thay đổi"
                      : "Thêm vào lịch"}
                </button>
              </div>
            </div>
          )}

          {/* ── Xác nhận xóa ── */}
          {mode === "delete" && selectedId && selectedItem && (
            <div className="space-y-4">
              <div
                className={`rounded-lg border ${TYPES[selectedItem.type].border} ${TYPES[selectedItem.type].bg} p-4`}
              >
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                  <CalendarDays className="w-3.5 h-3.5" />
                  {formatShortDate(new Date(selectedItem.date))} ·{" "}
                  {sessionLabel(sessionFromTime(selectedItem.start))}
                </div>
                <p className={`font-semibold ${TYPES[selectedItem.type].text}`}>
                  {selectedItem.title}
                </p>
                <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
                  <Clock className="w-3.5 h-3.5" />
                  {selectedItem.start} – {selectedItem.end}
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
                  <Users className="w-3.5 h-3.5" />
                  {selectedItem.allTeam
                    ? "Cả team"
                    : selectedItem.members.map((m) => m.name).join(", ") ||
                      "Chưa có thành viên"}
                </div>
              </div>

              <p className="text-sm text-gray-400">
                Bạn có chắc muốn xóa buổi này khỏi thời khóa biểu không?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={closePanel}
                  disabled={saving}
                  className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-all disabled:opacity-40"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-400 text-white font-bold rounded-lg transition-all disabled:opacity-40"
                >
                  {saving ? "Đang xóa..." : "Xác nhận xóa"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ====== PHẦN 3: QUYỀN XEM LỊCH ====== */}
        <ScheduleAccessManagement />
      </div>

      {attendanceTarget && (
        <ScheduleAttendanceModal
          item={{
            id: attendanceTarget.id,
            title: attendanceTarget.title,
            date: formatShortDate(new Date(attendanceTarget.date)),
            startTime: attendanceTarget.start,
            endTime: attendanceTarget.end,
          }}
          // Buổi đã qua ngày (nút "Điểm danh hoàn tất") => bắt buộc nhập mật
          // khẩu admin mới cho sửa, xử lý trong ScheduleAttendanceModal.
          locked={attendanceTarget.date < todayStr}
          onClose={() => setAttendanceTarget(null)}
          onSaved={() => setAttendanceTarget(null)}
        />
      )}
    </div>
  );
}
