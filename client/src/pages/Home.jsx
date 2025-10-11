import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { API_BASE, fetchArtworks } from "../lib/api";
import SectionHeader from "../components/SectionHeader.jsx";
import GalleryCard from "../components/GalleryCard.jsx";
import SkeletonCard from "../components/SkeletonCard.jsx";
import ErrorAlert from "../components/ErrorAlert.jsx";
import { useI18n } from "../i18n/index.jsx";

export default function Home() {
  const { t } = useI18n();
  const [items, setItems] = useState([]);
  const [state, setState] = useState({ loading: true, error: "" });

  const load = useCallback(async () => {
    setState({ loading: true, error: "" });
    try {
      const data = await fetchArtworks({ offset: 0, limit: 6 });
      setItems(Array.isArray(data) ? data : []);
      setState({ loading: false, error: "" });
    } catch (e) {
      setState({ loading: false, error: e.message || "Failed to load" });
    }
  }, []);

  useEffect(() => {
    (async () => {
      await load();
    })();
  }, [load]);

  const resolveImage = (a) => {
    if (!a.image_path) return null;
    if (a.image_path.startsWith("/media")) return `${API_BASE}${a.image_path}`;
    return `${API_BASE}/media/${a.image_path}`;
    // Note: backend mounts /media at API root
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <SectionHeader title={t("home.title")} />
      <ErrorAlert message={state.error} onRetry={load} />

      {state.loading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : items.length ? (
        <>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((a) => (
              <GalleryCard key={a.id} item={a} imageUrl={resolveImage(a)} />
            ))}
          </div>
          <div className="mt-6">
            <Link to="/portfolio" className="btn btn-ghost">
              {t("home.seeFullPortfolio")}
            </Link>
          </div>
        </>
      ) : (
        <div className="opacity-70">{t("home.empty")}</div>
      )}
    </div>
  );
}
