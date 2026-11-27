// admin/intro-video/video.utils.ts
import * as tus from "tus-js-client";
import { newPageApi, type VideoPayload } from "@/api/landingpage-intro.api";

export function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** Ưu tiên thông báo lỗi do server trả về */
export function getErrorMessage(error: unknown, fallback: string): string {
  const apiError = error as { response?: { data?: { message?: string } } };
  return apiError?.response?.data?.message ?? fallback;
}

/**
 * Upload 1 file lên Bunny (prepare → sign → TUS).
 * Trả về dữ liệu để gọi API lưu vào database.
 */
export async function uploadVideo(
  file: File,
  signal: AbortSignal,
  onProgress: (percent: number) => void,
): Promise<VideoPayload> {
  const { videoId } = await newPageApi.prepareUpload(file.name);
  const { signature, expire } = await newPageApi.signUpload(videoId);
  signal.throwIfAborted();

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
      metadata: { filetype: file.type, title: file.name },
      onProgress(uploaded, total) {
        onProgress(Math.round((uploaded / total) * 100));
      },
      onSuccess() {
        resolve();
      },
      onError(error) {
        reject(error);
      },
    });

    signal.addEventListener("abort", () => {
      void upload.abort();
      reject(signal.reason);
    });
    upload.start();
  });

  signal.throwIfAborted();
  return { videoId, title: file.name, fileSize: file.size };
}
