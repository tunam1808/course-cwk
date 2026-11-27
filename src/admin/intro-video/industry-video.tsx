// admin/intro-video/industry-video.tsx
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  FiCheck,
  FiEdit2,
  FiFolder,
  FiLoader,
  FiPlus,
  FiTrash2,
  FiUploadCloud,
  FiX,
} from "react-icons/fi";
import ConfirmDialog from "@/common/ConfirmDialog";
import { showError, showSuccess } from "@/common/toast";
import {
  newPageApi,
  type Industry,
  type NewPageVideo,
} from "@/api/landingpage-intro.api";
import VideoCard from "./video-card";
import { getErrorMessage, uploadVideo } from "./video.utils";

interface UploadState {
  industryId: number;
  current: number;
  total: number;
  progress: number;
}

// Chuẩn hóa tên: bỏ khoảng trắng thừa
const cleanName = (value: string) => value.trim().replace(/\s+/g, " ");

export default function IndustryVideos() {
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "ready">(
    "loading",
  );
  const [reloadKey, setReloadKey] = useState(0);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<{ id: number; name: string } | null>(
    null,
  );
  const [renaming, setRenaming] = useState(false);
  const [toDelete, setToDelete] = useState<Industry | null>(null);
  const [videoToDelete, setVideoToDelete] = useState<NewPageVideo | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [upload, setUpload] = useState<UploadState | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // ─── Tải dữ liệu ────────────────────────────────────────────────────────────
  useEffect(() => {
    let ignore = false;
    newPageApi
      .getIndustries()
      .then((data) => {
        if (ignore) return;
        if (!Array.isArray(data)) {
          setStatus("error");
          return;
        }
        setIndustries(data);
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

  const updateIndustryState = (
    id: number,
    update: (industry: Industry) => Industry,
  ) => setIndustries((prev) => prev.map((i) => (i.id === id ? update(i) : i)));

  // ─── Ngành nghề ─────────────────────────────────────────────────────────────
  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = cleanName(name);
    if (!trimmed || creating) return;

    setCreating(true);
    try {
      const industry = await newPageApi.createIndustry(trimmed);
      setIndustries((prev) => [industry, ...prev]);
      setName("");
      showSuccess(`Đã tạo ngành "${industry.name}"`);
    } catch (error) {
      showError(getErrorMessage(error, "Tạo ngành thất bại"));
    } finally {
      setCreating(false);
    }
  };

  const handleRename = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing || renaming) return;
    const { id } = editing;
    const trimmed = cleanName(editing.name);
    if (!trimmed) return;

    // Không đổi gì thì chỉ đóng ô sửa
    if (industries.find((i) => i.id === id)?.name === trimmed) {
      setEditing(null);
      return;
    }

    setRenaming(true);
    try {
      const updated = await newPageApi.updateIndustry(id, trimmed);
      updateIndustryState(id, (i) => ({ ...i, name: updated.name }));
      setEditing(null);
      showSuccess("Đã cập nhật tên ngành");
    } catch (error) {
      showError(getErrorMessage(error, "Cập nhật tên ngành thất bại"));
    } finally {
      setRenaming(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    const { id } = toDelete;
    setToDelete(null);
    setDeleting(true);
    try {
      await newPageApi.deleteIndustry(id);
      setIndustries((prev) => prev.filter((i) => i.id !== id));
      showSuccess("Đã xóa ngành nghề");
    } catch (error) {
      showError(getErrorMessage(error, "Xóa ngành thất bại"));
    } finally {
      setDeleting(false);
    }
  };

  // ─── Video ──────────────────────────────────────────────────────────────────
  const handleAddVideos = async (industryId: number, files: File[]) => {
    const valid = files.filter((f) => f.type.startsWith("video/"));
    if (valid.length < files.length) showError("Chỉ chấp nhận file video");
    if (!valid.length) return;

    const controller = new AbortController();
    abortRef.current = controller;
    let success = 0;

    // Upload tuần tự, file lỗi thì chuyển sang file tiếp theo
    for (const [index, file] of valid.entries()) {
      const state = { industryId, current: index + 1, total: valid.length };
      setUpload({ ...state, progress: 0 });

      try {
        const payload = await uploadVideo(file, controller.signal, (progress) =>
          setUpload({ ...state, progress }),
        );
        const saved = await newPageApi.saveSampleVideo(industryId, payload);
        updateIndustryState(industryId, (i) => ({
          ...i,
          videos: [...i.videos, saved],
        }));
        success++;
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("[IndustryVideos] upload failed:", error);
        showError(getErrorMessage(error, `Tải "${file.name}" thất bại`));
      }
    }

    setUpload(null);
    if (success) showSuccess(`Đã tải lên ${success}/${valid.length} video`);
  };

  const handleConfirmDeleteVideo = async () => {
    if (!videoToDelete) return;
    const { id } = videoToDelete;
    setVideoToDelete(null);
    setDeleting(true);
    try {
      await newPageApi.deleteSampleVideo(id);
      setIndustries((prev) =>
        prev.map((i) => ({
          ...i,
          videos: i.videos.filter((v) => v.id !== id),
        })),
      );
      showSuccess("Đã xóa video");
    } catch (error) {
      showError(getErrorMessage(error, "Xóa video thất bại"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-800 pb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-yellow-400 tracking-tight">
          Video mẫu theo ngành nghề
        </h2>
        <p className="mt-1 text-sm text-gray-400">
          Tạo ngành nghề trước, sau đó tải video mẫu lên đúng ngành.
        </p>
      </div>

      {/* Form tạo ngành */}
      <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tên ngành nghề, ví dụ: Spa & Làm đẹp"
          aria-label="Tên ngành nghề"
          maxLength={80}
          className="flex-1 sm:max-w-md px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500"
        />
        <button
          type="submit"
          disabled={!name.trim() || creating || status !== "ready"}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-gray-950 font-semibold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {creating ? (
            <FiLoader className="w-4 h-4 animate-spin" />
          ) : (
            <FiPlus className="w-4 h-4" />
          )}
          Tạo ngành
        </button>
      </form>

      {/* Danh sách ngành */}
      {status === "loading" ? (
        <div className="flex items-center gap-2 py-8 text-sm text-gray-500">
          <FiLoader className="w-5 h-5 animate-spin" />
          Đang tải dữ liệu...
        </div>
      ) : status === "error" ? (
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-red-900/30 border border-red-700/50 text-sm text-red-400">
          Không thể tải danh sách ngành nghề
          <button
            type="button"
            onClick={handleRetry}
            className="shrink-0 underline underline-offset-2 hover:text-red-300"
          >
            Thử lại
          </button>
        </div>
      ) : industries.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 rounded-2xl border-2 border-dashed border-gray-800 text-center">
          <FiFolder className="w-8 h-8 text-gray-600" />
          <p className="text-sm text-gray-400">Chưa có ngành nghề nào</p>
        </div>
      ) : (
        <div className="space-y-4">
          {industries.map((industry) => (
            <section
              key={industry.id}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-4 sm:p-5 space-y-4"
            >
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[200px]">
                  {editing?.id === industry.id ? (
                    <form onSubmit={handleRename} className="flex gap-2">
                      <input
                        autoFocus
                        value={editing.name}
                        onChange={(e) =>
                          setEditing({ id: industry.id, name: e.target.value })
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Escape") setEditing(null);
                        }}
                        aria-label="Tên ngành mới"
                        maxLength={80}
                        className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-sm text-white focus:outline-none focus:border-yellow-500"
                      />
                      <button
                        type="submit"
                        disabled={!editing.name.trim() || renaming}
                        className="shrink-0 p-2.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-gray-950 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Lưu tên"
                        aria-label="Lưu tên"
                      >
                        <FiCheck className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(null)}
                        className="shrink-0 p-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 transition-colors"
                        title="Hủy"
                        aria-label="Hủy sửa tên"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center gap-1">
                      <h3 className="min-w-0 font-semibold text-white break-words">
                        {industry.name}
                      </h3>
                      <button
                        type="button"
                        onClick={() =>
                          setEditing({ id: industry.id, name: industry.name })
                        }
                        className="shrink-0 p-2 rounded-lg text-gray-500 hover:text-yellow-400 hover:bg-yellow-500/10 transition-colors"
                        title="Sửa tên ngành"
                        aria-label={`Sửa tên ngành ${industry.name}`}
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    {industry.videos.length} video
                  </p>
                </div>

                <label
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg bg-yellow-500/10 text-yellow-400 text-xs font-medium border border-yellow-500/30 transition-colors focus-within:ring-2 focus-within:ring-yellow-400 ${
                    upload
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:bg-yellow-500/20 cursor-pointer"
                  }`}
                >
                  <FiUploadCloud className="w-4 h-4" />
                  Tải video lên
                  <input
                    type="file"
                    accept="video/*"
                    multiple
                    disabled={!!upload}
                    className="sr-only"
                    onChange={(e) => {
                      handleAddVideos(
                        industry.id,
                        Array.from(e.target.files ?? []),
                      );
                      e.target.value = ""; // cho phép chọn lại cùng file
                    }}
                  />
                </label>

                <button
                  type="button"
                  onClick={() => setToDelete(industry)}
                  disabled={deleting || upload?.industryId === industry.id}
                  className="p-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Xóa ngành"
                  aria-label={`Xóa ngành ${industry.name}`}
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>

              {upload?.industryId === industry.id && (
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                    <span>
                      Đang tải video {upload.current}/{upload.total}
                    </span>
                    <span className="font-semibold text-yellow-400">
                      {upload.progress}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 rounded-full transition-all duration-300"
                      style={{ width: `${upload.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {industry.videos.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-600 rounded-xl border border-dashed border-gray-800">
                  Ngành này chưa có video mẫu
                </p>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
                  {industry.videos.map((video) => (
                    <VideoCard
                      key={video.id}
                      video={video}
                      onRemove={() => setVideoToDelete(video)}
                      disabled={deleting}
                    />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa ngành nghề"
        description={`Xóa ngành "${toDelete?.name ?? ""}" và toàn bộ video của ngành này?\nHành động này không thể hoàn tác.`}
      />

      <ConfirmDialog
        open={!!videoToDelete}
        onClose={() => setVideoToDelete(null)}
        onConfirm={handleConfirmDeleteVideo}
        title="Xác nhận xóa video"
        description={`Xóa video "${videoToDelete?.title ?? ""}"?\nHành động này không thể hoàn tác.`}
      />
    </div>
  );
}
