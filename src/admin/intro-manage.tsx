// pages/admin/ManageIntro.tsx
import { useEffect, useRef, useState } from "react";
import * as tus from "tus-js-client";
import { introApi } from "@/api/intro.api";
import { showSuccess, showError } from "@/common/toast";
import ConfirmDialog from "@/common/ConfirmDialog";
import {
  FiUploadCloud,
  FiVideo,
  FiTrash2,
  FiCheck,
  FiLoader,
  FiAlertCircle,
  FiRefreshCw,
} from "react-icons/fi";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Intro {
  slot: 1 | 2 | 3;
  videoId: string | null;
  createdAt?: string;
  updatedAt?: string;
}

type SlotStatus = "idle" | "ready" | "uploading" | "done" | "error";

interface SlotState {
  file: File | null;
  preview: string | null;
  duration: string;
  size: string;
  status: SlotStatus;
  progress: number;
  error: string;
  isDragging: boolean;
  isReplacing: boolean;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const initSlot = (): SlotState => ({
  file: null,
  preview: null,
  duration: "",
  size: "",
  status: "idle",
  progress: 0,
  error: "",
  isDragging: false,
  isReplacing: false,
});

// ─── Component ────────────────────────────────────────────────────────────────
export default function ManageIntro() {
  const [intros, setIntros] = useState<Intro[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [slots, setSlots] = useState<SlotState[]>([
    initSlot(),
    initSlot(),
    initSlot(),
  ]);

  const [showConfirm, setShowConfirm] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState<1 | 2 | 3 | null>(null);

  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);
  const tusRef = useRef<tus.Upload | null>(null);

  // ─── Fetch ──────────────────────────────────────────────────────────────────
  const fetchIntros = async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const data = await introApi.getIntro();
      const list: Intro[] = Array.isArray(data) ? (data as Intro[]) : [];
      const formatted: Intro[] = ([1, 2, 3] as const).map(
        (slot) => list.find((i) => i?.slot === slot) || { slot, videoId: null },
      );
      setIntros(formatted);
    } catch (err) {
      console.error("[ManageIntro] fetchIntros failed:", err);
      setFetchError(true);
      showError("Không thể tải danh sách intro. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntros();
  }, []);

  // ─── Patch slot helper ───────────────────────────────────────────────────────
  const patchSlot = (index: number, patch: Partial<SlotState>) =>
    setSlots((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    );

  // ─── Xử lý file ─────────────────────────────────────────────────────────────
  const handleFile = (index: number, file: File) => {
    if (!file.type.startsWith("video/")) {
      patchSlot(index, {
        error: "Chỉ chấp nhận file video (mp4, webm, mov...)",
      });
      return;
    }
    const old = slots[index].preview;
    if (old) URL.revokeObjectURL(old);

    const preview = URL.createObjectURL(file);
    patchSlot(index, {
      file,
      preview,
      size: formatSize(file.size),
      status: "ready",
      progress: 0,
      error: "",
      duration: "",
      isReplacing: false,
    });

    const vid = document.createElement("video");
    vid.src = preview;
    vid.onloadedmetadata = () => {
      const m = Math.floor(vid.duration / 60);
      const s = Math.floor(vid.duration % 60);
      patchSlot(index, { duration: `${m}:${s.toString().padStart(2, "0")}` });
    };
  };

  const handleRemoveFile = (index: number) => {
    const old = slots[index].preview;
    if (old) URL.revokeObjectURL(old);
    if (fileRefs.current[index]) fileRefs.current[index]!.value = "";
    patchSlot(index, initSlot());
  };

  // ─── Upload 1 slot ───────────────────────────────────────────────────────────
  const uploadSlot = async (slotNumber: 1 | 2 | 3, file: File) => {
    const index = slotNumber - 1;
    patchSlot(index, { status: "uploading", progress: 0, error: "" });

    try {
      const { videoId } = await introApi.prepareUpload();
      const { signature, expire } = await introApi.signUpload(videoId);

      await new Promise<void>((resolve, reject) => {
        const upload = new tus.Upload(file, {
          endpoint: "https://video.bunnycdn.com/tusupload",
          retryDelays: [0, 3000, 5000, 10000],
          headers: {
            AuthorizationSignature: signature,
            AuthorizationExpire: String(expire),
            VideoId: videoId,
            LibraryId: import.meta.env.VITE_BUNNY_LIBRARY_ID,
          },
          metadata: {
            filetype: file.type,
            title: `intro_slot_${slotNumber}`,
          },
          onProgress(uploaded, total) {
            patchSlot(index, { progress: Math.round((uploaded / total) * 90) });
          },
          onSuccess() {
            resolve();
          },
          onError(err) {
            reject(err);
          },
        });
        tusRef.current = upload;
        upload.start();
      });

      await introApi.saveIntro(videoId, slotNumber);
      patchSlot(index, { status: "done", progress: 100 });
      showSuccess(`Upload Video ${slotNumber} thành công!`);
    } catch (err) {
      const apiErr = err as ApiError;
      const msg =
        apiErr?.response?.data?.message ??
        `Video ${slotNumber} upload thất bại`;
      patchSlot(index, { status: "error", error: msg });
      showError(msg);
      throw err;
    } finally {
      tusRef.current = null;
    }
  };

  // ─── Upload tuần tự ──────────────────────────────────────────────────────────
  const handleUploadAll = async () => {
    setIsRunning(true);
    for (let i = 0; i < 3; i++) {
      const { file, status } = slots[i];
      if (!file || status === "done") continue;
      try {
        await uploadSlot((i + 1) as 1 | 2 | 3, file);
      } catch {
        // Tiếp tục slot tiếp theo khi slot này lỗi
      }
    }
    setIsRunning(false);
    fetchIntros();
  };

  // ─── Xóa intro ───────────────────────────────────────────────────────────────
  const handleDelete = (slot: 1 | 2 | 3) => {
    setSlotToDelete(slot);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!slotToDelete) return;
    try {
      await introApi.deleteIntro(slotToDelete);
      showSuccess(`Đã xóa video ${slotToDelete}!`);
      fetchIntros();
    } catch {
      showError("Xóa video thất bại!");
    } finally {
      setShowConfirm(false);
      setSlotToDelete(null);
    }
  };

