import { useEffect, useState } from "react";

// Thanh Zalo ở đáy chỉ hiện khi đã cuộn qua phần đầu trang (#top).
export function useStickyBar() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    let raf = 0;
    function update() {
      const hero = document.getElementById("top");
      if (hero) setOn(hero.getBoundingClientRect().bottom < innerHeight * 0.6);
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
  }, []);
  return on;
}
