export default function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-ink-400">
      <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-hairline border-t-crimson-600" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
