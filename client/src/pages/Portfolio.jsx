import { useEffect, useState, useCallback } from "react";
import { API_BASE, fetchArtworks } from "../lib/api";
import SectionHeader from "../components/SectionHeader.jsx";
import GalleryCard from "../components/GalleryCard.jsx";
import SkeletonCard from "../components/SkeletonCard.jsx";
import ErrorAlert from "../components/ErrorAlert.jsx";
import { useI18n } from "../i18n/index.jsx";

export default function Portfolio() {
  const { t } = useI18n();
  const [items, setItems] = useState([]);
  const [state, setState] = useState({ loading: true, error: "" });

  const load = useCallback(async () => {
    setState({ loading: true, error: "" });
    try {
      const data = await fetchArtworks({ offset: 0, limit: 100 });
      setItems(Array.isArray(data) ? data : []);
      setState({ loading: false, error: "" });
    } catch (e) {
      setState({ loading: false, error: e.message || "Failed to load" });
    }
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      await load();
    })();
    return () => {
      alive = false;
    };
  }, [load]);

  const resolveImage = (a) => {
    if (!a.image_path) return null;
    // Backend stores image_path like "/media/<file>" — handle both cases just in case
    if (a.image_path.startsWith("/media")) return `${API_BASE}${a.image_path}`;
    return `${API_BASE}/media/${a.image_path}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <SectionHeader title={t("portfolio.title")} />

      <ErrorAlert message={state.error} onRetry={load} />

      {state.loading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : items.length ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((a) => (
            <GalleryCard key={a.id} item={a} imageUrl={resolveImage(a)} />
          ))}
        </div>
      ) : (
        <div className="opacity-70">{t("portfolio.empty")}</div>
      )}
    </div>
  );
}
