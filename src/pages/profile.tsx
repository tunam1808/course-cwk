import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  RotateCcw,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/auth.context";
import {
  scoreApi,
  type ScoreLogDto,
  type ScoreSummaryDto,
  type ScorePeriodDto,
} from "@/api/score.api";
import ScoreDonutChart from "@/components/score-donut-chart";

type ScoreData = ScoreSummaryDto & { logs: ScoreLogDto[] };

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/70";

// ─── Tiện ích ngày tháng ─────────────────────────────────────────────────
const pad = (n: number): string => String(n).padStart(2, "0");

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

const toDateInputValue = (d: Date): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const formatShortDate = (d: Date): string =>
  `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;

const formatTime = (iso: string): string => {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const formatDayLabel = (iso: string): string => {
  const d = startOfDay(new Date(iso));
  const today = startOfDay(new Date());
  const diff = Math.round((today.getTime() - d.getTime()) / 86_400_000);
  if (diff === 0) return "Hôm nay";
  if (diff === 1) return "Hôm qua";
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

interface WeekRange {
  label: string;
  from: string;
  to: string;
}

// Danh sách các tuần (Thứ 2 → Chủ nhật) có giao với tháng được chọn — lấy
// trọn vẹn Thứ 2 → Chủ nhật kể cả khi lấn sang tháng trước/sau, khớp cách
// chia tuần đang dùng ở trang thời khóa biểu.
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

interface LogGroup {
  key: string;
  label: string;
  logs: ScoreLogDto[];
}

// Gom các lượt chấm điểm liền kề cùng ngày (giữ nguyên thứ tự API trả về).
function groupLogsByDay(logs: ScoreLogDto[]): LogGroup[] {
  const groups: LogGroup[] = [];
  for (const log of logs) {
    const key = toDateInputValue(new Date(log.createdAt));
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.logs.push(log);
    } else {
      groups.push({ key, label: formatDayLabel(log.createdAt), logs: [log] });
    }
  }
  return groups;
}

function getErrorStatus(err: unknown): number | undefined {
  if (err && typeof err === "object" && "response" in err) {
    return (err as { response?: { status?: number } }).response?.status;
  }
  return undefined;
}

// ─── Thành phần dùng chung ───────────────────────────────────────────────
function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  tone = "quiet",
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; count?: number }[];
  label: string;
  tone?: "accent" | "quiet";
}) {
  const activeCls =
    tone === "accent"
      ? "bg-yellow-500 text-black shadow-sm"
      : "bg-gray-700 text-white shadow-sm";
  return (
    <div
      role="tablist"
      aria-label={label}
      className="inline-flex gap-1 rounded-lg bg-gray-800/80 p-1"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${focusRing} ${
              active ? activeCls : "text-gray-400 hover:text-white"
            }`}
          >
            {opt.label}
            {opt.count !== undefined && (
              <span
                className={`ml-1.5 text-xs tabular-nums ${
                  active ? "opacity-70" : "text-gray-600"
                }`}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function IconButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`grid size-9 place-items-center rounded-lg border border-gray-800 bg-gray-800/60 text-gray-300 transition-colors hover:bg-gray-700 hover:text-white ${focusRing}`}
    >
      {children}
    </button>
  );
}

