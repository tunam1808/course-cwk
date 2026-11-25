import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { pageView } from "@/lib/analytics";

// Gửi page_view mỗi lần đổi trang trong SPA (không gửi khi chỉ đổi #hash).
export default function Analytics() {
  const { pathname } = useLocation();
  useEffect(() => {
    pageView(pathname);
  }, [pathname]);
  return null;
}
