import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import OfficerSidebar from './OfficerSidebar';
import OfficerToaster from './OfficerToasts';
import ResidentSidebar from './ResidentSidebar';
import Logo from './Logo';
import api from '../lib/api';
import { BARANGAY_NAME, initials } from '../lib/constants';

const OFFICER_CRUMBS = {
  '/officer': 'Dashboard',
  '/officer/queue': 'Complaint Queue',
  '/officer/action-log': 'Action Log',
  '/officer/settings': 'Settings',
};

const THEME_KEY = 'officer-theme';

export function OfficerLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  // Officer portal colour scheme. Dark is the default look; the choice is
  // remembered per browser and applied as the `dark` class on the shell root,
  // which re-skins every officer page through the design tokens.
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* storage blocked — the toggle still applies for this session */
    }
  }, [theme]);

  const crumb = pathname.startsWith('/officer/complaints')
    ? 'Action Log / Complaint Detail'
    : OFFICER_CRUMBS[pathname] ?? 'Dashboard';

  function submitSearch(e) {
    e.preventDefault();
    const term = query.trim();
    navigate(term ? `/officer/queue?q=${encodeURIComponent(term)}` : '/officer/queue');
  }

  return (
    <div className={`flex h-screen overflow-hidden bg-canvas ${theme === 'dark' ? 'dark' : ''}`}>
      <OfficerSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-40 shrink-0 border-b border-hairline bg-canvas/85 px-8 pb-4 pt-4 backdrop-blur-xl">
          {/* Row 1 — breadcrumb + sync status */}
          <div className="flex items-center gap-3">
            <span className="truncate text-[11px] text-ink-400">
              {BARANGAY_NAME}
              <span className="mx-1.5 text-hairline-strong">/</span>
              <span className="font-medium text-ink-500">{crumb}</span>
            </span>
            <span className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.6px] text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
              Live Sync Active
            </span>
          </div>

          {/* Row 2 — hub title, search, theme toggle, quick icons */}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-lg font-bold tracking-[-0.3px] text-ink">
              Officer Incident Control Hub
            </h1>

            <div className="ml-auto flex w-full items-center gap-2 sm:w-auto">
              <form onSubmit={submitSearch} className="relative min-w-0 flex-1 sm:w-[300px] sm:flex-none">
                <IconTrack className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search tracking ID, resident, purok…"
                  aria-label="Search complaints"
                  className="h-[38px] w-full rounded-lg border border-hairline bg-surface pl-9 pr-3 text-[13px] text-ink placeholder:text-ink-400 focus:border-crimson-500 focus:outline-none focus:ring-2 focus:ring-crimson-500/20"
                />
              </form>

              {/* Light / dark switch */}
              <div
                role="group"
                aria-label="Color theme"
                className="inline-flex shrink-0 items-center gap-0.5 rounded-lg border border-hairline bg-surface p-0.5"
              >
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  aria-pressed={theme === 'light'}
                  title="Light mode"
                  className={`flex h-[34px] w-[34px] items-center justify-center rounded-md transition ${
                    theme === 'light'
                      ? 'bg-crimson-600 text-white shadow-sm'
                      : 'text-ink-400 hover:text-ink'
                  }`}
                >
                  <IconSun className="h-[17px] w-[17px]" />
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  aria-pressed={theme === 'dark'}
                  title="Dark mode"
                  className={`flex h-[34px] w-[34px] items-center justify-center rounded-md transition ${
                    theme === 'dark'
                      ? 'bg-crimson-600 text-white shadow-sm'
                      : 'text-ink-400 hover:text-ink'
                  }`}
                >
                  <IconMoon className="h-[17px] w-[17px]" />
                </button>
              </div>

              <button type="button" className="officer-icon-btn" title="Notifications" aria-label="Notifications">
                <IconBell className="h-[18px] w-[18px]" />
                <span className="officer-icon-btn-dot" />
              </button>
              <Link to="/officer/settings" className="officer-icon-btn" title="Profile" aria-label="Profile">
                <IconUser className="h-[18px] w-[18px]" />
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-8 py-7">
            <Outlet />
          </div>
        </main>
      </div>

      <OfficerToaster />
    </div>
  );
}

