// admin/intro-video/new-page-intro.tsx
import { useEffect, useRef, useState } from "react";
import { FiLoader, FiRefreshCw, FiUploadCloud } from "react-icons/fi";
import ConfirmDialog from "@/common/ConfirmDialog";
import { showError, showSuccess } from "@/common/toast";
import { newPageApi, type NewPageVideo } from "@/api/landingpage-intro.api";
import VideoCard from "./video-card";
import { getErrorMessage, uploadVideo } from "./video.utils";

export default function NewPageIntro() {
  const [video, setVideo] = useState<NewPageVideo | null>(null);
  const [status, setStatus] = useState<"loading" | "error" | "ready">(
    "loading",
  );
  const [reloadKey, setReloadKey] = useState(0);
  const [progress, setProgress] = useState<number | null>(null); // null = không upload
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let ignore = false;
    newPageApi
      .getIntro()
      .then((data) => {
        if (ignore) return;
        setVideo(data);
        setStatus("ready");
      })
      .catch(() => {
        if (!ignore) setStatus("error");
      });
    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  // Rời trang thì hủy upload đang chạy
  useEffect(() => () => abortRef.current?.abort(), []);

  const handleRetry = () => {
    setStatus("loading");
    setReloadKey((k) => k + 1);
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("video/")) {
      showError("Chỉ chấp nhận file video");
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setProgress(0);

    try {
      const payload = await uploadVideo(file, controller.signal, setProgress);
      const { intro } = await newPageApi.saveIntro(payload);
      setVideo(intro);
      showSuccess("Tải video intro thành công!");
    } catch (error) {
      if (controller.signal.aborted) return;
      console.error("[NewPageIntro] upload failed:", error);
      showError(getErrorMessage(error, "Tải video thất bại"));
    } finally {
      setProgress(null);
    }
  };

  const handleConfirmDelete = async () => {
    setShowConfirm(false);
    setDeleting(true);
    try {
      await newPageApi.deleteIntro();
      setVideo(null);
      showSuccess("Đã xóa video intro!");
    } catch (error) {
      showError(getErrorMessage(error, "Xóa video thất bại!"));
    } finally {
      setDeleting(false);
    }
  };

  const busy = progress !== null || deleting;

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-800 pb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-yellow-400 tracking-tight">
          Video Intro cho page mới (9:16)
        </h2>
        <p className="mt-1 text-sm text-gray-400">
          Chọn một video intro hiển thị trên page mới.
        </p>
      </div>

      <div className="w-full max-w-[300px] mx-auto bg-gray-900 border border-gray-800 rounded-2xl p-4 sm:p-5 space-y-4">
        {status === "loading" ? (
          <div className="aspect-[9/16] flex items-center justify-center gap-2 text-sm text-gray-500">
            <FiLoader className="w-5 h-5 animate-spin" />
            Đang tải...
          </div>
        ) : status === "error" ? (
          <div className="aspect-[9/16] flex flex-col items-center justify-center gap-3 text-sm text-red-400">
            Không thể tải video intro
            <button
              type="button"
              onClick={handleRetry}
              className="underline underline-offset-2 hover:text-red-300"
            >
              Thử lại
            </button>
          </div>
        ) : (
          <>
            {video ? (
              <VideoCard
                video={video}
                onRemove={() => setShowConfirm(true)}
                disabled={busy}
              />
            ) : (
              <div className="aspect-[9/16] flex items-center justify-center rounded-2xl border-2 border-dashed border-gray-700 text-sm text-gray-400">
                Chưa có video
              </div>
            )}

            {progress !== null && (
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                  <span>
                    {progress < 100 ? "Đang upload..." : "Đang lưu..."}
                  </span>
                  <span className="font-semibold text-yellow-400">
                    {progress}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-gray-950 font-semibold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {busy ? (
                <FiLoader className="w-4 h-4 animate-spin" />
              ) : video ? (
                <FiRefreshCw className="w-4 h-4" />
              ) : (
                <FiUploadCloud className="w-4 h-4" />
              )}
              {video ? "Thay đổi video" : "Tải video intro"}
            </button>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </div>

      <ConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa video intro"
        description={`Bạn có chắc muốn xóa video intro của page mới không?\nHành động này không thể hoàn tác.`}
      />
    </div>
  );
}
