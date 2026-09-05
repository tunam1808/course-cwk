import { useEffect, useMemo, useState, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Users,
  Sun,
  Cloud,
  Moon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ClipboardEdit,
  Bell,
  BellOff,
} from "lucide-react";
import { scheduleApi, type ScheduleItemDto } from "@/api/schedule.api";
import { showError, showSuccess } from "@/common/toast";
import ScheduleFeedbackForm, {
  type FeedbackTargetItem,
} from "@/pages/team-member-feekback";
import {
  enablePushNotifications,
  getNotificationPermissionStatus,
} from "@/lib/push";

// ─── Kiểu dữ liệu local ─────────────────────────────────────────────────
type SessionKey = "sang" | "chieu" | "toi";
type TypeKey = "hoc" | "choi";

interface LocalMember {
  userId: number;
  name: string;
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

const sessionFromTime = (start: string): SessionKey => {
  if (!start) return "sang";
  const hour = parseInt(start.split(":")[0], 10);
  const found = SESSIONS.find((s) => hour >= s.range[0] && hour < s.range[1]);
  return found ? found.key : "toi";
};

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
    name: m.user.fullName || m.user.email,
  })),
  allTeam: dto.allTeam,
});

// ─── Tiện ích chọn tuần (giống bản admin) ───────────────────────────────
const LOOKUP_RANGE_DAYS = 30;

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

