// Gửi số điện thoại khách về Google Apps Script (Sheets + Gmail).
// Chỉ báo thành công khi máy chủ trả về { ok: true } đọc được — không dùng mode "no-cors".

const ENDPOINT = (import.meta.env.VITE_LEAD_ENDPOINT || "").trim();

export type LeadSource = "bang_gia" | "cuoi_trang";
export type LeadResult =
  | { ok: true; id: string }
  | { ok: false; message: string };

// Số di động Việt Nam: 0 + (3|5|7|8|9) + 8 số; nhận +84 / 84, dấu cách, chấm, gạch
export function normalizePhone(v: string) {
  let s = v.slice(0, 30).replace(/[\s.\-()]/g, "");
  if (/^\+84/.test(s)) s = "0" + s.slice(3);
  else if (/^84\d{9}$/.test(s)) s = "0" + s.slice(2);
  return /^0(3|5|7|8|9)\d{8}$/.test(s) ? s : "";
}

export function newRequestId() {
  try {
    return crypto.randomUUID();
  } catch {
    return (
      Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 12)
    );
  }
}

const MESSAGES: Record<string, string> = {
  invalid_phone: "Số điện thoại chưa đúng. Ví dụ: 0912 345 678.",
  no_consent: "Bạn cần đồng ý để CWK liên hệ tư vấn qua số này.",
  rate_limited:
    "Hệ thống đang bận. Bạn thử lại sau ít phút, hoặc nhắn Zalo cho CWK.",
  busy: "Hệ thống đang bận. Bạn thử lại sau ít phút, hoặc nhắn Zalo cho CWK.",
};
const FAIL = "Chưa gửi được. Bạn thử lại, hoặc nhắn Zalo cho CWK.";

export async function sendLead(input: {
  phone: string;
  source: LeadSource;
  requestId: string;
  website: string;
}): Promise<LeadResult> {
  if (!ENDPOINT) return { ok: false, message: FAIL };
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return {
      ok: false,
      message: "Mất kết nối mạng. Bạn kiểm tra mạng rồi gửi lại.",
    };
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 25000);
  try {
    // Không đặt header tùy chỉnh: trình duyệt gửi dạng text/plain (yêu cầu "simple"),
    // không cần preflight, và vẫn đọc được phản hồi JSON của Apps Script.
    const res = await fetch(ENDPOINT, {
      method: "POST",
      body: JSON.stringify({ ...input, consent: true }),
      redirect: "follow",
      signal: ctrl.signal,
    });
    if (!res.ok) return { ok: false, message: FAIL };
    const data = (await res.json()) as {
      ok?: boolean;
      id?: string;
      code?: string;
    };
    if (data && data.ok === true)
      return { ok: true, id: String(data.id || "") };
    return {
      ok: false,
      message: (data && data.code && MESSAGES[data.code]) || FAIL,
    };
  } catch (e) {
    if ((e as Error).name === "AbortError")
      return { ok: false, message: "Máy chủ phản hồi chậm. Bạn thử gửi lại." };
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      return {
        ok: false,
        message: "Mất kết nối mạng. Bạn kiểm tra mạng rồi gửi lại.",
      };
    }
    return { ok: false, message: FAIL };
  } finally {
    clearTimeout(timer);
  }
}
