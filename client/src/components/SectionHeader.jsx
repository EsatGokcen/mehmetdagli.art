export default function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
        {title}
      </h1>
      {subtitle && <p className="opacity-70 mt-2">{subtitle}</p>}
    </div>
  );
}
