export default function EmptyState({ title, message, children }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-hairline-strong bg-surface px-6 py-14 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface-soft text-2xl">
        📭
      </div>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {message && <p className="mt-1 max-w-sm text-sm text-ink-500">{message}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
