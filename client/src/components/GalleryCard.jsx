import { useI18n } from "../i18n/index.jsx";

export default function GalleryCard({ item, imageUrl }) {
  const { t } = useI18n();
  const badge = item.available ? (
    <span className="badge badge-success">{t("common.available")}</span>
  ) : (
    <span className="badge">{t("common.notAvailable")}</span>
  );

  return (
    <div className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
      {imageUrl && (
        <figure className="aspect-[4/3] overflow-hidden">
          <img
            src={imageUrl}
            alt={item.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </figure>
      )}
      <div className="card-body">
        <h3 className="card-title text-lg">{item.title}</h3>
        <div className="text-sm opacity-70 space-x-2">
          {item.year ? <span>{item.year}</span> : null}
          {item.medium ? <span>• {item.medium}</span> : null}
        </div>
        {item.description && <p className="text-sm">{item.description}</p>}
        <div className="card-actions justify-between items-center pt-2">
          <span className="text-sm">
            {item.price != null ? String(item.price) : "—"}
          </span>
          {badge}
        </div>
      </div>
    </div>
  );
}
