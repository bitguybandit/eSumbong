export const STATUS_META = {
  submitted: { label: 'Submitted', badge: 'bg-amber-100 text-amber-800 ring-amber-600/20' },
  under_review: { label: 'Accepted', badge: 'bg-teal-100 text-teal-800 ring-teal-600/20' },
  referred: { label: 'In Progress', badge: 'bg-violet-100 text-violet-800 ring-violet-600/20' },
  resolved: { label: 'Resolved', badge: 'bg-emerald-100 text-emerald-800 ring-emerald-600/20' },
  closed: { label: 'Closed', badge: 'bg-slate-200 text-slate-700 ring-slate-500/20' },
  rejected: { label: 'Rejected', badge: 'bg-red-100 text-red-800 ring-red-600/20' },
};

export const ENTRY_TYPE_META = {
  submitted: { label: 'Submitted', icon: '📥' },
  accepted: { label: 'Accepted', icon: '✅' },
  rejected: { label: 'Rejected', icon: '⛔' },
  referred: { label: 'Referred', icon: '📨' },
  action: { label: 'Action', icon: '🛠️' },
  resolved: { label: 'Resolved', icon: '🏁' },
  closed: { label: 'Closed', icon: '🔒' },
};

export const STATUS_DOT = {
  submitted: 'bg-blue-500',
  under_review: 'bg-teal-500',
  referred: 'bg-violet-500',
  resolved: 'bg-emerald-500',
  closed: 'bg-slate-400',
  rejected: 'bg-red-500',
};

export const CATEGORY_ICONS = {
  'Pothole / Road Damage': '🚗',
  'Broken Streetlight': '💡',
  'Clogged Drainage': '💧',
  'Illegal Dumping / Garbage': '🗑️',
  'Noise Complaint': '🔊',
  'Stray Animal': '🐾',
};

/** Best-effort icon for any category name (covers future/renamed categories). */
export function categoryIcon(name) {
  if (!name) return '📦';
  if (CATEGORY_ICONS[name]) return CATEGORY_ICONS[name];
  const n = name.toLowerCase();
  if (n.includes('pothole') || n.includes('road')) return '🚗';
  if (n.includes('streetlight') || n.includes('light')) return '💡';
  if (n.includes('drain') || n.includes('flood')) return '💧';
  if (n.includes('dump') || n.includes('garbage') || n.includes('sanit')) return '🗑️';
  if (n.includes('noise')) return '🔊';
  if (n.includes('animal') || n.includes('stray')) return '🐾';
  return '📦';
}

export const REJECTION_REASONS = [
  'Duplicate complaint',
  'Insufficient information',
  'Outside barangay jurisdiction',
  'Invalid / unverifiable report',
  'Other (specify in notes)',
];

export const BARANGAY_NAME = 'Barangay San Jose, Iloilo City';

export function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function initials(name) {
  if (!name) return '—';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');
}
