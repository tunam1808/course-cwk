import { FEEDBACK_MAU } from "@/data/mock";

export default function Feedback() {
  return (
    <section
      className="wrap bg-gray py-24 text-center max-[640px]:py-[72px]"
      aria-labelledby="fb-h"
    >
      <div className="mx-auto max-w-[1024px]">
        <h2 className="sec-h reveal" id="fb-h">
          Khách nói gì.
        </h2>
        <div
          className="mt-14 grid grid-cols-[repeat(3,1fr)] gap-5 max-[760px]:grid-cols-[1fr_1fr] max-[760px]:[&>div:nth-child(3)]:hidden"
          data-stagger
        >
          {FEEDBACK_MAU.map((note) => (
            <div
              key={note}
              className="reveal grid aspect-[3/4] place-items-center rounded-[28px] border border-dashed border-line bg-white p-4 text-center text-[14px] text-ink-3"
            >
              <div>
                <b className="mb-1 block font-semibold text-ink">
                  Ảnh feedback
                </b>
                {note}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
