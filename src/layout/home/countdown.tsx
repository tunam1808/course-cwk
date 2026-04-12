import { useEffect, useState } from "react";
import { FiClock } from "react-icons/fi";
import { countdownApi } from "@/api/countdown.api";

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    countdownApi.getCountdown().then((data) => {
      if (!data.active || !data.visible) return;
      setVisible(true);

      const endTime = new Date(data.startTime!).getTime() + data.durationMs!;

      const tick = () => {
        const remaining = endTime - Date.now();
        if (remaining <= 0) {
          setExpired(true);
          setTimeLeft(null);
          return;
        }
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
    });
  }, []);

  if (!visible) return null;

  return (
    <>
      {/* ==================== DESKTOP ==================== */}
      <div className="hidden md:block px-4 py-12 bg-black">
        <button
          disabled={expired}
          className={`w-full md:w-220 mx-auto rounded-2xl block
                     text-black font-black text-2xl uppercase tracking-wide
                     py-6 px-10 transition-all duration-200 shadow-lg
                     ${
                       expired
                         ? "bg-gray-300 cursor-not-allowed"
                         : "bg-[#ffff00] hover:bg-yellow-300 active:bg-yellow-400 hover:shadow-xl"
                     }`}
        >
          <div className="flex flex-col items-center gap-3">
            <FiClock className="w-8 h-8 text-black/70" />
            <span className="text-xl font-medium tracking-wider text-black/80">
              {expired
                ? "Đã hết thời gian ưu đãi"
                : "Thời gian đăng ký còn lại"}
            </span>
            {!expired && (
              <span className="text-5xl font-black tabular-nums">
                {timeLeft}
              </span>
            )}
          </div>
        </button>
      </div>

      {/* ==================== MOBILE ==================== */}
      <div className="block md:hidden px-4 py-10 bg-black">
        <button
          disabled={expired}
          className={`w-full max-w-[320px] mx-auto rounded-2xl block
                     text-black font-black text-xl uppercase tracking-wide
                     py-5 px-6 transition-all duration-200 shadow-lg
                     ${
                       expired
                         ? "bg-gray-300 cursor-not-allowed"
                         : "bg-[#ffff00] hover:bg-yellow-300 active:bg-yellow-400 hover:shadow-xl"
                     }`}
        >
          <div className="flex flex-col items-center gap-2.5">
            <FiClock className="w-6 h-6 text-black/70" />
            <span className="text-base font-medium tracking-wider text-black/80">
              {expired
                ? "Đã hết thời gian ưu đãi"
                : "Thời gian đăng ký còn lại"}
            </span>
            {!expired && (
              <span className="text-3xl font-black tabular-nums">
                {timeLeft}
              </span>
            )}
          </div>
        </button>
      </div>
    </>
  );
}
