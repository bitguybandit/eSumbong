import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

const relativeFormatter = new Intl.RelativeTimeFormat(undefined, { numeric: 'always' });

function relativeTime(iso) {
  if (!iso) return '';
  const diff = new Date(iso).getTime() - Date.now();
  const mins = Math.round(diff / 60000);
  if (Math.abs(mins) < 1) return 'just now';
  if (Math.abs(mins) < 60) return relativeFormatter.format(mins, 'minute');
  const hours = Math.round(diff / 3600000);
  if (Math.abs(hours) < 24) return relativeFormatter.format(hours, 'hour');
  const days = Math.round(diff / 86400000);
  if (Math.abs(days) < 7) return relativeFormatter.format(days, 'day');
  const weeks = Math.round(diff / 604800000);
  if (Math.abs(weeks) < 5) return relativeFormatter.format(weeks, 'week');
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function OfficerNotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const buttonRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    api
      .get('/notifications')
      .then((res) => setNotifications(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;
    function onPointerDown(e) {
      if (panelRef.current?.contains(e.target) || buttonRef.current?.contains(e.target)) return;
      setIsOpen(false);
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  async function handleNotificationClick(notification) {
    setIsOpen(false);

    if (!notification.is_read) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
      );
      try {
        await api.patch(`/notifications/${notification.id}/read`);
      } catch {
        /* keep the optimistic state; the list refreshes on next mount */
      }
    }

    if (notification.complaint_id) {
      navigate(`/officer/complaints/${notification.complaint_id}`);
    }
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        className="officer-icon-btn"
        title="Notifications"
        aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : 'Notifications'}
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <svg
          className="h-[18px] w-[18px]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Zm4 11a2 2 0 0 0 4 0"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          ref={panelRef}
          className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl"
          role="menu"
          aria-label="Notifications"
        >
          <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-200">Notifications</h2>
            {unreadCount > 0 && (
              <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[11px] font-semibold text-red-400">
                {unreadCount} new
              </span>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-slate-400">No new notifications.</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => handleNotificationClick(notification)}
                    className="flex w-full items-start gap-2.5 border-b border-slate-800 px-4 py-3 text-left transition last:border-b-0 hover:bg-slate-800"
                  >
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        notification.is_read ? 'bg-transparent' : 'bg-red-500'
                      }`}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block text-sm ${
                          notification.is_read ? 'text-slate-400' : 'font-medium text-slate-200'
                        }`}
                      >
                        {notification.message}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-slate-500">
                        {relativeTime(notification.created_at)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
