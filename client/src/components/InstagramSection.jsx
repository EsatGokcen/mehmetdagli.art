import { useEffect, useState, useRef, useCallback } from "react";
import { fetchInstagram } from "../lib/api.js";
import ErrorAlert from "./ErrorAlert.jsx";

const cx = (...xs) => xs.filter(Boolean).join(" ");

export default function InstagramSection({ title = "Instagram" }) {
  const [items, setItems] = useState([]);
  const [state, setState] = useState({ loading: true, error: "" });
  const trackRef = useRef(null);

  const load = useCallback(async () => {
    setState({ loading: true, error: "" });
    try {
      const data = await fetchInstagram({ limit: 12 });
      setItems(Array.isArray(data) ? data : []);
      setState({ loading: false, error: "" });
    } catch (e) {
      setState({
        loading: false,
        error: e.message || "Failed to load Instagram",
      });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-semibold text-neutral-900">
          {title}
        </h2>
        <a
          href="https://www.instagram.com/"
          target="_blank"
          rel="noreferrer"
          className="btn btn-sm rounded-full"
        >
          Instagram
        </a>
      </div>
      <ErrorAlert message={state.error} onRetry={load} />

      {state.loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-xl bg-neutral-100 animate-pulse"
            />
          ))}
        </div>
      ) : items.length ? (
        <div className="relative">
          <div
            ref={trackRef}
            className={cx(
              "flex gap-3 overflow-x-auto scroll-smooth pb-2 px-1",
              "snap-x snap-mandatory"
            )}
          >
            {items.map((m) => (
              <div
                key={m.id}
                className="snap-start shrink-0 w-[68%] sm:w-[42%] md:w-[30%] lg:w-[18%]"
              >
                <InstaCard media={m} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="opacity-70">No Instagram posts.</div>
      )}
    </section>
  );
}

function InstaCard({ media }) {
  const isVideo = media.media_type === "VIDEO";
  const thumb = media.thumbnail_url || media.media_url;
  return (
    <div className="group relative rounded-xl overflow-hidden border border-neutral-200 bg-white shadow hover:shadow-lg transition-shadow">
      <div className="aspect-square bg-neutral-100">
        {isVideo ? (
          <video
            src={media.media_url}
            poster={thumb}
            className="w-full h-full object-cover"
            playsInline
            controls
          />
        ) : (
          <img
            src={media.media_url}
            alt={media.caption || "Instagram"}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        )}
      </div>

      {/* Overlay actions */}
      <a
        href={media.permalink}
        target="_blank"
        rel="noreferrer"
        className="absolute bottom-2 right-2 btn btn-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      >
        View on IG
      </a>
    </div>
  );
}
