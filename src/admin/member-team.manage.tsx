import { useEffect, useState } from "react";
import { Search, UserPlus, X, Shield, User as UserIcon } from "lucide-react";
import {
  scheduleApi,
  type ScheduleAccessDto,
  type UserSearchResultDto,
  type ScheduleAccessType,
} from "@/api/schedule.api";
import { showSuccess, showError } from "@/common/toast";
import { isAxiosError } from "axios";

const getErrorMessage = (err: unknown, fallback: string): string => {
  if (isAxiosError<{ message?: string }>(err)) {
    return err.response?.data?.message ?? fallback;
  }
  return fallback;
};

const ACCESS_TYPE_LABEL: Record<ScheduleAccessType, string> = {
  TEAM_MEMBER: "Thành viên team",
  NORMAL: "Người dùng thường",
};

export default function ScheduleAccessManagement() {
  const [accessList, setAccessList] = useState<ScheduleAccessDto[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchResultDto[]>([]);
  const [searching, setSearching] = useState(false);
  const [grantingId, setGrantingId] = useState<number | null>(null);
  const [revokingId, setRevokingId] = useState<number | null>(null);
  const [pickedType, setPickedType] = useState<ScheduleAccessType>("NORMAL");

  const fetchAccessList = async (): Promise<void> => {
    setLoadingList(true);
    try {
      const data = await scheduleApi.getScheduleAccessList();
      setAccessList(data);
    } catch {
      showError("Không thể tải danh sách quyền xem lịch");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchAccessList();
  }, []);

  // Debounce tìm kiếm 300ms
  useEffect(() => {
    const handle = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setSearching(true);
      try {
        const data = await scheduleApi.searchUsers(query.trim());
        setResults(data);
      } catch {
        showError("Không thể tìm kiếm tài khoản");
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [query]);

  const grantedUserIds = new Set(accessList.map((a) => a.userId));

  const handleGrant = async (email: string, userId: number): Promise<void> => {
    setGrantingId(userId);
    try {
      await scheduleApi.grantScheduleAccess(email, pickedType);
      showSuccess("Đã cấp quyền xem lịch!");
      fetchAccessList();
    } catch (err: unknown) {
      showError(getErrorMessage(err, "Có lỗi xảy ra"));
    } finally {
      setGrantingId(null);
    }
  };

  const handleRevoke = async (id: number): Promise<void> => {
    setRevokingId(id);
    try {
      await scheduleApi.revokeScheduleAccess(id);
      showSuccess("Đã thu hồi quyền xem lịch!");
      fetchAccessList();
    } catch (err: unknown) {
      showError(getErrorMessage(err, "Có lỗi xảy ra"));
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 space-y-5">
      <div>
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
          Quyền xem thời khóa biểu
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          Chỉ những tài khoản được cấp quyền dưới đây mới xem được lịch (ngoài
          admin).
        </p>
      </div>

      {/* ── Tìm kiếm & cấp quyền ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm theo email hoặc tên..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400 transition-colors"
            />
          </div>

          <select
            value={pickedType}
            onChange={(e) =>
              setPickedType(e.target.value as ScheduleAccessType)
            }
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400 transition-colors"
          >
            <option value="NORMAL">Người dùng thường</option>
            <option value="TEAM_MEMBER">Thành viên team</option>
          </select>
        </div>

        {query.trim() && (
          <div className="border border-gray-800 rounded-lg divide-y divide-gray-800 max-h-64 overflow-y-auto">
            {searching ? (
              <div className="p-4 text-center text-xs text-gray-500">
                Đang tìm...
              </div>
            ) : results.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-500">
                Không tìm thấy tài khoản nào khớp "{query}"
              </div>
            ) : (
              results.map((u) => {
                const already = grantedUserIds.has(u.id);
                return (
                  <div
                    key={u.id}
                    className="flex items-center justify-between gap-3 px-4 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-white truncate">{u.email}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {u.fullName && (
                          <span className="text-xs text-gray-500 truncate">
                            {u.fullName}
                          </span>
                        )}
                        {u.role === "ADMIN" && (
                          <span className="flex items-center gap-1 text-[10px] text-yellow-400">
                            <Shield className="w-2.5 h-2.5" /> Admin
                          </span>
                        )}
                      </div>
                    </div>

                    {already ? (
                      <span className="text-xs text-gray-500 shrink-0">
                        Đã có quyền
                      </span>
                    ) : (
                      <button
                        onClick={() => handleGrant(u.email, u.id)}
                        disabled={grantingId === u.id}
                        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 text-black transition-all"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        {grantingId === u.id ? "Đang cấp..." : "Cấp quyền"}
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* ── Danh sách đã cấp quyền ── */}
      <div>
        <p className="text-xs font-medium text-gray-400 mb-2">
          Đã cấp quyền ({accessList.length})
        </p>

        {loadingList ? (
          <p className="text-xs text-gray-500 py-4 text-center">Đang tải...</p>
        ) : accessList.length === 0 ? (
          <p className="text-xs text-gray-500 py-4 text-center">
            Chưa có tài khoản nào được cấp quyền xem lịch.
          </p>
        ) : (
          <div className="space-y-2">
            {accessList.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between gap-3 bg-gray-800/60 border border-gray-800 rounded-lg px-3 py-2.5"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center shrink-0">
                    <UserIcon className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">
                      {a.user.email}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {a.user.fullName || "—"} · {ACCESS_TYPE_LABEL[a.type]}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleRevoke(a.id)}
                  disabled={revokingId === a.id}
                  className="shrink-0 p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-40 transition-all"
                  title="Thu hồi quyền"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
