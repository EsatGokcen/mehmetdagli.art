import { formatDateISO } from "../lib/date";

export default function EventItem({ event }) {
  const imgs = Array.isArray(event.images) ? event.images : [];

  return (
    <div className="card bg-base-100 shadow-sm">
      {imgs.length > 0 && (
        <div className="w-full overflow-x-auto">
          <div className="flex gap-2 p-2">
            {imgs.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={event.title || "Exhibition image"}
                className="h-40 w-auto rounded-lg object-cover flex-shrink-0"
                loading="lazy"
                decoding="async"
              />
            ))}
          </div>
        </div>
      )}

      <div className="card-body">
        <div className="flex flex-wrap items-baseline gap-x-3">
          <h3 className="card-title text-lg">{event.title}</h3>
          <span className="opacity-70 text-sm">{event.location || "—"}</span>
        </div>
        <div className="text-sm">
          {formatDateISO(event.start_date)}
          {event.end_date ? ` → ${formatDateISO(event.end_date)}` : ""}
        </div>
        {event.details && <p className="text-sm mt-2">{event.details}</p>}
      </div>
    </div>
  );
}
