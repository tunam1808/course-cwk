// src/pages/admin/ResourceManage.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import {
  FiFolder,
  FiFolderPlus,
  FiUpload,
  FiTrash2,
  FiEdit2,
  FiCheck,
  FiX,
  FiChevronRight,
  FiChevronLeft,
  FiImage,
  FiMusic,
  FiVideo,
  FiType,
  FiFile,
  FiDownload,
  FiChevronDown,
  FiGrid,
  FiList,
  FiLock,
  FiUnlock,
  FiSliders, // ✅ Thêm mới cho LUT
} from "react-icons/fi";
import { resourceAdminApi } from "@/api/resource.api";
import type {
  ResourceCategory,
  ResourceSubFolder,
  ResourceFile,
} from "@/api/resource.api";

// ── Helpers ────────────────────────────────────────────────────────────

// Nút chỉ hiện khi rê chuột — nhưng CHỈ trên thiết bị thật sự có hover.
// Trên điện thoại/tablet cảm ứng (không có hover) các nút này luôn hiển thị,
// nếu không sẽ không thể đổi tên / xóa / tải xuống được.
const REVEAL_ON_HOVER =
  "[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100";
const REVEAL_ON_EDIT_HOVER =
  "[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/edit:opacity-100";

// Lưới file: tự chia số cột theo bề rộng thực tế của khung file
// (không phụ thuộc breakpoint vì còn bị sidebar chiếm chỗ).
const FILE_GRID = "grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-3";

// Danh sách file: nhỏ gọn (icon | tên + thông tin | nút) và chỉ hiện đủ 6 cột ở xl.
const LIST_COLS =
  "grid-cols-[2rem_minmax(0,1fr)_auto] xl:grid-cols-[2rem_minmax(0,1fr)_9rem_7rem_5rem_5rem]";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileColor(type: string) {
  if (type === "MP3")
    return {
      bg: "bg-purple-500/15",
      icon: "text-purple-400",
      border: "border-purple-500/20",
    };
  if (type === "MP4")
    return {
      bg: "bg-blue-500/15",
      icon: "text-blue-400",
      border: "border-blue-500/20",
    };
  if (type === "FONT")
    return {
      bg: "bg-emerald-500/15",
      icon: "text-emerald-400",
      border: "border-emerald-500/20",
    };
  // ✅ Thêm mới
  if (type === "IMAGE")
    return {
      bg: "bg-pink-500/15",
      icon: "text-pink-400",
      border: "border-pink-500/20",
    };
  if (type === "LUT")
    return {
      bg: "bg-orange-500/15",
      icon: "text-orange-400",
      border: "border-orange-500/20",
    };
  return {
    bg: "bg-slate-500/15",
    icon: "text-slate-400",
    border: "border-slate-500/20",
  };
}

function FileTypeIcon({
  type,
  size = "md",
}: {
  type: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = { sm: "w-3.5 h-3.5", md: "w-5 h-5", lg: "w-8 h-8" };
  const cls = sizes[size];
  const color = getFileColor(type);
  if (type === "MP3") return <FiMusic className={`${cls} ${color.icon}`} />;
  if (type === "MP4") return <FiVideo className={`${cls} ${color.icon}`} />;
  if (type === "FONT") return <FiType className={`${cls} ${color.icon}`} />;
  // ✅ Thêm mới
  if (type === "IMAGE") return <FiImage className={`${cls} ${color.icon}`} />;
  if (type === "LUT") return <FiSliders className={`${cls} ${color.icon}`} />;
  return <FiFile className={`${cls} ${color.icon}`} />;
}

// ── AccessBadge ────────────────────────────────────────────────────────
function AccessBadge({ isVip }: { isVip: boolean }) {
  if (isVip)
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex-shrink-0">
        <FiLock className="w-2.5 h-2.5" />
        VIP
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex-shrink-0">
      <FiUnlock className="w-2.5 h-2.5" />
      FREE
    </span>
  );
}

