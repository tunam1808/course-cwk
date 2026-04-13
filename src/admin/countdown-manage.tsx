import { useEffect, useState } from "react";
import { countdownApi, type CountdownState } from "@/api/countdown.api";
import { showSuccess, showError } from "@/common/toast";

const DURATION_OPTIONS = [
  { days: 3, label: "3 ngày" },
  { days: 7, label: "7 ngày" },
  { days: 15, label: "15 ngày" },
  { days: 30, label: "30 ngày" },
];

export default function CountdownManagement() {
  const [setting, setSetting] = useState<CountdownState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDays, setSelectedDays] = useState(7);
  const [visible, setVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);

  // ─── Lucky Number ───────────────────────────────────────────────────────────
  const [showLuckyNumber, setShowLuckyNumber] = useState(false);
  const [savingLucky, setSavingLucky] = useState(false);

  const fetchSetting = async () => {
    try {
      const data = await countdownApi.getCountdown();
      setSetting(data);
      setVisible(data.visible);
      if (data.durationMs) {
        setSelectedDays(data.durationMs / (24 * 60 * 60 * 1000));
      }
    } catch {
      showError("Không thể tải cài đặt ưu đãi");
    } finally {
      setLoading(false);
    }
  };

  const fetchLuckySetting = async () => {
    try {
      const data = await countdownApi.getLuckySetting();
      setShowLuckyNumber(data.showLuckyNumber);
    } catch {
      showError("Không thể tải cài đặt số may mắn");
    }
  };

  useEffect(() => {
    fetchSetting();
    fetchLuckySetting();
  }, []);

  // Tick đồng hồ preview
  useEffect(() => {
    if (!setting?.active || !setting.startTime || !setting.durationMs) {
      setTimeLeft(null);
      setExpired(false);
      return;
    }

    const endTime = new Date(setting.startTime).getTime() + setting.durationMs;

    const tick = () => {
      const remaining = endTime - Date.now();
      if (remaining <= 0) {
        setExpired(true);
        setTimeLeft(null);
        return;
      }
      setExpired(false);
      const d = Math.floor(remaining / 86400000);
      const h = Math.floor((remaining % 86400000) / 3600000);
      const m = Math.floor((remaining % 3600000) / 60000);
      const s = Math.floor((remaining % 60000) / 1000);
      setTimeLeft(
        `${d} ngày, ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
      );
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [setting]);

  const handleStart = async () => {
    setSaving(true);
    try {
      await countdownApi.updateCountdown({
        active: true,
        visible,
        durationMs: selectedDays * 24 * 60 * 60 * 1000,
        resetTimer: true,
      });
      showSuccess("Đã bắt đầu đếm ngược!");
      fetchSetting();
    } catch {
      showError("Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  const handleStop = async () => {
    setSaving(true);
    try {
      await countdownApi.updateCountdown({
        active: false,
        visible: false,
        durationMs: null,
      });
      showSuccess("Đã dừng đồng hồ!");
      fetchSetting();
    } catch {
      showError("Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVisible = async (checked: boolean) => {
    setVisible(checked);
    if (!setting?.active) return;
    try {
      await countdownApi.updateCountdown({
        active: setting.active,
        visible: checked,
        durationMs: setting.durationMs,
      });
      showSuccess(checked ? "Đã hiển thị đồng hồ" : "Đã ẩn đồng hồ");
      fetchSetting();
    } catch {
      showError("Có lỗi xảy ra");
    }
  };

  const handleToggleLuckyNumber = async (checked: boolean) => {
    setSavingLucky(true);
    try {
      await countdownApi.updateLuckySetting(checked);
      setShowLuckyNumber(checked);
      showSuccess(checked ? "Đã bật số may mắn" : "Đã tắt số may mắn");
    } catch {
      showError("Có lỗi xảy ra");
    } finally {
      setSavingLucky(false);
    }
  };

  const getStatusBadge = () => {
    if (!setting?.active)
      return (
        <span className="px-2 py-1 rounded-full text-xs bg-gray-700 text-gray-300">
          Chưa bật
        </span>
      );
    if (expired)
      return (
        <span className="px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400">
          Hết hạn
        </span>
      );
    return (
      <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
        Đang chạy
      </span>
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-yellow-400 mb-6">
        Quản lý ưu đãi
      </h2>

      {loading ? (
        <p className="text-gray-400">Đang tải...</p>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ====== CỘT TRÁI: CÀI ĐẶT ====== */}
            <div className="space-y-4">
              {/* Chọn thời lượng */}
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
                  Thời lượng đếm ngược
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {DURATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.days}
                      onClick={() => setSelectedDays(opt.days)}
                      disabled={!!setting?.active}
                      className={`py-3 rounded-lg text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                        selectedDays === opt.days
                          ? "bg-yellow-500 text-black"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle hiển thị đồng hồ */}
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Hiển thị đồng hồ</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Bật để người dùng thấy đếm ngược
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleVisible(!visible)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                      visible ? "bg-yellow-500" : "bg-gray-700"
                    }`}
                  >
                    <span
                      className={`block absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                        visible ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Nút hành động */}
              <div className="flex gap-3">
                <button
                  onClick={handleStart}
                  disabled={saving || !!setting?.active}
                  className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold rounded-lg transition-all"
                >
                  {saving ? "Đang lưu..." : "Bắt đầu đếm ngược"}
                </button>
                <button
                  onClick={handleStop}
                  disabled={saving || !setting?.active}
                  className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all"
                >
                  Đặt lại
                </button>
              </div>
            </div>

            {/* ====== CỘT PHẢI: TRẠNG THÁI + PREVIEW ====== */}
            <div className="space-y-4">
              {/* Trạng thái */}
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                    Trạng thái hiện tại
                  </h3>
                  {getStatusBadge()}
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Bắt đầu lúc</span>
                    <span className="text-gray-200">
                      {setting?.startTime
                        ? new Date(setting.startTime).toLocaleString("vi-VN")
                        : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Kết thúc lúc</span>
                    <span className="text-gray-200">
                      {setting?.startTime && setting?.durationMs
                        ? new Date(
                            new Date(setting.startTime).getTime() +
                              setting.durationMs,
                          ).toLocaleString("vi-VN")
                        : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Thời lượng</span>
                    <span className="text-gray-200">
                      {setting?.durationMs
                        ? setting.durationMs / (24 * 60 * 60 * 1000) + " ngày"
                        : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Hiển thị</span>
                    <span
                      className={visible ? "text-green-400" : "text-gray-500"}
                    >
                      {visible ? "Đang hiển thị" : "Đang ẩn"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
                  Preview — người dùng thấy
                </h3>
                <div
                  className={`w-full rounded-2xl py-6 px-4 flex flex-col items-center gap-2 transition-all ${
                    expired || !setting?.active
                      ? "bg-gray-700 cursor-not-allowed"
                      : "bg-[#ffff00]"
                  }`}
                >
                  {expired || !setting?.active ? (
                    <span className="text-lg font-bold text-gray-400">
                      {!setting?.active
                        ? "Chưa bật đồng hồ"
                        : "Đã hết thời gian ưu đãi"}
                    </span>
                  ) : (
                    <>
                      <span className="text-sm font-medium text-black/70">
                        Thời gian đăng ký còn lại
                      </span>
                      <span className="text-3xl font-black tabular-nums text-black">
                        {timeLeft ?? "--:--:--"}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ====== LUCKY NUMBER ====== */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
              Số may mắn
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Hiển thị số may mắn</p>
                <p className="text-gray-400 text-sm mt-1">
                  Bật để hiện 1 số ngẫu nhiên (0000–9999) trên trang người dùng
                </p>
              </div>
              <button
                onClick={() => handleToggleLuckyNumber(!showLuckyNumber)}
                disabled={savingLucky}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 disabled:opacity-40 ${
                  showLuckyNumber ? "bg-yellow-500" : "bg-gray-700"
                }`}
              >
                <span
                  className={`block absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                    showLuckyNumber ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Preview số may mắn */}
            <div className="mt-4 flex items-center gap-3">
              <span className="text-gray-400 text-sm">Preview:</span>
              {showLuckyNumber ? (
                <span className="text-4xl font-black text-yellow-400 tabular-nums tracking-widest">
                  {String(Math.floor(Math.random() * 10000)).padStart(4, "0")}
                </span>
              ) : (
                <span className="text-gray-600 text-sm italic">Đang ẩn</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
