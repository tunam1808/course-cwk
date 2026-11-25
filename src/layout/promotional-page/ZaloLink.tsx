import type { ReactNode } from "react";
import { ZALO_URL } from "@/data/mock";
import { track } from "@/lib/analytics";

export type ViTri =
  | "nav"
  | "dau_trang"
  | "goi_10"
  | "goi_30"
  | "goi_50"
  | "bao_gia_rieng"
  | "khoi_cuoi"
  | "thanh_day";

// Mọi nút Zalo mở zalo.me ở tab mới và gửi sự kiện click_zalo kèm vị trí.
export default function ZaloLink({
  className,
  viTri,
  children,
}: {
  className: string;
  viTri: ViTri;
  children: ReactNode;
}) {
  return (
    <a
      className={className}
      href={ZALO_URL}
      target="_blank"
      rel="noopener"
      data-vi-tri={viTri}
      onClick={() => track("click_zalo", { vi_tri: viTri })}
    >
      {children}
    </a>
  );
}
