import { useRef, type ReactNode } from "react";
import { useCountUp } from "@/hooks/useCountUp";

// `text`: giá trị cố định, không chạy hiệu ứng đếm (vd "24–48")
function Stat({
  to,
  text,
  suffix = "",
  sup,
  children,
}: {
  to: number;
  text?: string;
  suffix?: string;
  sup?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const value = useCountUp(ref, to);
  return (
    <div ref={ref} className="reveal">
      <div className="text-[clamp(44px,6vw,64px)] leading-none font-light tracking-[-.03em] tabular-nums">
        {text ?? value + suffix}
        {sup && (
          <sup className="relative top-[.4em] ml-[2px] align-top text-[.35em] leading-none font-medium">
            {sup}
          </sup>
        )}
      </div>
      <p className="mx-auto mt-[10px] max-w-[20ch] text-[15px] text-ink-2">
        {children}
      </p>
    </div>
  );
}

export default function Stats() {
  return (
    <section
      className="wrap py-24 text-center max-[640px]:py-[72px]"
      aria-labelledby="proof-h"
    >
      <div className="mx-auto max-w-[1024px]">
        <h2 className="sec-h reveal" id="proof-h">
          Người làm nghề.
          <br />
          Không phải người làm thử.
        </h2>
        <p className="sub reveal mt-[14px]">
          Portfolio thật. Quy trình rõ. Chính sách chỉnh sửa minh bạch.
        </p>
        <div
          className="mt-14 grid grid-cols-[repeat(4,1fr)] gap-7 max-[760px]:grid-cols-[repeat(2,1fr)] max-[760px]:gap-x-5 max-[760px]:gap-y-10"
          data-stagger
        >
          <Stat to={14} suffix="K" sup="+">
            người theo dõi kênh dạy edit “Biên tập nghiệp dư”
          </Stat>
          <Stat to={13}>người trong đội sáng tạo CWK</Stat>
          <Stat to={24} text="24–48" sup="giờ">
            bàn giao dự kiến mỗi video sau khi nhận đủ tư liệu
          </Stat>
          <Stat to={2} sup="lần">
            sửa miễn phí cho mỗi video
          </Stat>
        </div>
      </div>
    </section>
  );
}
