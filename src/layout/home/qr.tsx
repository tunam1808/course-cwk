const steps = [
  {
    label: "Bước 1 :",
    content: (
      <>
        Quét mã QR bên trên (Tiến hành thanh toán)
        <br />
        hoặc thông tin này
        <br />
        STK : <span className="text-white">999999999914</span>
        <br />
        Ngân hàng : <span className="text-white">MB Bank</span>
        <br />
        Chủ TK : <span className="text-white">Phùng Ngọc Phương</span>
      </>
    ),
  },
  {
    label: "Bước 2 :",
    content: (
      <>
        Gửi ảnh thanh toán + Gmail qua zalo
        <br />
        <span className="text-white">0335529408</span>
      </>
    ),
  },
  {
    label: "Bước 3 :",
    content: <>Vào lớp &amp; nhận quà VIP ngay lập tức</>,
  },
];

export default function PaymentSection() {
  return (
    // id="payment-section" để introduce.tsx có thể scroll đến
    <div id="payment-section">
      {/* ==================== DESKTOP ==================== */}
      <div className="hidden md:block">
        <div className="max-w-[1150px] mx-auto px-4 md:px-6 my-6 mt-6">
          <div
            className="border-transparent rounded-2xl p-[10px]"
            style={{
              background:
                "linear-gradient(to right, #1d1d1d, #1d1d1d, #203756, #1d3e5d)",
            }}
          >
            <div
              className="border border-white rounded-xl px-16 py-10"
              style={{
                background:
                  "linear-gradient(to right, #1d1d1d, #1d1d1d, #203756, #1d3e5d)",
              }}
            >
              <h2 className="text-center text-3xl font-black text-[#ffff00] uppercase tracking-wide mb-8 leading-tight">
                Hành động ngay - Đừng chần chừ thêm một giây nào nữa!
              </h2>
              <div className="flex  items-center">
                {/* Left: QR */}
                <div className="flex-1 flex items-center justify-center">
                  <div className=" w-full aspect-square max-w-[380px]">
                    <img
                      src="/Qr.png"
                      alt="QR thanh toán"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                {/* Right: Steps */}
                <div className="flex-1 flex flex-col gap-4">
                  {steps.map((step, i) => (
                    <div key={i}>
                      <p className="text-[22px] font-black text-[#ffff00] uppercase mb-1">
                        {step.label}
                      </p>
                      <p className="text-[22px] text-gray-300 italic leading-relaxed">
                        {step.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-center text-[30px] font-bold text-[#ffff00] italic mt-8 leading-relaxed">
                Trợ lý sẽ kích hoạt khóa học và gửi toàn bộ Kho Tài Nguyên VIP
                trị giá 2.5 triệu cho bạn trong vòng 1 phút
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== MOBILE ==================== */}
      <div className="md:hidden">
        <div className="max-w-[1150px] mx-auto px-4 my-2">
          <div
            className="border-transparent rounded-2xl p-[10px]"
            style={{
              background:
                "linear-gradient(to right, #1d1d1d, #1d1d1d, #203756, #1d3e5d)",
            }}
          >
            <div
              className="border border-white rounded-xl px-6 py-8"
              style={{
                background:
                  "linear-gradient(to right, #1d1d1d, #1d1d1d, #203756, #1d3e5d)",
              }}
            >
              <h2 className="text-center text-xl font-black text-[#ffff00] uppercase tracking-wide mb-6 leading-tight">
                Hành động ngay - Đừng chần chừ thêm một giây nào nữa!
              </h2>

              <div className="flex flex-col gap-6">
                {/* QR Code */}
                <div className="flex items-center justify-center">
                  <div className="w-full max-w-[300px] aspect-square">
                    <img
                      src="/Qr.png"
                      alt="QR thanh toán"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Các bước */}
                <div className="flex flex-col gap-4">
                  {steps.map((step, i) => (
                    <div key={i}>
                      <p className="text-base font-black text-[#ffff00] uppercase mb-1">
                        {step.label}
                      </p>
                      <p className="text-base text-gray-300 italic leading-relaxed">
                        {step.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-center text-[15px] font-bold text-[#ffff00] italic mt-8 leading-relaxed">
                Trợ lý sẽ kích hoạt khóa học và gửi toàn bộ Kho Tài Nguyên VIP
                trị giá 2.5 triệu cho bạn trong vòng 1 phút
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
