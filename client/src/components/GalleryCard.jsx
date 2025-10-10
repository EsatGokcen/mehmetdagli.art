export default function GalleryCard({ item, imageUrl }) {
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
        {item.medium && <div className="text-sm opacity-70">{item.medium}</div>}
        {item.description && <p className="text-sm">{item.description}</p>}
        <div className="card-actions justify-between items-center pt-2">
          <span className="text-sm">
            {item.price != null ? `£${item.price}` : "—"}
          </span>
          <span className={`badge ${item.available ? "badge-success" : ""}`}>
            {item.available ? "Available" : "Not available"}
          </span>
        </div>
      </div>
    </div>
  );
}
