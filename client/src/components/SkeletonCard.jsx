export default function SkeletonCard() {
  return (
    <div className="card bg-base-200 animate-pulse">
      <div className="h-40 bg-base-300 rounded-t-2xl" />
      <div className="card-body">
        <div className="h-4 bg-base-300 rounded w-2/3 mb-2" />
        <div className="h-3 bg-base-300 rounded w-1/2 mb-4" />
        <div className="h-8 bg-base-300 rounded w-24" />
      </div>
    </div>
  );
}
