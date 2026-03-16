import React, { useEffect, useRef, useState } from "react";
import { courseApi } from "@/api/course.api";
import { showSuccess, showError } from "@/common/toast";
import ConfirmDialog from "@/common/ConfirmDialog";

interface Course {
  id: number;
  title: string;
  category: string;
  duration: number | null;
  fileSize: number | null;
  videoId: string | null;
  uploadedAt: string;
}

interface FormData {
  title: string;
  category: string;
  duration: string;
  fileSize: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  CAPCUT_AI: "Edit video CapCut nâng cao + AI",
  BAT_DONG_SAN: "Bất động sản",
  MIEN_PHI: "Miễn phí",
};

const CATEGORY_ORDER: Record<string, number> = {
  CAPCUT_AI: 0,
  BAT_DONG_SAN: 1,
  MIEN_PHI: 2,
};

export default function CoursesManage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortRef = useRef<AbortController | null>(null); // 👈 thêm
  const [formData, setFormData] = useState<FormData>({
    title: "",
    category: "CAPCUT_AI",
    duration: "",
    fileSize: "",
  });
  const [error, setError] = useState("");

  const fetchCourses = async () => {
    try {
      const data = await courseApi.getCourses();
      const sorted = [...data].sort((a, b) => {
        const catDiff =
          (CATEGORY_ORDER[a.category] ?? 99) -
          (CATEGORY_ORDER[b.category] ?? 99);
        if (catDiff !== 0) return catDiff;
        return (
          new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
        );
      });
      setCourses(sorted);
    } catch {
      showError("Không thể tải danh sách khóa học");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleOpenCreate = () => {
    setEditCourse(null);
    setVideoFile(null);
    setVideoPreview(null);
    setUploadProgress(0);
    setFormData({
      title: "",
      category: "CAPCUT_AI",
      duration: "",
      fileSize: "",
    });
    setError("");
    setShowModal(true);
  };

  const handleOpenEdit = (course: Course) => {
    setEditCourse(course);
    setVideoFile(null);
    setVideoPreview(null);
    setUploadProgress(0);
    setFormData({
      title: course.title,
      category: course.category,
      duration: course.duration ? String(course.duration) : "",
      fileSize: course.fileSize ? String(course.fileSize) : "",
    });
    setError("");
    setShowModal(true);
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));

    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    setFormData((prev) => ({ ...prev, fileSize: fileSizeMB }));

    const video = document.createElement("video");
    video.src = URL.createObjectURL(file);
    video.onloadedmetadata = () => {
      const durationMin = (video.duration / 60).toFixed(1);
      setFormData((prev) => ({ ...prev, duration: String(durationMin) }));
    };
  };

  const handleCancelClick = () => {
    if (uploading) {
      // Tạm dừng interval khi dialog bật lên
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setShowCancelConfirm(true);
    } else {
      setShowModal(false);
    }
  };

  const handleConfirmCancel = () => {
    // Hủy request HTTP → BE nhận được và dừng upload Bunny
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setShowCancelConfirm(false);
    setShowModal(false);
    setUploading(false);
    setUploadProgress(0);
  };

  const handleKeepUploading = () => {
    // Tiếp tục upload — khởi động lại interval từ chỗ đang dừng
    setShowCancelConfirm(false);
    const currentProgress = uploadProgress;
    let fakeProgress = currentProgress;
    const fileSizeMB = videoFile ? videoFile.size / (1024 * 1024) : 0;
    const estimatedSeconds = Math.max(10, fileSizeMB * 0.5);
    const intervalMs = (estimatedSeconds * 1000) / 90;

    intervalRef.current = setInterval(() => {
      fakeProgress += 1;
      if (fakeProgress >= 90) {
        fakeProgress = 90;
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
      setUploadProgress(Math.round(fakeProgress));
    }, intervalMs);
  };

  const handleSubmit = async () => {
    setError("");

    if (!formData.title.trim()) {
      setError("Vui lòng nhập tên buổi học!");
      return;
    }
    if (!editCourse && !videoFile) {
      setError("Vui lòng upload video!");
      return;
    }
    const isDuplicate = courses.some(
      (c) =>
        c.title.trim().toLowerCase() === formData.title.trim().toLowerCase() &&
        c.id !== editCourse?.id,
    );
    if (isDuplicate) {
      setError("Tên buổi học đã tồn tại!");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Tạo AbortController mới cho mỗi lần upload
      abortRef.current = new AbortController();

      const fileSizeMB = videoFile ? videoFile.size / (1024 * 1024) : 0;
      const estimatedSeconds = Math.max(10, fileSizeMB * 0.5);
      const intervalMs = (estimatedSeconds * 1000) / 90;

      let fakeProgress = 0;
      intervalRef.current = setInterval(() => {
        fakeProgress += 1;
        if (fakeProgress >= 90) {
          fakeProgress = 90;
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
        setUploadProgress(Math.round(fakeProgress));
      }, intervalMs);

      const payload = {
        title: formData.title,
        category: formData.category,
        duration: Number(formData.duration),
        fileSize: Number(formData.fileSize),
        video: videoFile || undefined,
      };

      if (editCourse) {
        await courseApi.updateCourse(
          editCourse.id,
          payload,
          undefined,
          abortRef.current.signal, // 👈 truyền signal
        );
      } else {
        await courseApi.createCourse(
          payload,
          undefined,
          abortRef.current.signal, // 👈 truyền signal
        );
      }

      if (intervalRef.current) clearInterval(intervalRef.current);
      setUploadProgress(100);
      await new Promise((r) => setTimeout(r, 600));

      showSuccess(
        editCourse
          ? "Cập nhật khóa học thành công!"
          : "Tạo khóa học thành công!",
      );
      setShowModal(false);
      fetchCourses();
    } catch (err: any) {
      if (intervalRef.current) clearInterval(intervalRef.current);

      // Nếu bị abort thì không hiện lỗi
      if (err.code === "ERR_CANCELED" || err.name === "AbortError") return;

      const message = err.response?.data?.message || "Có lỗi xảy ra";
      setError(message);
      showError(message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await courseApi.deleteCourse(deleteId);
      showSuccess("Xóa khóa học thành công!");
      fetchCourses();
    } catch {
      showError("Xóa khóa học thất bại!");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-yellow-400 mb-6">
        Quản lý khóa học
      </h2>

      {loading ? (
        <p className="text-gray-400">Đang tải...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead>
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                  Tên buổi học
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                  Loại
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                  Thời lượng
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                  Dung lượng
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                  Ngày upload
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {courses.map((course, index) => {
                const prevCategory =
                  index > 0 ? courses[index - 1].category : null;
                const showGroupHeader = course.category !== prevCategory;

                return (
                  <React.Fragment key={course.id}>
                    {showGroupHeader && (
                      <tr>
                        <td colSpan={7} className="px-6 py-2 bg-gray-800/50">
                          <span className="text-xs font-bold text-yellow-500 uppercase tracking-wider">
                            {CATEGORY_LABELS[course.category]}
                          </span>
                        </td>
                      </tr>
                    )}
                    <tr className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-300">
                        #{course.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {course.title}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400">
                          {CATEGORY_LABELS[course.category]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {course.duration ? `${course.duration} phút` : "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {course.fileSize ? `${course.fileSize} MB` : "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {new Date(course.uploadedAt).toLocaleDateString(
                          "vi-VN",
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleOpenEdit(course)}
                          className="text-yellow-400 hover:text-yellow-300 mr-3"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteClick(course.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleOpenCreate}
          className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-all"
        >
          Thêm buổi học mới
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-yellow-400 mb-4">
              {editCourse ? "Sửa khóa học" : "Thêm buổi học mới"}
            </h3>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Tên buổi học"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  setError("");
                }}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
              />

              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-500"
              >
                <option value="CAPCUT_AI">
                  Edit video CapCut nâng cao + AI
                </option>
                <option value="BAT_DONG_SAN">Bất động sản</option>
                <option value="MIEN_PHI">Miễn phí</option>
              </select>

              <div
                className={`border-2 border-dashed rounded-lg p-4 text-center hover:border-yellow-500 transition-colors ${!editCourse && !videoFile && error === "Vui lòng upload video!" ? "border-red-500" : "border-gray-700"}`}
              >
                <input
                  type="file"
                  accept="video/*"
                  id="video-upload"
                  className="hidden"
                  onChange={(e) => {
                    handleVideoChange(e);
                    setError("");
                  }}
                />
                <label htmlFor="video-upload" className="cursor-pointer">
                  {videoPreview ? (
                    <video
                      src={videoPreview}
                      className="w-full rounded-lg max-h-40 object-cover"
                      controls
                    />
                  ) : (
                    <div className="py-4">
                      <p className="text-gray-400 text-sm">
                        🎬 Click để upload video
                      </p>
                      <p className="text-gray-600 text-xs mt-1">
                        MP4, MOV, AVI...
                      </p>
                    </div>
                  )}
                </label>
              </div>

              {(videoFile || (editCourse && editCourse.duration)) && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-800 rounded-lg px-4 py-3">
                    <p className="text-xs text-gray-400 mb-1">Thời lượng</p>
                    <p className="text-white text-sm font-semibold">
                      {formData.duration} phút
                    </p>
                  </div>
                  <div className="bg-gray-800 rounded-lg px-4 py-3">
                    <p className="text-xs text-gray-400 mb-1">Dung lượng</p>
                    <p className="text-white text-sm font-semibold">
                      {formData.fileSize} MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <p className="text-red-400 text-sm mt-3 flex items-center gap-1">
                ⚠️ {error}
              </p>
            )}

            {uploading && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>
                    {uploadProgress < 100 ? "Đang upload..." : "Hoàn tất! ✅"}
                  </span>
                  <span className="font-semibold text-yellow-400">
                    {uploadProgress}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-2.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${uploadProgress}%`,
                      background:
                        uploadProgress === 100 ? "#22c55e" : "#eab308",
                    }}
                  />
                </div>
                {uploadProgress < 100 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Vui lòng không đóng cửa sổ này...
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCancelClick}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={uploading}
                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading
                  ? `Đang upload... ${uploadProgress}%`
                  : editCourse
                    ? "Cập nhật"
                    : "Tạo"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog xác nhận hủy upload */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60]">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold text-white mb-2">
              Xác nhận hủy upload
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Video đang được upload. Bạn có chắc muốn hủy không? Tiến trình sẽ
              bị mất.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleKeepUploading} // 👈 tiếp tục upload
                className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 hover:text-white rounded-lg transition-colors"
              >
                Tiếp tục upload
              </button>
              <button
                onClick={handleConfirmCancel} // 👈 hủy upload
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-400 text-white font-bold rounded-lg transition-all"
              >
                Hủy upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog xác nhận xóa */}
      <ConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa khóa học"
        description="Bạn có chắc muốn xóa khóa học này không? Hành động này không thể hoàn tác."
      />
    </div>
  );
}
