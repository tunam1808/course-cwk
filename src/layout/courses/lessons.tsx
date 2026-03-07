// src/layout/courses/lessons.tsx
import { useState } from "react";
import { CheckCircleIcon, PlayIcon } from "@heroicons/react/24/solid";

interface Lesson {
  id: number;
  title: string;
  completed: boolean;
  isCurrent: boolean;
}

const mockLessons: Lesson[] = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  title: i === 7 ? "Cách dùng keyframe trong CapCut" : "Chủ đề X",
  completed: i < 8,
  isCurrent: i === 7,
}));

export default function CoursePlayer() {
  const [currentLessonId] = useState(8); // Có thể thay bằng useParams hoặc context sau

  const currentLesson = mockLessons.find((l) => l.id === currentLessonId)!;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Container giới hạn chiều rộng giống Navbar & Search */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar trái - Tiến độ */}
          <aside className="w-full lg:w-80 xl:w-96 bg-gray-900 rounded-xl border-2 border-white overflow-hidden shadow-lg shadow-black/30">
            <div className="p-2  border-b border-white bg-gray-900/80">
              <h2 className="text-xl font-bold text-center ">
                Nội dung khóa học
              </h2>
              <div className="mt-3 flex items-center justify-center gap-3">
                <span className="text-yellow-400 font-semibold text-lg text-center">
                  Tiến độ
                </span>
                <span className="text-yellow-400 font-bold text-lg">8/30</span>
              </div>
            </div>

            <div
              className="h-[540px] overflow-y-auto overflow-y-auto 
                scrollbar-thin 
                scrollbar-thumb-yellow-500 
                scrollbar-track-gray-900 
                hover:scrollbar-thumb-yellow-400"
            >
              <ul className="divide-y divide-gray-800">
                {mockLessons.map((lesson) => (
                  <li
                    key={lesson.id}
                    className={`px-5 py-4 flex items-center justify-between cursor-pointer transition-colors
                      ${lesson.isCurrent ? "bg-yellow-500/15 border-l-4 border-yellow-500" : "hover:bg-gray-800/60"}
                    `}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <span className="text-xs text-gray-400 min-w-[3rem] font-medium">
                        Buổi {lesson.id}
                      </span>
                      <span className="text-sm truncate">{lesson.title}</span>
                    </div>

                    {lesson.completed ? (
                      <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0" />
                    ) : lesson.isCurrent ? (
                      <span className="w-6 h-6 rounded-full border-2 border-yellow-500 flex items-center justify-center text-xs font-bold text-yellow-500">
                        •
                      </span>
                    ) : (
                      <span className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs text-gray-500">
                        •
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Phần chính - Video player */}
          <main className="flex-1 flex flex-col bg-gray-900 rounded-xl border-2 border-white overflow-hidden shadow-lg shadow-black/30">
            {/* Header buổi học */}
            <div className="p-5 lg:p-6 border-b border-gray-800 bg-gray-900/80">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl lg:text-base italic text-yellow-400">
                  Buổi {currentLesson.id}: {currentLesson.title}
                </h1>
                {currentLesson.completed && (
                  <div className="flex border p-1 rounded-md  items-center gap-2 text-green-500 font-medium text-sm lg:text-base">
                    <CheckCircleIcon className="w-6 h-6" />
                    Đánh dấu là đã hoàn thành
                  </div>
                )}
              </div>
            </div>

            {/* Video player */}
            <div className="flex-1 flex items-center justify-center bg-black min-h-[50vh] lg:min-h-[65vh] relative">
              <div className="text-center">
                <button className="group relative focus:outline-none">
                  <div className="w-28 h-28 lg:w-20 lg:h-20 rounded-full bg-yellow-500 flex items-center justify-center shadow-2xl shadow-yellow-500/40 transition-all group-hover:scale-110 group-active:scale-95">
                    <PlayIcon className="w-16 h-16 lg:w-14 lg:h-16 text-black ml-1" />
                  </div>
                  <div className="absolute inset-0 rounded-full bg-yellow-400 opacity-0 group-hover:opacity-30 transition-opacity blur-2xl" />
                </button>
                <p className="mt-2 text-2xl lg:text-xl font-semibold text-gray-300">
                  Video khóa học
                </p>
              </div>
            </div>

            {/* Navigation dưới */}
            <div className="p-5 lg:p-6 border-t border-gray-800 bg-gray-900 flex flex-col sm:flex-row justify-between items-center gap-4">
              <button
                disabled
                className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black rounded-lg font-medium flex items-center gap-2 transition-all w-full sm:w-auto"
              >
                ← Bài trước
              </button>

              <button className="px-8 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black rounded-lg font-medium flex items-center gap-2 transition-all w-full sm:w-auto">
                Bài sau →
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
