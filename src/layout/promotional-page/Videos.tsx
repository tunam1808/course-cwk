import { useEffect, useState } from "react";
import { SO_VIDEO_MAU, type Nganh } from "@/data/mock";
import { track } from "@/lib/analytics";

export default function Videos({ nganh }: { nganh: Nganh[] }) {
  const [active, setActive] = useState(nganh[0]?.id ?? "");

  // Link dạng /#spa mở thẳng đúng ngành và cuộn tới khối video
  useEffect(() => {
    function fromHash() {
      const h = (location.hash || "").slice(1);
      if (nganh.some((n) => n.id === h)) {
        setActive(h);
        document
          .getElementById("video")
          ?.scrollIntoView({ behavior: "smooth" });
      }
    }
    fromHash();
    addEventListener("hashchange", fromHash);
    return () => removeEventListener("hashchange", fromHash);
  }, [nganh]);

  const current = nganh.find((n) => n.id === active) ?? nganh[0];

  return (
    <section
      className="wrap bg-black py-24 text-center text-[#f5f5f7] max-[640px]:py-[72px]"
      id="video"
      aria-labelledby="video-h"
    >
      <div className="mx-auto max-w-[1024px]">
        <p className="eyebrow text-[#a1a1a6]">Video mẫu</p>
        <h2 className="sec-h mt-2" id="video-h">
          Xem theo ngành của bạn.
        </h2>
        <div className="mt-9 flex justify-center">
          <div
            className="no-scrollbar flex max-w-full gap-1 overflow-x-auto rounded-[980px] bg-[#1d1d1f] p-1"
            role="group"
            aria-label="Chọn ngành"
            id="seg"
          >
            {nganh.map((n) => (
              <button
                key={n.id}
                type="button"
                className="seg-btn"
                data-id={n.id}
                aria-pressed={n.id === current?.id ? "true" : "false"}
                onClick={() => {
                  setActive(n.id);
                  track("chon_nganh", { nganh: n.id });
                  try {
                    history.replaceState(null, "", "#" + n.id);
                  } catch {
                    /* bỏ qua */
                  }
                }}
              >
                {n.name}
              </button>
            ))}
          </div>
        </div>
        <div
          className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto px-1 pt-11 pb-2"
          id="reels"
          aria-live="polite"
        >
          {current &&
            Array.from({ length: SO_VIDEO_MAU }, (_, k) => k + 1).map((i) => (
              <div
                key={current.id + "-" + i}
                className="swap flex flex-[0_0_min(64vw,260px)] snap-center flex-col gap-[14px]"
                style={{ animationDelay: i * 60 + "ms" }}
              >
                <div className="reel-v">
                  <span>
                    Video mẫu {i}
                    <br />
                    thêm sau
                  </span>
                </div>
                <p className="text-center text-[14px] text-[#a1a1a6]">
                  <b className="font-semibold text-[#f5f5f7]">{current.name}</b>
                  <br />X clip thô → 1 video Y giây
                </p>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
