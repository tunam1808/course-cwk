import { useEffect, useState, type RefObject } from "react";
import { REVEALED } from "./motion";

// Con số đếm lên (1,2 giây, chậm dần) khi khối chứa nó vừa hiện lên lúc cuộn tới.
export function useCountUp(ref: RefObject<HTMLElement | null>, to: number) {
  const [value, setValue] = useState(to);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let done = false;
    function start() {
      if (done) return;
      done = true;
      const t0 = performance.now();
      const tick = (t: number) => {
        const k = Math.min(1, (t - t0) / 1200);
        const e = 1 - Math.pow(1 - k, 3);
        setValue(Math.round(to * e));
        if (k < 1) raf = requestAnimationFrame(tick);
      };
      tick(t0);
    }
    el.addEventListener(REVEALED, start);
    return () => {
      el.removeEventListener(REVEALED, start);
      cancelAnimationFrame(raf);
      setValue(to);
    };
  }, [ref, to]);

  return value;
}
