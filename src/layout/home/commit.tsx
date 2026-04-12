// ==================== DATA ====================
const commitments = [
  {
    main: "Bạn không cần biết gì trước đó",
    sub: "Chỉ cần làm theo từng bước là sẽ làm được video đầu tiên",
    highlightFirst: true,
  },
  {
    main: "Bạn sẽ được hỗ trợ 1-1 đến khi làm được",
    sub: "Nếu bạn học theo lộ trình mà vẫn không edit được video hoàn chỉnh",
    highlightFirst: false,
  },
  {
    before: "Trong quá trình học, bạn ",
    highlight: "luôn có người hỗ trợ",
    sub: "Không bị bỏ rơi như khi tự học trên mạng",
  },
];

function CheckIcon() {
  return (
    <span className="flex-shrink-0 w-9 h-9 rounded-full bg-green-600 flex items-center justify-center border border-green-400">
      <span className="text-white text-3xl font-black leading-none">✓</span>
    </span>
  );
}

function CtaButton({ text, onClick }: { text: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full md:w-220 mx-auto rounded-2xl block 
                 bg-[#ffff00] hover:bg-yellow-300 
                 text-black font-black 
                 text-xl md:text-xl 
                 uppercase tracking-wide 
                 py-4 px-6 
                 rounded transition-colors duration-150"
    >
      {text}
    </button>
  );
}

// ==================== MAIN COMPONENT ====================
export default function CommitSection() {
  function scrollToPayment() {
    const el = document.getElementById("payment-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <>
      {/* ==================== DESKTOP VERSION ==================== */}
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
              <h2 className="text-center text-2xl md:text-4xl font-black text-[#ffff00] uppercase tracking-wide mb-8">
                Cam kết từ khóa học
              </h2>

              <ul className="flex flex-col gap-6">
                {commitments.map((item, i) => (
                  <li key={i} className="flex items-center gap-4">
                    <CheckIcon />
                    <div className="pt-0.5">
                      {item.highlightFirst ? (
                        <>
                          <p className="pl-7 text-xl text-[#ffff00] italic leading-relaxed">
                            {item.main}
                          </p>
                          <p className="pl-7 text-xl text-gray-300 italic leading-relaxed mt-0.5">
                            {item.sub}
                          </p>
                        </>
                      ) : item.before ? (
                        <>
                          <p className="pl-7 text-xl text-gray-300 italic leading-relaxed">
                            {item.before}
                            <span className="text-[#ffff00]">
                              {item.highlight}
                            </span>
                          </p>
                          <p className="pl-7 text-xl text-gray-300 italic leading-relaxed mt-0.5">
                            {item.sub}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="pl-7 text-xl text-gray-300 italic leading-relaxed">
                            {item.sub}
                          </p>
                          <p className="pl-7 text-xl text-[#ffff00] italic leading-relaxed mt-0.5">
                            {item.main}
                          </p>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <section className="px-6 py-4 mt-6 cursor-pointer">
            <CtaButton
              text="Đăng ký học & nhận tài nguyên ngay"
              onClick={scrollToPayment}
            />
          </section>
        </div>
      </div>

      {/* ==================== MOBILE VERSION ==================== */}
      <div className="md:hidden">
        <div className="max-w-[1150px] mx-auto px-4 md:px-6 my-6">
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
              <h2 className="text-center text-2xl md:text-4xl font-black text-[#ffff00] uppercase tracking-wide mb-8">
                Cam kết từ khóa học
              </h2>

              <ul className="flex flex-col gap-6">
                {commitments.map((item, i) => (
                  <li key={i} className="flex items-center gap-4">
                    <CheckIcon />
                    <div className="pt-0.5">
                      {item.highlightFirst ? (
                        <>
                          <p className="text-base text-[#ffff00] italic leading-relaxed">
                            {item.main}
                          </p>
                          <p className="text-base text-gray-300 italic leading-relaxed mt-0.5">
                            {item.sub}
                          </p>
                        </>
                      ) : item.before ? (
                        <>
                          <p className="text-base text-gray-300 italic leading-relaxed">
                            {item.before}
                            <span className="text-[#ffff00]">
                              {item.highlight}
                            </span>
                          </p>
                          <p className="text-base text-gray-300 italic leading-relaxed mt-0.5">
                            {item.sub}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-base text-gray-300 italic leading-relaxed">
                            {item.sub}
                          </p>
                          <p className="text-base text-[#ffff00] italic leading-relaxed mt-0.5">
                            {item.main}
                          </p>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <section className="px-4 py-4 cursor-pointer">
          <CtaButton
            text="Đăng ký học & nhận tài nguyên ngay"
            onClick={scrollToPayment}
          />
        </section>
      </div>
    </>
  );
}
