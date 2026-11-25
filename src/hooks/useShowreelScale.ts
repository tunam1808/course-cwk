import { useEffect, type RefObject } from "react";
import { prefersReducedMotion } from "./motion";

// Khung điện thoại trong showreel phóng to dần theo cuộn.
export function useShowreelScale(reel: RefObject<HTMLElement | null>, phone: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let raf = 0;
    function update() {
      const r = reel.current?.getBoundingClientRect();
      const p = phone.current;
      if (!r || !p) return;
      const k = Math.min(1, Math.max(0, 1 - r.top / innerHeight));
      p.style.transform = "scale(" + (0.86 + 0.2 * k).toFixed(3) + ") translateY(" + ((1 - k) * 30).toFixed(1) + "px)";
    }
    const onScroll = () => {
      raf = requestAnimationFrame(update);
    };
    addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [reel, phone]);
}
