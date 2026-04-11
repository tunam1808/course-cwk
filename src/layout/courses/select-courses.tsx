import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth.context";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { LockClosedIcon } from "@heroicons/react/24/solid";

const courses = [
  {
    id: "CAPCUT_AI",
    title: "Khóa edit video CapCut nâng cao + AI",
    description:
      "Học cách edit video chuyên nghiệp với CapCut và các công cụ AI hiện đại",
    image: "/capcut.jpg",
    lessons: 40,
    link: "/lesson-capcut",
  },
  {
    id: "BAT_DONG_SAN",
    title: "Khóa học edit video bất động sản",
    description: "Kỹ thuật quay và dựng video bất động sản thu hút khách hàng",
    image: "/batdongsan.jpg",
    lessons: 30,
    link: "/lesson-bds",
  },
];

export default function SelectCourses() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showNoAccessDialog, setShowNoAccessDialog] = useState(false);

  const handleClick = (course: (typeof courses)[0], hasAccess: boolean) => {
    if (!user) {
      setShowLoginDialog(true);
      return;
    }
    if (!hasAccess) {
      setShowNoAccessDialog(true);
      return;
    }
    navigate(course.link);
  };

  return (
    <div className=" bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-400 text-sm text-center mb-8">
          Chọn khóa học của bạn để bắt đầu học ngay
        </p>

        <div className="flex flex-col gap-5 lg:gap-6">
          {courses.map((course) => {
            const hasAccess =
              user?.role === "ADMIN" ||
              user?.purchasedCategories?.includes(course.id) ||
              false;

            return (
              <div
                key={course.id}
                onClick={() => handleClick(course, hasAccess)}
                className="cursor-pointer"
              >
                {/* ===== DESKTOP: UI cũ - ảnh nền + text đè lên ===== */}
                <div className="hidden lg:block group relative w-full h-64 rounded-2xl overflow-hidden border-2 border-gray-800 hover:border-yellow-500 transition-all duration-300 shadow-lg hover:shadow-yellow-500/20">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

                  {(!user || !hasAccess) && (
                    <div className="absolute top-4 right-4 bg-black/60 rounded-full p-2 border border-gray-600">
                      <LockClosedIcon className="w-5 h-5 text-yellow-400" />
                    </div>
                  )}

                  <div className="absolute inset-0 flex flex-col justify-center px-12">
                    <p className="text-yellow-400 text-sm font-medium mb-2 uppercase tracking-wider">
                      {course.lessons} + buổi học và sẽ cập nhật thêm
                    </p>
                    <h2 className="text-3xl font-bold text-white mb-3 leading-snug">
                      {course.title}
                    </h2>
                    <p className="text-gray-300 text-base mb-5">
                      {course.description}
                    </p>
                    <div>
                      <span className="inline-flex items-center gap-2 px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg text-sm transition-all group-hover:gap-3">
                        {!user || !hasAccess
                          ? "🔒 Chưa mở khóa"
                          : "Vào học ngay →"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ===== MOBILE: UI mới - ảnh trên, text dưới ===== */}
                <div className="lg:hidden group rounded-2xl overflow-hidden border-2 border-gray-800 hover:border-yellow-500 transition-all duration-300 shadow-lg">
                  <div className="relative w-full h-44 sm:h-56">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    <div className="absolute top-3 left-3 bg-yellow-500 text-black text-xs font-black px-3 py-1 rounded-full uppercase tracking-wide">
                      {course.lessons}+ buổi học
                    </div>

                    {(!user || !hasAccess) && (
                      <div className="absolute top-3 right-3 bg-black/60 rounded-full p-2 border border-gray-600">
                        <LockClosedIcon className="w-4 h-4 text-yellow-400" />
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-900 px-5 py-4 flex flex-col gap-3">
                    <h2 className="text-base font-bold text-white leading-snug">
                      {course.title}
                    </h2>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {course.description}
                    </p>
                    <button className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-sm uppercase tracking-widest rounded-xl transition-all active:scale-95">
                      {!user || !hasAccess
                        ? "🔒 Chưa mở khóa"
                        : "Vào học ngay →"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dialog yêu cầu đăng nhập */}
      <Dialog.Root open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/70 z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-sm shadow-xl">
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

      {/* Dialog chưa được cấp quyền */}
      <Dialog.Root
        open={showNoAccessDialog}
        onOpenChange={setShowNoAccessDialog}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/70 z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center">
                <LockClosedIcon className="w-7 h-7 text-red-400" />
              </div>
            </div>
            <Dialog.Title className="text-lg font-bold text-white text-center mb-2">
              Bạn chưa có quyền truy cập
            </Dialog.Title>
            <Dialog.Description className="text-gray-400 text-sm text-center mb-6">
              Khóa học này chưa được mở khóa cho tài khoản của bạn. Vui lòng
              liên hệ admin để được cấp quyền.
            </Dialog.Description>
            <button
              onClick={() => setShowNoAccessDialog(false)}
              className="w-full px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-all"
            >
              Đã hiểu
            </button>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
