const pricingItems = [
  { label: "Khóa học 7 ngày edit video", price: "1.399.000 VNĐ" },
  { label: "Kho tài nguyên edit", price: "2.499.000 VNĐ" },
  { label: "Hỗ trợ 24/7 mọi vấn đề", price: null },
];

export default function OffersSection() {
  return (
    <>
      {/* ==================== DESKTOP ==================== */}
      <div className="hidden md:block">
        <div className="max-w-[1150px] mx-auto px-4 md:px-6 my-6 mt-10">
          <div
            className="border-transparent rounded-2xl p-[10px]"
            style={{
              background:
                "linear-gradient(to right, #1d1d1d, #1d1d1d, #203756, #1d3e5d)",
            }}
          >
            <div
              className="border border-white rounded-xl px-25 py-10"
              style={{
                background:
                  "linear-gradient(to right, #1d1d1d, #1d1d1d, #203756, #1d3e5d)",
              }}
            >
              <h2 className="text-center text-2xl md:text-4xl font-black text-[#ffff00] uppercase tracking-wide mb-6 leading-tight">
                Khóa học 7 ngày tự edit video
              </h2>

              <ul className="flex flex-col gap-3 mb-8">
                {pricingItems.map((item, i) => (
                  <li
                    key={i}
                    className="text-base md:text-xl text-white uppercase tracking-wide font-normal"
                  >
                    - {item.label}
                    {item.price && (
                      <span className="text-[#ffff00] italic font-normal">
                        {" "}
                        ({item.price})
                      </span>
                    )}
                  </li>
                ))}
              </ul>

              <p className="text-[22px] font-black text-white uppercase tracking-wide mb-2">
                Chào hè 2026 tất cả những thứ trên chỉ còn :
              </p>

              <div className="flex items-baseline gap-4 flex-wrap mb-2">
                <span className="text-6xl font-black text-[#ffff00] leading-none tracking-tight">
                  888.000 VNĐ
                </span>
                <span className="text-xl text-white">
                  ( 20 Người Nhanh Nhất )
                </span>
              </div>

              <p className="text-2xl font-semibold text-gray-400 line-through tracking-wide">
                Giá cũ 1.399.000 VNĐ
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== MOBILE ==================== */}
      <div className="md:hidden">
        <div className="max-w-[1150px] mx-auto px-4 my-6">
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
              <h2 className="text-center text-2xl md:text-4xl font-black text-[#ffff00] uppercase tracking-wide mb-6 leading-tight">
                Khóa học 7 ngày tự edit video
              </h2>

              <ul className="flex flex-col gap-3 mb-8">
                {pricingItems.map((item, i) => (
                  <li
                    key={i}
                    className="text-base md:text-xl text-white uppercase tracking-wide font-normal"
                  >
                    - {item.label} <br></br>
                    {item.price && (
                      <span className="text-[#ffff00] italic font-normal">
                        {" "}
                        ({item.price})
                      </span>
                    )}
                  </li>
                ))}
              </ul>

              <p className="text-base font-black text-white uppercase tracking-wide mb-2">
                Chào hè 2026 tất cả những thứ trên chỉ còn :
              </p>

              <div className="flex items-baseline gap-3 flex-wrap mb-2">
                <span className="text-4xl font-black text-[#ffff00] leading-none tracking-tight">
                  888.000 VNĐ
                </span>
                <span className="text-base font-bold text-white">
                  ( 20 Người Nhanh Nhất )
                </span>
              </div>

              <p className="text-sm font-semibold text-gray-400 line-through tracking-wide">
                Giá cũ 1.399.000 VNĐ
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
