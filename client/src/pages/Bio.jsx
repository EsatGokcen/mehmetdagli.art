import SectionHeader from "../components/SectionHeader.jsx";
import { useI18n } from "../i18n/index.jsx";

function asArray(v) {
  return Array.isArray(v) ? v : [];
}

export default function Bio() {
  const { t } = useI18n();

  const sections = t("bio.sections") || {};
  const timeline = asArray(t("bio.timelineList"));
  const awards = asArray(t("bio.awardsList"));
  const solo = asArray(t("bio.soloList"));
  const group = asArray(t("bio.groupList"));

  return (
    <div className="container mx-auto px-4 py-8">
      <SectionHeader title={t("bio.title") || "Biography"} />

      <div className="grid gap-8 md:grid-cols-2">
        {/* Timeline */}
        <div>
          <h3 className="font-semibold mb-3">
            {sections.timeline || "Timeline"}
          </h3>
          {timeline.length ? (
            <ul className="timeline timeline-snap-icon max-md:timeline-compact timeline-vertical">
              {timeline.map((it, idx) => (
                <li key={idx}>
                  <div className="timeline-middle">
                    <div className="badge">{it.year}</div>
                  </div>
                  <div className="timeline-start md:text-end">
                    <div className="text-lg">{it.text}</div>
                  </div>
                  <hr />
                </li>
              ))}
            </ul>
          ) : (
            <div className="opacity-70">
              {t("common.empty") || "Nothing to show yet."}
            </div>
          )}
        </div>

        {/* Lists */}
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">
              {sections.awards || "Awards"}
            </h3>
            {awards.length ? (
              <ul className="list-disc ms-5">
                {awards.map((it, i) => (
                  <li key={i}>
                    <span className="opacity-70 me-2">{it.year}</span>
                    {it.text}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="opacity-70">{t("common.empty")}</div>
            )}
          </div>

          <div>
            <h3 className="font-semibold mb-2">
              {sections.solo || "Solo Exhibitions"}
            </h3>
            {solo.length ? (
              <ul className="list-disc ms-5">
                {solo.map((it, i) => (
                  <li key={i}>
                    <span className="opacity-70 me-2">{it.year}</span>
                    {it.text}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="opacity-70">{t("common.empty")}</div>
            )}
          </div>

          <div>
            <h3 className="font-semibold mb-2">
              {sections.group || "Group Exhibitions"}
            </h3>
            {group.length ? (
              <ul className="list-disc ms-5">
                {group.map((it, i) => (
                  <li key={i}>
                    <span className="opacity-70 me-2">{it.year}</span>
                    {it.text}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="opacity-70">{t("common.empty")}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
