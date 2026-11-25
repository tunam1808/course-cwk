const term =
  "term reveal flex flex-col gap-[10px] rounded-[28px] bg-[#1d1d1f] px-8 py-9";
const k =
  "text-[clamp(30px,4vw,40px)] leading-[1.1] font-semibold tracking-[-.01em] text-yellow";
const kt =
  "text-[clamp(19px,2.2vw,22px)] leading-[1.25] font-semibold tracking-[-.01em] text-[#f5f5f7]";
const text = "text-[17px] text-[#a1a1a6]";

// Lợi ích (marketing). Điều khoản chi tiết nằm trong hợp đồng, không hiển thị ở đây.
const LOI_ICH = [
  {
    k: "24–48h",
    kt: "Bàn giao dự kiến",
    p: "Sau khi xác nhận brief và nhận đủ tư liệu, tùy lịch sản xuất.",
  },
  {
    k: "2 lần",
    kt: "Chỉnh sửa miễn phí",
    p: "Tinh chỉnh để video phù hợp với nội dung đã thống nhất.",
  },
  {
    k: "Nhất quán.",
    kt: "Theo phong cách kênh",
    p: "Hậu kỳ đồng bộ với định hướng nội dung và nhận diện của bạn.",
  },
  {
    k: "Đơn giản.",
    kt: "Bạn gửi footage",
    p: "Gửi qua Zalo hoặc Google Drive. CWK phụ trách hậu kỳ.",
  },
];

export default function Terms() {
  return (
    <section
      className="wrap bg-black py-24 text-center text-[#f5f5f7] max-[640px]:py-[72px]"
      id="camket"
      aria-labelledby="cam-h"
    >
      <div className="mx-auto max-w-[1024px]">
        <h2 className="sec-h reveal" id="cam-h">
          Hậu kỳ gọn nhẹ. Mọi thứ rõ ràng.
        </h2>
        <div
          className="mt-14 grid grid-cols-[repeat(2,1fr)] gap-5 text-left max-[760px]:grid-cols-[1fr]"
          data-stagger
        >
          {LOI_ICH.map((x) => (
            <div key={x.kt} className={term}>
              <div className={k}>{x.k}</div>
              <h3 className={kt}>{x.kt}</h3>
              <p className={text}>{x.p}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
