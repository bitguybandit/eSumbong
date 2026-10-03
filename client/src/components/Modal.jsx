import { useEffect } from 'react';

export default function Modal({ open, onClose, title, subtitle, children, width = 'max-w-lg' }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${width} max-h-[90vh] overflow-y-auto rounded-2xl border border-hairline bg-surface shadow-2xl`}>
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-hairline bg-surface px-6 py-4">
          <div>
            <h2 className="font-display text-lg font-bold tracking-[-0.2px] text-ink">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-ink-500">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-ink-400 hover:bg-surface-hover hover:text-ink"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
