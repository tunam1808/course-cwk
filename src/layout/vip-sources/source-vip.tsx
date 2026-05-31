import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  resourcePublicApi,
  type ResourceCategory,
  type ResourceSubFolder,
  type ResourceFile,
} from "@/api/resource.api";
import { useAuth } from "@/contexts/auth.context";

function getCategoryEmoji(name: string): string {
  const n = name.toLowerCase();
  if (
    n.includes("nhạc") ||
    n.includes("music") ||
    n.includes("âm thanh") ||
    n.includes("sfx")
  )
    return "🎵";
  if (n.includes("font") || n.includes("chữ")) return "🔤";
  if (n.includes("xanh") || n.includes("green") || n.includes("phông"))
    return "🎬";
  if (n.includes("video") || n.includes("clip")) return "📹";
  if (n.includes("ảnh") || n.includes("hình") || n.includes("photo"))
    return "🖼️";
  if (n.includes("hiệu ứng") || n.includes("effect")) return "✨";
  return "📦";
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ✅ Helper lấy emoji theo fileType enum
function getFileTypeEmoji(fileType: string): string {
  if (fileType === "MP3") return "🎵";
  if (fileType === "MP4") return "📹";
  if (fileType === "FONT") return "🔤";
  if (fileType === "IMAGE") return "🖼️";
  if (fileType === "LUT") return "🎨";
  return "📄";
}

function SkeletonCard() {
  return (
    <div
      className="rounded-2xl p-[6px] animate-pulse"
      style={{
        background:
          "linear-gradient(to right, #1d1d1d, #1d1d1d, #203756, #1d3e5d)",
      }}
    >
      <div
        className="rounded-xl border border-white/20 overflow-hidden flex flex-col h-full"
        style={{
          background:
            "linear-gradient(to right, #1d1d1d, #1d1d1d, #203756, #1d3e5d)",
        }}
      >
        <div className="h-32 bg-white/10" />
        <div className="p-3 flex flex-col gap-2 flex-1">
          <div className="h-4 bg-white/10 rounded w-4/5" />
          <div className="h-4 bg-white/10 rounded w-3/5" />
          <div className="mt-auto h-8 bg-white/10 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ── CategoryCard ──────────────────────────────────────────────────
function CategoryCard({
  category,
  isLoggedIn,
  onSelect,
}: {
  category: ResourceCategory;
  isLoggedIn: boolean;
  onSelect: (cat: ResourceCategory) => void;
}) {
  const emoji = getCategoryEmoji(category.name);
  const subCount =
    category._count?.subFolders ?? category.subFolders?.length ?? 0;
  const locked = category.isVip && !isLoggedIn;

  return (
    <div
      className="rounded-2xl p-[6px]"
      style={{
        background:
          "linear-gradient(to right, #1d1d1d, #1d1d1d, #203756, #1d3e5d)",
      }}
    >
      <div
        className={`rounded-xl border overflow-hidden flex flex-col h-full relative transition-all ${
          locked ? "border-white/20 brightness-50" : "border-white"
        }`}
        style={{
          background:
            "linear-gradient(to right, #1d1d1d, #1d1d1d, #203756, #1d3e5d)",
        }}
      >
        <div className="relative h-32 overflow-hidden bg-[#1e2937]/60">
          {category.thumbnailUrl ? (
            <>
              <img
                src={category.thumbnailUrl}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30" />
            </>
          ) : (
            <div className="absolute inset-0 flex items-end justify-start p-3">
              <span className="text-3xl">{emoji}</span>
            </div>
          )}

          {category.isVip ? (
            <div className="absolute top-2 left-2 bg-gradient-to-r from-[#f59e0b] to-[#ef4444] text-white text-xs font-bold px-2 py-0.5 rounded-md z-10">
              VIP
            </div>
          ) : (
            <div className="absolute top-2 left-2 bg-gradient-to-r from-[#10b981] to-[#059669] text-white text-xs font-bold px-2 py-0.5 rounded-md z-10">
              FREE
            </div>
          )}

          {subCount > 0 && (
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-md z-10 backdrop-blur-sm">
              {subCount} folder
            </div>
          )}
        </div>

        <div className="p-3 flex flex-col flex-1">
          <h3
            className={`text-sm font-bold mb-3 leading-snug uppercase ${category.isVip ? "text-[#fbbf24]" : "text-white"}`}
          >
            {category.name}
          </h3>
          <button
            onClick={() => onSelect(category)}
            className={`mt-auto w-full py-2 font-bold rounded-lg text-xs transition-opacity active:scale-95 ${
              locked
                ? "bg-white/20 text-white/60 cursor-not-allowed"
                : "bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] text-black hover:opacity-90"
            }`}
          >
            {locked ? "🔒 ĐĂNG NHẬP ĐỂ XEM" : "BẤM ĐỂ TẢI NGAY"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── SubFolderCard ─────────────────────────────────────────────────
type DownloadState = "idle" | "loading" | "done" | "error";

function SubFolderCard({
  sub,
  onOpen,
}: {
  sub: ResourceSubFolder;
  onOpen: () => void;
}) {
  const [dlState, setDlState] = useState<DownloadState>("idle");
  const [progress, setProgress] = useState<{ done: number; total: number }>({
    done: 0,
    total: 0,
  });

  const handleDownloadAll = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setDlState("loading");
    setProgress({ done: 0, total: 0 });
    try {
      const { items } = await resourcePublicApi.getFiles(sub.id);
      if (items.length === 0) {
        setDlState("done");
        return;
      }
      setProgress({ done: 0, total: items.length });
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const getFileName = (file: ResourceFile, index: number): string => {
        const urlExt = file.fileUrl
          .split("?")[0]
          .match(/\.([a-zA-Z0-9]+)$/)?.[1];
        const nameHasExt = /\.[a-zA-Z0-9]{2,5}$/.test(file.name);
        const baseName = file.name || `file_${index + 1}`;
        return nameHasExt
          ? baseName
          : urlExt
            ? `${baseName}.${urlExt.toLowerCase()}`
            : baseName;
      };
      let done = 0;
      await Promise.all(
        items.map(async (file, index) => {
          await resourcePublicApi.trackDownload(file.id);
          const res = await fetch(file.fileUrl);
          const blob = await res.blob();
          zip.file(getFileName(file, index), blob);
          done += 1;
          setProgress({ done, total: items.length });
        }),
      );
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${sub.name}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setDlState("done");
      setTimeout(() => setDlState("idle"), 3000);
    } catch {
      setDlState("error");
      setTimeout(() => setDlState("idle"), 3000);
    }
  };

  const dlLabel = () => {
    if (dlState === "loading") {
      if (progress.total === 0) return "⏳ Đang chuẩn bị...";
      if (progress.done < progress.total)
        return `⏳ Đang tải ${progress.done}/${progress.total}...`;
      return "📦 Đang nén ZIP...";
    }
    if (dlState === "done") return "✅ Đã tải xong!";
    if (dlState === "error") return "❌ Lỗi, thử lại";
    return "⬇ Tải cả folder (ZIP)";
  };

  return (
    <div
      className="rounded-2xl p-[6px] cursor-pointer hover:scale-105 transition-transform"
      style={{
        background:
          "linear-gradient(to right, #1d1d1d, #1d1d1d, #203756, #1d3e5d)",
      }}
      onClick={onOpen}
    >
      <div
        className="rounded-xl border border-white/50 p-4 flex flex-col gap-2 h-full"
        style={{
          background:
            "linear-gradient(to right, #1d1d1d, #1d1d1d, #203756, #1d3e5d)",
        }}
      >
        <span className="text-2xl">📁</span>
        <h3 className="text-sm font-bold text-yellow-400 uppercase leading-snug">
          {sub.name}
        </h3>
        {sub._count && (
          <p className="text-xs text-gray-400">{sub._count.files} file</p>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
          className="mt-auto w-full py-2 bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] text-black font-bold rounded-lg text-xs hover:opacity-90 transition-opacity"
        >
          MỞ FOLDER
        </button>
        <button
          onClick={handleDownloadAll}
          disabled={dlState === "loading"}
          className={`w-full py-2 rounded-lg text-xs font-bold transition-opacity border ${
            dlState === "done"
              ? "border-green-500 text-green-400 bg-transparent"
              : dlState === "error"
                ? "border-red-500 text-red-400 bg-transparent"
                : "border-[#fbbf24]/60 text-[#fbbf24] bg-transparent hover:bg-white/5"
          } ${dlState === "loading" ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {dlLabel()}
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════════
export default function OffersSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const isLoggedIn = user !== null;

  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<ResourceCategory | null>(null);
  const [selectedSubFolder, setSelectedSubFolder] =
    useState<ResourceSubFolder | null>(null);
  const [files, setFiles] = useState<ResourceFile[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);

  useEffect(() => {
    resourcePublicApi
      .getAllCategories()
      .then((data) => setCategories(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedSubFolder) return;

    const fetchFiles = async () => {
      setFilesLoading(true);
      try {
        const { items } = await resourcePublicApi.getFiles(
          selectedSubFolder.id,
        );
        setFiles(items);
      } catch {
        setFiles([]);
      } finally {
        setFilesLoading(false);
      }
    };

    fetchFiles();
  }, [selectedSubFolder]);

  const handleSelectCategory = (cat: ResourceCategory) => {
    if (cat.isVip && !isLoggedIn) {
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }
    setSelectedCategory(cat);
  };

  const handleDownload = async (file: ResourceFile) => {
    await resourcePublicApi.trackDownload(file.id);
    try {
      const res = await fetch(file.fileUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const urlExt = file.fileUrl.split("?")[0].match(/\.([a-zA-Z0-9]+)$/)?.[1];
      const nameHasExt = /\.[a-zA-Z0-9]{2,5}$/.test(file.name);
      a.download = nameHasExt
        ? file.name
        : urlExt
          ? `${file.name}.${urlExt.toLowerCase()}`
          : file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      const a = document.createElement("a");
      a.href = file.fileUrl;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  };

  // ✅ Fix: check đúng theo enum fileType thay vì string extension
  const canPreview = (file: ResourceFile) =>
    ["MP3", "MP4", "IMAGE"].includes(file.fileType);

  const handleBack = () => {
    if (selectedSubFolder) {
      setSelectedSubFolder(null);
      setFiles([]);
    } else setSelectedCategory(null);
  };

  return (
    <div ref={sectionRef}>
      {/* HERO BANNER */}
      <div className="max-w-[1150px] mx-auto px-4 md:px-6 my-6 mt-10">
        <div
          className="border-transparent rounded-2xl p-[10px]"
          style={{
            background:
              "linear-gradient(to right, #1d1d1d, #1d1d1d, #203756, #1d3e5d)",
          }}
        >
          <div
            className="border border-white rounded-xl px-6 md:px-16 py-10"
            style={{
              background:
                "linear-gradient(to right, #1d1d1d, #1d1d1d, #203756, #1d3e5d)",
              textAlign: "center",
            }}
          >
            <h2 className="text-center text-2xl md:text-3xl font-black text-[#ffff00] uppercase tracking-wide mb-6 leading-tight">
              KHO TÀI NGUYÊN EDIT GIÚP BẠN LÀM VIDEO NHANH HƠN
            </h2>
            <p
              style={{
                color: "#ffffff",
                maxWidth: "760px",
                margin: "0 auto 6px",
                lineHeight: "1.7",
                fontSize: "14.5px",
                fontStyle: "italic",
              }}
            >
              Bạn có thể tải và sử dụng các tài nguyên{" "}
              <span style={{ color: "#ffff00" }}>MIỄN PHÍ</span> ngay tại đây để
              bắt đầu.
            </p>
            <p
              style={{
                color: "#ffffff",
                maxWidth: "760px",
                margin: "0 auto 6px",
                lineHeight: "1.7",
                fontSize: "14.5px",
                fontStyle: "italic",
              }}
            >
              Nhưng nếu bạn muốn edit nhanh hơn, chuẩn xác hơn và ra video đẹp
              ngay từ đầu...
            </p>
            <p
              style={{
                maxWidth: "820px",
                margin: "0 auto 6px",
                lineHeight: "1.7",
                fontSize: "15px",
                fontStyle: "italic",
              }}
            >
              <span style={{ color: "#ffff00" }}>
                Bộ tài nguyên VIP (trị giá 2.500.000 VNĐ)
              </span>
              <span style={{ color: "#ffffff" }}>
                {" "}
                đã được chọn lọc sẵn sẽ giúp bạn làm điều đó dễ dàng hơn rất
                nhiều.
              </span>
            </p>
            <p
              style={{
                color: "#ffffff",
                fontSize: "14.5px",
                maxWidth: "680px",
                margin: "0 auto 18px",
                lineHeight: "1.7",
                fontStyle: "italic",
              }}
            >
              Nhiều người học edit lâu nhưng vẫn chậm...{" "}
              <span style={{ color: "#ffff00" }}>
                chỉ vì không có sẵn tài nguyên chuẩn
              </span>
            </p>
            <p
              style={{
                color: "#e2e8f0",
                fontSize: "17px",
                maxWidth: "680px",
                margin: "0 auto",
                fontWeight: "700",
              }}
            >
              ( Toàn bộ sẽ được mở khóa khi bạn{" "}
              <span style={{ color: "#ffff00", fontWeight: "700" }}>
                tham gia Khóa học Edit 7 Ngày
              </span>{" "}
              )
            </p>
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="max-w-[1100px] mx-auto px-0 py-8">
        {selectedCategory && (
          <div className="flex items-center gap-2 mb-6 px-2">
            <button
              onClick={handleBack}
              className="text-yellow-400 hover:text-yellow-300 text-sm flex items-center gap-1"
            >
              ← Quay lại
            </button>
            <span className="text-gray-500">/</span>
            <span className="text-gray-300 text-sm">
              {selectedCategory.name}
            </span>
            {selectedSubFolder && (
              <>
                <span className="text-gray-500">/</span>
                <span className="text-gray-300 text-sm">
                  {selectedSubFolder.name}
                </span>
              </>
            )}
          </div>
        )}

        {error ? (
          <p className="text-center text-red-400 text-sm py-8">
            Không thể tải danh sách tài nguyên. Vui lòng thử lại sau.
          </p>
        ) : !selectedCategory ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))
              : categories.map((cat) => (
                  <CategoryCard
                    key={cat.id}
                    category={cat}
                    isLoggedIn={isLoggedIn}
                    onSelect={handleSelectCategory}
                  />
                ))}
          </div>
        ) : !selectedSubFolder ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(selectedCategory.subFolders ?? []).map((sub) => (
              <SubFolderCard
                key={sub.id}
                sub={sub}
                onOpen={() => setSelectedSubFolder(sub)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filesLoading ? (
              <p className="text-center text-gray-400 py-8">Đang tải file...</p>
            ) : files.length === 0 ? (
              <p className="text-center text-gray-400 py-8">
                Chưa có file nào.
              </p>
            ) : (
              files.map((file) => (
                <div
                  key={file.id}
                  className="rounded-xl p-[4px]"
                  style={{
                    background:
                      "linear-gradient(to right, #1d1d1d, #1d1d1d, #203756, #1d3e5d)",
                  }}
                >
                  <div
                    className="rounded-lg border border-white/20 px-4 py-3 flex items-center justify-between gap-4"
                    style={{
                      background:
                        "linear-gradient(to right, #1d1d1d, #1d1d1d, #203756, #1d3e5d)",
                    }}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* ✅ Dùng helper thay vì chain ternary dài */}
                      <span className="text-xl flex-shrink-0">
                        {getFileTypeEmoji(file.fileType)}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatSize(file.fileSize)} • {file.fileType}
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-2">
                      {/* ✅ canPreview check đúng theo enum */}
                      {canPreview(file) && (
                        <button
                          onClick={() => window.open(file.fileUrl, "_blank")}
                          className="px-3 py-2 border border-white/30 text-white/80 font-bold rounded-lg text-xs hover:bg-white/10 transition-all"
                        >
                          👁 Xem demo
                        </button>
                      )}
                      <button
                        onClick={() => handleDownload(file)}
                        className="px-4 py-2 bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] text-black font-bold rounded-lg text-xs hover:opacity-90 transition-opacity"
                      >
                        ⬇ Tải về
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
