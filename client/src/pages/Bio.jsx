import SectionHeader from "../components/SectionHeader.jsx";
import { useI18n } from "../i18n/index.jsx";
import { getBioStrings } from "../i18n/bio.js";

/* ---------- utilities ---------- */
const A = (v) => (Array.isArray(v) ? v : []);
const cls = (...xs) => xs.filter(Boolean).join(" ");

/* ---------- monochrome primitives (stronger hover) ---------- */
const Surface = ({ className = "", children }) => (
  <div
    className={cls(
      "rounded-2xl bg-white border border-neutral-200/70",
      "shadow-[0_6px_20px_rgba(0,0,0,0.10)]",
      "hover:shadow-[0_18px_48px_rgba(0,0,0,0.22)] hover:-translate-y-0.5 transition-all",
      className
    )}
  >
    {children}
  </div>
);

const Divider = () => <div className="h-px w-full bg-neutral-200/80" />;

/* ---------- page ---------- */
export default function Bio() {
  const { lang } = useI18n();
  const S = getBioStrings(lang);

  // images in /public — per your request we swapped them:
  const heroArtwork = "/mehmet1.png"; // right image in hero
  const widePortrait = "/keci4.png"; // long banner — ensure head is visible

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Hero */}
      <div className="grid md:grid-cols-2 gap-6 items-stretch">
        <Surface className="p-6 md:p-8 flex flex-col justify-center">
          <h1 className="text-4xl text-center md:text-5xl font-sans tracking-tight text-neutral-900">
            {S.name}
          </h1>
          {/* removed underline/Divider under the name */}
        </Surface>

        <Surface className="overflow-hidden">
          <figure className="relative">
            <img
              src={heroArtwork}
              alt="Artwork"
              className="w-full h-[320px] md:h-[360px] object-cover"
              loading="eager"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          </figure>
        </Surface>
      </div>

      {/* Education / Career */}
      <section className="mt-8 md:mt-10">
        <Surface className="p-6 md:p-8">
          <SectionHeader title={S.headings.education} />
          <div className="mt-3 grid md:grid-cols-2 gap-4 text-neutral-800">
            <ul className="space-y-2">
              {A(S.education)
                .slice(0, Math.ceil(A(S.education).length / 2))
                .map((p, i) => (
                  <li key={`e1-${i}`} className="leading-relaxed">
                    {p}
                  </li>
                ))}
            </ul>
            <ul className="space-y-2">
              {A(S.education)
                .slice(Math.ceil(A(S.education).length / 2))
                .map((p, i) => (
                  <li key={`e2-${i}`} className="leading-relaxed">
                    {p}
                  </li>
                ))}
            </ul>
          </div>
        </Surface>
      </section>

      {/* Wide banner — ensure head visible (top-center crop + taller height) */}
      <section className="mt-8 md:mt-10">
        <Surface className="overflow-hidden">
          <img
            src={widePortrait}
            alt={`${S.name}`}
            className="w-full h-[520px] md:h-[520px] object-cover"
            style={{ objectPosition: "center 35%" }} // top-center; adjust % if needed
            loading="lazy"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        </Surface>
      </section>

      {/* Exhibitions */}
      <section className="mt-8 md:mt-10">
        <div className="mb-3">
          <SectionHeader title={S.headings.exhibitions} />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Solo */}
          <Surface className="p-6 md:p-8">
            <h3 className="text-lg font-semibold text-neutral-900">
              {S.headings.solo}
            </h3>
            <Divider />
            <ul className="mt-4 divide-y divide-neutral-200/70">
              {A(S.solo).map((it, i) => (
                <li
                  key={`s-${i}`}
                  className="py-3 flex gap-4 items-start group"
                >
                  <span className="w-14 shrink-0 text-neutral-500">
                    {it.year}
                  </span>
                  <span className="group-hover:text-neutral-900 transition-colors">
                    {it.text}
                  </span>
                </li>
              ))}
              {!A(S.solo).length && (
                <li className="py-3 text-neutral-500">{S.ui?.empty}</li>
              )}
            </ul>
          </Surface>

          {/* Group */}
          <Surface className="p-6 md:p-8">
            <h3 className="text-lg font-semibold text-neutral-900">
              {S.headings.group}
            </h3>
            <Divider />
            <ul className="mt-4 divide-y divide-neutral-200/70">
              {A(S.group).map((it, i) => (
                <li
                  key={`g-${i}`}
                  className="py-3 flex gap-4 items-start group"
                >
                  <span className="w-14 shrink-0 text-neutral-500">
                    {it.year}
                  </span>
                  <span className="group-hover:text-neutral-900 transition-colors">
                    {it.text}
                  </span>
                </li>
              ))}
              {!A(S.group).length && (
                <li className="py-3 text-neutral-500">{S.ui?.empty}</li>
              )}
            </ul>
          </Surface>
        </div>
      </section>
    </div>
  );
}
