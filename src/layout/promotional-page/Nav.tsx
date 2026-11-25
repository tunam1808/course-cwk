import ZaloLink from "./ZaloLink";

export default function Nav() {
  return (
    <nav
      className="wrap glass sticky top-[env(safe-area-inset-top,0px)] z-30 border-b border-[rgba(0,0,0,.08)] bg-[rgba(251,251,253,.8)]"
      aria-label="Chính"
    >
      <div className="mx-auto flex h-12 max-w-[1024px] items-center justify-between gap-4">
        <a href="#top" aria-label="CWK Media">
          <img
            className="block h-[22px] w-auto"
            src="/logo-cwk-navy.png"
            alt="CWK Media"
            width={560}
            height={183}
          />
        </a>
        <div className="flex gap-7 text-[12px] text-ink opacity-85 max-[640px]:hidden">
          <a className="hover:opacity-60" href="#video">
            Video mẫu
          </a>
          <a className="hover:opacity-60" href="#gia">
            Bảng giá
          </a>
          <a className="hover:opacity-60" href="#camket">
            Lợi ích
          </a>
        </div>
        <ZaloLink
          className="pill pill-navy px-3 py-[5px] text-[12px]"
          viTri="nav"
        >
          Nhắn Zalo
        </ZaloLink>
      </div>
    </nav>
  );
}