  // ─── Derived ─────────────────────────────────────────────────────────────────
  const hasAnyReady = slots.some((s) => s.file && s.status !== "done");
  const allDone = slots.filter((s) => s.file).every((s) => s.status === "done");

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-800 pb-5">
        <h2 className="text-2xl font-bold text-yellow-400 tracking-tight">
          Quản lý Video Intro (9:16)
        </h2>
        <p className="mt-1 text-sm text-gray-400">
          Chọn video cho từng slot, sau đó bấm "Tải lên tất cả" để upload tuần
          tự Video 1 → 2 → 3.
        </p>
      </div>

      {/* Lỗi fetch */}
      {fetchError && !loading && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-900/30 border border-red-700/50 text-red-400 text-sm">
          <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>Không thể tải danh sách video intro.</span>
          <button
            onClick={fetchIntros}
            className="ml-auto text-xs underline underline-offset-2 hover:text-red-300 transition-colors"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* 3 Slot Cards */}
      {loading ? (
        <div className="flex items-center gap-2 text-gray-500 text-sm py-8">
          <FiLoader className="animate-spin w-5 h-5" />
          Đang tải dữ liệu...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {([1, 2, 3] as const).map((slotNumber) => {
            const index = slotNumber - 1;
            const slotState = slots[index];
            const currentIntro = intros.find((i) => i.slot === slotNumber);
            const hasExistingVideo = !!currentIntro?.videoId;

            return (
              <div
                key={slotNumber}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-white">
                    Video {slotNumber}
                  </h4>
                  <StatusBadge status={slotState.status} />
                </div>

                {/* ── CASE 1: Có video trên server, chưa chọn file mới ── */}
                {hasExistingVideo &&
                  !slotState.file &&
                  slotState.status !== "done" && (
                    <>
                      <div className="relative aspect-[9/16] bg-black rounded-xl overflow-hidden border border-gray-700">
                        <iframe
                          src={`https://iframe.mediadelivery.net/embed/${import.meta.env.VITE_BUNNY_LIBRARY_ID}/${currentIntro!.videoId}?autoplay=false`}
                          className="w-full h-full"
                          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                          allowFullScreen
                        />
                      </div>

                      {!isRunning && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              patchSlot(index, { isReplacing: true });
                              setTimeout(
                                () => fileRefs.current[index]?.click(),
                                0,
                              );
                            }}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 text-xs font-medium transition-colors border border-yellow-500/30"
                          >
                            <FiRefreshCw className="w-3.5 h-3.5" />
                            Thay đổi video
                          </button>
                          <button
                            onClick={() => handleDelete(slotNumber)}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium transition-colors border border-red-500/30"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                            Xóa
                          </button>
                        </div>
                      )}

                      <input
                        ref={(el) => {
                          fileRefs.current[index] = el;
                        }}
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFile(index, file);
                        }}
                      />
                    </>
                  )}

                {/* ── CASE 2: Chưa có video, hiện dropzone ── */}
                {!hasExistingVideo &&
                  !slotState.file &&
                  slotState.status !== "done" && (
                    <>
                      <div
                        onDrop={(e) => {
                          e.preventDefault();
                          patchSlot(index, { isDragging: false });
                          const file = e.dataTransfer.files?.[0];
                          if (file) handleFile(index, file);
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          patchSlot(index, { isDragging: true });
                        }}
                        onDragLeave={() =>
                          patchSlot(index, { isDragging: false })
                        }
                        onClick={() =>
                          !isRunning && fileRefs.current[index]?.click()
                        }
                        className={`
                        relative aspect-[9/16] border-2 border-dashed rounded-2xl
                        flex flex-col items-center justify-center gap-2 transition-all duration-300
                        ${
                          isRunning
                            ? "border-gray-800 opacity-40 cursor-not-allowed"
                            : slotState.isDragging
                              ? "border-yellow-400 bg-yellow-500/10 scale-[1.01] cursor-pointer"
                              : "border-gray-700 hover:border-yellow-500 hover:bg-gray-800/50 cursor-pointer"
                        }
                      `}
                      >
                        {slotState.isDragging && (
                          <span className="absolute inset-0 rounded-2xl ring-2 ring-yellow-400/40 animate-pulse pointer-events-none" />
                        )}
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${slotState.isDragging ? "bg-yellow-500/20" : "bg-gray-800"}`}
                        >
                          <FiVideo
                            className={`w-6 h-6 transition-colors ${slotState.isDragging ? "text-yellow-400" : "text-gray-600"}`}
                          />
                        </div>
                        <p className="text-gray-400 text-sm">Chưa có video</p>
                        {!isRunning && (
                          <p className="text-yellow-400 text-xs">
                            {slotState.isDragging
                              ? "Thả file vào đây"
                              : "Kéo thả hoặc click để chọn"}
                          </p>
                        )}
                      </div>

                      <input
                        ref={(el) => {
                          fileRefs.current[index] = el;
                        }}
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFile(index, file);
                        }}
                      />
                    </>
                  )}

                {/* ── CASE 3: Đã chọn file mới (preview) ── */}
                {slotState.file && (
                  <div className="rounded-xl border border-gray-700 overflow-hidden">
                    <div className="bg-black">
                      <video
                        src={slotState.preview ?? ""}
                        controls
                        className="w-full max-h-52 object-contain"
                      />
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2.5 bg-gray-800">
                      <div className="w-8 h-8 rounded-lg bg-yellow-500/15 flex items-center justify-center flex-shrink-0">
                        <FiVideo className="w-4 h-4 text-yellow-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">
                          {slotState.file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {slotState.size}
                          {slotState.duration && ` · ${slotState.duration}`}
                        </p>
                      </div>
                      {!isRunning && slotState.status !== "done" && (
                        <button
                          onClick={() => handleRemoveFile(index)}
                          className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Hủy chọn file"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Progress bar */}
                    {slotState.status === "uploading" && (
                      <div className="px-3 pb-3 pt-2 bg-gray-900">
                        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                          <span>Đang upload...</span>
                          <span className="font-semibold text-yellow-400">
                            {slotState.progress}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${slotState.progress}%`,
                              background:
                                slotState.progress === 100
                                  ? "#22c55e"
                                  : "#eab308",
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Done */}
                {slotState.status === "done" && (
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-green-900/30 border border-green-700/50 text-green-400 text-xs">
                    <FiCheck className="w-4 h-4 flex-shrink-0" />
                    Upload Video {slotNumber} thành công!
                  </div>
                )}

                {/* Error */}
                {slotState.error && (
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-900/30 border border-red-700/50 text-red-400 text-xs">
                    <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                    {slotState.error}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Nút Upload tất cả */}
      {hasAnyReady && !allDone && (
        <div className="flex items-center gap-4 pt-2">
          <button
            onClick={handleUploadAll}
            disabled={isRunning}
            className={`
              flex items-center gap-2 px-7 py-3 rounded-xl font-semibold text-sm transition-all
              ${
                isRunning
                  ? "bg-yellow-500/40 text-yellow-200 cursor-not-allowed"
                  : "bg-yellow-400 hover:bg-yellow-300 text-gray-950 hover:shadow-lg hover:shadow-yellow-500/20"
              }
            `}
          >
            {isRunning ? (
              <>
                <FiLoader className="w-4 h-4 animate-spin" />
                Đang upload...
              </>
            ) : (
              <>
                <FiUploadCloud className="w-4 h-4" />
                Tải lên tất cả
              </>
            )}
          </button>

          {!isRunning && (
            <p className="text-xs text-gray-500">
              Upload tuần tự: Video 1 → Video 2 → Video 3
            </p>
          )}
        </div>
      )}

      {/* Confirm xóa */}
      <ConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa video intro"
        description={`Bạn có chắc muốn xóa video intro ${slotToDelete} không?\nHành động này không thể hoàn tác.`}
      />
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: SlotStatus }) {
  const map: Record<SlotStatus, { label: string; className: string }> = {
    idle: { label: "Chờ", className: "bg-gray-800 text-gray-500" },
    ready: { label: "Sẵn sàng", className: "bg-blue-900/40 text-blue-400" },
    uploading: {
      label: "Uploading",
      className: "bg-yellow-900/40 text-yellow-400",
    },
    done: { label: "Xong ✓", className: "bg-green-900/40 text-green-400" },
    error: { label: "Lỗi", className: "bg-red-900/40 text-red-400" },
  };
  const { label, className } = map[status];
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${className}`}>
      {label}
    </span>
  );
}
