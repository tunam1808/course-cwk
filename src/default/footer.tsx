import React, { useState } from "react";

import {
  FaPlay,
  FaGift,
  FaHeadphones,
  FaCheckCircle,
  FaStar,
  FaUsers,
  FaDownload,
  FaBookOpen,
  FaYoutube,
  FaFacebook,
} from "react-icons/fa";

import { SiTiktok, SiZalo } from "react-icons/si";

// ─── Zalo QR Modal ────────────────────────────────────────────────────────────
function ZaloQRModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative rounded-2xl p-7 text-center"
        style={{
          background: "linear-gradient(135deg, #1d1d1d, #1e3350)",
          border: "1px solid #ffff00",
          maxWidth: 300,
          width: "90%",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-white text-xl leading-none"
        >
          ✕
        </button>

        {/* Zalo icon */}
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
          style={{ background: "#0068ff" }}
        >
          <SiZalo className="w-7 h-7 text-white" />
        </div>

        <div className="text-[#ffff00] font-black text-base mb-1">
          Kết nối Zalo
        </div>
        <div className="text-gray-400 text-xs mb-4">
          Quét mã QR để kết nối với mình nhé!
        </div>

        {/* QR Image */}
        <div className="bg-white rounded-xl p-2.5 inline-block mb-4">
          <img
            src="/qr_zalo.png"
            alt="Zalo QR Code"
            className="w-44 h-44 object-contain block"
          />
        </div>

        <div className="text-gray-500 text-xs">
          Hoặc tìm kiếm SĐT{" "}
          <span className="text-[#ffff00] font-bold">0335.529.408</span>
        </div>
      </div>
    </div>
  );
}