// --- Icons (bottom navigation) ---
function IconHome({ className = 'h-6 w-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5 12 3l9 7.5M5 9.25V21h14V9.25M9.5 21v-6h5v6" />
    </svg>
  );
}
function IconTrack({ className = 'h-6 w-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" d="m21 21-4.35-4.35" />
    </svg>
  );
}
function IconBell({ className = 'h-6 w-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Zm4 11a2 2 0 0 0 4 0" />
    </svg>
  );
}
function IconSun({ className = 'h-[17px] w-[17px]' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}
function IconMoon({ className = 'h-[17px] w-[17px]' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  );
}
function IconUser({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function IconSettings({ className = 'h-6 w-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  );
}

const MOBILE_TABS = [
  { to: '/resident', label: 'Home', icon: IconHome, end: true },
  { to: '/resident/track', label: 'Track', icon: IconTrack },
  { to: '/resident/notifications', label: 'Notifications', icon: IconBell, dot: true },
  { to: '/resident/settings', label: 'Settings', icon: IconSettings },
];

export function ResidentLayout() {
  const { profile } = useAuth();
  const location = useLocation();
  const showFab = location.pathname === '/resident';
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    api
      .get('/notifications')
      .then((res) => setUnreadCount(res.data.filter((n) => !n.is_read).length))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      {/* Desktop sidebar */}
      <ResidentSidebar />

      {/* Main column */}
      <div className="min-w-0 flex-1">
        {/* Top header (mobile only) */}
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white md:hidden">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
            <Link to="/resident" className="inline-flex items-center">
              <Logo size="sm" />
            </Link>

            <div className="flex items-center gap-2">
              {/* Notification bell removed on mobile — Notifications now lives in
                  the bottom tab bar. */}
              <Link
                to="/resident/settings"
                title="Settings"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white"
              >
                {initials(profile?.full_name)}
              </Link>
            </div>
          </div>
        </header>

        {/*
          Main content.
          Mobile (<768px) is untouched: mx-auto / max-w-3xl / px-4.
          From md: up we release the max-width cap and mx-auto so the
          column spans the full viewport beside the sidebar, with padding
          that scales px-8 -> lg:px-12.
        */}
        <main className="mx-auto w-full max-w-3xl px-4 pb-36 pt-4 md:mx-0 md:max-w-none md:px-8 md:pb-12 md:pt-8 lg:px-12">
          <Outlet />

          {/* Footer (desktop) */}
          <footer className="mt-10 hidden border-t border-slate-200 py-6 text-xs text-slate-400 md:block">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>eSumbong Civic Portal • Government of Barangay San Jose, Iloilo City</span>
              <span className="flex flex-wrap gap-4">
                <span className="cursor-pointer hover:text-slate-600">Citizen Charter</span>
                <Link to="/privacy" className="cursor-pointer hover:text-slate-600">
                  Privacy Notice
                </Link>
                <Link to="/terms" className="cursor-pointer hover:text-slate-600">
                  Terms of Service
                </Link>
                <Link to="/help" className="cursor-pointer hover:text-slate-600">
                  Help &amp; FAQ
                </Link>
              </span>
            </div>
          </footer>
        </main>
      </div>

      {/* Extended FAB — only on the home page, above the bottom nav */}
      {showFab && (
        <div className="fixed inset-x-0 bottom-[72px] z-40 flex justify-center px-4 md:hidden">
          <Link
            to="/resident/report"
            className="flex w-full max-w-md items-center justify-center gap-2 rounded-full bg-blue-700 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-800 active:scale-[0.98]"
          >
            <span className="text-xl leading-none">+</span>
            File a New Report
          </Link>
        </div>
      )}

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="grid grid-cols-4">
          {MOBILE_TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `relative flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition ${
                  isActive ? 'text-blue-600' : 'text-slate-500'
                }`
              }
            >
              <span className="relative">
                <tab.icon className="h-6 w-6" />
                {tab.dot && unreadCount > 0 && (
                  <span className="absolute -right-1 -top-0.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                )}
              </span>
              {tab.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
