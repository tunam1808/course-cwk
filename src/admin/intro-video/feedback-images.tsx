// admin/intro-video/feedback-images.tsx
import { useEffect, useState } from "react";
import { FiLoader, FiTrash2, FiUploadCloud } from "react-icons/fi";
import ConfirmDialog from "@/common/ConfirmDialog";
import { showError, showSuccess } from "@/common/toast";
import { feedbackApi, type FeedbackImage } from "@/api/feedback.api";
import { getErrorMessage } from "./video.utils";

const ACCEPT = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // khớp giới hạn ở backend

export default function FeedbackImages() {
  const [images, setImages] = useState<FeedbackImage[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "ready">(
    "loading",
  );
  const [reloadKey, setReloadKey] = useState(0);
  const [progress, setProgress] = useState<string | null>(null); // "1/3"
  const [toDelete, setToDelete] = useState<FeedbackImage | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let ignore = false;
    feedbackApi
      .getAll()
      .then((data) => {
        if (ignore) return;
        setImages(data);
        setStatus("ready");
      })
      .catch(() => {
        if (!ignore) setStatus("error");
      });
    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  const handleRetry = () => {
    setStatus("loading");
    setReloadKey((k) => k + 1);
  };

  const handleFiles = async (files: File[]) => {
    const valid = files.filter(
      (f) => ACCEPT.includes(f.type) && f.size <= MAX_SIZE,
    );
    if (valid.length < files.length) {
      showError("Chỉ nhận ảnh JPG, PNG, WEBP tối đa 5MB");
    }
    if (!valid.length) return;

    let success = 0;
    // Upload tuần tự, ảnh lỗi thì chuyển sang ảnh tiếp theo
    for (const [index, file] of valid.entries()) {
      setProgress(`${index + 1}/${valid.length}`);
      try {
        const saved = await feedbackApi.upload(file);
        setImages((prev) => [saved, ...prev]);
        success++;
      } catch (error) {
        showError(getErrorMessage(error, `Tải "${file.name}" thất bại`));
      }
    }
    setProgress(null);
    if (success) showSuccess(`Đã tải lên ${success}/${valid.length} ảnh`);
  };

  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    const { id } = toDelete;
    setToDelete(null);
    setDeleting(true);
    try {
      await feedbackApi.remove(id);
      setImages((prev) => prev.filter((i) => i.id !== id));
      showSuccess("Đã xóa ảnh");
    } catch (error) {
      showError(getErrorMessage(error, "Xóa ảnh thất bại"));
    } finally {
      setDeleting(false);
    }
  };

  const disabled = progress !== null || status !== "ready";

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-800 pb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-yellow-400 tracking-tight">
          Ảnh feedback khách hàng
        </h2>
        <p className="mt-1 text-sm text-gray-400">
          Ảnh JPG, PNG hoặc WEBP, tối đa 5MB mỗi ảnh.
        </p>
      </div>

      <label
        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-yellow-400 text-gray-950 font-semibold text-sm transition-colors focus-within:ring-2 focus-within:ring-white ${
          disabled
            ? "opacity-40 cursor-not-allowed"
            : "hover:bg-yellow-300 cursor-pointer"
        }`}
      >
        {progress ? (
          <FiLoader className="w-4 h-4 animate-spin" />
        ) : (
          <FiUploadCloud className="w-4 h-4" />
        )}
        {progress ? `Đang tải ${progress}...` : "Tải ảnh lên"}
        <input
          type="file"
          accept={ACCEPT.join(",")}
          multiple
          disabled={disabled}
          className="sr-only"
          onChange={(e) => {
            handleFiles(Array.from(e.target.files ?? []));
            e.target.value = ""; // cho phép chọn lại cùng file
          }}
        />
      </label>

      {status === "loading" ? (
        <div className="flex items-center gap-2 py-8 text-sm text-gray-500">
          <FiLoader className="w-5 h-5 animate-spin" />
          Đang tải dữ liệu...
        </div>
      ) : status === "error" ? (
        <div className="text-sm text-red-400">
          Không thể tải danh sách ảnh.{" "}
          <button type="button" onClick={handleRetry} className="underline">
            Thử lại
          </button>
        </div>
      ) : images.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-500 rounded-2xl border-2 border-dashed border-gray-800">
          Chưa có ảnh feedback
        </p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative aspect-[3/4] rounded-xl overflow-hidden border border-gray-700 bg-gray-900"
            >
              <img
                src={image.imageUrl}
                alt="Ảnh feedback"
                loading="lazy"
                className="w-full h-full object-contain"
              />
              <button
                type="button"
                onClick={() => setToDelete(image)}
                disabled={deleting}
                className="absolute top-2 right-2 p-2 rounded-lg bg-black/70 text-red-400 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-40"
                title="Xóa ảnh"
                aria-label="Xóa ảnh"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa ảnh"
        description={`Bạn có chắc muốn xóa ảnh feedback này không?\nHành động này không thể hoàn tác.`}
      />
    </div>
  );
}