// ─── Counter ──────────────────────────────────────────────────────────────────
const Counter = ({
  end,
  suffix = "",
  decimals = 0,
  className = "",
}: {
  end: number;
  suffix?: string;
  decimals?: number;
  className?: string;
}) => {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    let start = 0;
    const duration = 1800;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Number(start.toFixed(decimals)));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [end, decimals]);

  return (
    <div className={className}>
      {count}
      {suffix}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const Footer: React.FC = () => {
  const [zaloOpen, setZaloOpen] = useState(false);

  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen font-sans">
      {zaloOpen && <ZaloQRModal onClose={() => setZaloOpen(false)} />}

      {/* ==================== HEADER ==================== */}
      <div className="max-w-[1150px] mx-auto px-4 md:px-6 my-5">
        <div
          className="border-transparent rounded-2xl p-[10px]"
          style={{
            background:
              "linear-gradient(to right, #1d1d1d, #1d1d1d, #203756, #1d3e5d)",
          }}
        >
          <div
            className="border border-white rounded-xl px-6 md:px-12 py-10 md:py-12"
            style={{
              background:
                "linear-gradient(to right, #1d1d1d, #1d1d1d, #203756, #1d3e5d)",
            }}
          >
            <h1 className="text-center text-2xl md:text-4xl font-bold mb-10 leading-[1.1] text-white">
              BẮT ĐẦU HÀNH TRÌNH{" "}
              <span className="text-[#ffff00]">EDIT VIDEO NGAY HÔM NAY !</span>
            </h1>

            <div className="grid md:grid-cols-5 gap-6">
              {[
                {
                  icon: <FaBookOpen className="w-9 h-9 text-[#ffff00]" />,
                  title: "Học dễ hiểu",
                  desc: "Lộ trình đơn giản, dễ áp dụng",
                },
                {
                  icon: <FaPlay className="w-9 h-9 text-[#ffff00]" />,
                  title: "Thực hành thực tế",
                  desc: "Học đi đôi với làm, có sản phẩm ngay",
                },
                {
                  icon: <FaGift className="w-9 h-9 text-[#ffff00]" />,
                  title: "Tài nguyên giá trị",
                  desc: "Kho tài nguyên VIP trị giá 2.5 triệu",
                },
                {
                  icon: <FaHeadphones className="w-9 h-9 text-[#ffff00]" />,
                  title: "Hỗ trợ tận tâm",
                  desc: "Đồng hành 24/7 trong suốt quá trình học",
                },
                {
                  icon: <FaCheckCircle className="w-9 h-9 text-[#ffff00]" />,
                  title: "Hoàn tiền 7 ngày",
                  desc: "Cam kết hoàn tiền nếu không hài lòng",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 bg-white/5 hover:bg-white/10 transition-all border border-white/10 rounded-2xl p-6 group h-full"
                >
                  <div className="flex-shrink-0">{item.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xs mb-1 text-[#ffff00] group-hover:text-yellow-300 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-gray-300 text-[10px] leading-tight">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ==================== MAIN CONTENT ==================== */}
      <div className="max-w-[1150px] mx-auto px-4 md:px-6 my-10">
        <div
          className="border-transparent rounded-2xl p-[10px]"
          style={{
            background:
              "linear-gradient(to right, #1d1d1d, #1d1d1d, #203756, #1d3e5d)",
          }}
        >
          <div
            className="border border-white rounded-xl px-5 md:px-10 py-8 md:py-12"
            style={{
              background:
                "linear-gradient(to right, #1d1d1d, #1d1d1d, #203756, #1d3e5d)",
            }}
          >
            <div className="grid md:grid-cols-12 gap-10">
              {/* LEFT COLUMN */}
              <div className="md:col-span-5">
                <div className="-mb-6 -mt-10 md:-mb-10 md:-mt-18">
                  <img
                    src="/logo.png"
                    alt="Cursed With Knowledge"
                    className="h-35 md:h-72 w-auto"
                  />
                </div>

                <p className="text-[#ffff00] italic leading-relaxed mb-10 text-base md:text-[20px]">
                  Nơi cung cấp kiến thức và tài nguyên để bạn tự tin tạo ra
                  những video chuyên nghiệp, thu hút và bứt phá trên mọi nền
                  tảng.
                </p>

                <div>
                  <h3 className="font-bold text-xl mb-6">KẾT NỐI VỚI MÌNH</h3>

                  <div className="flex gap-4 mb-8">
                    <a
                      href="https://www.tiktok.com/@bientapnghiepdu"
                      className="w-11 h-11 bg-white/10 hover:bg-yellow-400 hover:text-black rounded-2xl flex items-center justify-center transition-all"
                    >
                      <SiTiktok className="w-6 h-6" />
                    </a>
                    <a
                      href="https://www.youtube.com/@bientapnghiepdu"
                      className="w-11 h-11 bg-white/10 hover:bg-yellow-400 hover:text-black rounded-2xl flex items-center justify-center transition-all"
                    >
                      <FaYoutube className="w-6 h-6" />
                    </a>
                    <a
                      href="https://www.facebook.com/bientapnghiepdu247"
                      className="w-11 h-11 bg-white/10 hover:bg-yellow-400 hover:text-black rounded-2xl flex items-center justify-center transition-all"
                    >
                      <FaFacebook className="w-6 h-6" />
                    </a>

                    {/* ── Zalo button — đổi thành <button> + mở modal ── */}
                    <button
                      onClick={() => setZaloOpen(true)}
                      className="w-11 h-11 bg-white/10 hover:bg-yellow-400 hover:text-black rounded-2xl flex items-center justify-center transition-all"
                    >
                      <SiZalo className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-5 text-gray-300 text-sm md:text-base">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📞</span>
                      <span>0335.529.408</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">✉️</span>
                      <span>cwkphuong@gmail.com</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🌐</span>
                      <span>
                        <a href="">coursecwk.com (Biên tập nghiệp dư)</a>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="md:col-span-7">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                  {/* KHÁM PHÁ */}
                  <div>
                    <h3 className="font-bold text-lg mb-4 text-[#ffff00]">
                      KHÁM PHÁ
                    </h3>
                    <ul className="space-y-2.5 text-gray-300 text-sm">
                      <li>
                        <a
                          href="/"
                          className="hover:text-[#ffff00] transition-colors"
                        >
                          › Trang chủ
                        </a>
                      </li>
                      <li>
                        <a
                          href="/free-courses"
                          className="hover:text-[#ffff00] transition-colors"
                        >
                          › Học miễn phí
                        </a>
                      </li>
                      <li>
                        <a
                          href="/list-courses"
                          className="hover:text-[#ffff00] transition-colors"
                        >
                          › Các khóa học
                        </a>
                      </li>
                      <li>
                        <a
                          href="/vip-sources"
                          className="hover:text-[#ffff00] transition-colors"
                        >
                          › Kho tài nguyên
                        </a>
                      </li>
                      <li>
                        <a
                          href="/contact"
                          className="hover:text-[#ffff00] transition-colors"
                        >
                          › Liên hệ
                        </a>
                      </li>
                    </ul>
                  </div>

                  {/* HỖ TRỢ */}
                  <div>
                    <h3 className="font-bold text-lg mb-4 text-[#ffff00]">
                      HỖ TRỢ
                    </h3>
                    <ul className="space-y-2.5 text-gray-300 text-sm">
                      <li>› Hướng dẫn thanh toán</li>
                      <li>› Chính sách bảo mật</li>
                      <li>› Điều khoản sử dụng</li>
                      <li>› Câu hỏi thường gặp</li>
                    </ul>
                  </div>

                  {/* VỀ COURSECWK */}
                  <div>
                    <h3 className="font-bold text-lg mb-4 text-[#ffff00]">
                      VỀ COURSECWK
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      CourseCWK được xây dựng với sứ mệnh giúp mọi người có thể
                      tự tin edit video từ con số 0, ứng dụng vào thực tế để tạo
                      ra thu nhập và xây dựng thương hiệu cá nhân.
                    </p>
                    <div className="flex justify-start md:justify-end mt-8">
                      <button className="w-full md:w-auto min-w-[300px] md:min-w-[380px] border-2 border-[#ffff00] text-[#ffff00] hover:bg-[#ffff00] hover:text-black font-bold px-8 md:px-12 py-4 rounded-2xl transition-all text-sm tracking-wider whitespace-nowrap">
                        TÌM HIỂU THÊM VỀ MÌNH →
                      </button>
                    </div>
                  </div>
                </div>

                {/* TƯ VẤN MIỄN PHÍ */}
                <div className="border-2 border-[#ffff00] rounded-3xl p-6 md:p-8">
                  <div className="flex flex-col sm:flex-row items-start gap-6 mb-6">
                    <FaHeadphones className="w-14 h-14 text-[#ffff00] flex-shrink-0 mt-1" />
                    <div>
                      <h2 className="text-2xl font-bold">TƯ VẤN MIỄN PHÍ</h2>
                      <p className="text-[#ffff00] italic">
                        (Dành cho người mới bắt đầu)
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-5 gap-8">
                    <div className="md:col-span-3 italic space-y-4">
                      {[
                        "Lộ trình học edit từ cơ bản đến nâng cao",
                        "Được hướng dẫn từng bước để tự làm video đầu tiên",
                        'Có người giải đáp khi bạn bị "mắc" trong lúc học',
                      ].map((text, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <FaCheckCircle className="w-6 h-6 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-200">{text}</span>
                        </div>
                      ))}
                    </div>

                    <div className="md:col-span-2">
                      <input
                        type="tel"
                        placeholder="Nhập số điện thoại..."
                        className="w-full bg-transparent border border-white/30 rounded-2xl px-5 py-4 mb-4 focus:outline-none focus:border-[#ffff00] text-sm"
                      />
                      <button className="w-full bg-[#ffff00] hover:bg-yellow-300 text-black font-black py-4 rounded-2xl text-lg transition-all">
                        TƯ VẤN MIỄN PHÍ
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-[#ffff00] my-10"></div>

            {/* STATS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
              {[
                {
                  icon: <FaUsers className="w-10 h-10 md:w-11 md:h-11" />,
                  end: 1000,
                  suffix: "+",
                  decimals: 0,
                  label: "Học viên đã tin tưởng",
                },
                {
                  icon: <FaPlay className="w-10 h-10 md:w-11 md:h-11" />,
                  end: 5000,
                  suffix: "+",
                  decimals: 0,
                  label: "Video được tạo ra",
                },
                {
                  icon: <FaDownload className="w-10 h-10 md:w-11 md:h-11" />,
                  end: 2500,
                  suffix: "+",
                  decimals: 0,
                  label: "Tài nguyên chất lượng",
                },
                {
                  icon: <FaStar className="w-10 h-10 md:w-11 md:h-11" />,
                  end: 4.9,
                  suffix: "/5",
                  decimals: 1,
                  label: "Đánh giá từ học viên",
                },
              ].map((s, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="text-[#ffff00] mb-2">{s.icon}</div>
                  <Counter
                    end={s.end}
                    suffix={s.suffix}
                    decimals={s.decimals}
                    className="text-3xl md:text-4xl font-bold text-[#ffff00]"
                  />
                  <div className="text-xs md:text-sm text-white mt-1">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <footer className="border-t border-white/10 py-1 mb-4 bg-black">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white">
            <div>
              <p>© 2026 CourseCWK. All rights reserved.</p>
              <p>Không sao chép nội dung dưới mọi hình thức.</p>
            </div>
            <div className="flex items-center gap-2 text-yellow-400">
              <span className="text-lg">❤️</span>
              <span className="text-white">
                Nếu bạn thấy website hữu ích, hãy chia sẻ cho bạn bè cùng học
                nhé!
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
