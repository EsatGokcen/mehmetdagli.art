import { useEffect, useState } from "react";

export default function Portfolio() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/portfolio")
      .then((r) => r.json())
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Portfolio</h2>
      {!items ? (
        <span className="loading loading-dots loading-lg"></span>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <div className="card bg-base-100 shadow" key={p.id}>
              <figure className="aspect-square bg-base-200">
                {/* placeholder, swap with real image */}
                <span className="text-sm opacity-70 m-4">{p.title}</span>
              </figure>
              <div className="card-body">
                <h3 className="card-title">{p.title}</h3>
                <p className="opacity-80">
                  {p.medium} · {p.year}
                </p>
                <div className="card-actions justify-end">
                  <button className="btn btn-outline btn-sm">Enquire</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
