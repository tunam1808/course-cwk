import { useId, useRef, useState } from "react";
import {
  newRequestId,
  normalizePhone,
  sendLead,
  type LeadSource,
} from "@/lib/lead";

type State = { kind: "idle" | "sending" | "done" | "err"; text: string };

// Ô "Chưa tiện nhắn Zalo?" — giao diện theo bản HTML gốc. tone="dark" dùng ở khối cuối nền navy.
export default function LeadForm({
  source,
  tone = "light",
}: {
  source: LeadSource;
  tone?: "light" | "dark";
}) {
  const uid = useId();
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<State>({ kind: "idle", text: "" });
  const requestId = useRef(newRequestId());
  const busy = useRef(false);
  const website = useRef<HTMLInputElement>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy.current) return; // chống bấm liên tiếp
    const p = normalizePhone(phone);
    if (!p)
      return setState({
        kind: "err",
        text: "Số điện thoại chưa đúng. Ví dụ: 0912 345 678.",
      });
    if (!consent)
      return setState({
        kind: "err",
        text: "Bạn cần đánh dấu đồng ý trước khi gửi.",
      });

    busy.current = true;
    setState({ kind: "sending", text: "Đang gửi…" });
    const r = await sendLead({
      phone: p,
      source,
      requestId: requestId.current,
      website: website.current?.value || "",
    });
    busy.current = false;
    if (r.ok) {
      setState({
        kind: "done",
        text: "Đã nhận số của bạn. CWK sẽ gọi lại trong 24 giờ.",
      });
      setPhone("");
      setConsent(false);
      requestId.current = newRequestId(); // lần gửi sau là yêu cầu mới
    } else {
      // Giữ nguyên mã yêu cầu: gửi lại sau lỗi mạng không tạo dòng trùng
      setState({ kind: "err", text: r.message });
    }
  }

  const sending = state.kind === "sending";
  return (
    <div className={"lead" + (tone === "dark" ? " lead-dark" : "")}>
      <h3>Chưa tiện nhắn Zalo?</h3>
      <p className="s">
        Để lại số điện thoại, CWK gọi lại cho bạn trong 24 giờ.
      </p>
      <form onSubmit={submit} noValidate>
        <label htmlFor={uid + "-sdt"} className="sr-only">
          Số điện thoại
        </label>
        <input
          id={uid + "-sdt"}
          name="sdt"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          maxLength={20}
          placeholder="Số điện thoại của bạn"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            if (state.kind === "err") setState({ kind: "idle", text: "" });
          }}
          disabled={sending}
          aria-invalid={
            state.kind === "err" && !normalizePhone(phone) ? true : undefined
          }
        />
        {/* Bẫy bot: người thật không thấy ô này */}
        <input
          ref={website}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="lead-hp"
        />
        <button type="submit" disabled={sending} aria-busy={sending}>
          {sending ? "Đang gửi…" : "Gửi"}
        </button>
      </form>
      <label className="agree">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          disabled={sending}
        />
        <span>Tôi đồng ý để CWK dùng số này để liên hệ tư vấn.</span>
      </label>
      <p className="ok">
        CWK chỉ sử dụng số điện thoại của bạn để liên hệ tư vấn.
      </p>
      <p
        className={
          "msg" +
          (state.kind === "done" ? " done" : state.kind === "err" ? " err" : "")
        }
        role="status"
        aria-live="polite"
      >
        {state.kind === "sending" ? "" : state.text}
      </p>
    </div>
  );
}