const formatShortDate = (d: Date): string =>
  `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

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

export default function MySchedule() {
  const navigate = useNavigate();
  const [items, setItems] = useState<LocalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekStart, setWeekStart] = useState<Date>(clampWeekStart(today));
  const [submittedIds, setSubmittedIds] = useState<Set<number>>(new Set());
  const [feedbackTarget, setFeedbackTarget] = useState<LocalItem | null>(null);

  // Trạng thái quyền nhận thông báo — hiển thị nút phù hợp (Bật/Đã bật)
  const [notifStatus, setNotifStatus] = useState<
    NotificationPermission | "unsupported"
  >("default");
  const [enablingNotif, setEnablingNotif] = useState(false);

  const todayStr = toDateInputValue(today);

  const fetchSubmittedIds = async (): Promise<void> => {
    try {
      const ids = await scheduleApi.getMySubmittedFeedbackIds();
      setSubmittedIds(new Set(ids));
    } catch {
      // im lặng bỏ qua — không chặn hiển thị lịch nếu lỗi
    }
  };

  useEffect(() => {
    fetchSubmittedIds();
    setNotifStatus(getNotificationPermissionStatus());
  }, []);

  const handleEnableNotifications = async (): Promise<void> => {
    setEnablingNotif(true);
    try {
      const result = await enablePushNotifications();
      if (result === "granted") {
        showSuccess("Đã bật thông báo! Bạn sẽ được nhắc trước 1 tiếng.");
      } else if (result === "denied") {
        showError(
          "Bạn đã từ chối quyền thông báo. Vào cài đặt trình duyệt để bật lại.",
        );
      } else {
        showError("Thiết bị/trình duyệt này không hỗ trợ thông báo đẩy.");
      }
      setNotifStatus(getNotificationPermissionStatus());
    } catch {
      showError("Không thể bật thông báo, thử lại sau.");
    } finally {
      setEnablingNotif(false);
    }
  };

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

  useEffect(() => {
    fetchSchedule(weekStart, weekEnd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart]);

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

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ====== HEADER ====== */}
        <div className="text-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-yellow-400 transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>
          <h2 className="text-3xl sm:text-4xl font-bold text-yellow-400 tracking-wide">
            THỜI KHÓA BIỂU
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {loading
              ? "Đang tải..."
              : `${items.length} buổi trong tuần ${formatShortDate(weekStart)} – ${formatShortDate(weekEnd)}`}
          </p>

          {/* Nút bật thông báo nhắc lịch — chỉ hiện khi chưa cấp quyền hoặc bị từ chối */}
          {notifStatus !== "granted" && notifStatus !== "unsupported" && (
            <button
              onClick={handleEnableNotifications}
              disabled={enablingNotif}
              className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 hover:bg-yellow-400/20 transition-all disabled:opacity-50"
            >
              <Bell className="w-3.5 h-3.5" />
              {enablingNotif
                ? "Đang bật..."
                : "Bật thông báo nhắc trước 1 tiếng"}
            </button>
          )}
          {notifStatus === "granted" && (
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-gray-500">
              <Bell className="w-3.5 h-3.5 text-yellow-400" />
              Đã bật thông báo nhắc lịch
            </p>
          )}
          {notifStatus === "unsupported" && (
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-gray-600">
              <BellOff className="w-3.5 h-3.5" />
              Trình duyệt/thiết bị này không hỗ trợ thông báo đẩy
            </p>
          )}
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

        {/* ====== BẢNG THỜI KHÓA BIỂU ====== */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-500 text-sm">
              Đang tải thời khóa biểu...
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                {/* Một grid DUY NHẤT bao trọn header + toàn bộ các dòng
                    Sáng/Chiều/Tối — tránh dùng nhiều grid container riêng lẻ
                    (mỗi cái tự làm tròn độ rộng cột "1fr" khác nhau), vốn là
                    nguyên nhân khiến các cột bị lệch/xiên giữa các dòng. */}
                <div className="min-w-[1000px] grid grid-cols-[100px_repeat(7,1fr)]">
                  {/* Header */}
                  <div className="p-4 flex items-center border-b border-gray-700">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Buổi
                    </span>
                  </div>
                  {WEEKDAY_LABELS.map((label, i) => (
                    <div
                      key={label}
                      className="p-4 text-center border-l border-b border-gray-800"
                    >
                      <span className="text-sm font-semibold text-white block">
                        {label}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        {formatShortDate(weekDates[i])}
                      </span>
                    </div>
                  ))}

                  {/* Các dòng Sáng / Chiều / Tối — cùng chung 1 grid với
                      header ở trên, đảm bảo cột luôn thẳng hàng tuyệt đối. */}
                  {SESSIONS.map((session, sIdx) => {
                    const Icon = session.icon;
                    const isLastSession = sIdx === SESSIONS.length - 1;
                    const borderCls = isLastSession
                      ? ""
                      : "border-b border-gray-800";

                    return (
                      <Fragment key={session.key}>
                        <div
                          className={`p-4 flex flex-col gap-1 justify-center bg-gray-900/60 ${borderCls}`}
                        >
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
                              className={`p-2 border-l border-gray-800 min-h-[92px] flex flex-col gap-1.5 ${borderCls}`}
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
                                  const isDone = submittedIds.has(item.id);
                                  const canShowButton = item.date <= todayStr;
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
                                      {canShowButton &&
                                        (isDone ? (
                                          <div className="flex items-center gap-1 mt-1.5 text-[10px] font-medium text-gray-500">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Đã đánh giá
                                          </div>
                                        ) : (
                                          <button
                                            onClick={() =>
                                              setFeedbackTarget(item)
                                            }
                                            className="flex items-center gap-1 mt-1.5 text-[10px] font-semibold text-yellow-400 hover:text-yellow-300 transition-colors"
                                          >
                                            <ClipboardEdit className="w-3 h-3" />
                                            Đánh giá
                                          </button>
                                        ))}
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          );
                        })}
                      </Fragment>
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
      </div>

      {feedbackTarget && (
        <ScheduleFeedbackForm
          item={
            {
              id: feedbackTarget.id,
              type: feedbackTarget.type.toUpperCase() as "HOC" | "CHOI",
              title: feedbackTarget.title,
              startTime: feedbackTarget.start,
              endTime: feedbackTarget.end,
            } satisfies FeedbackTargetItem
          }
          onSubmitted={(id) => {
            setSubmittedIds((prev) => new Set(prev).add(id));
            setFeedbackTarget(null);
          }}
          onClose={() => setFeedbackTarget(null)}
        />
      )}
    </div>
  );
}
