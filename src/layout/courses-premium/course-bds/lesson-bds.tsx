import { useEffect, useState } from "react";
import { CheckCircleIcon, PlayIcon } from "@heroicons/react/24/solid";
import { courseApi } from "@/api/course.api";
import { progressApi } from "@/api/progress.api";
import { useAuth } from "@/contexts/auth.context";
import { useNavigate } from "react-router-dom";

interface Course {
  id: number;
  title: string;
  category: string;
  duration: number | null;
  fileSize: number | null;
  videoId: string | null;
  uploadedAt: string;
}

const BUNNY_LIBRARY_ID = import.meta.env.VITE_BUNNY_LIBRARY_ID;

export default function CoursePlayer() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Course[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Course | null>(null);
  const [completedIds, setCompletedIds] = useState<number[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await courseApi.getCourses();
        const freeLessons = data.filter(
          (c: Course) => c.category === "BAT_DONG_SAN",
        );
        setLessons(freeLessons);
        if (freeLessons.length > 0) setCurrentLesson(freeLessons[0]);

        if (user) {
          const progress = await progressApi.getProgress();
          setCompletedIds(progress);
        }
      } catch {
        console.error("Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    if (!currentLesson?.videoId) {
      setVideoUrl(null);
      return;
    }
    setVideoUrl(
      `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${currentLesson.videoId}?autoplay=false`,
    );
  }, [currentLesson]);

  const currentIndex = lessons.findIndex((l) => l.id === currentLesson?.id);
  const isCompleted = currentLesson
    ? completedIds.includes(currentLesson.id)
    : false;

  const handleToggleComplete = async () => {
    if (!currentLesson || !user) return;
    try {
      setMarking(true);
      if (isCompleted) {
        await progressApi.markIncomplete(currentLesson.id);
        setCompletedIds((prev) => prev.filter((id) => id !== currentLesson.id));
      } else {
        await progressApi.markComplete(currentLesson.id);
        setCompletedIds((prev) => [...prev, currentLesson.id]);
      }
    } catch {
      console.error("Không thể cập nhật tiến độ");
    } finally {
      setMarking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* 👈 Nút quay lại nằm ngoài layout, luôn hiển thị */}
        <button
          onClick={() => navigate("/list-courses")}
          className="flex items-center gap-1 text-gray-400 hover:text-yellow-400 transition-colors text-xl mb-4"
        >
          ← Quay lại chọn khóa học
        </button>
        {lessons.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-400">Chưa có bài học nào.</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Sidebar trái - Danh sách bài học */}
            <aside className="w-full lg:w-80 xl:w-96 bg-gray-900 rounded-xl border-2 border-white overflow-hidden shadow-lg shadow-black/30">
              <div className="p-2 border-b border-white bg-gray-900/80">
                <h2 className="text-xl font-bold text-center">
                  Nội dung khóa học
                </h2>
                <div className="mt-3 flex items-center justify-center gap-3">
                  <span className="text-yellow-400 font-semibold text-lg">
                    Tiến độ
                  </span>
                  <span className="text-yellow-400 font-bold text-lg">
                    {completedIds.length}/{lessons.length}
                  </span>
                </div>
              </div>

              <div className="h-[540px] overflow-y-auto scrollbar-thin scrollbar-thumb-yellow-500 scrollbar-track-gray-900 hover:scrollbar-thumb-yellow-400">
                <ul className="divide-y divide-gray-800">
                  {lessons.map((lesson, index) => {
                    const done = completedIds.includes(lesson.id);
                    const isCurrent = currentLesson?.id === lesson.id;

                    return (
                      <li
                        key={lesson.id}
                        onClick={() => setCurrentLesson(lesson)}
                        className={`px-5 py-4 flex items-center justify-between cursor-pointer transition-colors
                          ${
                            isCurrent
                              ? "bg-yellow-500/15 border-l-4 border-yellow-500"
                              : "hover:bg-gray-800/60"
                          }`}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <span className="text-xs text-gray-400 min-w-[3rem] font-medium">
                            Buổi {index + 1}
                          </span>
                          <span className="text-sm truncate">
                            {lesson.title}
                          </span>
                        </div>

                        {done ? (
                          <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0" />
                        ) : isCurrent ? (
                          <span className="w-6 h-6 rounded-full border-2 border-yellow-500 flex items-center justify-center text-xs font-bold text-yellow-500">
                            •
                          </span>
                        ) : (
                          <span className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs text-gray-500">
                            •
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </aside>

            {/* Phần chính - Video player */}
            <main className="flex-1 flex flex-col bg-gray-900 rounded-xl border-2 border-white overflow-hidden shadow-lg shadow-black/30">
              {/* Header buổi học */}
              <div className="p-5 lg:p-6 border-b border-gray-800 bg-gray-900/80">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h1 className="text-lg italic text-yellow-400">
                    Buổi {currentIndex + 1}: {currentLesson?.title}
                  </h1>

                  {user && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleToggleComplete}
                        disabled={marking}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed
                          ${
                            isCompleted
                              ? "bg-green-500/20 border border-green-500 text-green-400 hover:bg-green-500/30"
                              : "bg-gray-700 border border-gray-600 text-gray-300 hover:bg-gray-600"
                          }`}
                      >
                        <CheckCircleIcon
                          className={`w-5 h-5 ${isCompleted ? "text-green-400" : "text-gray-500"}`}
                        />
                        {marking
                          ? "Đang lưu..."
                          : isCompleted
                            ? "Đã hoàn thành"
                            : "Đánh dấu hoàn thành"}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Video player */}
              <div className="flex-1 flex items-center justify-center bg-black min-h-[50vh] lg:min-h-[65vh] relative">
                {videoUrl ? (
                  <iframe
                    src={videoUrl}
                    className="w-full h-full min-h-[50vh] lg:min-h-[65vh]"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                ) : (
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-3">
                      <PlayIcon className="w-10 h-10 text-gray-500 ml-1" />
                    </div>
                    <p className="text-gray-500 text-sm">Video chưa sẵn sàng</p>
                  </div>
                )}
              </div>

              {/* Navigation dưới */}
              <div className="p-5 lg:p-6 border-t border-gray-800 bg-gray-900 flex flex-col sm:flex-row justify-between items-center gap-4">
                <button
                  disabled={currentIndex <= 0}
                  onClick={() => setCurrentLesson(lessons[currentIndex - 1])}
                  className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black rounded-lg font-medium flex items-center gap-2 transition-all w-full sm:w-auto disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Bài trước
                </button>

                <span className="text-gray-400 text-sm">
                  {currentIndex + 1} / {lessons.length}
                </span>

                <button
                  disabled={currentIndex >= lessons.length - 1}
                  onClick={() => setCurrentLesson(lessons[currentIndex + 1])}
                  className="px-8 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black rounded-lg font-medium flex items-center gap-2 transition-all w-full sm:w-auto disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Bài sau →
                </button>
              </div>
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