function PeriodNav({
  label,
  prevLabel,
  nextLabel,
  onPrev,
  onNext,
  showReset,
  resetLabel,
  onReset,
}: {
  label: string;
  prevLabel: string;
  nextLabel: string;
  onPrev: () => void;
  onNext: () => void;
  showReset: boolean;
  resetLabel: string;
  onReset: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-center gap-2">
        <IconButton onClick={onPrev} label={prevLabel}>
          <ChevronLeft className="size-4" />
        </IconButton>
        <span className="min-w-44 text-center text-sm font-semibold text-white tabular-nums">
          {label}
        </span>
        <IconButton onClick={onNext} label={nextLabel}>
          <ChevronRight className="size-4" />
        </IconButton>
      </div>
      <div className="mt-2 flex h-7 justify-center">
        {showReset && (
          <button
            onClick={onReset}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-yellow-400 transition-colors hover:bg-yellow-500/10 ${focusRing}`}
          >
            <RotateCcw className="size-3" />
            {resetLabel}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Biểu đồ theo khoảng ngày ────────────────────────────────────────────
// Số ở giữa biểu đồ là phần TĂNG/GIẢM trong khoảng đó, không cộng dồn với
// điểm nền 100.
function PeriodChart({
  title,
  data,
  loading,
  variant = "compact",
}: {
  title: string;
  data: ScorePeriodDto | null;
  loading: boolean;
  variant?: "featured" | "compact";
}) {
  const featured = variant === "featured";
  const size = featured ? 176 : 104;

  const placeholder = (text: string, pulse: boolean) => (
    <div
      className={`grid place-items-center rounded-full border-[10px] border-gray-800 text-xs text-gray-600 ${
        pulse ? "motion-safe:animate-pulse" : ""
      }`}
      style={{ width: size, height: size }}
    >
      {text}
    </div>
  );

  const plus = data?.totalPositive ?? 0;
  const minus = Math.abs(data?.totalNegative ?? 0);

  const chart = loading ? (
    placeholder("", true)
  ) : data ? (
    <ScoreDonutChart
      totalPositive={data.totalPositive}
      totalNegative={data.totalNegative}
      netScore={data.netChange}
      size={size}
    />
  ) : (
    placeholder("Không có dữ liệu", false)
  );

  if (featured) {
    return (
      <div className="rounded-2xl border border-gray-800 bg-gray-950/60 p-5">
        <p className="mb-4 text-center text-sm font-medium text-gray-300">
          {title}
        </p>
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-10">
          {chart}
          {data && !loading && (
            <dl className="grid grid-cols-3 gap-6 text-center sm:grid-cols-1 sm:gap-3 sm:text-left">
              <div>
                <dt className="text-xs text-gray-500">Điểm cộng</dt>
                <dd className="text-lg font-bold text-green-400 tabular-nums">
                  +{plus}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Điểm trừ</dt>
                <dd className="text-lg font-bold text-red-400 tabular-nums">
                  −{minus}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Lượt chấm</dt>
                <dd className="text-lg font-bold text-white tabular-nums">
                  {data.logCount}
                </dd>
              </div>
            </dl>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-gray-800 bg-gray-950/40 p-3.5">
      <p className="text-xs font-medium text-gray-400 tabular-nums">{title}</p>
      {chart}
      {data && !loading && (
        <div className="text-center">
          <p className="text-xs font-semibold tabular-nums">
            <span className="text-green-400">+{plus}</span>
            <span className="mx-1.5 text-gray-700">/</span>
            <span className="text-red-400">−{minus}</span>
          </p>
          <p className="mt-0.5 text-[11px] text-gray-500">
            {data.logCount} lượt chấm
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Modal xem biểu đồ theo tuần / theo tháng ────────────────────────────
function MyPeriodChartModal({ onClose }: { onClose: () => void }) {
  const today = startOfDay(new Date());
  const currentMonday = getMonday(today);

  const [mode, setMode] = useState<"week" | "month">("week");

  // Kết quả được lưu kèm "key" của khoảng ngày đã tải. Khi key không khớp với
  // khoảng đang chọn thì coi là đang tải → không cần setState("loading") trong effect.
  const [weekAnchor, setWeekAnchor] = useState<Date>(currentMonday);
  const [weekResult, setWeekResult] = useState<{
    key: string;
    data: ScorePeriodDto | null;
  } | null>(null);

  const [monthYear, setMonthYear] = useState(today.getFullYear());
  const [monthNum, setMonthNum] = useState(today.getMonth() + 1);
  const [monthResult, setMonthResult] = useState<{
    key: string;
    weeks: Record<string, ScorePeriodDto | null>;
    total: ScorePeriodDto | null;
  } | null>(null);

  const weekEnd = addDays(weekAnchor, 6);
  const weekKey = toDateInputValue(weekAnchor);
  const weekReady = weekResult !== null && weekResult.key === weekKey;
  const weekLoading = !weekReady;
  const weekData = weekResult && weekReady ? weekResult.data : null;

  const weekRanges = useMemo(
    () => getWeeksInMonth(monthYear, monthNum),
    [monthYear, monthNum],
  );
  const monthKey = `${monthYear}-${monthNum}`;
  const monthReady = monthResult !== null && monthResult.key === monthKey;
  const monthLoading = !monthReady;
  const monthTotal = monthResult && monthReady ? monthResult.total : null;
  const isCurrentWeek = weekAnchor.getTime() === currentMonday.getTime();
  const isCurrentMonth =
    monthYear === today.getFullYear() && monthNum === today.getMonth() + 1;

  // Esc để đóng + khóa cuộn trang phía sau
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  useEffect(() => {
    if (mode !== "week") return;
    let cancelled = false;
    const from = toDateInputValue(weekAnchor);
    const to = toDateInputValue(addDays(weekAnchor, 6));
    scoreApi
      .getMyPeriod(from, to)
      .catch(() => null)
      .then((data) => {
        if (!cancelled) setWeekResult({ key: from, data });
      });
    return () => {
      cancelled = true;
    };
  }, [mode, weekAnchor]);

  useEffect(() => {
    if (mode !== "month") return;
    let cancelled = false;

    const firstDay = toDateInputValue(new Date(monthYear, monthNum - 1, 1));
    const lastDay = toDateInputValue(new Date(monthYear, monthNum, 0));

    Promise.all([
      Promise.all(
        weekRanges.map((range) =>
          scoreApi.getMyPeriod(range.from, range.to).catch(() => null),
        ),
      ),
      scoreApi.getMyPeriod(firstDay, lastDay).catch(() => null),
    ]).then(([weekResults, total]) => {
      if (cancelled) return;
      const weeks: Record<string, ScorePeriodDto | null> = {};
      weekRanges.forEach((range, i) => {
        weeks[range.from] = weekResults[i];
      });
      setMonthResult({ key: monthKey, weeks, total });
    });

    return () => {
      cancelled = true;
    };
  }, [mode, monthKey, monthYear, monthNum, weekRanges]);

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

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/75 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="period-modal-title"
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-gray-800 bg-gray-900 shadow-2xl sm:rounded-3xl"
      >
        <div className="flex items-center justify-between gap-4 border-b border-gray-800 px-6 py-4">
          <h3
            id="period-modal-title"
            className="text-base font-semibold text-white"
          >
            Điểm của tôi theo tuần / tháng
          </h3>
          <button
            onClick={onClose}
            aria-label="Đóng"
            className={`grid size-9 place-items-center rounded-lg text-gray-500 transition-colors hover:bg-gray-800 hover:text-white ${focusRing}`}
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          <div className="mb-5 flex justify-center">
            <Segmented
              label="Chế độ xem"
              tone="accent"
              value={mode}
              onChange={setMode}
              options={[
                { value: "week", label: "Tuần" },
                { value: "month", label: "Tháng" },
              ]}
            />
          </div>

          {mode === "week" ? (
            <>
              <PeriodNav
                label={`${formatShortDate(weekAnchor)} - ${formatShortDate(weekEnd)}`}
                prevLabel="Tuần trước"
                nextLabel="Tuần sau"
                onPrev={goPrevWeek}
                onNext={goNextWeek}
                showReset={!isCurrentWeek}
                resetLabel="Về tuần này"
                onReset={() => setWeekAnchor(currentMonday)}
              />
              <PeriodChart
                variant="featured"
                title="Điểm của bạn trong tuần"
                data={weekData}
                loading={weekLoading}
              />
            </>
          ) : (
            <>
              <PeriodNav
                label={`Tháng ${monthNum}/${monthYear}`}
                prevLabel="Tháng trước"
                nextLabel="Tháng sau"
                onPrev={goPrevMonth}
                onNext={goNextMonth}
                showReset={!isCurrentMonth}
                resetLabel="Về tháng này"
                onReset={() => {
                  setMonthYear(today.getFullYear());
                  setMonthNum(today.getMonth() + 1);
                }}
              />
              <PeriodChart
                variant="featured"
                title={`Tổng cả tháng ${monthNum}/${monthYear}`}
                data={monthTotal}
                loading={monthLoading}
              />

              <p className="mb-3 mt-6 text-sm font-medium text-gray-300">
                Chi tiết từng tuần
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {weekRanges.map((range) => (
                  <PeriodChart
                    key={range.from}
                    title={range.label}
                    data={
                      monthResult && monthReady
                        ? (monthResult.weeks[range.from] ?? null)
                        : null
                    }
                    loading={monthLoading}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Điểm đánh giá ───────────────────────────────────────────────────────
type ScoreState =
  | { status: "loading" }
  | { status: "hidden" } // 403: user không có quyền xem lịch → ẩn hoàn toàn
  | { status: "error" }
  | { status: "ready"; data: ScoreData };

function useMyScore(): { state: ScoreState; reload: () => void } {
  const [state, setState] = useState<ScoreState>({ status: "loading" });
  const [nonce, setNonce] = useState(0);

  // State ban đầu đã là "loading"; các lần tải lại thì reload() tự set "loading"
  // (trong event handler) nên effect chỉ setState trong callback bất đồng bộ.
  useEffect(() => {
    let cancelled = false;
    scoreApi
      .getMyScore()
      .then((result) => {
        if (!cancelled) setState({ status: "ready", data: result });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({ status: getErrorStatus(err) === 403 ? "hidden" : "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [nonce]);

  const reload = useCallback(() => {
    setState({ status: "loading" });
    setNonce((n) => n + 1);
  }, []);

  return { state, reload };
}

function StatusNote({
  level,
  score,
}: {
  level: ScoreSummaryDto["warningLevel"];
  score: number;
}) {
  if (level === "SEVERE") {
    return (
      <div className="flex items-start gap-3 rounded-xl border-l-4 border-red-500 bg-red-500/10 px-4 py-3">
        <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-400" />
        <div>
          <p className="text-sm font-semibold text-red-300">
            Thái độ của bạn đang ở ngưỡng cảnh báo
          </p>
          <p className="mt-0.5 text-xs text-red-300/70">
            Điểm hiện tại: {score}
          </p>
        </div>
      </div>
    );
  }
  if (level === "MILD") {
    return (
      <div className="flex items-start gap-3 rounded-xl border-l-4 border-yellow-500 bg-yellow-500/10 px-4 py-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-yellow-400" />
        <div>
          <p className="text-sm font-semibold text-yellow-300">
            Điểm của bạn thấp, hãy cải thiện thêm
          </p>
          <p className="mt-0.5 text-xs text-yellow-300/70">
            Điểm hiện tại: {score}
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-3 rounded-xl border-l-4 border-green-500 bg-green-500/10 px-4 py-3">
      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-400" />
      <div>
        <p className="text-sm font-semibold text-green-300">
          Bạn đang giữ điểm tốt
        </p>
        <p className="mt-0.5 text-xs text-green-300/70">
          Điểm hiện tại: {score}
        </p>
      </div>
    </div>
  );
}

function ScoreSkeleton() {
  return (
    <div className="rounded-3xl border border-gray-800 bg-gray-900 p-6 sm:p-8">
      <div className="space-y-2">
        <div className="h-6 w-40 rounded bg-gray-800 motion-safe:animate-pulse" />
        <div className="h-4 w-64 max-w-full rounded bg-gray-800/70 motion-safe:animate-pulse" />
      </div>
      <div className="mt-8 flex flex-col items-center gap-6 sm:flex-row">
        <div className="size-44 rounded-full border-[14px] border-gray-800 motion-safe:animate-pulse" />
        <div className="w-full flex-1 space-y-3">
          <div className="h-14 rounded-xl bg-gray-800/70 motion-safe:animate-pulse" />
          <div className="h-16 rounded-xl bg-gray-800/50 motion-safe:animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function ScoreError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8 text-center">
      <p className="text-sm font-medium text-white">
        Không tải được điểm đánh giá
      </p>
      <p className="mt-1 text-xs text-gray-500">
        Kiểm tra kết nối mạng rồi thử lại.
      </p>
      <button
        onClick={onRetry}
        className={`mt-4 inline-flex items-center gap-1.5 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-yellow-400 transition-colors hover:bg-gray-700 ${focusRing}`}
      >
        <RotateCcw className="size-3.5" />
        Thử lại
      </button>
    </div>
  );
}

function ScorePanel({ data }: { data: ScoreData }) {
  const [filter, setFilter] = useState<"all" | "plus" | "minus">("all");
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const closeModal = useCallback(() => setShowPeriodModal(false), []);

  const counts = useMemo(
    () => ({
      all: data.logs.length,
      plus: data.logs.filter((l) => l.points > 0).length,
      minus: data.logs.filter((l) => l.points <= 0).length,
    }),
    [data.logs],
  );

  const groups = useMemo(() => {
    const visible = data.logs.filter((l) =>
      filter === "all"
        ? true
        : filter === "plus"
          ? l.points > 0
          : l.points <= 0,
    );
    return groupLogsByDay(visible);
  }, [data.logs, filter]);

  return (
    <section className="overflow-hidden rounded-3xl border border-gray-800 bg-gray-900">
      {/* Đầu panel */}
      <div className="flex flex-wrap items-start justify-between gap-4 px-6 pt-6 sm:px-8 sm:pt-8">
        <div>
          <h2 className="text-xl font-bold text-white">Điểm đánh giá</h2>
          <p className="mt-1 text-sm text-gray-400">
            Dựa trên thái độ và ý thức học tập của bạn
          </p>
        </div>
        <button
          onClick={() => setShowPeriodModal(true)}
          className={`inline-flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-yellow-400 ${focusRing}`}
        >
          <BarChart3 className="size-4" />
          Xem theo tuần / tháng
        </button>
      </div>

      {/* Điểm hiện tại */}
      <div className="flex flex-col items-center gap-8 px-6 py-8 sm:flex-row sm:px-8">
        <div className="shrink-0">
          <ScoreDonutChart
            totalPositive={data.totalPositive}
            totalNegative={data.totalNegative}
            netScore={data.netScore}
            size={190}
          />
        </div>

        <div className="w-full min-w-0 flex-1 space-y-4">
          <StatusNote level={data.warningLevel} score={data.netScore} />

          <dl className="grid grid-cols-3 divide-x divide-gray-800 rounded-xl border border-gray-800 bg-gray-950/50">
            <div className="px-4 py-3">
              <dt className="text-xs text-gray-500">Điểm cộng</dt>
              <dd className="mt-0.5 text-xl font-bold text-green-400 tabular-nums">
                +{data.totalPositive}
              </dd>
            </div>
            <div className="px-4 py-3">
              <dt className="text-xs text-gray-500">Điểm trừ</dt>
              <dd className="mt-0.5 text-xl font-bold text-red-400 tabular-nums">
                −{Math.abs(data.totalNegative)}
              </dd>
            </div>
            <div className="px-4 py-3">
              <dt className="text-xs text-gray-500">Lượt chấm</dt>
              <dd className="mt-0.5 text-xl font-bold text-white tabular-nums">
                {data.logs.length}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Lịch sử chấm điểm */}
      <div className="border-t border-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 sm:px-8">
          <h3 className="text-sm font-semibold text-white">
            Lịch sử chấm điểm
          </h3>
          <Segmented
            label="Lọc lịch sử"
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: "Tất cả", count: counts.all },
              { value: "plus", label: "Cộng", count: counts.plus },
              { value: "minus", label: "Trừ", count: counts.minus },
            ]}
          />
        </div>

        <div className="max-h-[26rem] overflow-y-auto">
          {groups.length === 0 ? (
            <p className="px-6 pb-8 pt-2 text-center text-sm text-gray-600">
              {counts.all === 0
                ? "Chưa có lượt chấm điểm nào."
                : "Không có lượt nào trong mục này."}
            </p>
          ) : (
            groups.map((group) => (
              <div key={group.key}>
                <p className="sticky top-0 z-10 bg-gray-900/95 px-6 py-2 text-xs font-medium text-gray-500 backdrop-blur sm:px-8">
                  {group.label}
                </p>
                <ul className="divide-y divide-gray-800/70">
                  {group.logs.map((log) => {
                    const positive = log.points > 0;
                    return (
                      <li
                        key={log.id}
                        className="flex items-start gap-4 px-6 py-3.5 sm:px-8"
                      >
                        <span
                          className={`grid h-8 w-12 shrink-0 place-items-center rounded-lg text-sm font-bold tabular-nums ${
                            positive
                              ? "bg-green-500/10 text-green-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {positive ? "+" : ""}
                          {log.points}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-white">
                            {log.reasonLabel}
                          </p>
                          {log.note && (
                            <p className="mt-0.5 text-xs leading-relaxed text-gray-400">
                              {log.note}
                            </p>
                          )}
                          <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-gray-600">
                            <Clock className="size-3" />
                            <span className="tabular-nums">
                              {formatTime(log.createdAt)}
                            </span>
                            <span>bởi {log.createdByName}</span>
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}
        </div>
      </div>

      {showPeriodModal && <MyPeriodChartModal onClose={closeModal} />}
    </section>
  );
}

// ─── Thẻ thông tin tài khoản ─────────────────────────────────────────────
function IdentityCard() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  return (
    <aside className="overflow-hidden rounded-3xl border border-gray-800 bg-gray-900">
      <div className="flex flex-col items-center px-6 pb-6 pt-8 text-center">
        <div className="size-24 overflow-hidden rounded-full ring-2 ring-yellow-500 ring-offset-4 ring-offset-gray-900">
          {isAdmin ? (
            <img
              src="/admin.jpg"
              alt="Admin"
              className="size-full object-cover"
            />
          ) : (
            <div className="grid size-full select-none place-items-center bg-yellow-500 text-4xl font-bold text-black">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <p className="mt-5 w-full break-words text-base font-semibold text-white">
          {user?.email}
        </p>
        <span
          className={`mt-2 rounded-full px-2.5 py-1 text-xs font-medium ${
            isAdmin
              ? "bg-yellow-500/15 text-yellow-400"
              : "bg-gray-800 text-gray-300"
          }`}
        >
          {user?.role}
        </span>
      </div>

      <dl className="divide-y divide-gray-800 border-t border-gray-800 text-sm">
        <div className="flex items-center justify-between gap-4 px-6 py-3.5">
          <dt className="text-gray-500">Vai trò</dt>
          <dd className="font-medium text-white">{user?.role}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 px-6 py-3.5">
          <dt className="text-gray-500">ID tài khoản</dt>
          <dd className="font-medium text-white tabular-nums">#{user?.id}</dd>
        </div>
      </dl>
    </aside>
  );
}

// ─── Trang chính ─────────────────────────────────────────────────────────
export default function Profile() {
  const { state, reload } = useMyScore();

  // Không đủ điều kiện xem điểm → chỉ hiện thẻ tài khoản, căn giữa
  if (state.status === "hidden") {
    return (
      <div className="min-h-screen bg-black px-4 py-10 sm:py-14">
        <div className="mx-auto w-full max-w-md">
          <PageTitle />
          <IdentityCard />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-4 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-5xl">
        <PageTitle />
        <div className="grid items-start gap-6 lg:grid-cols-[18.5rem_minmax(0,1fr)]">
          <div className="lg:sticky lg:top-6">
            <IdentityCard />
          </div>

          {state.status === "loading" && <ScoreSkeleton />}
          {state.status === "error" && <ScoreError onRetry={reload} />}
          {state.status === "ready" && <ScorePanel data={state.data} />}
        </div>
      </div>
    </div>
  );
}

function BackButton() {
  // Không phụ thuộc router: quay lại trang trước, nếu mở trực tiếp trang này
  // (không có lịch sử) thì về trang chủ.
  const goBack = (): void => {
    if (window.history.length > 1) window.history.back();
    else window.location.assign("/");
  };

  return (
    <button
      onClick={goBack}
      className={`-ml-2.5 mb-5 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-900 hover:text-white ${focusRing}`}
    >
      <ArrowLeft className="size-4" />
      Quay lại
    </button>
  );
}

function PageTitle() {
  return (
    <header className="mb-8">
      <BackButton />
      <h1 className="text-2xl font-bold text-white sm:text-3xl">
        Tài khoản của tôi
      </h1>
      <p className="mt-1.5 text-sm text-gray-400">
        Thông tin tài khoản và điểm đánh giá của bạn
      </p>
    </header>
  );
}
