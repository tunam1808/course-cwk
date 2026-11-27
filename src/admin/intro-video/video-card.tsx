// admin/intro-video/video-card.tsx
import { FiTrash2 } from "react-icons/fi";
import type { NewPageVideo } from "@/api/landingpage-intro.api";
import { formatSize } from "./video.utils";

interface Props {
  video: NewPageVideo;
  onRemove: () => void;
  disabled?: boolean;
}

export default function VideoCard({ video, onRemove, disabled }: Props) {
  return (
    <div className="rounded-xl border border-gray-700 overflow-hidden bg-gray-800">
      <div className="aspect-[9/16] bg-black">
        <iframe
          src={`https://iframe.mediadelivery.net/embed/${import.meta.env.VITE_BUNNY_LIBRARY_ID}/${video.videoId}?autoplay=false`}
          title={video.title}
          loading="lazy"
          className="w-full h-full"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
      <div className="flex items-center gap-2 px-3 py-2.5">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-white truncate">
            {video.title}
          </p>
          {video.fileSize !== null && (
            <p className="text-xs text-gray-500">
              {formatSize(video.fileSize)}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          className="shrink-0 p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title="Xóa video"
          aria-label={`Xóa video ${video.title}`}
        >
          <FiTrash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
