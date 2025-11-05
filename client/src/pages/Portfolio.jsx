import { useEffect, useState, useCallback } from "react";
import { API_BASE, fetchArtworks } from "../lib/api";
import SectionHeader from "../components/SectionHeader.jsx";
import SkeletonCard from "../components/SkeletonCard.jsx";
import ErrorAlert from "../components/ErrorAlert.jsx";
import { useI18n } from "../i18n/index.jsx";

export default function Portfolio() {
  const { t } = useI18n();
  const [items, setItems] = useState([]);
  const [state, setState] = useState({ loading: true, error: "" });
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setState({ loading: true, error: "" });
    try {
      const data = await fetchArtworks({ offset: 0, limit: 200 }); // backend cap
      setItems(Array.isArray(data) ? data : []);
      setState({ loading: false, error: "" });
    } catch (e) {
      setState({ loading: false, error: e.message || "Failed to load" });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const resolveImage = (a) => {
    if (!a?.image_path) return null;
    return a.image_path.startsWith("/media")
      ? `${API_BASE}${a.image_path}`
      : `${API_BASE}/media/${a.image_path}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <SectionHeader title={t("portfolio.title") || "Portfolio"} />
      <ErrorAlert message={state.error} onRetry={load} />

      {state.loading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : items.length ? (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
          {items.map((a) => {
            const src = resolveImage(a);
            return (
              <button
                key={a.id}
                type="button"
                className="mb-4 block w-full text-left break-inside-avoid rounded-2xl overflow-hidden border border-neutral-200/70 shadow-[0_6px_20px_rgba(0,0,0,0.10)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.18)] transition-shadow bg-white"
                onClick={() => setSelected(a)}
              >
                {src ? (
                  <img
                    src={src}
                    alt={a.title || "artwork"}
                    className="w-full h-auto object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="aspect-video bg-neutral-100" />
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="opacity-70">{t("portfolio.empty")}</div>
      )}

      {/* Inline Modal */}
      {selected && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSelected(null)}
          />
          <div className="relative z-10 mx-auto mt-10 mb-10 max-w-5xl">
            <div className="grid md:grid-cols-2 gap-6 rounded-2xl bg-white p-4 md:p-6 shadow-[0_18px_48px_rgba(0,0,0,0.25)]">
              {/* Image */}
              <div className="flex items-center justify-center">
                <img
                  src={
                    selected.image_path?.startsWith("/media")
                      ? `${API_BASE}${selected.image_path}`
                      : `${API_BASE}/media/${selected.image_path || ""}`
                  }
                  alt={selected.title || "artwork"}
                  className="max-h-[70vh] w-auto object-contain rounded-lg"
                />
              </div>

              {/* Info — centered vertically & horizontally */}
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-2xl font-semibold text-neutral-900">
                    {selected.title || "Untitled"}
                  </h3>
                  {selected.medium ? (
                    <div className="mt-2 text-sm text-neutral-600">
                      {selected.medium}
                    </div>
                  ) : null}
                  {selected.price != null ? (
                    <div className="mt-2 text-sm text-neutral-600">
                      {new Intl.NumberFormat(undefined, {
                        style: "currency",
                        currency: "TRY",
                      }).format(Number(selected.price))}
                    </div>
                  ) : null}
                  <div className="mt-2">
                    <span className="badge badge-success">
                      {selected.available ? "Satışta" : "Satışta değil"}
                    </span>
                  </div>

                  {selected.description ? (
                    <p className="mt-4 text-sm text-neutral-700 max-w-prose mx-auto">
                      {selected.description}
                    </p>
                  ) : null}

                  <div className="mt-6 flex items-center justify-center gap-3">
                    <button className="btn btn-primary rounded-full">
                      Satın Al
                    </button>
                    <button
                      className="btn rounded-full"
                      onClick={() => setSelected(null)}
                    >
                      Kapat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
