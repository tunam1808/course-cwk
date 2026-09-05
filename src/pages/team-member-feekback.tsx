import { useEffect, useState } from "react";
import { X, Smile, Battery, HelpCircle, MessageSquare } from "lucide-react";
import { scheduleApi, type ScheduleFeedbackInput } from "@/api/schedule.api";
import { showSuccess, showError } from "@/common/toast";
import { isAxiosError } from "axios";

const getErrorMessage = (err: unknown, fallback: string): string => {
  if (isAxiosError<{ message?: string }>(err)) {
    return err.response?.data?.message ?? fallback;
  }
  return fallback;
};

// Ngưỡng coi là "không vui" để hiện ô lý do
const UNHAPPY_THRESHOLD = 5;

export interface FeedbackTargetItem {
  id: number;
  type: "HOC" | "CHOI";
  title: string;
  startTime: string;
  endTime: string;
}

// ─── Thang điểm dạng "tô sáng dồn" — chọn số nào thì các số nhỏ hơn cũng sáng ──
function ScaleRating({
  max,
  value,
  onChange,
}: {
  max: number;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`w-8 h-8 rounded-lg text-xs font-bold border transition-all ${
            n <= value
              ? "bg-yellow-500 text-black border-yellow-500"
              : "bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700"
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

const emptyAnswers = {
  moodScore: 0,
  moodReason: "",
  understandScore: 0,
  understandNote: "",
  energyScore: 0,
  difficulty: "",
  suggestion: "",
};

export default function ScheduleFeedbackForm({
  item,
  extraNote,
  onSubmitted,
  onClose,
}: {
  item: FeedbackTargetItem;
  extraNote?: string;
  onSubmitted: (scheduleItemId: number) => void;
  onClose: () => void;
}) {
  const [answers, setAnswers] = useState(emptyAnswers);
  const [submitting, setSubmitting] = useState(false);

  const isStudySession = item.type === "HOC";

  useEffect(() => {
    setAnswers(emptyAnswers);
  }, [item.id]);

  const handleSubmit = async (): Promise<void> => {
    if (!answers.moodScore || !answers.energyScore) {
      showError("Vui lòng chọn điểm cho các mục bắt buộc");
      return;
    }
    if (isStudySession && !answers.understandScore) {
      showError("Vui lòng chọn điểm hiểu bài");
      return;
    }

    setSubmitting(true);
    try {
      const payload: ScheduleFeedbackInput = {
        scheduleItemId: item.id,
        moodScore: answers.moodScore,
        moodReason: answers.moodReason.trim() || undefined,
        energyScore: answers.energyScore,
        difficulty: answers.difficulty.trim() || undefined,
        suggestion: answers.suggestion.trim() || undefined,
        ...(isStudySession
          ? {
              understandScore: answers.understandScore,
              understandNote: answers.understandNote.trim() || undefined,
            }
          : {}),
      };
      await scheduleApi.submitFeedback(payload);
      showSuccess("Cảm ơn bạn đã đánh giá!");
      onSubmitted(item.id);
    } catch (err: unknown) {
      showError(getErrorMessage(err, "Có lỗi xảy ra, thử lại sau"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className="text-lg font-bold text-yellow-400">
              Đánh giá buổi học
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {item.title} · {item.startTime}–{item.endTime}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {extraNote && (
          <p className="text-[11px] text-gray-500 mb-4">{extraNote}</p>
        )}

        <div className="space-y-5 mt-4">
          {/* 1. Mức độ vui */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-200 mb-2">
              <Smile className="w-4 h-4 text-yellow-400" />
              Hôm nay bạn thấy học/làm việc/đi chơi, vui không?
            </label>
            <ScaleRating
              max={10}
              value={answers.moodScore}
              onChange={(v) => setAnswers({ ...answers, moodScore: v })}
            />
            {answers.moodScore > 0 &&
              answers.moodScore <= UNHAPPY_THRESHOLD && (
                <textarea
                  value={answers.moodReason}
                  onChange={(e) =>
                    setAnswers({ ...answers, moodReason: e.target.value })
                  }
                  placeholder="Lý do bạn cảm thấy không vui..."
                  rows={2}
                  className="w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400 transition-colors resize-none"
                />
              )}
          </div>

          {/* 2. Hiểu bài — chỉ hiện với buổi học */}
          {isStudySession && (
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-200 mb-2">
                <HelpCircle className="w-4 h-4 text-yellow-400" />
                Hôm nay có hiểu bài không?
              </label>
              <ScaleRating
                max={5}
                value={answers.understandScore}
                onChange={(v) => setAnswers({ ...answers, understandScore: v })}
              />
              <textarea
                value={answers.understandNote}
                onChange={(e) =>
                  setAnswers({ ...answers, understandNote: e.target.value })
                }
                placeholder="Chỗ nào chưa hiểu (nếu có)..."
                rows={2}
                className="w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400 transition-colors resize-none"
              />
            </div>
          )}

          {/* 3. Năng lượng */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-200 mb-2">
              <Battery className="w-4 h-4 text-yellow-400" />
              Năng lượng của bạn hôm nay thế nào?
            </label>
            <ScaleRating
              max={10}
              value={answers.energyScore}
              onChange={(v) => setAnswers({ ...answers, energyScore: v })}
            />
          </div>

          {/* 4. Khó khăn */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Bạn có khó khăn hay vấn đề gì cần mọi người giúp không?
            </label>
            <textarea
              value={answers.difficulty}
              onChange={(e) =>
                setAnswers({ ...answers, difficulty: e.target.value })
              }
              placeholder="Để trống nếu không có..."
              rows={2}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400 transition-colors resize-none"
            />
          </div>

          {/* 5. Góp ý */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-200 mb-2">
              <MessageSquare className="w-4 h-4 text-yellow-400" />
              Bạn có góp ý về cách giảng dạy hay ý kiến để mọi người gắn kết hơn
              không?
            </label>
            <textarea
              value={answers.suggestion}
              onChange={(e) =>
                setAnswers({ ...answers, suggestion: e.target.value })
              }
              placeholder="Để trống nếu không có..."
              rows={2}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400 transition-colors resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-all disabled:opacity-40"
          >
            {extraNote ? "Để sau" : "Hủy"}
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 text-black font-bold rounded-lg transition-all"
          >
            {submitting ? "Đang gửi..." : "Gửi đánh giá"}
          </button>
        </div>
      </div>
    </div>
  );
}
