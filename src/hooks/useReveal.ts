import { useLayoutEffect } from "react";
import { REVEALED, prefersReducedMotion } from "./motion";

// Khối có class "reveal": chỉ ẩn những khối nằm DƯỚI màn hình đầu lúc tải trang,
// hiện lên (trượt lên + rõ dần) khi cuộn tới. Các ô trong nhóm [data-stagger] lệch nhau 0,12s.
export function useReveal() {
  useLayoutEffect(() => {
    if (prefersReducedMotion() || !("IntersectionObserver" in window)) return;

    document.querySelectorAll<HTMLElement>("[data-stagger]").forEach((g) =>
      Array.from(g.children).forEach((c, i) => (c as HTMLElement).style.setProperty("--d", i * 0.12 + "s")),
    );

    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal")).filter(
      (e) => e.getBoundingClientRect().top > innerHeight,
    );
    els.forEach((e) => e.classList.add("pre"));

    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          en.target.classList.remove("pre");
          en.target.dispatchEvent(new CustomEvent(REVEALED));
          io.unobserve(en.target);
        }),
      { rootMargin: "0px 0px -12% 0px" },
    );
    els.forEach((e) => io.observe(e));

    return () => {
      io.disconnect();
      els.forEach((e) => e.classList.remove("pre"));
    };
  }, []);
}
