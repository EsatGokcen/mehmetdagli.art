import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE } from "../lib/api";
import SectionHeader from "../components/SectionHeader.jsx";
import GalleryCard from "../components/GalleryCard.jsx";

export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // fetch 6 most recent artworks
  useEffect(() => {
    let on = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/portfolio?offset=0&limit=6`, {
          credentials: "include",
        });
        const data = res.ok ? await res.json() : [];
        if (on) setItems(data);
      } finally {
        if (on) setLoading(false);
      }
    })();
    return () => {
      on = false;
    };
  }, []);

  return (
    <div className="container">
      {/* HERO */}
      <section className="py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight tracking-tight">
              Mehmet Dağlı — <span className="text-primary">Art</span>
            </h1>
            <p className="mt-4 text-base md:text-lg opacity-80 max-w-prose">
              Modern visuals with texture, light, and quiet emotion. Explore
              recent works, see upcoming exhibitions, or get in touch for
              commissions.
            </p>
            <div className="mt-6 flex gap-3">
              <Link className="btn btn-primary" to="/portfolio">
                View Portfolio
              </Link>
              <Link className="btn" to="/contact">
                Contact
              </Link>
            </div>
          </div>

          {/* Optional hero image — show the first artwork if present */}
          <div className="rounded-2xl overflow-hidden shadow bg-base-200 aspect-[4/3]">
            {items[0]?.image_path ? (
              <img
                src={`${API_BASE}/media/${items[0].image_path}`}
                alt={items[0].title}
                className="w-full h-full object-cover"
                loading="eager"
              />
            ) : (
              <div className="w-full h-full grid place-items-center opacity-60">
                <span className="text-sm">Artwork image will appear here</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="py-6 md:py-10">
        <SectionHeader
          title="Featured works"
          subtitle="A quick look at recent pieces"
        />
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card bg-base-200 animate-pulse">
                <div className="aspect-[4/3] bg-base-300" />
                <div className="card-body">
                  <div className="h-4 bg-base-300 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-base-300 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
          <div className="opacity-70">
            No artworks yet. Add some from the admin dashboard.
          </div>
        )}
        <div className="mt-6">
          <Link to="/portfolio" className="btn btn-ghost">
            See full portfolio →
          </Link>
        </div>
      </section>
    </div>
  );
}
