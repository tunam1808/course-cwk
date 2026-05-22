import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-sm
                 rounded-2xl shadow-2xl border border-yellow-400/40 bg-gray-900/95
                 backdrop-blur px-5 py-4 flex items-center gap-4"
    >
      <img
        src="/logonguyen.png"
        alt="app icon"
        className="w-12 h-12 rounded-xl flex-shrink-0"
      />

      <div className="flex-1 min-w-0">
        <p className="text-white font-bold text-sm leading-tight">
          Cài Biên tập nghiệp dư về máy
        </p>
        <p className="text-gray-400 text-xs mt-0.5">
          Dùng như app, không cần mở trình duyệt
        </p>
      </div>

      <div className="flex flex-col gap-2 flex-shrink-0">
        <button
          onClick={handleInstall}
          className="bg-[#ffff00] hover:bg-yellow-300 text-black font-black text-xs
                     px-4 py-2 rounded-xl transition-all whitespace-nowrap"
        >
          Cài ngay
        </button>
        <button
          onClick={() => setVisible(false)}
          className="text-gray-500 hover:text-white text-xs text-center transition-colors"
        >
          Bỏ qua
        </button>
      </div>
    </div>
  );
}
