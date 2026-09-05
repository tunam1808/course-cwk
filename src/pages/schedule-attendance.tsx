import { useEffect, useState } from "react";
import { X, UserCheck, Users, Check, Ban, Lock } from "lucide-react";
import { scheduleApi, type ScheduleAccessDto } from "@/api/schedule.api";
import { showSuccess, showError } from "@/common/toast";
import { isAxiosError } from "axios";

const getErrorMessage = (err: unknown, fallback: string): string => {
  if (isAxiosError<{ message?: string }>(err)) {
    return err.response?.data?.message ?? fallback;
  }
  return fallback;
};

export interface AttendanceTargetItem {
  id: number;
  title: string;
  date: string; // "dd/mm" hoặc bất kỳ chuỗi hiển thị nào
  startTime: string;
  endTime: string;
}

export default function ScheduleAttendanceModal({
  item,
  locked = false,
  onClose,
  onSaved,
}: {
  item: AttendanceTargetItem;
  // true khi buổi đã qua ngày (đã "điểm danh hoàn tất") — bắt buộc nhập
  // đúng mật khẩu admin mới cho lưu thay đổi.
  locked?: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [accounts, setAccounts] = useState<ScheduleAccessDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // roster: userId -> present (null = đã chọn tham gia nhưng chưa tick)
  const [roster, setRoster] = useState<Map<number, boolean | null>>(new Map());
  const [adminPassword, setAdminPassword] = useState("");

  useEffect(() => {
    const load = async (): Promise<void> => {
      setLoading(true);
      try {
        const [accessList, attendance] = await Promise.all([
          scheduleApi.getScheduleAccessList(),
          scheduleApi.getAttendance(item.id),
        ]);
        setAccounts(accessList);
        const map = new Map<number, boolean | null>();
        attendance.forEach((a) => map.set(a.userId, a.present));
        setRoster(map);
      } catch {
        showError("Không thể tải danh sách điểm danh");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [item.id]);

  const isAllSelected =
    accounts.length > 0 && accounts.every((a) => roster.has(a.userId));

  const toggleParticipant = (userId: number): void => {
    setRoster((prev) => {
      const next = new Map(prev);
      if (next.has(userId)) next.delete(userId);
      else next.set(userId, null);
      return next;
    });
  };

  const selectAll = (): void => {
    setRoster((prev) => {
      const next = new Map(prev);
      accounts.forEach((a) => {
        if (!next.has(a.userId)) next.set(a.userId, null);
      });
      return next;
    });
  };

  const deselectAll = (): void => {
    setRoster(new Map());
  };

  const setPresent = (userId: number, present: boolean): void => {
    setRoster((prev) => {
      const next = new Map(prev);
      next.set(userId, present);
      return next;
    });
  };

  const handleSave = async (): Promise<void> => {
    if (locked && !adminPassword.trim()) {
      showError("Vui lòng nhập mật khẩu admin để sửa điểm danh buổi đã qua");
      return;
    }
    setSaving(true);
    try {
      const participants = Array.from(roster.entries()).map(
        ([userId, present]) => ({
          userId,
          present,
        }),
      );
      await scheduleApi.saveAttendance(
        item.id,
        participants,
        locked ? adminPassword : undefined,
      );
      showSuccess("Đã lưu điểm danh!");
      onSaved();
    } catch (err: unknown) {
      showError(getErrorMessage(err, "Có lỗi xảy ra, thử lại sau"));
      if (locked) setAdminPassword("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className="text-lg font-bold text-yellow-400 flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Điểm danh
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {item.title} · {item.date} · {item.startTime}–{item.endTime}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {locked && (
          <div className="flex items-start gap-2 mt-3 mb-1 px-3 py-2.5 rounded-lg bg-yellow-400/10 border border-yellow-400/30">
            <Lock className="w-3.5 h-3.5 text-yellow-400 mt-0.5 shrink-0" />
            <p className="text-[11px] text-yellow-300 leading-snug">
              Buổi này đã điểm danh hoàn tất. Cần nhập đúng mật khẩu tài khoản
              admin để lưu thay đổi.
            </p>
          </div>
        )}

        {loading ? (
          <div className="py-10 text-center text-gray-500 text-sm">
            Đang tải...
          </div>
        ) : accounts.length === 0 ? (
          <div className="py-10 text-center text-gray-500 text-sm">
            Chưa có tài khoản nào được cấp quyền xem lịch để điểm danh.
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mt-4 mb-3">
              <button
                onClick={isAllSelected ? deselectAll : selectAll}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  isAllSelected
                    ? "bg-yellow-500 text-black border-yellow-500"
                    : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                {isAllSelected ? "Bỏ chọn cả team" : "Chọn cả team"}
              </button>
              <span className="text-xs text-gray-500">
                Đã chọn {roster.size}/{accounts.length} người
              </span>
            </div>

            <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
              {accounts.map((a) => {
                const selected = roster.has(a.userId);
                const present = roster.get(a.userId);
                return (
                  <div
                    key={a.userId}
                    className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 transition-all ${
                      selected
                        ? "bg-gray-800/80 border-gray-700"
                        : "bg-gray-900 border-gray-800"
                    }`}
                  >
                    <label className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleParticipant(a.userId)}
                        className="w-4 h-4 accent-yellow-500 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm text-white truncate">
                          {a.user.fullName || a.user.email}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate">
                          {a.user.email}
                        </p>
                      </div>
                    </label>

                    {selected && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => setPresent(a.userId, true)}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
                            present === true
                              ? "bg-green-500/20 text-green-400 border-green-500/40"
                              : "bg-gray-800 text-gray-500 border-gray-700 hover:bg-gray-700"
                          }`}
                        >
                          <Check className="w-3 h-3" />
                          Có mặt
                        </button>
                        <button
                          onClick={() => setPresent(a.userId, false)}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
                            present === false
                              ? "bg-red-500/20 text-red-400 border-red-500/40"
                              : "bg-gray-800 text-gray-500 border-gray-700 hover:bg-gray-700"
                          }`}
                        >
                          <Ban className="w-3 h-3" />
                          Vắng
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {locked && !loading && accounts.length > 0 && (
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Mật khẩu admin
            </label>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Nhập mật khẩu để xác nhận sửa điểm danh"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400 transition-colors"
            />
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-all disabled:opacity-40"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading || (locked && !adminPassword.trim())}
            className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 text-black font-bold rounded-lg transition-all"
          >
            {saving ? "Đang lưu..." : "Lưu điểm danh"}
          </button>
        </div>
      </div>
    </div>
  );
}