// ── Inline editable text ───────────────────────────────────────────────
function InlineEdit({
  value,
  onSave,
  className = "",
}: {
  value: string;
  onSave: (v: string) => Promise<void>;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const save = async () => {
    if (!text.trim() || text === value) {
      setEditing(false);
      return;
    }
    setLoading(true);
    await onSave(text.trim());
    setLoading(false);
    setEditing(false);
  };

  if (editing) {
    return (
      <span
        className="flex items-center gap-1"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") setEditing(false);
          }}
          // min-w-0 + flex-1: co giãn theo hàng thay vì cố định w-36 (tràn trên mobile).
          // text-base trên mobile để iOS không tự phóng to trang khi focus.
          className="min-w-0 w-36 max-w-full flex-1 bg-[#2d2e30] border border-[#5f6368] rounded px-2 py-0.5 text-[#e8eaed] text-base lg:text-sm outline-none focus:border-[#8ab4f8]"
        />
        <button
          onClick={save}
          disabled={loading}
          className="text-[#8ab4f8] hover:text-blue-300 p-1"
          aria-label="Lưu"
        >
          <FiCheck className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setEditing(false)}
          className="text-[#9aa0a6] hover:text-[#e8eaed] p-1"
          aria-label="Huỷ"
        >
          <FiX className="w-3.5 h-3.5" />
        </button>
      </span>
    );
  }

  return (
    <span className={`group/edit flex items-center gap-1 ${className}`}>
      <span className="truncate">{value}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setText(value);
          setEditing(true);
        }}
        className={`${REVEAL_ON_EDIT_HOVER} transition-opacity text-[#9aa0a6] hover:text-[#8ab4f8] flex-shrink-0 p-1.5 lg:p-0`}
        aria-label="Đổi tên"
      >
        <FiEdit2 className="w-3 h-3" />
      </button>
    </span>
  );
}

// ── Upload queue types ─────────────────────────────────────────────────
type UploadStatus = "pending" | "uploading" | "done" | "error";

interface UploadQueueItem {
  id: string;
  file: File;
  name: string;
  status: UploadStatus;
  progress: number;
  error?: string;
}

function QueueStatusIcon({ status }: { status: UploadStatus }) {
  if (status === "done")
    return <FiCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />;
  if (status === "error")
    return <FiX className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />;
  if (status === "uploading")
    return (
      <span className="w-3.5 h-3.5 flex-shrink-0 rounded-full border-2 border-[#8ab4f8] border-t-transparent animate-spin" />
    );
  return (
    <span className="w-3.5 h-3.5 flex-shrink-0 rounded-full border border-[#5f6368]" />
  );
}

