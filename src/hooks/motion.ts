export const prefersReducedMotion = () =>
  typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

// Sự kiện bắn ra trên một khối .reveal khi nó vừa hiện lên lúc cuộn tới
export const REVEALED = "cwk:revealed";
