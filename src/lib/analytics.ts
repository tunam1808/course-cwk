// Thống kê: Google Analytics 4 + Microsoft Clarity.
// - Chỉ tải khi có biến môi trường VITE_GA_ID / VITE_CLARITY_ID.
// - Không tải trên /quan-tri.
// - Thêm ?ga_debug=1 vào địa chỉ để sự kiện hiện trong DebugView của GA4.

const GA_ID = (import.meta.env.VITE_GA_ID || "").trim();
const CLARITY_ID = (import.meta.env.VITE_CLARITY_ID || "").trim();

type Params = Record<string, string>;
type Win = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  clarity?: ((...args: unknown[]) => void) & { q?: unknown[] };
};
const w = window as Win;

let loaded = false;
let lastPath = "";

export const isAdminPath = (pathname: string) => pathname === "/quan-tri" || pathname.startsWith("/quan-tri/");

function addScript(src: string) {
  const s = document.createElement("script");
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

function load() {
  if (loaded) return;
  loaded = true;
  if (GA_ID) {
    w.dataLayer = w.dataLayer || [];
    // gtag yêu cầu đẩy đúng đối tượng `arguments`
    w.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      w.dataLayer!.push(arguments);
    };
    w.gtag("js", new Date());
    const debug = new URLSearchParams(location.search).has("ga_debug");
    // Tự gửi page_view mỗi lần đổi trang trong SPA nên tắt page_view tự động
    w.gtag("config", GA_ID, { send_page_view: false, ...(debug ? { debug_mode: true } : {}) });
    addScript("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_ID));
  }
  if (CLARITY_ID) {
    const c = function (...args: unknown[]) {
      (c.q = c.q || []).push(args);
    } as NonNullable<Win["clarity"]>;
    w.clarity = w.clarity || c;
    addScript("https://www.clarity.ms/tag/" + encodeURIComponent(CLARITY_ID));
  }
}

function log(event: string, params?: Params) {
  if (import.meta.env.DEV) console.info("[thong-ke]", event, JSON.stringify(params || {}));
}

// Gọi mỗi lần đổi trang. GA4 tự đọc đuôi UTM từ page_location.
export function pageView(pathname: string) {
  if (pathname === lastPath) return;
  lastPath = pathname;
  if (isAdminPath(pathname)) return;
  load();
  const params = { page_location: location.href, page_path: pathname + location.search, page_title: document.title };
  log("page_view", params);
  w.gtag?.("event", "page_view", params);
}

// Gửi sự kiện: click_zalo {vi_tri}, chon_nganh {nganh}, phat_video {nganh}, sao_chep_so
export function track(event: "click_zalo" | "chon_nganh" | "phat_video" | "sao_chep_so", params?: Params) {
  if (isAdminPath(location.pathname)) return;
  log(event, params);
  w.gtag?.("event", event, params || {});
}
