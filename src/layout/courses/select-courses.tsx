import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth.context";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { LockClosedIcon } from "@heroicons/react/24/solid";

const courses = [
  {
    id: "capcut",
    title: "Khóa edit video CapCut nâng cao + AI",
    description:
      "Học cách edit video chuyên nghiệp với CapCut và các công cụ AI hiện đại",
    image: "/capcut.jpg",
    lessons: 30,
    category: "EDIT_CO_BAN",
    link: "/lesson-capcut",
  },
  {
    id: "batdongsan",
    title: "Khóa học edit video bất động sản",
    description: "Kỹ thuật quay và dựng video bất động sản thu hút khách hàng",
    image: "/batdongsan.jpg",
    lessons: 30,
    category: "BAT_DONG_SAN",
    link: "/lesson-bds",
  },
];

export default function SelectCourses() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const handleCourseClick = () => {
    if (!user) {
      setShowLoginDialog(true);
      return;
    }
    // navigate vào khóa học
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Tiêu đề trang */}
        <div className="mb-10 text-center">
          <p className="text-gray-400 text-base">
            Chọn khóa học để bắt đầu học ngay
          </p>
        </div>

        {/* Danh sách khóa học */}
        <div className="flex flex-col gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              onClick={() => {
                if (!user) {
                  setShowLoginDialog(true);
                  return;
                }
                navigate(course.link);
              }}
              className="group relative w-full h-52 lg:h-64 rounded-2xl overflow-hidden cursor-pointer border-2 border-gray-800 hover:border-yellow-500 transition-all duration-300 shadow-lg hover:shadow-yellow-500/20"
            >
              {/* Ảnh banner */}
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

              {/* Icon khóa khi chưa đăng nhập */}
              {!user && (
                <div className="absolute top-4 right-4 bg-black/60 rounded-full p-2 border border-gray-600">
                  <LockClosedIcon className="w-5 h-5 text-yellow-400" />
                </div>
              )}

              {/* Nội dung */}
              <div className="absolute inset-0 flex flex-col justify-center px-8 lg:px-12">
                <p className="text-yellow-400 text-sm font-medium mb-2 uppercase tracking-wider">
                  {course.lessons} buổi học
                </p>
                <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3 leading-snug">
                  {course.title}
                </h2>
                <p className="text-gray-300 text-sm lg:text-base mb-5 hidden sm:block">
                  {course.description}
                </p>
                <div>
                  <span className="inline-flex items-center gap-2 px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg text-sm transition-all group-hover:gap-3">
                    Vào học ngay →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dialog yêu cầu đăng nhập */}
      <Dialog.Root open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/70 z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-sm shadow-xl">
            {/* Icon khóa */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <LockClosedIcon className="w-7 h-7 text-yellow-400" />
              </div>
            </div>

            <Dialog.Title className="text-lg font-bold text-white text-center mb-2">
              Bạn cần đăng nhập
            </Dialog.Title>
            <Dialog.Description className="text-gray-400 text-sm text-center mb-6">
              Bạn cần đăng nhập để sử dụng tính năng này
            </Dialog.Description>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLoginDialog(false)}
                className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 hover:text-white rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  setShowLoginDialog(false);
                  navigate("/login");
                }}
                className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-all"
              >
                Đăng nhập
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
