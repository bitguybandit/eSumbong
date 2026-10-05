import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { BARANGAY_NAME, initials } from '../lib/constants';
import Logo from './Logo';

/* ── Icons (1.8–2px stroke, matching the officer portal prototype) ── */
function IconDashboard({ className = 'h-[18px] w-[18px]' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function IconQueue({ className = 'h-[18px] w-[18px]' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function IconActionLog({ className = 'h-[18px] w-[18px]' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

function IconDispatch({ className = 'h-[18px] w-[18px]' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="2.4" />
      <path d="M8.1 8.1a5.5 5.5 0 0 0 0 7.8M15.9 15.9a5.5 5.5 0 0 0 0-7.8" />
      <path d="M5.2 5.2a9.6 9.6 0 0 0 0 13.6M18.8 18.8a9.6 9.6 0 0 0 0-13.6" />
    </svg>
  );
}

function IconSla({ className = 'h-[18px] w-[18px]' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 17.5a8.5 8.5 0 1 1 15 0" />
      <path d="m12 13.5 3.5-3.5" />
      <circle cx="12" cy="14.5" r="1.2" />
    </svg>
  );
}

function IconMap({ className = 'h-[18px] w-[18px]' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 4.5 3.5 6.75V19.5L9 17.25l6 2.25 5.5-2.25V4.5L15 6.75z" />
      <path d="M9 4.5v12.75M15 6.75V19.5" />
    </svg>
  );
}

function IconSettings({ className = 'h-[18px] w-[18px]' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6h.09A1.65 1.65 0 0 0 10.6 3V3a2 2 0 1 1 4 0v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9v.09A1.65 1.65 0 0 0 21 10.6h.09a2 2 0 1 1 0 4H21a1.65 1.65 0 0 0-1.6 1z" />
    </svg>
  );
}

function IconLogout({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

const MAIN = [
  { to: '/officer', label: 'Dashboard', Icon: IconDashboard, end: true },
  { to: '/officer/queue', label: 'Complaint Queue', Icon: IconQueue, badge: true },
  { to: '/officer/action-log', label: 'Action Log', Icon: IconActionLog },
  // No page exists for these yet — rendered as a non-navigating row (with a
  // "Soon" tag) so the sidebar can never link to a dead route.
  { label: 'Tanod Dispatch', Icon: IconDispatch, live: true, soon: true },
];

const ANALYTICS = [
  { label: 'SLA Performance', Icon: IconSla, soon: true },
  { label: 'Purok Heatmap', Icon: IconMap, soon: true },
];

const SYSTEM = [{ to: '/officer/settings', label: 'Settings', Icon: IconSettings }];

function LiveTag() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-200 bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.4px] text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/15 dark:text-emerald-300">
      <span className="h-1 w-1 rounded-full bg-emerald-600 dark:bg-emerald-300" />
      Live
    </span>
  );
}

function SoonTag() {
  return (
    <span className="shrink-0 rounded-full border border-hairline-strong px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.4px] text-ink-400 dark:border-white/15 dark:text-white/40">
      Soon
    </span>
  );
}

function NavItem({ item }) {
  const content = (
    <>
      <item.Icon className="h-[18px] w-[18px] shrink-0" />
      <span className="flex-1 truncate">{item.label}</span>
      {item.live && <LiveTag />}
      {item.badge && <PendingBadge />}
      {item.soon && <SoonTag />}
    </>
  );

  if (!item.to) {
    return (
      <span
        title={`${item.label} — coming soon`}
        className="flex cursor-not-allowed items-center gap-3 rounded-full py-2.5 pl-3.5 pr-3.5 text-[13px] font-medium text-ink-400 dark:text-white/30"
      >
        {content}
      </span>
    );
  }

  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        `relative flex items-center gap-3 py-2.5 text-[13px] transition ${
          isActive
            ? '-mr-3 rounded-l-full rounded-r-none bg-blue-600 pl-3.5 pr-4 font-semibold text-white shadow-[0_4px_12px_rgba(37,99,235,0.45)]'
            : 'rounded-full pl-3.5 pr-3.5 font-medium text-ink-500 hover:bg-surface-hover hover:text-ink dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white'
        }`
      }
    >
      {content}
    </NavLink>
  );
}

function PendingBadge() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    api
      .get('/officer/complaints')
      .then((res) => setCount(res.data.length))
      .catch(() => setCount(0));
  }, []);
  if (!count) return null;
  return (
    <span className="ml-auto rounded-full border border-amber-200 bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-400">
      {count}
    </span>
  );
}

export default function OfficerSidebar({ onNavigate }) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  function handleSignOut() {
    signOut();
    navigate('/login');
  }

  return (
    <aside className="flex h-full w-[268px] shrink-0 flex-col border-r border-hairline bg-surface text-ink dark:border-transparent dark:bg-shell-900 dark:text-white">
      {/* Brand */}
      <div className="border-b border-hairline px-5 pb-4 pt-5 dark:border-white/10">
        <Logo size="md" className="dark:brightness-0 dark:invert" />
        <span className="mt-1.5 block truncate text-[11px] text-ink-400 dark:text-white/45">{BARANGAY_NAME}</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[1.2px] text-ink-400 dark:text-white/40">
          Main Menu
        </p>
        <div className="space-y-0.5">
          {MAIN.map((item) => (
            <NavItem key={item.label} item={item} />
          ))}
        </div>

        <p className="px-3 pb-2 pt-6 text-[10px] font-semibold uppercase tracking-[1.2px] text-ink-400 dark:text-white/40">
          Analytics &amp; Reports
        </p>
        <div className="space-y-0.5">
          {ANALYTICS.map((item) => (
            <NavItem key={item.label} item={item} />
          ))}
        </div>

        <p className="px-3 pb-2 pt-6 text-[10px] font-semibold uppercase tracking-[1.2px] text-ink-400 dark:text-white/40">
          System
        </p>
        <div className="space-y-0.5">
          {SYSTEM.map((item) => (
            <NavItem key={item.to} item={item} />
          ))}
        </div>
      </nav>

      {/* Profile */}
      <div className="flex items-center gap-3 border-t border-hairline px-5 py-4 dark:border-white/10">
        <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full border border-hairline-strong bg-surface-soft text-sm font-semibold text-ink dark:border-white/15 dark:bg-white/10 dark:text-white">
          {initials(profile?.full_name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold text-ink dark:text-white">{profile?.full_name}</div>
          <div className="text-[11px] text-ink-400 dark:text-white/45">Barangay Officer</div>
        </div>
        <button
          onClick={handleSignOut}
          title="Sign out"
          aria-label="Sign out"
          className="flex rounded-md p-1.5 text-ink-400 transition hover:bg-surface-hover hover:text-ink dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <IconLogout />
        </button>
      </div>
    </aside>
  );
}
