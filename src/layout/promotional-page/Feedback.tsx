import { useEffect, useState } from "react";
import { feedbackApi, type FeedbackImage } from "@/api/feedback.api";

export default function Feedback() {
  const [images, setImages] = useState<FeedbackImage[]>([]);

  useEffect(() => {
    let ignore = false;
    feedbackApi
      .getAll()
      .then((data) => {
        if (!ignore) setImages(data);
      })
      .catch((error) => {
        console.error("[Feedback] Không tải được ảnh:", error);
      });
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <section
      className="wrap bg-gray py-24 text-center max-[640px]:py-[72px]"
      aria-labelledby="fb-h"
      hidden={images.length === 0} // chưa có ảnh thì ẩn cả khối
    >
      <div className="mx-auto max-w-[1024px]">
        <h2 className="sec-h reveal" id="fb-h">
          Khách nói gì.
        </h2>
        <div className="mt-14 grid grid-cols-[repeat(3,1fr)] gap-5 max-[760px]:grid-cols-[1fr_1fr]">
          {images.map((image, i) => (
            <div
              key={image.id}
              className="aspect-[3/4] overflow-hidden rounded-[28px] border border-line bg-white"
            >
              <img
                src={image.imageUrl}
                alt={`Feedback của khách hàng ${i + 1}`}
                loading="lazy"
                className="h-full w-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
