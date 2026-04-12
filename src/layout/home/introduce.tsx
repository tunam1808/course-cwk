import { useState, useEffect } from "react";
import { introApi } from "@/api/intro.api";

// ==================== TYPES ====================
interface IntroSlot {
  slot: 1 | 2 | 3 | 4 | 5 | 6;
  videoId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

// ==================== BUNNY URLS ====================
const BUNNY_LIBRARY_ID = import.meta.env.VITE_BUNNY_LIBRARY_ID;

function getBunnyEmbedUrl(videoId: string): string {
  return `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoId}?autoplay=true&muted=false&preload=false`;
}

function getBunnyThumbnailUrl(videoId: string): string {
  return `https://vz-${BUNNY_LIBRARY_ID}.b-cdn.net/${videoId}/thumbnail.jpg`;
}

// ==================== DATA ====================
const painPoints = [
  "Xem hàng chục video hướng dẫn edit trên mạng nhưng vẫn không biết bắt đầu từ đâu?",
  'Edit xong video mà nhìn vẫn "phèn", không chuyên nghiệp.',
  "Mất hàng tuần, hàng tháng nhưng vẫn không tiến bộ rõ rệt.",
  "Không biết làm sao để biến kỹ năng edit thành tiền.",
  "Thấy người khác edit đẹp, kiếm tiền được... còn mình vẫn loay hoay.",
];

const benefits = [
  {
    title: (
      <>
        <span className="text-[#ffff00]">
          Cầm tay chỉ việc từng bước một qua video.
        </span>
        <br /> Từ người chưa từng mở CapCut đến Editor ra đơn thành thạo.
      </>
    ),
  },
  {
    title: (
      <>
        Rút ngắn thời gian làm việc.{" "}
        <span className="text-[#ffff00]">Edit cực nhanh và dễ dàng.</span>
        <br />
        Học xong có thể làm video đăng được luôn.
      </>
    ),
  },
  {
    title: (
      <>
        Số tiền mua khóa học này chưa bằng{" "}
        <span className="text-[#ffff00]">1/10 chi phí</span>
        <br /> bạn phải trả cho một tháng thuê nhân sự quay dựng.
      </>
    ),
  },
];

// ==================== ICONS & CTA ====================
function XIcon() {
  return (
    <span className="flex-shrink-0 w-9 h-9 rounded-full bg-red-600 flex items-center justify-center border border-red-400">
      <span className="text-white text-2xl font-black leading-none translate-y-px">
        ✕
      </span>
    </span>
  );
}

function CheckIcon() {
  return (
    <span className="flex-shrink-0 w-9 h-9 rounded-full bg-green-600 flex items-center justify-center border border-green-400">
      <span className="text-white text-3xl font-black leading-none">✓</span>
    </span>
  );
}

function CtaButton({ text, onClick }: { text: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full md:w-220 mx-auto rounded-2xl block bg-[#ffff00] hover:bg-yellow-300 text-black font-black text-xl md:text-xl uppercase tracking-wide py-4 px-6 rounded transition-colors duration-150"
    >
      {text}
    </button>
  );
}

// ==================== GRADIENT BORDER ====================
function GradientBorderSection({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-[10px] my-8"
      style={{
        background:
          "linear-gradient(to right, #1d1d1d, #1d1d1d, #1d3e5d, #203756)",
      }}
    >
      <div
        className="border border-white rounded-xl px-8 md:px-12 lg:px-16 py-10"
        style={{
          background:
            "linear-gradient(to right, #1d1d1d, #1d1d1d, #1d3e5d, #203756)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ==================== VIDEO SLOT (Desktop) ====================
function VideoSlot({
  slot,
  videoId,
  loading,
}: {
  slot: number;
  videoId: string | null;
  loading: boolean;
}) {
  const [activatedVideoId, setActivatedVideoId] = useState<string | null>(null);
  const activated = activatedVideoId === videoId && videoId !== null;

  return (
    <div className="aspect-[9/16] bg-black border border-gray-700 flex items-center justify-center relative overflow-hidden">
      {loading ? (
        <span className="text-sm text-gray-500">Đang tải...</span>
      ) : videoId ? (
        activated ? (
          <iframe
            src={getBunnyEmbedUrl(videoId)}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          />
        ) : (
          <button
            onClick={() => {
              console.log(
                `[VideoSlot Desktop] Nút Play pressed — slot ${slot}, videoId: ${videoId}`,
              );
              setActivatedVideoId(videoId);
            }}
            className="absolute inset-0 w-full h-full group"
          >
            <img
              src={getBunnyThumbnailUrl(videoId)}
              alt={`Video ${slot}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white flex items-center justify-center shadow-xl transition-all group-hover:scale-110">
                <div className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[18px] border-l-black ml-1" />
              </div>
            </div>
          </button>
        )
      ) : (
        <span className="text-sm text-gray-500 font-medium">Video {slot}</span>
      )}
    </div>
  );
}

// ==================== MOBILE RESULTS SECTION ====================
function MobileResultsSection({
  intros,
  loading,
}: {
  intros: IntroSlot[];
  loading: boolean;
}) {
  const [activeSlot, setActiveSlot] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [activated, setActivated] = useState(false);

  const slots: (1 | 2 | 3 | 4 | 5 | 6)[] = [1, 2, 3, 4, 5, 6];

  const currentIntro = intros.find((i) => i.slot === activeSlot);
  const videoId = currentIntro?.videoId ?? null;

  function goLeft() {
    console.log(
      "[MobileResults] goLeft — slot " + activeSlot + " → reset activated",
    );
    setActivated(false);
    setActiveSlot((prev) =>
      prev === 1 ? 6 : ((prev - 1) as 1 | 2 | 3 | 4 | 5 | 6),
    );
  }

  function goRight() {
    console.log(
      "[MobileResults] goRight — slot " + activeSlot + " → reset activated",
    );
    setActivated(false);
    setActiveSlot((prev) =>
      prev === 6 ? 1 : ((prev + 1) as 1 | 2 | 3 | 4 | 5 | 6),
    );
  }

  return (
    <section>
      <h2 className="text-center text-2xl font-black text-[#ffff00] uppercase tracking-wide mb-2">
        Thành quả <br />
        sau khi học
      </h2>
      <p className="text-center text-base italic text-gray-300 mb-6">
        <span className="text-[#ffff00]">Thành quả</span> sau khi học của các
        học viên
      </p>

      {/* Video player — iframe chiếm toàn bộ, không có gì đè lên */}
      <div className="aspect-[9/16] bg-black border border-gray-700 relative overflow-hidden rounded-lg">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm text-gray-500">Đang tải...</span>
          </div>
        ) : videoId ? (
          activated ? (
            <iframe
              src={getBunnyEmbedUrl(videoId)}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            />
          ) : (
            <button
              onClick={() => {
                console.log(
                  `[MobileResults] Nút Play pressed — slot ${activeSlot}, videoId: ${videoId}`,
                );
                setActivated(true);
              }}
              className="absolute inset-0 w-full h-full group"
              style={{
                touchAction: "manipulation",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <img
                src={getBunnyThumbnailUrl(videoId)}
                alt={`Video ${activeSlot}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <div className="absolute inset-0 bg-black/30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl">
                  <div className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[18px] border-l-black ml-1" />
                </div>
              </div>
            </button>
          )
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm text-gray-500 font-medium">
              Video {activeSlot}
            </span>
          </div>
        )}
      </div>

      {/* Nút điều hướng — nằm DƯỚI iframe, hoàn toàn tách biệt */}
      <div className="flex items-center justify-center gap-6 mt-4">
        <button
          onClick={() => {
            console.log("[MobileResults] Nút ‹ pressed — slot " + activeSlot);
            goLeft();
          }}
          style={{
            touchAction: "manipulation",
            WebkitTapHighlightColor: "transparent",
          }}
          className="w-11 h-11 rounded-full bg-black/80 border border-white/40 flex items-center justify-center text-white text-2xl active:scale-95 shadow-lg"
        >
          ‹
        </button>

        {/* Dot indicators */}
        <div className="flex gap-3">
          {slots.map((s) => (
            <button
              key={s}
              onClick={() => {
                console.log(
                  "[MobileResults] Dot pressed — chuyển sang slot " + s,
                );
                setActivated(false);
                setActiveSlot(s);
              }}
              style={{
                touchAction: "manipulation",
                WebkitTapHighlightColor: "transparent",
              }}
              className={`w-3 h-3 rounded-full transition-all ${
                activeSlot === s ? "bg-[#ffff00] scale-125" : "bg-white/40"
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => {
            console.log("[MobileResults] Nút › pressed — slot " + activeSlot);
            goRight();
          }}
          style={{
            touchAction: "manipulation",
            WebkitTapHighlightColor: "transparent",
          }}
          className="w-11 h-11 rounded-full bg-black/80 border border-white/40 flex items-center justify-center text-white text-2xl active:scale-95 shadow-lg"
        >
          ›
        </button>
      </div>
    </section>
  );
}

// ==================== MAIN COMPONENT ====================
export default function CourseLandingPage() {
  const [intros, setIntros] = useState<IntroSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    introApi
      .getIntro()
      .then((data) => setIntros(data))
      .catch(() => {
        setIntros([
          { slot: 1, videoId: null, createdAt: null, updatedAt: null },
          { slot: 2, videoId: null, createdAt: null, updatedAt: null },
          { slot: 3, videoId: null, createdAt: null, updatedAt: null },
          { slot: 4, videoId: null, createdAt: null, updatedAt: null },
          { slot: 5, videoId: null, createdAt: null, updatedAt: null },
          { slot: 6, videoId: null, createdAt: null, updatedAt: null },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  function getIntroBySlot(slot: number): IntroSlot | undefined {
    return intros.find((i) => i.slot === slot);
  }

  function scrollToPayment() {
    const el = document.getElementById("payment-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <div className="bg-black text-white min-h-screen">
      <div className="max-w-[1150px] mx-auto px-4 md:px-6">
        {/* ==================== DESKTOP ==================== */}
        <div className="hidden md:block">
          <section className="px-6 py-6 text-center">
            <h1 className="text-4xl md:text-5xl font-black text-[#ffff00] uppercase leading-tight mb-6">
              7 ngày thành thạo edit video tiktok
            </h1>
            <p className="text-base md:text-xl text-gray-400 leading-relaxed max-w-6xl mx-auto">
              Xem hàng chục video hướng dẫn edit... nhưng càng xem càng rối,
              càng mất thời gian và vẫn không biết bắt đầu từ đâu. Khóa học này
              là dành cho bạn.
            </p>
            <div className="mt-10 cursor-pointer">
              <CtaButton
                text="Đăng ký học & nhận tài nguyên ngay"
                onClick={scrollToPayment}
              />
            </div>
          </section>

          <GradientBorderSection>
            <section>
              <h2 className="text-center text-2xl md:text-4xl font-black text-[#ffff00] uppercase tracking-wide mb-8">
                Bạn có đang mắc kẹt ở đây không?
              </h2>
              <ul className="flex flex-col gap-5 mb-8">
                {painPoints.map((point, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-4 ml-10 italic text-xl text-gray-300 leading-relaxed"
                  >
                    <XIcon />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <div className="pl-20 py-2 pr-4 rounded-r">
                <p className="text-3xl text-gray-300 tracking-wide font-bold leading-relaxed">
                  Nếu bạn vẫn học theo cách hiện tại...
                </p>
                <p className="text-3xl tracking-wide font-bold text-[#ffff00] mt-2">
                  ➜ 3 tháng nữa bạn vẫn sẽ không biết edit từ đâu.
                </p>
              </div>
            </section>
          </GradientBorderSection>

          <GradientBorderSection>
            <section>
              <h2 className="text-center text-2xl md:text-4xl font-black text-[#ffff00] uppercase tracking-wide mb-8">
                Sở hữu khóa học này, bạn sẽ được
              </h2>
              <ul className="flex flex-col gap-6 mb-8">
                {benefits.map((b, i) => (
                  <li key={i} className="flex items-center ml-10 gap-4">
                    <CheckIcon />
                    <div className="pl-7 italic">
                      <p className="text-xl text-gray-300 leading-relaxed">
                        {b.title}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="text-center text-3xl text-gray-300 leading-relaxed italic">
                <p className="font-bold">
                  Bạn không thiếu cố gắng, bạn chỉ đang thiếu{" "}
                  <span className="text-[#ffff00] font-bold">
                    một lộ trình đúng.
                  </span>
                </p>
                <p className="mt-2 font-bold">
                  Vậy nên khóa học này sinh ra{" "}
                  <span className="text-[#ffff00] font-bold">
                    dành cho bạn.
                  </span>
                </p>
                <p className="mt-2 font-bold">
                  Với{" "}
                  <span className="text-[#ffff00] font-bold">
                    cách học khác hoàn toàn
                  </span>{" "}
                  với những gì bạn từng xem.
                </p>
                <p className="mt-2 font-bold">Lộ trình rõ ràng từng bước.</p>
              </div>
            </section>
          </GradientBorderSection>

          <GradientBorderSection>
            <section>
              <h2 className="text-center text-2xl md:text-4xl font-black text-[#ffff00] uppercase tracking-wide mb-2">
                Thành quả sau khi học
              </h2>
              <p className="text-center text-xl italic text-gray-300 mb-8">
                <span className="text-[#ffff00]">Thành quả</span> sau khi học
                của các học viên
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((slot) => {
                  const intro = getIntroBySlot(slot);
                  return (
                    <div
                      key={slot}
                      className="rounded overflow-hidden bg-[#222]"
                    >
                      <VideoSlot
                        slot={slot}
                        videoId={intro?.videoId ?? null}
                        loading={loading}
                      />
                    </div>
                  );
                })}
              </div>
            </section>
          </GradientBorderSection>

          <section className="px-6 py-4 cursor-pointer">
            <CtaButton
              text="Đăng ký học & nhận tài nguyên ngay"
              onClick={scrollToPayment}
            />
          </section>
        </div>

        {/* ==================== MOBILE ==================== */}
        <div className="md:hidden">
          <section className="px-4 py-4 text-center">
            <h1 className="text-3xl font-black text-[#ffff00] uppercase leading-tight mb-2">
              7 ngày thành thạo edit video tiktok
            </h1>
            <p className="text-base text-gray-400 leading-relaxed">
              Xem hàng chục video hướng dẫn edit... nhưng càng xem càng rối,
              càng mất thời gian và vẫn không biết bắt đầu từ đâu. Khóa học này
              là dành cho bạn.
            </p>
            <div className="mt-8 ">
              <CtaButton
                text="Đăng ký học & nhận tài nguyên ngay"
                onClick={scrollToPayment}
              />
            </div>
          </section>

          <GradientBorderSection>
            <section>
              <h2 className="text-center text-2xl font-black text-[#ffff00] uppercase tracking-wide mb-8">
                Bạn có đang mắc kẹt ở đây không?
              </h2>
              <ul className="flex flex-col gap-6 mb-8">
                {painPoints.map((point, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-4 text-base italic text-gray-300 leading-relaxed"
                  >
                    <XIcon />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <div className="pl-4 py-4">
                <p className="text-xl text-gray-300 tracking-wide font-bold leading-relaxed">
                  Nếu bạn vẫn học theo cách hiện tại...
                </p>
                <p className="text-xl tracking-wide font-bold text-[#ffff00] mt-2">
                  ➜ 3 tháng nữa bạn vẫn sẽ không biết edit từ đâu.
                </p>
              </div>
            </section>
          </GradientBorderSection>

          <GradientBorderSection>
            <section>
              <h2 className="text-center text-2xl font-black text-[#ffff00] uppercase tracking-wide mb-8">
                Sở hữu khóa học này, bạn sẽ được
              </h2>
              <ul className="flex flex-col gap-6 mb-8">
                {benefits.map((b, i) => (
                  <li key={i} className="flex items-center gap-4">
                    <CheckIcon />
                    <div className="text-base text-gray-300 leading-relaxed italic">
                      {b.title}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="text-center text-base text-gray-300 leading-relaxed italic px-2">
                <p className="font-bold">
                  Bạn không thiếu cố gắng, bạn chỉ đang thiếu{" "}
                  <span className="text-[#ffff00]">một lộ trình đúng.</span>
                </p>
                <p className="mt-3 font-bold">
                  Vậy nên khóa học này sinh ra là để{" "}
                  <span className="text-[#ffff00]">dành cho bạn.</span>
                </p>
                <p className="mt-3 font-bold">
                  Với{" "}
                  <span className="text-[#ffff00]">
                    cách học khác hoàn toàn
                  </span>{" "}
                  với những gì bạn từng xem.
                </p>
                <p className="mt-3 font-bold">Lộ trình rõ ràng từng bước.</p>
              </div>
            </section>
          </GradientBorderSection>

          <GradientBorderSection>
            <MobileResultsSection intros={intros} loading={loading} />
          </GradientBorderSection>

          <section className="px-4 py-4">
            <CtaButton
              text="Đăng ký học & nhận tài nguyên ngay"
              onClick={scrollToPayment}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
