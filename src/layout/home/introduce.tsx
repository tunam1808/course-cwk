import { useNavigate } from "react-router-dom";

export default function Introduce() {
  const navigate = useNavigate();
  return (
    <div className="flex items-stretch max-w-[1100px] mx-auto gap-4 mt-4">
      {/* Phần ảnh - 70% */}
      <div className="w-[60%] relative">
        <img
          src="/introduce.png"
          alt="Course Thumbnail"
          className="w-full h-full object-cover rounded-xl border-2"
        />

        <button
          onClick={() => navigate("/free-courses")}
          className="absolute top-1/2 right-4 -translate-y-1/2 mt-10 mr-6 flex items-center justify-center gap-3 px-15 py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-lg transition-all text-sm uppercase tracking-wide cursor-pointer"
        >
          Chi tiết khóa học
          <span className="text-xl">→</span>
        </button>
      </div>

      {/* Phần mô tả - 30% */}
      <div className="w-[40%] bg-gray-900 p-8 flex flex-col justify-center gap-6 rounded-xl border-2">
        <h2 className="text-2xl font-bold text-white uppercase tracking-wide">
          Khóa học Edit Nâng Cao
        </h2>

        <ul className="flex flex-col gap-3">
          <li className="flex items-start gap-2 text-sm text-gray-300">
            <span className="text-white mt-0.5">-</span>
            <span>
              Nắm trọn bí quyết edit "thôi miên" 3 giây đầu hút triệu view tự
              động.
            </span>
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-300">
            <span className="text-white mt-0.5">-</span>
            <span>
              Biến kỹ xảo thành cảm xúc mua hàng, đẩy cao tỷ lệ chuyển đổi và
              tạo báo đơn.
            </span>
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-300">
            <span className="text-white mt-0.5">-</span>
            <span>Tự do edit bất cứ ở đâu bất cứ khi nào</span>
          </li>
        </ul>

        <button
          onClick={() => navigate("/list-courses")}
          className="flex items-center justify-center gap-3 px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-lg transition-all text-sm uppercase tracking-wide cursor-pointer"
        >
          Chi tiết khóa học
          <span className="text-xl">→</span>
        </button>

        {/* Video giới thiệu */}
        <div className="rounded-xl overflow-hidden border-2 border-gray-700 bg-black aspect-video">
          <video
            // src="/intro-video.mp4"
            controls
            className="w-full h-full object-cover"
            // poster="/introduce.png"
          >
            Trình duyệt không hỗ trợ video.
          </video>
        </div>
      </div>
    </div>
  );
}
