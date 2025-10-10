import { useEffect, useState } from "react";
import { API_BASE } from "../lib/api";
import SectionHeader from "../components/SectionHeader.jsx";
import GalleryCard from "../components/GalleryCard.jsx";

export default function Portfolio() {
  const [items, setItems] = useState([]);
  const [state, setState] = useState({ loading: true, error: "" });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/portfolio?offset=0&limit=100`,
          { credentials: "include" }
        );
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const data = await res.json();
        if (mounted) {
          setItems(data);
          setState({ loading: false, error: "" });
        }
      } catch (e) {
        if (mounted)
          setState({ loading: false, error: String(e.message || e) });
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="container">
      <SectionHeader
        title="Portfolio"
        subtitle="Selected works by Mehmet Dağlı"
      />

      {state.loading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card bg-base-200 animate-pulse">
              <div className="aspect-[4/3] bg-base-300" />
              <div className="card-body">
                <div className="h-4 bg-base-300 rounded w-2/3 mb-2" />
                <div className="h-3 bg-base-300 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!state.loading && state.error && (
        <div className="alert alert-error">{state.error}</div>
      )}

      {!state.loading &&
        !state.error &&
        (items.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((a) => (
              <GalleryCard
                key={a.id}
                item={a}
                imageUrl={
                  a.image_path ? `${API_BASE}/media/${a.image_path}` : null
                }
              />
            ))}
          </div>
        ) : (
          <div className="opacity-70">No artworks yet.</div>
        ))}
    </div>
  );
}
