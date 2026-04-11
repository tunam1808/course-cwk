import { FaTiktok, FaFacebookF } from "react-icons/fa";

export default function SocialFollow() {
  return (
    <div className="w-full max-w-[1200px] mx-auto mt-6 md:px-4">
      <div className="bg-black rounded-xl px-6 py-5 flex flex-col items-center gap-4">
        <p className="text-white font-black text-sm md:text-3xl uppercase tracking-widest text-center">
          Theo dõi và đồng hành cùng mình trên mọi nền tảng
        </p>

        <div className="flex w-full gap-3">
          <a
            href="https://www.tiktok.com/@bientapnghiepdu"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-transparent hover:bg-yellow-300 active:scale-95 transition-all text-white hover:text-black font-black text-sm uppercase tracking-widest py-3 rounded-lg border-2 border-white"
          >
            <FaTiktok className="w-4 h-4" />
            TikTok
          </a>

          <a
            href="https://www.facebook.com/bientapnghiepdu247"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-transparent hover:bg-yellow-300 active:scale-95 transition-all text-white hover:text-black font-black text-sm uppercase tracking-widest py-3 rounded-lg border-2 border-white"
          >
            <FaFacebookF className="w-4 h-4" />
            Facebook
          </a>
        </div>
      </div>
    </div>
  );
}
