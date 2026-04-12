import { useEffect, useRef, useState } from "react";
import { countdownApi } from "@/api/countdown.api";
import { BUYER_NAMES } from "@/assets/data/buyernames";

const pricingItems = [
  { label: "7 ngày thành thạo edit video tiktok", price: "1.399.000 VNĐ" },
  { label: "Kho tài nguyên edit", price: "2.499.000 VNĐ" },
  { label: "Hỗ trợ 24/7 mọi vấn đề", price: null },
];

const NOTIFICATIONS = BUYER_NAMES.map((name) => `${name} đã mua khóa học`);

// ─── Purchase Notification ────────────────────────────────────────────────────
function PurchaseNotification({
  visible,
  message,
}: {
  visible: boolean;
  message: string;
}) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: "50%",
        transform: `translateX(-50%) translateY(${visible ? "0px" : "-110%"})`,
        transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        zIndex: 9999,
        pointerEvents: "none",
      }}
      className="mt-3 px-5 py-3 rounded-2xl shadow-2xl border border-yellow-400/40 bg-gray-900/95 backdrop-blur flex items-center gap-3 min-w-[260px] max-w-[90vw]"
    >
      <div className="w-9 h-9 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0">
        <span className="text-black text-base font-black leading-none">🎬</span>
      </div>
      <div>
        <p className="text-xs text-gray-400 leading-none mb-0.5">Vừa đăng ký</p>
        <p className="text-sm font-bold text-white leading-snug">{message}</p>
      </div>
      <span className="ml-auto flex-shrink-0 w-2.5 h-2.5 rounded-full bg-green-400 shadow shadow-green-400/60" />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function OffersSection() {
  const [expired, setExpired] = useState(false);

  // Notification state
  const [notifVisible, setNotifVisible] = useState(false);
  const [notifMessage, setNotifMessage] = useState(NOTIFICATIONS[0]);

  const sectionRef = useRef<HTMLDivElement>(null);
  const notifIndexRef = useRef(0);
  const hasTriggeredRef = useRef(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showNextRef = useRef<() => void>(null!);

  // ─── Countdown fetch ────────────────────────────────────────────────────────
  useEffect(() => {
    countdownApi.getCountdown().then((data) => {
      if (
        !data.active ||
        !data.visible ||
        !data.startTime ||
        !data.durationMs
      ) {
        setExpired(true);
        return;
      }

      const endTime = new Date(data.startTime).getTime() + data.durationMs;

      const check = () => {
        if (Date.now() >= endTime) setExpired(true);
      };

      check();
      const id = setInterval(check, 1000);
      return () => clearInterval(id);
    });
  }, []);

  // ─── Gán showNext sau khi mount ─────────────────────────────────────────────
  useEffect(() => {
    showNextRef.current = function showNext() {
      const idx = notifIndexRef.current % NOTIFICATIONS.length;
      setNotifMessage(NOTIFICATIONS[idx]);
      notifIndexRef.current += 1;
      setNotifVisible(true);

      // Ẩn sau 3.5s
      hideTimerRef.current = setTimeout(() => {
        setNotifVisible(false);
        // Hiện tiếp theo sau 6s
        loopTimerRef.current = setTimeout(() => {
          showNextRef.current();
        }, 6000);
      }, 3500);
    };
  }, []);

  // ─── IntersectionObserver — chỉ chạy 1 lần khi mount ──────────────────────
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTriggeredRef.current) {
          hasTriggeredRef.current = true;
          loopTimerRef.current = setTimeout(() => {
            showNextRef.current();
          }, 5000);
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (loopTimerRef.current) clearTimeout(loopTimerRef.current);
    };
  }, []);

  // ─── Derived ────────────────────────────────────────────────────────────────
  const promoLabel = expired
    ? "Tất cả những thứ trên có giá:"
    : "Chào hè 2026 tất cả những thứ trên chỉ còn :";

  const promoPrice = expired ? "1.399.000 VNĐ" : "888.000 VNĐ";

  return (
    <>
      <PurchaseNotification visible={notifVisible} message={notifMessage} />

      <div ref={sectionRef}>
        {/* ==================== DESKTOP ==================== */}
        <div className="hidden md:block">
          <div className="max-w-[1150px] mx-auto px-4 md:px-6 my-6 mt-10">
            <div
              className="border-transparent rounded-2xl p-[10px]"
              style={{
                background:
                  "linear-gradient(to right, #1d1d1d, #1d1d1d, #203756, #1d3e5d)",
              }}
            >
              <div
                className="border border-white rounded-xl px-25 py-10"
                style={{
                  background:
                    "linear-gradient(to right, #1d1d1d, #1d1d1d, #203756, #1d3e5d)",
                }}
              >
                <h2 className="text-center text-2xl md:text-4xl font-black text-[#ffff00] uppercase tracking-wide mb-6 leading-tight">
                  7 ngày thành thạo edit video tiktok
                </h2>

                <ul className="flex flex-col gap-3 mb-8">
                  {pricingItems.map((item, i) => (
                    <li
                      key={i}
                      className="text-base md:text-xl text-white uppercase tracking-wide font-normal"
                    >
                      - {item.label}
                      {item.price && (
                        <span className="text-[#ffff00] italic line-through font-normal">
                          {" "}
                          ({item.price})
                        </span>
                      )}
                    </li>
                  ))}
                </ul>

                <p className="text-[22px] font-black text-white uppercase tracking-wide mb-2">
                  {promoLabel}
                </p>

                <div className="flex items-baseline gap-4 flex-wrap mb-2">
                  <span className="text-6xl font-black text-[#ffff00] leading-none tracking-tight">
                    {promoPrice}
                  </span>
                  {!expired && (
                    <span className="text-xl text-white">
                      ( 20 Người Nhanh Nhất )
                    </span>
                  )}
                </div>

                {!expired && (
                  <p className="text-2xl font-semibold line-through text-gray-400 tracking-wide">
                    Giá cũ 1.399.000 VNĐ
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ==================== MOBILE ==================== */}
        <div className="md:hidden">
          <div className="max-w-[1150px] mx-auto px-4 my-6">
            <div
              className="border-transparent rounded-2xl p-[10px]"
              style={{
                background:
                  "linear-gradient(to right, #1d1d1d, #1d1d1d, #203756, #1d3e5d)",
              }}
            >
              <div
                className="border border-white rounded-xl px-6 py-8"
                style={{
                  background:
                    "linear-gradient(to right, #1d1d1d, #1d1d1d, #203756, #1d3e5d)",
                }}
              >
                <h2 className="text-center text-2xl md:text-4xl font-black text-[#ffff00] uppercase tracking-wide mb-6 leading-tight">
                  7 ngày thành thạo edit video tiktok
                </h2>

                <ul className="flex flex-col gap-3 mb-8">
                  {pricingItems.map((item, i) => (
                    <li
                      key={i}
                      className="text-base md:text-xl text-white uppercase tracking-wide font-normal"
                    >
                      - {item.label} <br />
                      {item.price && (
                        <span className="text-[#ffff00] italic line-through font-normal">
                          {" "}
                          ({item.price})
                        </span>
                      )}
                    </li>
                  ))}
                </ul>

                <p className="text-base font-black text-white uppercase tracking-wide mb-2">
                  {promoLabel}
                </p>

                <div className="flex items-baseline gap-3 flex-wrap mb-2">
                  <span className="text-4xl font-black text-[#ffff00] leading-none tracking-tight">
                    {promoPrice}
                  </span>
                  {!expired && (
                    <span className="text-base font-bold text-white">
                      ( 20 Người Nhanh Nhất )
                    </span>
                  )}
                </div>

                {!expired && (
                  <p className="text-sm font-semibold text-gray-400 line-through tracking-wide">
                    Giá cũ 1.399.000 VNĐ
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
