import { useEffect, useState } from "react";
import {
  Smile,
  Battery,
  HelpCircle,
  CalendarDays,
  Clock,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { scheduleApi, type ScheduleFeedbackDto } from "@/api/schedule.api";
import { showSuccess, showError } from "@/common/toast";

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}/${d.getUTCFullYear()}`;
};

const scoreColor = (score: number, max: number): string => {
  const ratio = score / max;
  if (ratio >= 0.7) return "text-green-400";
  if (ratio >= 0.4) return "text-yellow-400";
  return "text-red-400";
};

export default function ScheduleFeedbackManagement() {
  const [list, setList] = useState<ScheduleFeedbackDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  const fetchList = async (): Promise<void> => {
    setLoading(true);
    try {
      const data = await scheduleApi.getFeedbackList();
      setList(data);
    } catch {
      showError("Không thể tải danh sách đánh giá");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleDeleteOne = async (id: number): Promise<void> => {
    setDeletingId(id);
    try {
      await scheduleApi.deleteFeedback(id);
      showSuccess("Đã xóa đánh giá!");
      setList((prev) => prev.filter((fb) => fb.id !== id));
    } catch {
      showError("Không thể xóa đánh giá này");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAll = async (): Promise<void> => {
    setDeletingAll(true);
    try {
      const res = await scheduleApi.deleteAllFeedback();
      showSuccess(`Đã xóa ${res.count} đánh giá!`);
      setList([]);
      setConfirmDeleteAll(false);
    } catch {
      showError("Không thể xóa tất cả đánh giá");
    } finally {
      setDeletingAll(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-yellow-400">
              Đánh giá buổi học / buổi đi chơi
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {loading ? "Đang tải..." : `${list.length} đánh giá đã nhận`}
            </p>
          </div>

          {list.length > 0 && !confirmDeleteAll && (
            <button
              onClick={() => setConfirmDeleteAll(true)}
              className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-gray-800 hover:bg-red-500/20 border border-gray-700 hover:border-red-500/40 text-gray-300 hover:text-red-400 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Xóa tất cả
            </button>
          )}
        </div>

        {/* Xác nhận xóa tất cả */}
        {confirmDeleteAll && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-4">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-sm text-gray-200 flex-1">
              Xóa toàn bộ <strong>{list.length}</strong> đánh giá? Thao tác này
              không thể hoàn tác.
            </p>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => setConfirmDeleteAll(false)}
                disabled={deletingAll}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-800 hover:bg-gray-700 text-white transition-all disabled:opacity-40"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteAll}
                disabled={deletingAll}
                className="px-3 py-1.5 rounded-lg text-sm font-bold bg-red-500 hover:bg-red-400 text-white transition-all disabled:opacity-40"
              >
                {deletingAll ? "Đang xóa..." : "Xác nhận xóa hết"}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-10 text-center text-gray-500 text-sm">
            Đang tải...
          </div>
        ) : list.length === 0 ? (
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-10 text-center text-gray-500 text-sm">
            Chưa có đánh giá nào.
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((fb) => (
              <div
                key={fb.id}
                className="bg-gray-900 border border-gray-700 rounded-xl p-5"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {fb.scheduleItem.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        {formatDate(fb.scheduleItem.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {fb.scheduleItem.startTime}–{fb.scheduleItem.endTime}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-sm text-white">
                        {fb.user.fullName || fb.user.email}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {fb.user.email}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteOne(fb.id)}
                      disabled={deletingId === fb.id}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-40 transition-all"
                      title="Xóa đánh giá này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                  <div className="bg-gray-800/60 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-1">
                      <Smile className="w-3 h-3" /> Vui vẻ
                    </div>
                    <p
                      className={`text-lg font-bold ${scoreColor(fb.moodScore, 10)}`}
                    >
                      {fb.moodScore}/10
                    </p>
                  </div>

                  {fb.understandScore !== null && (
                    <div className="bg-gray-800/60 rounded-lg p-3">
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-1">
                        <HelpCircle className="w-3 h-3" /> Hiểu bài
                      </div>
                      <p
                        className={`text-lg font-bold ${scoreColor(fb.understandScore, 5)}`}
                      >
                        {fb.understandScore}/5
                      </p>
                    </div>
                  )}

                  <div className="bg-gray-800/60 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-1">
                      <Battery className="w-3 h-3" /> Năng lượng
                    </div>
                    <p
                      className={`text-lg font-bold ${scoreColor(fb.energyScore, 10)}`}
                    >
                      {fb.energyScore}/10
                    </p>
                  </div>
                </div>

                {(fb.moodReason ||
                  fb.understandNote ||
                  fb.difficulty ||
                  fb.suggestion) && (
                  <div className="space-y-1.5 text-sm border-t border-gray-800 pt-3">
                    {fb.moodReason && (
                      <p className="text-gray-300">
                        <span className="text-gray-500">Lý do không vui:</span>{" "}
                        {fb.moodReason}
                      </p>
                    )}
                    {fb.understandNote && (
                      <p className="text-gray-300">
                        <span className="text-gray-500">Chưa hiểu chỗ:</span>{" "}
                        {fb.understandNote}
                      </p>
                    )}
                    {fb.difficulty && (
                      <p className="text-gray-300">
                        <span className="text-gray-500">Khó khăn:</span>{" "}
                        {fb.difficulty}
                      </p>
                    )}
                    {fb.suggestion && (
                      <p className="text-gray-300">
                        <span className="text-gray-500">Góp ý:</span>{" "}
                        {fb.suggestion}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
