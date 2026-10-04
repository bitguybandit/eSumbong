import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { BARANGAY_NAME, STATUS_DOT, STATUS_META, categoryIcon, timeAgo } from '../../lib/constants';

// --- Mobile-only styling (desktop keeps using the shared StatusBadge / STATUS_META) ---
const MOBILE_STATUS = {
  submitted: { label: 'Submitted', badge: 'bg-blue-100 text-blue-700' },
  under_review: { label: 'Accepted', badge: 'bg-teal-100 text-teal-700' },
  referred: { label: 'In Progress', badge: 'bg-emerald-100 text-emerald-700' },
  resolved: { label: 'Resolved', badge: 'bg-emerald-100 text-emerald-800' },
  closed: { label: 'Closed', badge: 'bg-slate-200 text-slate-700' },
  rejected: { label: 'Rejected', badge: 'bg-red-100 text-red-700' },
};

function mobileCategoryIconClass(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('streetlight') || n.includes('light')) return 'bg-amber-100 text-amber-600';
  if (n.includes('animal') || n.includes('stray')) return 'bg-blue-100 text-blue-600';
  if (n.includes('sanit') || n.includes('dump') || n.includes('garbage') || n.includes('drain') || n.includes('flood'))
    return 'bg-emerald-100 text-emerald-600';
  if (n.includes('noise')) return 'bg-rose-100 text-rose-600';
  if (n.includes('pothole') || n.includes('road')) return 'bg-orange-100 text-orange-600';
  return 'bg-slate-100 text-slate-600';
}

function ChevronRight({ className = 'h-5 w-5 shrink-0 text-slate-300' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
    </svg>
  );
}

function SearchIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" d="m21 21-4.35-4.35" />
    </svg>
  );
}

/**
 * Drops the "Action taken on your complaint <ticket>: " boilerplate the API
 * wraps around an officer's manual note, so their own words lead the feed item
 * (the ticket is already shown on the meta row below). No-op for other
 * notification types.
 */
function officerNote(message) {
  return (message || '').replace(/^Action taken on your complaint\s+\S+:\s*/i, '');
}

/**
 * Desktop-only "Action Taken" feed. Replaces the removed Office Schedule card
 * and fills the horizontal space freed up by the fluid full-width layout.
 */
