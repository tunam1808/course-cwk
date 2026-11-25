import { useEffect, useRef, useState } from "react";
import { ZALO_PHONE } from "@/data/mock";
import { prefersReducedMotion } from "@/hooks/motion";
import { track } from "@/lib/analytics";
import LeadForm from "./LeadForm";
import ZaloLink from "./ZaloLink";

export default function Final() {
  const ref = useRef<HTMLElement>(null);

  // Bật sẵn hiệu ứng nếu người dùng chọn giảm chuyển động
  // hoặc trình duyệt không có IntersectionObserver.
  // Tính ngay lúc khởi tạo state nên không cần setState trong effect.
  const [go, setGo] = useState(
    () =>
      typeof window !== "undefined" &&
      (prefersReducedMotion() || !("IntersectionObserver" in window)),
  );
  const [label, setLabel] = useState("Sao chép");

  // Vệt vàng quét qua khi khối cuối vào màn hình
  useEffect(() => {
    const el = ref.current;
    if (!el || go) return;

    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) {
            setGo(true); // gọi trong callback: hợp lệ
            io.disconnect();
          }
        }),
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [go]);

  async function copy() {
    track("sao_chep_so");
    try {
      await navigator.clipboard.writeText(ZALO_PHONE);
      setLabel("Đã sao chép");
    } catch {
      const el = document.getElementById("phone");
      const s = getSelection();
      if (el && s) {
        const r = document.createRange();
        r.selectNodeContents(el);
        s.removeAllRanges();
        s.addRange(r);
      }
      setLabel("Đã chọn số");
    }
  }

  return (
    <section
      ref={ref}
      className={
        "wrap relative overflow-hidden bg-navy py-24 text-center text-white max-[640px]:py-[72px]" +
        (go ? " go" : "")
      }
      id="final"
      aria-labelledby="final-h"
    >
      <div className="streak" aria-hidden="true"></div>
      <div className="mx-auto max-w-[1024px]">
        <img
          className="mx-auto mb-[34px] block h-[clamp(56px,10vw,88px)] w-auto"
          src="/logo-cwk-vang.png"
          alt="CWK Media"
          width={560}
          height={183}
        />
        <h2 className="sec-h" id="final-h">
          Bạn quay.
          <br />
          CWK lo hậu kỳ.
        </h2>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-[22px]">
          <ZaloLink className="pill pill-yellow" viTri="khoi_cuoi">
            Nhắn Zalo cho CWK
          </ZaloLink>
        </div>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-[14px] text-[15px] text-[#c7cfe0]">
          Zalo{" "}
          <span
            className="font-medium tracking-[.02em] text-white tabular-nums select-all"
            id="phone"
          >
            0335 529 408
          </span>
          <button
            type="button"
            id="copy"
            className="cursor-pointer rounded-[980px] border border-[rgba(255,255,255,.35)] bg-transparent px-[14px] py-[6px] text-[13px] leading-[normal] font-medium tracking-normal text-white"
            onClick={copy}
          >
            {label}
          </button>
        </div>
        <LeadForm source="cuoi_trang" tone="dark" />
      </div>
    </section>
  );
}
