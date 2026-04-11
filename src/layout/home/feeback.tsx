import { useRef, useState } from "react";
import { MdChevronLeft, MdChevronRight, MdClose } from "react-icons/md";

const feedbackImages = [
  "1.png",
  "2.png",
  "3.png",
  "4.png",
  "5.png",
  "6.png",
  "7.png",
  "8.png",
  "9.png",
  "10.png",
];

export default function Feedback() {
  const [current, setCurrent] = useState(0);
  const [desktopCurrent, setDesktopCurrent] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const touchStartX = useRef<number | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const mobileTotal = Math.ceil(feedbackImages.length / 2);
  const desktopTotal = Math.ceil(feedbackImages.length / 5);

  const prev = () => setCurrent((c) => (c - 1 + mobileTotal) % mobileTotal);
  const next = () => setCurrent((c) => (c + 1) % mobileTotal);

  const prevDesktop = () =>
    setDesktopCurrent((c) => (c - 1 + desktopTotal) % desktopTotal);
  const nextDesktop = () => setDesktopCurrent((c) => (c + 1) % desktopTotal);

  // Mở ảnh
  const openImage = (src: string) => {
    setSelectedImage(src);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Đóng modal
  const closeModal = () => {
    setSelectedImage(null);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Xử lý wheel zoom (desktop)
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale((prev) => Math.max(0.5, Math.min(5, prev * delta)));
  };

  // Drag (kéo ảnh khi đã zoom)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch support cho drag & pinch (cơ bản)
  const handleTouchStartImg = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleTouchMoveImg = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    }
  };

  const handleTouchEndImg = () => setIsDragging(false);

  return (
    <section className="max-w-[1130px] mx-auto mt-10 px-4">
      {/* Gradient Border Container */}
      <div
        className="rounded-3xl p-[10px]"
        style={{
          background:
            "linear-gradient(to right, #1d1d1d, #1d1d1d, #1d3e5d, #203756)",
        }}
      >
        <div className="border border-white rounded-2xl p-6 md:p-10">
          <div className="mb-4">
            <h2 className="text-[#ffff00] font-black text-2xl md:text-3xl uppercase text-center tracking-wide">
              Feedback về khóa học
            </h2>

            <p className="text-center text-gray-300 text-sm md:text-lg mt-4 leading-relaxed max-w-2xl mx-auto">
              <span className="text-[#ffff00] font-bold">Hơn 1000+ người</span>{" "}
              đã phá bỏ rào cản<br></br>{" "}
              <span className="italic">"mù công nghệ"</span> và nhân 3 thu nhập
              như thế nào?
            </p>
          </div>

          {/* Desktop Slider */}
          <div className="hidden md:block relative">
            <div className="overflow-hidden rounded-xl">
              <div
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${desktopCurrent * 100}%)` }}
              >
                {Array.from({ length: desktopTotal }).map((_, slideIndex) => (
                  <div key={slideIndex} className="min-w-full flex gap-4">
                    {feedbackImages
                      .slice(slideIndex * 5, slideIndex * 5 + 5)
                      .map((src, i) => (
                        <div
                          key={i}
                          className="w-1/5 cursor-pointer"
                          onClick={() => openImage(src)}
                        >
                          <img
                            src={src}
                            alt={`Feedback ${slideIndex * 5 + i + 1}`}
                            className="w-full h-auto object-contain rounded-xl border-3 border-[#ff8400] transition-colors"
                          />
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={prevDesktop}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black transition"
            >
              <MdChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextDesktop}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black transition"
            >
              <MdChevronRight className="w-6 h-6" />
            </button>

            <div className="flex justify-center gap-1.5 mt-4">
              {Array.from({ length: desktopTotal }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setDesktopCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === desktopCurrent ? "bg-yellow-400 w-4" : "bg-gray-600"}`}
                />
              ))}
            </div>
          </div>

          {/* Mobile Slider */}
          <div className="md:hidden relative">
            <div
              className="overflow-hidden rounded-xl"
              onTouchStart={(e) => {
                touchStartX.current = e.touches[0].clientX;
              }}
              onTouchEnd={(e) => {
                if (!touchStartX.current) return;
                const diff = touchStartX.current - e.changedTouches[0].clientX;
                if (diff > 50) next();
                else if (diff < -50) prev();
                touchStartX.current = null;
              }}
            >
              <div
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${current * 100}%)` }}
              >
                {Array.from({ length: mobileTotal }).map((_, slideIndex) => (
                  <div key={slideIndex} className="min-w-full flex gap-2">
                    {feedbackImages
                      .slice(slideIndex * 2, slideIndex * 2 + 2)
                      .map((src, i) => (
                        <div
                          key={i}
                          className="w-1/2 cursor-pointer"
                          onClick={() => openImage(src)}
                        >
                          <img
                            src={src}
                            alt={`Feedback ${slideIndex * 2 + i + 1}`}
                            className="w-full h-auto object-contain rounded-xl border-2 border-[#ff8400]"
                          />
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black transition"
            >
              <MdChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black transition"
            >
              <MdChevronRight className="w-5 h-5" />
            </button>

            <div className="flex justify-center gap-1.5 mt-3">
              {Array.from({ length: mobileTotal }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === current ? "bg-yellow-400 w-4" : "bg-gray-600"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ==================== IMAGE MODAL ==================== */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeModal}
        >
          <button
            onClick={closeModal}
            className="absolute top-6 right-6 text-white text-4xl z-50 hover:text-gray-300 transition"
          >
            <MdClose />
          </button>

          <div
            className="relative max-w-[95vw] max-h-[95vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()} // Ngăn đóng khi click vào ảnh
          >
            <img
              ref={imgRef}
              src={selectedImage}
              alt="Feedback lớn"
              className="max-w-full max-h-[90vh] object-contain cursor-grab active:cursor-grabbing select-none"
              style={{
                transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
                transition: isDragging ? "none" : "transform 0.1s ease-out",
              }}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStartImg}
              onTouchMove={handleTouchMoveImg}
              onTouchEnd={handleTouchEndImg}
            />
          </div>
        </div>
      )}
    </section>
  );
}
