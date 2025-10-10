import { LANGS, useI18n } from "../i18n/index.jsx";

const labels = { tr: "TR", en: "EN", it: "IT" };

export default function LanguageSwitch() {
  const { lang, setLang } = useI18n();

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost">
        {labels[lang] || lang}
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content menu bg-base-100 rounded-box z-[1] w-28 p-2 shadow"
      >
        {LANGS.map((code) => (
          <li key={code}>
            <button
              className={code === lang ? "active" : ""}
              onClick={() => setLang(code)}
            >
              {labels[code]}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
