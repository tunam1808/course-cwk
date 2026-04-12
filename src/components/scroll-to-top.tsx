import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 100);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <button
      onClick={scrollToTop}
      aria-label="Về đầu trang"
      className={`
        fixed bottom-6 right-6 z-50
        flex items-center justify-center
        w-12 h-12 rounded-full
        bg-yellow-500 hover:bg-yellow-400
        shadow-lg active:scale-95
        transition-all duration-300 ease-out
        ${
          visible
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-6 pointer-events-none"
        }
      `}
    >
      <ArrowUp className="w-6 h-6 text-white" strokeWidth={2.5} />
    </button>
  );
}
