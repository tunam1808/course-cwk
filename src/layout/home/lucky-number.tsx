import { useEffect, useState } from "react";
import { countdownApi } from "@/api/countdown.api";

function randomNumber() {
  return String(Math.floor(Math.random() * 10000)).padStart(4, "0");
}

export default function LuckyNumber() {
  const [show, setShow] = useState(false);
  const [number] = useState(randomNumber());

  useEffect(() => {
    countdownApi.getLuckySetting().then((data) => {
      setShow(data.showLuckyNumber);
    });
  }, []);

  if (!show) return null;

  return (
    <div className="w-full flex flex-col items-center justify-center py-12 px-4">
      <p className="text-[#ffff00] italic text-sm uppercase tracking-widest mb-3">
        Con số may mắn của bạn là:
      </p>
      <div className="flex gap-3">
        {number.split("").map((digit, i) => (
          <div
            key={i}
            className="w-16 h-20 md:w-24 md:h-28 bg-gray-900 border border-yellow-400/30 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-400/10"
          >
            <span className="text-4xl md:text-6xl font-black text-yellow-400 tabular-nums">
              {digit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
