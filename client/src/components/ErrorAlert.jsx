export default function ErrorAlert({ message, onRetry }) {
  if (!message) return null;
  return (
    <div role="alert" className="alert alert-error">
      <span>{message}</span>
      {onRetry && (
        <button className="btn btn-sm" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
