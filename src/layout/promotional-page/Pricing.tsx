import LeadForm from "./LeadForm";
import ZaloLink, { type ViTri } from "./ZaloLink";

type Goi = {
  ten: string;
  soVideo: string;
  gia: string;
  moiVideo: string;
  phuHop: string;
  viTri: ViTri;
  hot?: boolean;
};

// Giá cố định trong code như bản mẫu
const GOI: Goi[] = [
  {
    ten: "Gói 10",
    soVideo: "10 video mỗi tháng",
    gia: "2.800.000đ",
    moiVideo: "280.000đ mỗi video",
    phuHop: "Đăng 2–3 lần/tuần",
    viTri: "goi_10",
  },
  {
    ten: "Gói 30",
    soVideo: "30 video mỗi tháng",
    gia: "7.000.000đ",
    moiVideo: "~233.000đ mỗi video",
    phuHop: "Đăng mỗi ngày",
    viTri: "goi_30",
    hot: true,
  },
  {
    ten: "Gói 50",
    soVideo: "50 video mỗi tháng",
    gia: "10.500.000đ",
    moiVideo: "210.000đ mỗi video",
    phuHop: "Nhiều kênh, nhiều sản phẩm",
    viTri: "goi_50",
  },
];

function Plan({ g }: { g: Goi }) {
  const hot = !!g.hot;
  const li =
    "flex justify-between gap-3 border-t py-3 text-[15px] " +
    (hot
      ? "border-[rgba(255,255,255,.14)] text-[#c7cfe0]"
      : "border-line text-ink-2");
  const b = "text-right font-medium " + (hot ? "text-white" : "text-ink");
  const soft = hot ? "text-[#c7cfe0]" : "text-ink-2";
  return (
    <article
      className={
        "plan reveal relative flex min-w-0 flex-col items-center gap-[6px] rounded-[28px] px-[30px] pt-10 pb-[34px] text-center " +
        (hot ? "bg-navy text-white" : "bg-gray")
      }
    >
      <span
        className={
          "h-[18px] text-[12px] font-semibold tracking-[.02em] " +
          (hot ? "text-yellow" : "text-[#bf4800]")
        }
      >
        {hot ? "Phổ biến nhất" : ""}
      </span>
      <h3 className="mt-[6px] text-[28px] font-semibold tracking-[.004em]">
        {g.ten}
      </h3>
      <p className={"mt-[14px] text-[14px] " + soft}>{g.soVideo}</p>
      <div className="text-[40px] leading-[1.1] font-semibold tracking-[-.02em] tabular-nums">
        {g.gia}
      </div>
      <p className={"text-[14px] tabular-nums " + soft}>{g.moiVideo}</p>
      <ul className="mt-[26px] mb-7 w-full list-none p-0 text-left">
        <li className={li}>
          Giao video<b className={b}>Dự kiến 24–48 giờ</b>
        </li>
        <li className={li}>
          Sửa miễn phí<b className={b}>2 lần</b>
        </li>
        <li className={li}>
          Phụ đề, nhạc, logo<b className={b}>Có</b>
        </li>
        <li className={li}>
          Phù hợp<b className={b}>{g.phuHop}</b>
        </li>
      </ul>
      <ZaloLink
        className={"pill mt-auto " + (hot ? "pill-yellow" : "pill-navy")}
        viTri={g.viTri}
      >
        Chọn {g.ten.toLowerCase()}
      </ZaloLink>
    </article>
  );
}

export default function Pricing() {
  return (
    <section
      className="wrap py-24 text-center max-[640px]:py-[72px]"
      id="gia"
      aria-labelledby="gia-h"
    >
      <div className="mx-auto max-w-[1024px]">
        <h2 className="sec-h reveal" id="gia-h">
          Chọn gói của bạn.
        </h2>
        <p className="sub reveal mt-[14px]">
          Trả theo tháng. Mỗi video tối đa 90 giây.
        </p>
        <div
          className="mt-14 grid grid-cols-[repeat(3,1fr)] gap-5 max-[860px]:mx-auto max-[860px]:max-w-[460px] max-[860px]:grid-cols-[1fr]"
          data-stagger
        >
          {GOI.map((g) => (
            <Plan key={g.ten} g={g} />
          ))}
        </div>
        <p className="mt-7 text-[15px] text-ink-2">
          Cần phong cách dựng riêng hoặc số lượng khác? CWK tư vấn và báo giá
          theo nhu cầu của bạn.{" "}
          <ZaloLink className="more" viTri="bao_gia_rieng">
            Nhận báo giá riêng
          </ZaloLink>
        </p>
        <LeadForm source="bang_gia" />
      </div>
    </section>
  );
}
