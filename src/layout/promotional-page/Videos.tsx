import { useEffect, useRef, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { newPageApi, type Industry } from "@/api/landingpage-intro.api";
import { track } from "@/lib/analytics";

// "Bất động sản" → "bat-dong-san", dùng cho link dạng /#bat-dong-san
const toSlug = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const ARROW_CLASS =
  "absolute top-[275px] z-10 hidden h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#1d1d1f]/90 text-[#f5f5f7] shadow-lg backdrop-blur transition-colors hover:bg-[#3a3a3c] md:flex";

export default function Videos() {
  const [nganh, setNganh] = useState<Industry[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "ready">(
    "loading",
  );
  const [active, setActive] = useState<number | null>(null);
  const reelsRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState({ left: false, right: false });

  useEffect(() => {
    let ignore = false;
    newPageApi
      .getIndustries()
      .then((data) => {
        if (ignore) return;
        // Chỉ hiện ngành đã có video, ngành tạo trước đứng trước
        setNganh(
          data.filter((n) => n.videos.length > 0).sort((a, b) => a.id - b.id),
        );
        setStatus("ready");
      })
      .catch((error) => {
        console.error("[Videos] Không tải được video mẫu:", error);
        if (!ignore) setStatus("error");
      });
    return () => {
      ignore = true;
    };
  }, []);

  // Link dạng /#spa mở thẳng đúng ngành và cuộn tới khối video
  useEffect(() => {
    function fromHash() {
      const h = location.hash.slice(1);
      const found = nganh.find((n) => toSlug(n.name) === h);
      if (found) {
        setActive(found.id);
        document
          .getElementById("video")
          ?.scrollIntoView({ behavior: "smooth" });
      }
    }
    const frame = requestAnimationFrame(fromHash);
    addEventListener("hashchange", fromHash);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("hashchange", fromHash);
    };
  }, [nganh]);

  const current = nganh.find((n) => n.id === active) ?? nganh[0];
  const currentId = current?.id;

  // Theo dõi vị trí cuộn để ẩn/hiện nút mũi tên
  useEffect(() => {
    const el = reelsRef.current;
    if (!el) return;
    el.scrollLeft = 0; // đổi ngành thì quay về video đầu tiên

    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setCanScroll({
        left: el.scrollLeft > 4,
        right: el.scrollLeft < max - 4,
      });
    };

    // ResizeObserver gọi update ngay lần đầu và mỗi khi đổi kích thước
    const observer = new ResizeObserver(update);
    observer.observe(el);
    el.addEventListener("scroll", update, { passive: true });
    return () => {
      observer.disconnect();
      el.removeEventListener("scroll", update);
    };
  }, [currentId]);

  const scrollReels = (direction: -1 | 1) => {
    const el = reelsRef.current;
    el?.scrollBy({
      left: direction * el.clientWidth * 0.8,
      behavior: "smooth",
    });
  };

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

        {!current ? (
          <p className="pt-11 text-[14px] text-[#a1a1a6]" role="status">
            {status === "loading"
              ? "Đang tải video..."
              : status === "error"
                ? "Chưa tải được video. Vui lòng thử lại sau."
                : "Video mẫu đang được cập nhật."}
          </p>
        ) : (
          <>
            <div className="mt-9 flex justify-center">
              <div
                className="no-scrollbar flex max-w-full gap-1 overflow-x-auto rounded-[980px] bg-[#1d1d1f] p-1"
                role="group"
                aria-label="Chọn ngành"
                id="seg"
              >
                {nganh.map((n) => {
                  const slug = toSlug(n.name);
                  return (
                    <button
                      key={n.id}
                      type="button"
                      className="seg-btn"
                      data-id={slug}
                      aria-pressed={n.id === current.id}
                      onClick={() => {
                        setActive(n.id);
                        track("chon_nganh", { nganh: slug });
                        try {
                          history.replaceState(null, "", "#" + slug);
                        } catch {
                          /* bỏ qua */
                        }
                      }}
                    >
                      {n.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="relative">
              {canScroll.left && (
                <button
                  type="button"
                  onClick={() => scrollReels(-1)}
                  className={`${ARROW_CLASS} left-2`}
                  aria-label="Xem video trước"
                >
                  <FiChevronLeft className="h-6 w-6" />
                </button>
              )}

              <div
                ref={reelsRef}
                className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto px-1 pt-11 pb-2"
                id="reels"
                aria-live="polite"
              >
                {current.videos.map((video, i) => (
                  <div
                    key={video.id}
                    className="swap flex flex-[0_0_min(64vw,260px)] snap-center flex-col gap-[14px] first:ml-auto last:mr-auto"
                    style={{ animationDelay: (i + 1) * 60 + "ms" }}
                  >
                    <div className="reel-v relative aspect-[9/16] overflow-hidden">
                      <iframe
                        src={`https://iframe.mediadelivery.net/embed/${import.meta.env.VITE_BUNNY_LIBRARY_ID}/${video.videoId}?autoplay=false&preload=false&playsinline=true`}
                        title={`Video mẫu ${i + 1} ngành ${current.name}`}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full border-0"
                        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                ))}
              </div>

              {canScroll.right && (
                <button
                  type="button"
                  onClick={() => scrollReels(1)}
                  className={`${ARROW_CLASS} right-2`}
                  aria-label="Xem video tiếp theo"
                >
                  <FiChevronRight className="h-6 w-6" />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