function ActionTakenFeed({ items }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-lg">
            🔔
          </span>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Action Taken</h2>
            <p className="text-xs text-slate-500">Recent updates on your reports</p>
          </div>
        </div>
        <Link
          to="/resident/notifications"
          className="shrink-0 text-xs font-semibold text-blue-600 hover:underline"
        >
          View all →
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-slate-500">
          No actions taken yet. Status changes will appear here once an officer processes your report.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.map((item) => (
            <li key={item.id} className="flex items-start gap-3 px-5 py-3.5">
              {item.kind === 'action' ? (
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[11px]">
                  🔧
                </span>
              ) : (
                <span
                  className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                    STATUS_DOT[item.status] || 'bg-slate-400'
                  }`}
                />
              )}
              <div className="min-w-0 flex-1">
                {item.kind === 'action' && (
                  <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-wide text-amber-600">
                    Officer Update
                  </span>
                )}
                <p className="line-clamp-2 break-words text-sm text-slate-800">{item.message}</p>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
                  {item.trackingId && <span>Ticket: {item.trackingId}</span>}
                  {item.status && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-600">
                      {STATUS_META[item.status]?.label || item.status}
                    </span>
                  )}
                  <span>{timeAgo(item.at)}</span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function ResidentDashboard() {
  const { profile } = useAuth();
  const [complaints, setComplaints] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [error, setError] = useState('');
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    api
      .get('/complaints/mine')
      .then((res) => setComplaints(res.data))
      .catch((err) => setError(err.message));

    // Officer notifications ("Action Taken"). Non-blocking: a failure just
    // leaves the feed to the status changes derived from the complaints below.
    api
      .get('/notifications')
      .then((res) => setUpdates(Array.isArray(res.data) ? res.data : []))
      .catch(() => setUpdates([]));
  }, []);

  if (error) {
    return <EmptyState title="Couldn't load your complaints" message={error} />;
  }
  if (!complaints) return <Spinner label="Loading…" />;

  const firstName = profile?.full_name?.split(' ')[0] || 'there';
  const residentId = profile?.id
    ? `#BSI-2024-${String(parseInt(profile.id.replace(/-/g, '').slice(0, 8), 16) % 10000).padStart(4, '0')}`
    : '#BSI-2024-0000';

  // "Action Taken" feed items: real officer notifications (which carry the
  // exact text the officer typed in "Add Action") first, then plain status
  // changes derived from the resident's own complaints. Every notification is
  // kept — a complaint can receive several officer actions, so only the derived
  // status rows are skipped when a notification already covers that
  // same ticket + status.
  const notified = new Set(
    updates.map((n) => `${n.complaint?.tracking_id}-${n.complaint?.status}`)
  );

  const activity = [
    ...updates.map((n) => ({
      id: `n-${n.id}`,
      kind: 'action',
      // Prefer the officer's raw note when the API exposes it.
      message: officerNote(n.action_text ?? n.remarks ?? n.message),
      status: n.complaint?.status || null,
      trackingId: n.complaint?.tracking_id || null,
      at: n.created_at,
    })),
    ...complaints
      .filter((c) => c.status !== 'submitted' && !notified.has(`${c.tracking_id}-${c.status}`))
      .map((c) => ({
        id: `c-${c.id}`,
        kind: 'status',
        message: `Your complaint ${c.tracking_id} is now ${STATUS_META[c.status]?.label || c.status}.`,
        status: c.status,
        trackingId: c.tracking_id,
        at: c.updated_at || c.created_at,
      })),
  ]
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 3);

  return (
    <>
      {/* ===== Mobile layout (only) ===== */}
      <div className="md:hidden">
        {/* Greeting */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-slate-900">Good day, {firstName}! 👋</h1>
          <p className="mt-0.5 text-xs text-slate-500">
            {BARANGAY_NAME} • Resident ID: {residentId}
          </p>
        </div>

        {/* Track by ID */}
        <Link
          to="/resident/track"
          className="mb-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card transition active:scale-[0.99]"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <SearchIcon />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-slate-900">Trackss by ID</span>
            <span className="block text-xs text-slate-500">Check complaint status and resolution updates</span>
          </span>
          <ChevronRight />
        </Link>

        {/* Recent complaints */}
        <section className="mb-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">Your Recent Complaints</h2>
            {complaints.length > 0 && (
              <Link to="/resident/complaints" className="text-xs font-semibold text-blue-600">
                View all →
              </Link>
            )}
          </div>

          {complaints.length === 0 ? (
            <EmptyState
              title="No complaints yet"
              message="File your first report to help keep your barangay safe and clean."
            >
              <Link to="/resident/report" className="btn-primary">
                Report an issue
              </Link>
            </EmptyState>
          ) : (
            <ul className="space-y-2.5">
              {complaints.slice(0, 5).map((c) => (
                <li key={c.id}>
                  <Link
                    to={`/resident/complaints/${c.id}`}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card transition active:scale-[0.99]"
                  >
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${mobileCategoryIconClass(c.category?.name)}`}
                    >
                      {categoryIcon(c.category?.name)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-slate-900">{c.description}</span>
                      <span className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                        <span className="text-slate-500">{c.category?.name || 'Uncategorized'}</span>
                        <span className="text-slate-300">•</span>
                        <span
                          className={`rounded-full px-2 py-0.5 font-semibold ${
                            MOBILE_STATUS[c.status]?.badge || 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {MOBILE_STATUS[c.status]?.label || c.status}
                        </span>
                        <span className="text-slate-400">{timeAgo(c.created_at)}</span>
                      </span>
                      <span className="mt-1 block text-xs text-slate-400">Ticket: {c.tracking_id}</span>
                    </span>
                    <ChevronRight />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Mediation banner */}
        {showBanner && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <svg
              className="mt-0.5 h-4 w-4 shrink-0 text-blue-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="12" cy="12" r="9" />
              <path strokeLinecap="round" d="M12 11v5M12 8v.01" />
            </svg>
            <p className="flex-1 text-xs leading-relaxed text-blue-900">
              Need immediate mediation? The Lupon Tagapamayapa office is open Mon–Fri, 8:00 AM – 5:00 PM.
            </p>
            <button
              onClick={() => setShowBanner(false)}
              className="shrink-0 text-blue-400 transition hover:text-blue-600"
              aria-label="Dismiss"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* ===== Desktop layout (mobile stays exactly as above) ===== */}
      <div className="hidden space-y-6 md:block">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Good day, {firstName}! 👋</h1>
          <p className="text-sm text-slate-500">
            {BARANGAY_NAME} • Resident ID: {residentId}
          </p>
        </div>

        {/* Top section — action cards span the full width */}
        <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-2">
        <Link className="group relative flex items-center gap-4 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-5 shadow-lg shadow-blue-600/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-600/30 active:scale-[0.98] overflow-hidden" to="/resident/report">
          {/* Subtle glass icon container */}
          <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 text-2xl shadow-inner transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
            📄
          </span>
          
          <span className="relative min-w-0">
            <span className="block text-base font-semibold text-white tracking-wide">
              New Complaint
            </span>
            <span className="block text-sm text-blue-100/90 transition-opacity duration-300 group-hover:text-white">
              Report an issue to barangay officials
            </span>
          </span>
        </Link>

        <Link
          to="/resident/track"
          className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:scale-[0.98]"
        >
          {/* Icon container */}
          <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-inner transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
            🔍
          </span>

          <span className="relative min-w-0">
            <span className="block text-base font-semibold tracking-wide text-slate-900">
              Track by ID
            </span>
            <span className="block text-sm text-slate-500">
              Check complaint status and resolution updates
            </span>
          </span>
        </Link>
      </div>

      {/* Bottom section — Recent Complaints (2/3) beside Action Taken (1/3) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
      <section className="lg:col-span-2">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">Your Recent Complaints</h2>
          {complaints.length > 0 && (
            <Link to="/resident/complaints" className="text-sm font-medium text-blue-600 hover:underline">
              View all →
            </Link>
          )}
        </div>

        {complaints.length === 0 ? (
          <EmptyState
            title="No complaints yet"
            message="File your first report to help keep your barangay safe and clean."
          >
            <Link to="/resident/report" className="btn-primary">
              Report an issue
            </Link>
          </EmptyState>
        ) : (
          <ul className="space-y-2.5">
            {complaints.slice(0, 5).map((c) => (
              <li key={c.id}>
                <Link
                  to={`/resident/complaints/${c.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card transition hover:border-slate-300"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xl">
                    {categoryIcon(c.category?.name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-900">{c.description}</span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-slate-500">
                      <span>{c.category?.name || 'Uncategorized'}</span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <span className={`h-2 w-2 rounded-full ${STATUS_DOT[c.status] || 'bg-slate-400'}`} />
                        {STATUS_META[c.status]?.label}
                      </span>
                      <span>•</span>
                      <span>{timeAgo(c.created_at)}</span>
                      <span>•</span>
                      <span>Ticket: {c.tracking_id}</span>
                    </span>
                  </span>
                  <span className="text-slate-300">›</span>
                </Link>
              </li>
            ))}
          </ul>
        )}

      </section>

      <div className="lg:col-span-1">
        <ActionTakenFeed items={activity} />
      </div>
      </div>
      </div>
    </>
  );
}
