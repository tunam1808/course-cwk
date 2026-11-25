const tile =
  "tile reveal flex min-h-[220px] flex-col justify-start gap-[10px] rounded-[28px] bg-white px-[30px] py-9 text-left";
const stepn = "text-[14px] font-semibold text-[#bf4800]";
const big =
  "mt-[6px] text-[clamp(28px,3.2vw,34px)] font-bold leading-[1.12] tracking-[-.02em] text-ink";
const accent =
  "mt-[6px] bg-[linear-gradient(90deg,#001b42,#2453a4)] bg-clip-text text-[clamp(28px,3.2vw,34px)] font-bold leading-[1.12] tracking-[-.02em] text-transparent";
const text = "text-[17px] text-ink-2";

export default function Pain() {
  return (
    <section
      className="wrap mt-24 bg-gray py-24 text-center max-[640px]:py-[72px]"
      aria-labelledby="pain-h"
    >
      <div className="mx-auto max-w-[1024px]">
        <h2 className="sec-h reveal" id="pain-h">
          Quay xong.
          <br />
          Rồi để đó.
        </h2>
        <p className="body-l reveal mx-auto mt-5">
          Bạn có sản phẩm tốt và biết mình phải lên TikTok. Nhưng tối nào quay
          xong, đống clip lại nằm im trong máy vì không ai edit.
        </p>
        <p className="reveal mx-auto mt-[22px] max-w-[30ch] text-[clamp(19px,2.4vw,24px)] font-semibold">
          Mỗi tuần không đăng là một tuần khách hàng lướt qua cửa hàng của người
          khác.
        </p>
        <div
          className="mt-14 grid grid-cols-[repeat(3,1fr)] gap-5 max-[760px]:grid-cols-[1fr]"
          data-stagger
        >
          <div className={tile}>
            <span className={stepn}>Bước 1</span>
            <div className={big}>Gửi clip thô.</div>
            <p className={text}>
              Quay bằng điện thoại, nhiều clip ngắn hay một đoạn dài đều được.
              Gửi qua Zalo hoặc Google Drive.
            </p>
          </div>
          <div className={tile}>
            <span className={stepn}>Bước 2</span>
            <div className={accent}>
              Dự kiến <span className="whitespace-nowrap">24–48 giờ.</span>
            </div>
            <p className={text}>
              Cắt ghép, phụ đề, nhạc và hiệu ứng theo phong cách kênh của bạn.
              Thời gian tính từ khi xác nhận brief và nhận đủ tư liệu, tùy độ
              phức tạp và lịch sản xuất.
            </p>
          </div>
          <div className={tile}>
            <span className={stepn}>Bước 3</span>
            <div className={big}>Nhận video, đăng ngay.</div>
            <p className={text}>Chưa ưng chỗ nào thì sửa miễn phí 2 lần.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
