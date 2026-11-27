import { useEffect, useRef, useState } from "react";
import { newPageApi } from "@/api/landingpage-intro.api";
import { useShowreelScale } from "@/hooks/useShowreelScale";
import ZaloLink from "./ZaloLink";

export default function Hero() {
  const reel = useRef<HTMLDivElement>(null);
  const phone = useRef<HTMLDivElement>(null);
  useShowreelScale(reel, phone);

  const [videoId, setVideoId] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    newPageApi
      .getIntro()
      .then((intro) => {
        if (!ignore) setVideoId(intro?.videoId ?? null);
      })
      .catch((error) => {
        console.error("[Hero] Không tải được video intro:", error);
      });
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <header className="wrap pt-[72px] text-center" id="top">
      <div className="mx-auto max-w-[1024px]">
        <p className="eyebrow rise">CWK Media · Edit video theo tháng</p>
        <h1 className="hero-h mt-[10px]">
          <span className="ln">Đội edit riêng</span>
          <br />
          <span className="ln">cho doanh nghiệp của bạn.</span>
        </h1>
        <p className="sub rise d2 mx-auto mt-4 max-w-[38ch]">
          Dịch vụ edit video ngắn theo tháng, từ footage bạn cung cấp. Quy trình
          rõ ràng, chất lượng nhất quán.
        </p>
        <p className="rise d2 mt-[14px] text-[clamp(17px,2.2vw,21px)] text-ink">
          Từ <b className="font-semibold tabular-nums">2.800.000đ</b>/tháng
        </p>
        <div className="rise d3 mt-6 flex flex-wrap items-center justify-center gap-[22px]">
          <ZaloLink className="pill pill-navy" viTri="dau_trang">
            Nhắn Zalo tư vấn
          </ZaloLink>
          <a className="more" href="#video">
            Xem video mẫu
          </a>
        </div>
        <p className="rise d3 mt-[18px] text-[14px] text-ink-3">
          Phù hợp cho: Chủ shop tự quay · Doanh nghiệp có đội quay · Đội edit
          đang quá tải
        </p>
        <div
          ref={reel}
          className="showreel-bg rise d3 relative mx-auto mt-14 grid aspect-video max-w-[1024px] place-items-center overflow-hidden rounded-[28px] max-[640px]:aspect-[4/5] max-[640px]:rounded-[22px]"
        >
          <div
            ref={phone}
            className={`phone-scale relative isolate z-10 grid w-[min(32%,250px)] place-items-center overflow-hidden rounded-[34px] border-[6px] border-[#2b2b2e] bg-[#111] text-center text-[13px] text-[#86868b] shadow-[0_30px_80px_rgba(0,0,0,.6)] max-[640px]:w-[52%] ${
              videoId ? "aspect-[9/16]" : "aspect-[9/19.5] p-3"
            }`}
          >
            {videoId ? (
              <iframe
                src={`https://iframe.mediadelivery.net/embed/${import.meta.env.VITE_BUNNY_LIBRARY_ID}/${videoId}?autoplay=true&muted=true&loop=true&preload=true&playsinline=true`}
                title="Video showreel CWK Media"
                className="absolute inset-0 h-full w-full border-0"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <b className="block text-[15px] font-semibold text-[#f5f5f7]">
                Showreel
              </b>
            )}
          </div>
          <div className="glow pointer-events-none absolute inset-x-0 bottom-[-40%] h-[70%]"></div>
        </div>
      </div>
    </header>
  );
}
