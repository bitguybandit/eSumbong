import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { BARANGAY_NAME, initials } from '../lib/constants';
import Logo from './Logo';

/**
 * Uniform line-art navigation icons.
 *
 * Every glyph shares one 24x24 grid, one stroke width and `currentColor`, so the
 * sidebar reads as a single outline system — no emoji, no filled artwork.
 */
function Glyph({ children, className = 'h-5 w-5' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const IconHome = ({ className }) => (
  <Glyph className={className}>
    <path d="M4 10.5 12 4l8 6.5" />
    <path d="M6 9.75V19.5h12V9.75" />
    <path d="M10 19.5v-4.5h4v4.5" />
  </Glyph>
);

const IconReport = ({ className }) => (
  <Glyph className={className}>
    <path d="M16.8 5.2a2 2 0 0 1 2.8 2.8L9.4 18.2l-3.6.9.9-3.6z" />
    <path d="M15 7l2.8 2.8" />
  </Glyph>
);

const IconTrack = ({ className }) => (
  <Glyph className={className}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.4-4.4" />
  </Glyph>
);

const IconComplaints = ({ className }) => (
  <Glyph className={className}>
    <path d="M9.5 4.5h5v2.5h-5z" />
    <path d="M9.5 5.5H8A1.5 1.5 0 0 0 6.5 7v12A1.5 1.5 0 0 0 8 20.5h8a1.5 1.5 0 0 0 1.5-1.5V7A1.5 1.5 0 0 0 16 5.5h-1.5" />
    <path d="M9.5 11h5M9.5 14.5h5" />
  </Glyph>
);

const IconBell = ({ className }) => (
  <Glyph className={className}>
    <path d="M18 9a6 6 0 1 0-12 0c0 4.5-1.5 5.5-1.5 5.5h15S18 13.5 18 9Z" />
    <path d="M10.3 18.5a2 2 0 0 0 3.4 0" />
  </Glyph>
);

const IconSettings = ({ className }) => (
  <Glyph className={className}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 3.5v2.3M12 18.2v2.3M20.5 12h-2.3M5.8 12H3.5M18.01 5.99l-1.63 1.63M7.62 16.38l-1.63 1.63M18.01 18.01l-1.63-1.63M7.62 7.62 5.99 5.99" />
  </Glyph>
);

const IconPhone = ({ className }) => (
  <Glyph className={className}>
    <path d="M6.5 4.5h2.2l1.3 3.2-1.7 1.4a10.6 10.6 0 0 0 5.6 5.6l1.4-1.7 3.2 1.3v2.2a2 2 0 0 1-2 2A12.5 12.5 0 0 1 4.5 6.5a2 2 0 0 1 2-2Z" />
  </Glyph>
);

const NAV_ITEMS = [
  { to: '/resident', label: 'Home', icon: IconHome, end: true },
  { to: '/resident/report', label: 'Report', icon: IconReport },
  { to: '/resident/track', label: 'Track', icon: IconTrack },
  { to: '/resident/complaints', label: 'My Complaints', icon: IconComplaints, badge: true },
  { to: '/resident/notifications', label: 'Notifications', icon: IconBell, dot: true },
  { to: '/resident/settings', label: 'Settings', icon: IconSettings },
];

export default function ResidentSidebar() {
  const { profile } = useAuth();
  const [complaintCount, setComplaintCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    api
      .get('/complaints/mine')
      .then((res) => setComplaintCount(res.data.length))
      .catch(() => {});
    api
      .get('/notifications')
      .then((res) => setUnreadCount(res.data.filter((n) => !n.is_read).length))
      .catch(() => {});
  }, []);

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
      {/* Brand */}
      <div className="border-b border-slate-100 px-5 py-5">
        <Logo size="lg" />
        <div className="mt-1.5 text-xs text-slate-500">{BARANGAY_NAME}</div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Citizen Portal
        </div>
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `relative flex items-center gap-3 rounded-lg border px-3 py-2 text-base font-bold transition ${
                  isActive
                    ? 'border-blue-200 bg-blue-50 text-blue-700'
                    : 'border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-800'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Left-edge blue indicator pill */}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-blue-600"
                    />
                  )}
                  {/* Monochrome line-art glyph — inherits the item colour via currentColor */}
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && complaintCount > 0 && (
                    <span className="rounded-full border border-blue-200 px-2 py-0.5 text-xs font-semibold text-blue-700">
                      {complaintCount}
                    </span>
                  )}
                  {item.dot && unreadCount > 0 && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Emergency assistance */}
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3">
          <div className="flex items-center gap-2 text-red-600">
            <IconPhone className="h-4 w-4 shrink-0" />
            <span className="text-[11px] font-bold uppercase tracking-wide">Emergency Assistance</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">Tandoc Hotline:</div>
          <div className="text-sm font-semibold text-slate-900">(033) 337-0812</div>
        </div>
      </nav>

      {/* Profile */}
      <div className="flex items-center gap-3 border-t border-slate-100 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-sm font-bold text-blue-700">
          {initials(profile?.full_name)}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-slate-900">{profile?.full_name}</div>
          <div className="truncate text-xs text-slate-500">• Verified • Resident</div>
        </div>
      </div>
    </aside>
  );
}
