import { useI18n } from "../i18n";
import SectionHeader from "../components/SectionHeader.jsx";

function List({ items }) {
  return (
    <ul className="timeline timeline-vertical">
      {items.map((it, idx) => (
        <li key={idx}>
          <div className="timeline-start">{it.year}</div>
          <div className="timeline-middle">
            <span className="badge badge-primary" />
          </div>
          <div className="timeline-end md:text-left">{it.text}</div>
          {idx !== items.length - 1 && <hr />}
        </li>
      ))}
    </ul>
  );
}

export default function Bio() {
  const { t } = useI18n();
  const S = t("bio.sections");

  return (
    <div className="container">
      <SectionHeader title={t("bio.title")} subtitle={S.aboutTitle} />

      {/* ABOUT */}
      <section className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4 leading-relaxed">
          {S.aboutParas.map((p, i) => (
            <p key={i} className="text-base">
              {p}
            </p>
          ))}
        </div>
        <aside className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="card-title">{t("bio.sections.exhibitions")}</h3>
            <p className="opacity-70 text-sm">
              {t("bio.sections.solo")} & {t("bio.sections.group")}
            </p>
          </div>
        </aside>
      </section>

      {/* EXHIBITIONS */}
      <section className="mt-10 grid md:grid-cols-2 gap-10">
        <div>
          <h3 className="text-xl font-semibold mb-3">
            {t("bio.sections.solo")}
          </h3>
          <List items={t("bio.soloList")} />
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-3">
            {t("bio.sections.group")}
          </h3>
          <List items={t("bio.groupList")} />
        </div>
      </section>
    </div>
  );
}
