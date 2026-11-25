import { useStickyBar } from "@/hooks/useStickyBar";
import ZaloLink from "./ZaloLink";

export default function StickyBar() {
  const on = useStickyBar();
  return (
    <div
      className={
        "bar wrap glass fixed inset-x-0 bottom-0 z-30 border-t border-[rgba(0,0,0,.08)] bg-[rgba(251,251,253,.86)] pt-[10px] pb-[calc(10px+env(safe-area-inset-bottom,0px))]" +
        (on ? " on" : "")
      }
      role="region"
      aria-label="Liên hệ nhanh"
    >
      <div className="mx-auto flex max-w-[1024px] items-center justify-between gap-3">
        <div className="text-[14px] leading-[1.25]">
          <b className="block text-[15px] font-semibold">Gói 30 video</b>
          <span className="text-ink-2 tabular-nums">7.000.000đ/tháng</span>
        </div>
        <ZaloLink
          className="pill pill-navy px-[18px] py-[9px] text-[15px]"
          viTri="thanh_day"
        >
          Nhắn Zalo
        </ZaloLink>
      </div>
    </div>
  );
}
