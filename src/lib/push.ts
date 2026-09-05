import { scheduleApi } from "@/api/schedule.api";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export type PushPermissionResult = "granted" | "denied" | "unsupported";

// Xin quyền + đăng ký nhận push notification cho thiết bị hiện tại, rồi gửi
// thông tin subscription lên server để lưu lại. An toàn khi gọi nhiều lần —
// nếu thiết bị đã subscribe rồi thì chỉ đồng bộ lại với server, không tạo
// subscription mới.
export async function enablePushNotifications(): Promise<PushPermissionResult> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return "unsupported";
  }
  if (!VAPID_PUBLIC_KEY) {
    console.warn("[push] Thiếu VITE_VAPID_PUBLIC_KEY trong .env frontend");
    return "unsupported";
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return "denied";

  const registration = await navigator.serviceWorker.ready;

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        VAPID_PUBLIC_KEY,
      ) as BufferSource,
    });
  }

  const json = subscription.toJSON();
  if (json.endpoint && json.keys?.p256dh && json.keys?.auth) {
    await scheduleApi.subscribePush({
      endpoint: json.endpoint,
      keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
    });
  }

  return "granted";
}

// Hủy nhận push trên thiết bị hiện tại (cả ở trình duyệt lẫn trên server)
export async function disablePushNotifications(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;

  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();
  await scheduleApi.unsubscribePush(endpoint);
}

// Kiểm tra trạng thái quyền hiện tại mà không xin lại quyền (dùng để hiển thị
// UI phù hợp, VD: đã bật rồi thì không cần hiện nút "Bật thông báo" nữa).
export function getNotificationPermissionStatus():
  | NotificationPermission
  | "unsupported" {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
}