// ── New folder modal ───────────────────────────────────────────────────
function NewFolderModal({
  title,
  placeholder,
  showAccessToggle,
  onConfirm,
  onCancel,
}: {
  title: string;
  placeholder: string;
  showAccessToggle?: boolean;
  onConfirm: (name: string, isVip: boolean) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [isVip, setIsVip] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      {/* w-full max-w-sm (=24rem, đúng bằng w-96 cũ) để không tràn màn hình nhỏ */}
      <div className="bg-[#2d2e30] rounded-2xl shadow-2xl w-full max-w-sm max-h-full overflow-y-auto p-5 sm:p-6 border border-[#3c4043]">
        <h3 className="text-[#e8eaed] font-medium text-base mb-4">{title}</h3>
        <input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && name.trim()) onConfirm(name.trim(), isVip);
            if (e.key === "Escape") onCancel();
          }}
          placeholder={placeholder}
          className="w-full bg-transparent border-b-2 border-[#8ab4f8] text-[#e8eaed] text-base sm:text-sm py-2 outline-none placeholder-[#5f6368]"
        />

        {showAccessToggle && (
          <div className="mt-5">
            <p className="text-xs text-[#9aa0a6] mb-3 uppercase tracking-wider font-medium">
              Quyền truy cập
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsVip(true)}
                className={`flex-1 min-w-0 flex items-center gap-2.5 px-3 sm:px-4 py-3 rounded-xl border-2 transition-all ${
                  isVip
                    ? "border-amber-500 bg-amber-500/10"
                    : "border-[#3c4043] bg-transparent hover:border-[#5f6368]"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    isVip ? "border-amber-500" : "border-[#5f6368]"
                  }`}
                >
                  {isVip && (
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                  )}
                </div>
                <div className="text-left min-w-0">
                  <div className="flex items-center gap-1.5">
                    <FiLock className="w-3.5 h-3.5 text-amber-400" />
                    <span
                      className={`text-sm font-semibold ${isVip ? "text-amber-400" : "text-[#9aa0a6]"}`}
                    >
                      VIP
                    </span>
                  </div>
                  <p className="text-[10px] text-[#5f6368] mt-0.5">
                    Chỉ thành viên VIP
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsVip(false)}
                className={`flex-1 min-w-0 flex items-center gap-2.5 px-3 sm:px-4 py-3 rounded-xl border-2 transition-all ${
                  !isVip
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-[#3c4043] bg-transparent hover:border-[#5f6368]"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    !isVip ? "border-emerald-500" : "border-[#5f6368]"
                  }`}
                >
                  {!isVip && (
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  )}
                </div>
                <div className="text-left min-w-0">
                  <div className="flex items-center gap-1.5">
                    <FiUnlock className="w-3.5 h-3.5 text-emerald-400" />
                    <span
                      className={`text-sm font-semibold ${!isVip ? "text-emerald-400" : "text-[#9aa0a6]"}`}
                    >
                      FREE
                    </span>
                  </div>
                  <p className="text-[10px] text-[#5f6368] mt-0.5">
                    Tất cả người dùng
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onCancel}
            className="px-5 py-2 text-sm text-[#8ab4f8] hover:bg-[#8ab4f8]/10 rounded-full transition-colors"
          >
            Huỷ
          </button>
          <button
            onClick={() => name.trim() && onConfirm(name.trim(), isVip)}
            disabled={!name.trim()}
            className="px-5 py-2 text-sm bg-[#8ab4f8] text-[#202124] font-medium rounded-full hover:bg-[#93baf9] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Tạo
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════════════
export default function ResourceManage() {
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [selectedCat, setSelectedCat] = useState<ResourceCategory | null>(null);
  const [selectedSub, setSelectedSub] = useState<ResourceSubFolder | null>(
    null,
  );
  const [files, setFiles] = useState<ResourceFile[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [expandedCats, setExpandedCats] = useState<Set<number>>(new Set());
  const [showNewCat, setShowNewCat] = useState(false);
  const [showNewSub, setShowNewSub] = useState(false);

  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [showQueue, setShowQueue] = useState(true);
  const uploadQueueRef = useRef<UploadQueueItem[]>([]);
  const isUploadingRef = useRef(false);

  const updateQueue = (
    updater: (prev: UploadQueueItem[]) => UploadQueueItem[],
  ) => {
    setUploadQueue((prev) => {
      const next = updater(prev);
      uploadQueueRef.current = next;
      return next;
    });
  };

  const thumbInputRef = useRef<HTMLInputElement>(null);
  const thumbCatIdRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Load categories ──────────────────────────────────────────────
  const loadCategories = async () => {
    setLoadingCats(true);
    try {
      const data = await resourceAdminApi.getCategories();
      setCategories(data);
    } finally {
      setLoadingCats(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // ── Sync selectedCat & selectedSub ──────────────────────────────
  useEffect(() => {
    if (selectedCat) {
      const updated = categories.find((c) => c.id === selectedCat.id);
      if (updated) {
        setSelectedCat(updated);
        if (selectedSub) {
          const updatedSub = updated.subFolders.find(
            (s) => s.id === selectedSub.id,
          );
          if (updatedSub) setSelectedSub(updatedSub);
        }
      }
    }
  }, [categories]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Files ────────────────────────────────────────────────────────
  const loadFiles = async (subFolderId: number) => {
    setLoadingFiles(true);
    try {
      const { items } = await resourceAdminApi.getFiles(subFolderId);
      setFiles(items);
    } finally {
      setLoadingFiles(false);
    }
  };

  const selectSub = (cat: ResourceCategory, sub: ResourceSubFolder) => {
    setSelectedCat(cat);
    setSelectedSub(sub);
    setUploadQueue([]);
    uploadQueueRef.current = [];
    loadFiles(sub.id);
  };

  // Quay về danh sách folder (dùng cho nút "Quay lại" trên mobile)
  const backToFolders = () => {
    setSelectedSub(null);
    setFiles([]);
  };

  const toggleCat = (id: number) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ── Category actions ─────────────────────────────────────────────
  const createCategory = async (name: string, isVip: boolean) => {
    await resourceAdminApi.createCategory(name, isVip);
    setShowNewCat(false);
    loadCategories();
  };

  const updateCategory = async (id: number, name: string) => {
    await resourceAdminApi.updateCategory(id, { name });
    loadCategories();
  };

  const toggleCategoryAccess = async (cat: ResourceCategory) => {
    await resourceAdminApi.updateCategory(cat.id, { isVip: !cat.isVip });
    loadCategories();
  };

  const deleteCategory = async (id: number) => {
    if (
      !confirm(
        "Xoá folder này sẽ xoá toàn bộ subfolder và file bên trong. Tiếp tục?",
      )
    )
      return;
    await resourceAdminApi.deleteCategory(id);
    if (selectedCat?.id === id) {
      setSelectedCat(null);
      setSelectedSub(null);
      setFiles([]);
    }
    loadCategories();
  };

  const handleThumbnail = async (catId: number, file: File) => {
    await resourceAdminApi.updateThumbnail(catId, file);
    loadCategories();
  };

  // ── SubFolder actions ────────────────────────────────────────────
  const createSubFolder = async (name: string) => {
    if (!selectedCat) return;
    await resourceAdminApi.createSubFolder(name, selectedCat.id);
    setShowNewSub(false);
    loadCategories();
  };

  const updateSubFolder = async (id: number, name: string) => {
    await resourceAdminApi.updateSubFolder(id, { name });
    loadCategories();
  };

  const deleteSubFolder = async (id: number) => {
    if (!confirm("Xoá folder này sẽ xoá toàn bộ file bên trong. Tiếp tục?"))
      return;
    await resourceAdminApi.deleteSubFolder(id);
    if (selectedSub?.id === id) {
      setSelectedSub(null);
      setFiles([]);
    }
    loadCategories();
  };

  // ── Upload queue ─────────────────────────────────────────────────
  const processQueue = useCallback(async () => {
    if (isUploadingRef.current || !selectedSub) return;
    isUploadingRef.current = true;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const item = uploadQueueRef.current.find((i) => i.status === "pending");
      if (!item) break;

      updateQueue((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, status: "uploading", progress: 0 } : i,
        ),
      );

      try {
        await resourceAdminApi.uploadFile(
          selectedSub.id,
          item.name,
          item.file,
          "",
          (p) =>
            updateQueue((prev) =>
              prev.map((i) => (i.id === item.id ? { ...i, progress: p } : i)),
            ),
        );
        updateQueue((prev) =>
          prev.map((i) =>
            i.id === item.id ? { ...i, status: "done", progress: 100 } : i,
          ),
        );
        loadFiles(selectedSub.id);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Lỗi upload";
        updateQueue((prev) =>
          prev.map((i) =>
            i.id === item.id ? { ...i, status: "error", error: message } : i,
          ),
        );
      }
    }

    isUploadingRef.current = false;
  }, [selectedSub]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilesSelected = (fileList: FileList) => {
    if (!selectedSub) return;
    const newItems: UploadQueueItem[] = Array.from(fileList).map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      name: file.name.replace(/\.[^/.]+$/, ""),
      status: "pending" as UploadStatus,
      progress: 0,
    }));
    setUploadQueue((prev) => {
      const next = [...prev, ...newItems];
      uploadQueueRef.current = next;
      return next;
    });
    setShowQueue(true);
    setTimeout(() => processQueue(), 0);
  };

  const clearDoneQueue = () =>
    updateQueue((prev) => prev.filter((i) => i.status !== "done"));

  // ── File actions ─────────────────────────────────────────────────
  const downloadFile = async (fileUrl: string, fileName: string) => {
    try {
      const res = await fetch(fileUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      window.open(fileUrl, "_blank");
    }
  };

  const deleteFile = async (id: number) => {
    if (!confirm("Xoá file này?")) return;
    await resourceAdminApi.deleteFile(id);
    if (selectedSub) loadFiles(selectedSub.id);
  };

  // ── Derived ──────────────────────────────────────────────────────
  const activeUploads = uploadQueue.filter(
    (i) => i.status === "uploading" || i.status === "pending",
  ).length;
  const doneUploads = uploadQueue.filter((i) => i.status === "done").length;

  // ════════════════════════════════════════════════════════════════════
  // RENDER
  //
  // Bố cục:
  //  - ≥ lg: 2 khung cạnh nhau (cây folder | danh sách file) như cũ.
  //  - < lg: chỉ hiện 1 khung mỗi lúc. Chưa chọn folder con → hiện cây
  //    folder toàn chiều rộng; chọn folder con → hiện danh sách file kèm
  //    nút "Quay lại". (Dùng lg thay vì md vì đã có sidebar admin bên
  //    ngoài chiếm chỗ, thêm sidebar 15rem nữa thì khung file quá hẹp.)
  // ════════════════════════════════════════════════════════════════════
  return (
    <div className="h-full min-h-[60vh] flex bg-[#202124] text-[#e8eaed] overflow-hidden rounded-xl">
      {/* ── SIDEBAR ────────────────────────────────────────────────── */}
      <aside
        className={`${
          selectedSub ? "hidden lg:flex" : "flex"
        } flex-col w-full lg:w-60 flex-shrink-0 lg:border-r border-[#3c4043] overflow-hidden`}
      >
        <div className="px-4 pt-5 pb-3 flex items-center justify-between flex-shrink-0">
          <span className="text-sm font-semibold text-[#e8eaed]">
            Tài nguyên
          </span>
          <button
            onClick={() => setShowNewCat(true)}
            title="Thêm folder gốc"
            aria-label="Thêm folder gốc"
            className="w-9 h-9 lg:w-7 lg:h-7 flex items-center justify-center rounded-full hover:bg-[#3c4043] text-[#9aa0a6] hover:text-[#e8eaed] transition-colors"
          >
            <FiFolderPlus className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
          {loadingCats ? (
            <div className="space-y-1 px-2 pt-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-8 rounded-full bg-[#2d2e30] animate-pulse"
                  style={{ opacity: 1 - i * 0.15 }}
                />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <p className="text-[#9aa0a6] text-xs text-center py-8">
              Chưa có folder nào
            </p>
          ) : (
            categories.map((cat) => {
              const isExpanded = expandedCats.has(cat.id);
              const isActiveCat = selectedCat?.id === cat.id;
              return (
                <div key={cat.id}>
                  <div
                    className={`group flex items-center gap-1.5 px-2 py-2 lg:py-1.5 rounded-full cursor-pointer transition-colors select-none ${
                      isActiveCat && !selectedSub
                        ? "bg-[#394457] text-[#c2d9ff]"
                        : "hover:bg-[#2d2e30] text-[#9aa0a6] hover:text-[#e8eaed]"
                    }`}
                    onClick={() => toggleCat(cat.id)}
                  >
                    <FiChevronRight
                      className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-150 ${isExpanded ? "rotate-90" : ""}`}
                    />
                    <div
                      className="w-7 h-7 lg:w-5 lg:h-5 rounded flex-shrink-0 overflow-hidden flex items-center justify-center bg-[#3c4043] hover:ring-1 hover:ring-[#8ab4f8]"
                      onClick={(e) => {
                        e.stopPropagation();
                        thumbCatIdRef.current = cat.id;
                        thumbInputRef.current?.click();
                      }}
                      title="Đổi ảnh đại diện"
                    >
                      {cat.thumbnailUrl ? (
                        <img
                          src={cat.thumbnailUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FiImage className="w-4 h-4 lg:w-3 lg:h-3 text-[#9aa0a6]" />
                      )}
                    </div>
                    <span className="flex-1 text-sm min-w-0">
                      <InlineEdit
                        value={cat.name}
                        onSave={(name) => updateCategory(cat.id, name)}
                      />
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCategoryAccess(cat);
                      }}
                      title={`Đang ${cat.isVip ? "VIP" : "FREE"} — nhấn để đổi`}
                      className={`${REVEAL_ON_HOVER} transition-opacity`}
                    >
                      <AccessBadge isVip={cat.isVip ?? true} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCategory(cat.id);
                      }}
                      aria-label="Xoá folder"
                      className={`${REVEAL_ON_HOVER} w-8 h-8 lg:w-5 lg:h-5 flex items-center justify-center rounded-full hover:bg-red-500/20 text-[#9aa0a6] hover:text-red-400 flex-shrink-0 transition-all`}
                    >
                      <FiTrash2 className="w-3.5 h-3.5 lg:w-3 lg:h-3" />
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="ml-5 border-l border-[#3c4043] ml-4 pl-2 mt-0.5 space-y-0.5">
                      {cat.subFolders.map((sub) => (
                        <div
                          key={sub.id}
                          onClick={() => selectSub(cat, sub)}
                          className={`group flex items-center gap-2 pl-2 pr-2 py-2 lg:py-1.5 rounded-full cursor-pointer transition-colors select-none ${
                            selectedSub?.id === sub.id
                              ? "bg-[#394457] text-[#c2d9ff]"
                              : "hover:bg-[#2d2e30] text-[#9aa0a6] hover:text-[#e8eaed]"
                          }`}
                        >
                          <FiFolder className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="flex-1 text-sm min-w-0">
                            <InlineEdit
                              value={sub.name}
                              onSave={(name) => updateSubFolder(sub.id, name)}
                            />
                          </span>
                          <span className="text-xs text-[#5f6368] flex-shrink-0">
                            {sub._count?.files ?? 0}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSubFolder(sub.id);
                            }}
                            aria-label="Xoá folder con"
                            className={`${REVEAL_ON_HOVER} w-8 h-8 lg:w-4 lg:h-4 flex items-center justify-center rounded-full hover:bg-red-500/20 text-[#9aa0a6] hover:text-red-400 transition-all`}
                          >
                            <FiTrash2 className="w-3.5 h-3.5 lg:w-3 lg:h-3" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          setSelectedCat(cat);
                          setExpandedCats((p) => new Set(p).add(cat.id));
                          setShowNewSub(true);
                        }}
                        className="flex items-center gap-2 pl-2 py-2 lg:py-1.5 rounded-full w-full text-[#5f6368] hover:text-[#9aa0a6] hover:bg-[#2d2e30] transition-colors text-xs"
                      >
                        <FiFolderPlus className="w-3.5 h-3.5" />
                        Thêm folder con
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </nav>

        <input
          ref={thumbInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            const catId = thumbCatIdRef.current;
            if (file && catId) handleThumbnail(catId, file);
            e.target.value = "";
          }}
        />
      </aside>

      {/* ── MAIN ───────────────────────────────────────────────────── */}
      <main
        className={`${
          selectedSub ? "flex" : "hidden lg:flex"
        } flex-1 flex-col min-w-0 overflow-hidden`}
      >
        <header className="flex-shrink-0 flex flex-wrap items-center gap-x-3 gap-y-2 px-3 sm:px-5 py-3 border-b border-[#3c4043]">
          {/* Hàng 1: nút quay lại (mobile) + breadcrumb */}
          <div className="flex items-center gap-2 min-w-0 basis-full lg:basis-0 lg:flex-1">
            {selectedSub && (
              <button
                onClick={backToFolders}
                aria-label="Quay lại danh sách folder"
                className="lg:hidden shrink-0 -ml-1 w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#3c4043] text-[#9aa0a6] hover:text-[#e8eaed] transition-colors"
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>
            )}

            <div className="flex items-center gap-1.5 text-sm flex-1 min-w-0">
              <span
                className="hidden sm:inline text-[#9aa0a6] hover:text-[#e8eaed] cursor-pointer transition-colors"
                onClick={() => {
                  setSelectedCat(null);
                  setSelectedSub(null);
                  setFiles([]);
                }}
              >
                Tài nguyên
              </span>
              {selectedCat && (
                <>
                  <FiChevronRight className="hidden sm:block w-3.5 h-3.5 text-[#5f6368] flex-shrink-0" />
                  <span
                    className={`truncate transition-colors ${
                      selectedSub
                        ? "text-[#9aa0a6] hover:text-[#e8eaed] cursor-pointer"
                        : "text-[#e8eaed] font-medium"
                    }`}
                    onClick={() => {
                      if (selectedSub) {
                        setSelectedSub(null);
                        setFiles([]);
                      }
                    }}
                  >
                    {selectedCat.name}
                  </span>
                  {!selectedSub && (
                    <AccessBadge isVip={selectedCat.isVip ?? true} />
                  )}
                </>
              )}
              {selectedSub && (
                <>
                  <FiChevronRight className="w-3.5 h-3.5 text-[#5f6368] flex-shrink-0" />
                  <span className="text-[#e8eaed] font-medium truncate">
                    {selectedSub.name}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Hàng 2 (mobile) / cùng hàng (desktop): các nút thao tác */}
          <div className="flex items-center gap-2 w-full justify-between lg:w-auto lg:justify-end flex-shrink-0">
            {selectedCat && !selectedSub && (
              <button
                onClick={() => toggleCategoryAccess(selectedCat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  selectedCat.isVip
                    ? "border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
                    : "border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                }`}
              >
                {selectedCat.isVip ? (
                  <FiLock className="w-3.5 h-3.5" />
                ) : (
                  <FiUnlock className="w-3.5 h-3.5" />
                )}
                {selectedCat.isVip ? "VIP" : "FREE"}
              </button>
            )}
            {selectedSub && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-[#394457] hover:bg-[#3d4f6a] text-[#8ab4f8] rounded-full text-sm font-medium transition-colors border border-[#5076a8]/40"
              >
                <FiUpload className="w-3.5 h-3.5" />
                Tải lên
              </button>
            )}
            <div className="flex items-center bg-[#2d2e30] rounded-full p-0.5 border border-[#3c4043] ml-auto lg:ml-0">
              <button
                onClick={() => setViewMode("grid")}
                aria-label="Xem dạng lưới"
                className={`p-2 lg:p-1.5 rounded-full transition-colors ${viewMode === "grid" ? "bg-[#394457] text-[#8ab4f8]" : "text-[#9aa0a6] hover:text-[#e8eaed]"}`}
              >
                <FiGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                aria-label="Xem dạng danh sách"
                className={`p-2 lg:p-1.5 rounded-full transition-colors ${viewMode === "list" ? "bg-[#394457] text-[#8ab4f8]" : "text-[#9aa0a6] hover:text-[#e8eaed]"}`}
              >
                <FiList className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ✅ Thêm .gif .jpg .jpeg .png .cube vào accept */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="audio/*,video/*,.ttf,.otf,.woff,.woff2,.zip,.gif,.jpg,.jpeg,.png,.cube"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) handleFilesSelected(e.target.files);
              e.target.value = "";
            }}
          />
        </header>

        <div className="flex-1 overflow-y-auto p-3 sm:p-5">
          {!selectedSub ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[50vh] gap-3 text-center">
              <div className="w-16 h-16 rounded-full bg-[#2d2e30] flex items-center justify-center">
                <FiFolder className="w-7 h-7 text-[#5f6368]" />
              </div>
              <p className="text-[#9aa0a6] text-sm">
                {selectedCat
                  ? `Chọn folder con trong "${selectedCat.name}"`
                  : "Chọn folder từ thanh bên để xem file"}
              </p>
            </div>
          ) : loadingFiles ? (
            viewMode === "grid" ? (
              <div className={FILE_GRID}>
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[3/4] rounded-xl bg-[#2d2e30] animate-pulse"
                    style={{ opacity: 1 - i * 0.06 }}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="h-12 rounded-lg bg-[#2d2e30] animate-pulse"
                    style={{ opacity: 1 - i * 0.1 }}
                  />
                ))}
              </div>
            )
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[50vh] gap-3 text-center">
              <div className="w-16 h-16 rounded-full bg-[#2d2e30] flex items-center justify-center">
                <FiUpload className="w-7 h-7 text-[#5f6368]" />
              </div>
              <div>
                <p className="text-[#e8eaed] text-sm font-medium">
                  Folder này chưa có file
                </p>
                <p className="text-[#9aa0a6] text-xs mt-1">
                  Nhấn "Tải lên" để thêm file mới
                </p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-[#394457] hover:bg-[#3d4f6a] text-[#8ab4f8] rounded-full text-sm font-medium transition-colors border border-[#5076a8]/40"
              >
                <FiUpload className="w-3.5 h-3.5" />
                Chọn file để tải lên
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <div className={FILE_GRID}>
              {files.map((file) => {
                const color = getFileColor(file.fileType);
                return (
                  <div
                    key={file.id}
                    className={`group relative flex flex-col rounded-xl border ${color.border} ${color.bg} hover:brightness-110 transition-all cursor-default overflow-hidden`}
                  >
                    <div className="flex items-center justify-center h-24 pt-2">
                      <FileTypeIcon type={file.fileType} size="lg" />
                    </div>
                    <div className="px-2.5 pb-2.5">
                      <p
                        className="text-xs text-[#e8eaed] font-medium truncate"
                        title={file.name}
                      >
                        {file.name}
                      </p>
                      <p className="text-xs text-[#9aa0a6] mt-0.5">
                        {formatBytes(file.fileSize)}
                      </p>
                    </div>
                    <div className="absolute inset-0 bg-[#202124]/0 group-hover:bg-[#202124]/40 transition-colors rounded-xl pointer-events-none" />
                    <div
                      className={`${REVEAL_ON_HOVER} absolute top-1.5 right-1.5 flex gap-1 transition-opacity`}
                    >
                      <button
                        onClick={() =>
                          downloadFile(file.fileUrl, file.fileName)
                        }
                        className="w-7 h-7 lg:w-6 lg:h-6 flex items-center justify-center rounded-full bg-[#2d2e30]/90 text-[#9aa0a6] hover:text-[#8ab4f8] transition-colors"
                        title="Tải xuống"
                        aria-label="Tải xuống"
                      >
                        <FiDownload className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => deleteFile(file.id)}
                        className="w-7 h-7 lg:w-6 lg:h-6 flex items-center justify-center rounded-full bg-[#2d2e30]/90 text-[#9aa0a6] hover:text-red-400 transition-colors"
                        title="Xoá"
                        aria-label="Xoá"
                      >
                        <FiTrash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-[#3c4043] overflow-hidden">
              {/* Tiêu đề cột: chỉ hiện đủ 6 cột ở màn hình xl */}
              <div
                className={`grid ${LIST_COLS} gap-3 px-3 sm:px-4 py-2 bg-[#2d2e30] border-b border-[#3c4043] text-xs text-[#9aa0a6] font-medium uppercase tracking-wider`}
              >
                <span />
                <span>Tên</span>
                <span className="hidden xl:block">File gốc</span>
                <span className="hidden xl:block">Dung lượng</span>
                <span className="hidden xl:block">Lượt tải</span>
                <span />
              </div>
              {files.map((file, idx) => {
                const color = getFileColor(file.fileType);
                return (
                  <div
                    key={file.id}
                    className={`group grid ${LIST_COLS} gap-3 items-center px-3 sm:px-4 py-2.5 hover:bg-[#2d2e30] transition-colors ${
                      idx !== files.length - 1
                        ? "border-b border-[#3c4043]/50"
                        : ""
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg ${color.bg} border ${color.border} flex items-center justify-center`}
                    >
                      <FileTypeIcon type={file.fileType} size="sm" />
                    </div>

                    {/* Tên + (dưới xl) dòng thông tin phụ ngay bên dưới tên */}
                    <div className="min-w-0">
                      <p
                        className="text-sm text-[#e8eaed] truncate"
                        title={file.name}
                      >
                        {file.name}
                      </p>
                      <p className="xl:hidden text-[11px] text-[#9aa0a6] truncate">
                        {formatBytes(file.fileSize)} · {file.downloadCount} lượt
                        tải
                      </p>
                    </div>

                    <span className="hidden xl:block text-xs text-[#9aa0a6] truncate">
                      {file.fileName}
                    </span>
                    <span className="hidden xl:block text-xs text-[#9aa0a6]">
                      {formatBytes(file.fileSize)}
                    </span>
                    <span className="hidden xl:block text-xs text-[#9aa0a6]">
                      {file.downloadCount}
                    </span>

                    <div
                      className={`${REVEAL_ON_HOVER} flex items-center justify-end gap-1 transition-opacity`}
                    >
                      <button
                        onClick={() =>
                          downloadFile(file.fileUrl, file.fileName)
                        }
                        className="w-8 h-8 lg:w-7 lg:h-7 flex items-center justify-center rounded-full hover:bg-[#394457] text-[#9aa0a6] hover:text-[#8ab4f8] transition-colors"
                        title="Tải xuống"
                        aria-label="Tải xuống"
                      >
                        <FiDownload className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteFile(file.id)}
                        className="w-8 h-8 lg:w-7 lg:h-7 flex items-center justify-center rounded-full hover:bg-red-500/15 text-[#9aa0a6] hover:text-red-400 transition-colors"
                        title="Xoá"
                        aria-label="Xoá"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* ── UPLOAD QUEUE WIDGET ─────────────────────────────────────── */}
      {uploadQueue.length > 0 && (
        <div className="fixed bottom-3 left-3 right-3 sm:left-auto sm:bottom-6 sm:right-6 sm:w-80 z-40 rounded-2xl shadow-2xl border border-[#3c4043] bg-[#2d2e30] overflow-hidden">
          <div
            className="flex items-center justify-between px-4 py-3 bg-[#3c4043] cursor-pointer select-none"
            onClick={() => setShowQueue((p) => !p)}
          >
            <span className="text-sm font-medium text-[#e8eaed]">
              {activeUploads > 0
                ? `Đang tải lên ${activeUploads} file...`
                : `Hoàn tất — ${doneUploads}/${uploadQueue.length} file`}
            </span>
            <div className="flex items-center gap-1">
              <span className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-[#5f6368]/50 text-[#9aa0a6] transition-colors">
                <FiChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${showQueue ? "" : "rotate-180"}`}
                />
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (activeUploads === 0) setUploadQueue([]);
                  else clearDoneQueue();
                }}
                aria-label="Đóng"
                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-[#5f6368]/50 text-[#9aa0a6] hover:text-[#e8eaed] transition-colors"
              >
                <FiX className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {showQueue && (
            <div className="max-h-60 overflow-y-auto divide-y divide-[#3c4043]">
              {uploadQueue.map((item) => (
                <div
                  key={item.id}
                  className="px-4 py-2.5 flex flex-col gap-1.5"
                >
                  <div className="flex items-center gap-2">
                    <QueueStatusIcon status={item.status} />
                    <span
                      className={`text-xs flex-1 truncate ${
                        item.status === "done"
                          ? "text-[#5f6368] line-through"
                          : item.status === "error"
                            ? "text-red-400"
                            : "text-[#e8eaed]"
                      }`}
                    >
                      {item.name}
                    </span>
                    <span className="text-xs text-[#5f6368] flex-shrink-0">
                      {formatBytes(item.file.size)}
                    </span>
                    {(item.status === "pending" || item.status === "error") && (
                      <button
                        onClick={() =>
                          updateQueue((prev) =>
                            prev.filter((i) => i.id !== item.id),
                          )
                        }
                        className="text-[#5f6368] hover:text-red-400 transition-colors p-1"
                        aria-label="Bỏ khỏi hàng đợi"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  {item.status === "uploading" && (
                    <div className="ml-5 h-1 bg-[#3c4043] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#8ab4f8] rounded-full transition-all duration-150"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  )}
                  {item.status === "error" && item.error && (
                    <p className="ml-5 text-xs text-red-400">{item.error}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Modals ──────────────────────────────────────────────────── */}
      {showNewCat && (
        <NewFolderModal
          title="Tạo folder gốc mới"
          placeholder="Tên folder..."
          showAccessToggle
          onConfirm={createCategory}
          onCancel={() => setShowNewCat(false)}
        />
      )}
      {showNewSub && selectedCat && (
        <NewFolderModal
          title={`Thêm folder con vào "${selectedCat.name}"`}
          placeholder="Tên folder con..."
          onConfirm={(name) => createSubFolder(name)}
          onCancel={() => setShowNewSub(false)}
        />
      )}
    </div>
  );
}
