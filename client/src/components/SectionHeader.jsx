export default function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-4">
      <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900">
        {title}
      </h2>
      {subtitle ? <p className="mt-1 text-neutral-500">{subtitle}</p> : null}
    </div>
  );
}
