import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import { formatDateTime } from '../../lib/constants';

function ChevronRight() {
  return (
    <svg
      className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-slate-500"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
    </svg>
  );
}

/** Officer's own wording when the API exposes it, otherwise the composed message. */
function notificationText(n) {
  return n.action_text ?? n.remarks ?? n.message;
}

/** Where a notification should take the resident: the complaint it belongs to. */
function destinationFor(n) {
  if (n.complaint_id) return `/resident/complaints/${n.complaint_id}`;
  if (n.complaint?.tracking_id) return `/resident/track?id=${n.complaint.tracking_id}`;
  return '/resident/complaints';
}

export default function Notifications() {
  const [notifications, setNotifications] = useState(null);

  function load() {
    api.get('/notifications').then((res) => setNotifications(res.data)).catch(() => setNotifications([]));
  }

  useEffect(load, []);

  async function markRead(n) {
    if (n.is_read) return;
    await api.patch(`/notifications/${n.id}/read`).catch(() => {});
    setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
  }

  if (!notifications) return <Spinner label="Loading notifications…" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
        <p className="text-sm text-slate-500">Status updates about your complaints.</p>
      </div>

      {notifications.length === 0 ? (
        <EmptyState title="No notifications" message="You'll see status updates here when your complaints are processed." />
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li key={n.id}>
              <Link
                to={destinationFor(n)}
                onClick={() => markRead(n)}
                className={`card group flex w-full cursor-pointer items-start gap-3 p-4 text-left transition-colors hover:bg-slate-50 ${
                  n.is_read ? 'opacity-70' : ''
                }`}
              >
                <span
                  className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                    n.is_read ? 'bg-slate-300' : 'bg-blue-600'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-slate-800">{notificationText(n)}</div>
                  <div className="mt-0.5 text-xs text-slate-400">
                    {n.complaint ? `Tracking: ${n.complaint.tracking_id} · ` : ''}
                    {formatDateTime(n.created_at)}
                  </div>
                </div>
                <ChevronRight />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
