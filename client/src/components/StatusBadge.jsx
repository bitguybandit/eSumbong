import { STATUS_META } from '../lib/constants';

export default function StatusBadge({ status, className = '' }) {
  const meta = STATUS_META[status] || { label: status, badge: 'bg-slate-100 text-slate-700 ring-slate-500/20' };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${meta.badge} ${className}`}
    >
      {meta.label}
    </span>
  );
}
