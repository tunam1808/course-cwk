// layout/home/countdown.tsx
import { FiClock } from "react-icons/fi";

export default function Countdown() {
  return (
    <>
      {/* ==================== DESKTOP ==================== */}
      <div className="hidden md:block px-4 py-12 bg-black">
        <button
          className="w-full md:w-220 mx-auto rounded-2xl block 
                     bg-[#ffff00] hover:bg-yellow-300 active:bg-yellow-400
                     text-black font-black 
                     text-2xl 
                     uppercase tracking-wide 
                     py-6 px-10 
                     transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <div className="flex flex-col items-center gap-3">
            <FiClock className="w-8 h-8 text-black/70" />
            <span className="text-xl font-medium tracking-wider text-black/80">
              Thời gian đăng ký còn lại
            </span>
            <span className="text-5xl font-black tabular-nums">
              0 ngày, 22:33:12
            </span>
          </div>
        </button>
      </div>

      {/* ==================== MOBILE ==================== */}
      <div className="block md:hidden px-4 py-10 bg-black">
        <button
          className="w-full max-w-[320px] mx-auto rounded-2xl block 
                     bg-[#ffff00] hover:bg-yellow-300 active:bg-yellow-400
                     text-black font-black 
                     text-xl 
                     uppercase tracking-wide 
                     py-5 px-6 
                     transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <div className="flex flex-col items-center gap-2.5">
            <FiClock className="w-6 h-6 text-black/70" />
            <span className="text-base font-medium tracking-wider text-black/80">
              Thời gian đăng ký còn lại
            </span>
            <span className="text-3xl font-black tabular-nums">
              0 ngày, 22:33:12
            </span>
          </div>
        </button>
      </div>
    </>
  );
}
