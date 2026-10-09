import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { initials } from '../../lib/constants';

/**
 * Uniform line-art icon system — matches the ResidentSidebar glyphs.
 * 24x24 grid, stroke width 1.6, currentColor, no fill.
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

const IconEdit = ({ className }) => (
  <Glyph className={className}>
    <path d="M16.8 5.2a2 2 0 0 1 2.8 2.8L9.4 18.2l-3.6.9.9-3.6z" />
    <path d="M15 7l2.8 2.8" />
  </Glyph>
);

const IconLock = ({ className }) => (
  <Glyph className={className}>
    <rect x="5" y="11" width="14" height="9" rx="1.5" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </Glyph>
);

const IconBell = ({ className }) => (
  <Glyph className={className}>
    <path d="M18 9a6 6 0 1 0-12 0c0 4.5-1.5 5.5-1.5 5.5h15S18 13.5 18 9Z" />
    <path d="M10.3 18.5a2 2 0 0 0 3.4 0" />
  </Glyph>
);

const IconMail = ({ className }) => (
  <Glyph className={className}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="1.5" />
    <path d="m4.5 7 7.5 5.5L19.5 7" />
  </Glyph>
);

const IconChat = ({ className }) => (
  <Glyph className={className}>
    <path d="M20 12a7.5 7.5 0 0 1-10.9 6.8L4 20l1.2-4.1A7.5 7.5 0 1 1 20 12Z" />
  </Glyph>
);

const IconMapPin = ({ className }) => (
  <Glyph className={className}>
    <path d="M12 21s6.5-5.4 6.5-11a6.5 6.5 0 0 0-13 0C5.5 15.6 12 21 12 21Z" />
    <circle cx="12" cy="10" r="2.4" />
  </Glyph>
);

const IconHelp = ({ className }) => (
  <Glyph className={className}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M9.8 9.5a2.2 2.2 0 1 1 3.2 2c-.9.5-1 1.2-1 2" />
    <path d="M12 16.5h.01" />
  </Glyph>
);

const IconDocument = ({ className }) => (
  <Glyph className={className}>
    <path d="M7 3.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V5A1.5 1.5 0 0 1 7.5 3.5Z" />
    <path d="M14 3.5V7a1 1 0 0 0 1 1h3" />
    <path d="M9 12h6M9 15h6" />
  </Glyph>
);

const IconShield = ({ className }) => (
  <Glyph className={className}>
    <path d="M12 3.5 5.5 6v6c0 4.4 3 7.5 6.5 8.5 3.5-1 6.5-4.1 6.5-8.5V6Z" />
    <path d="m9.5 12 1.8 1.8L15 10.3" />
  </Glyph>
);

function Toggle({ on, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? 'bg-blue-600' : 'bg-slate-300'}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
          on ? 'left-[22px]' : 'left-0.5'
        }`}
      />
    </button>
  );
}

function Row({ icon: Icon, label, sub, to, right }) {
  const content = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-slate-900">{label}</span>
        {sub && <span className="block text-xs text-slate-500">{sub}</span>}
      </span>
      {right || <span className="text-slate-300">›</span>}
    </>
  );
  if (to) {
    return (
      <Link to={to} className="flex items-center gap-3 px-4 py-3 transition hover:bg-slate-50">
        {content}
      </Link>
    );
  }
  return <div className="flex items-center gap-3 px-4 py-3">{content}</div>;
}

function Section({ title, children }) {
  return (
    <div>
      <div className="px-1 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {title}
      </div>
      <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        {children}
      </div>
    </div>
  );
}

export default function Settings() {
  const { profile, session, signOut } = useAuth();
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState({ push: true, email: true, sms: true, location: true });

  const email = session?.user?.email || '';
  const set = (key) => (v) => setPrefs((p) => ({ ...p, [key]: v }));

  function handleSignOut() {
    signOut();
    navigate('/login');
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 lg:mx-0 lg:max-w-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/resident')}
          className="rounded-lg px-2 py-1 text-xl text-slate-600 hover:bg-slate-100"
          aria-label="Back"
        >
          ←
        </button>
        <h1 className="text-lg font-bold text-slate-900">Settings</h1>
        <Link
          to="/resident/notifications"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          aria-label="Notifications"
        >
          <IconBell className="h-5 w-5" />
        </Link>
      </div>

      {/* Profile */}
      <Link
        to="/resident/settings/profile"
        className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card transition hover:border-slate-300"
      >
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt="Avatar"
            className="h-14 w-14 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
            {initials(profile?.full_name)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate text-base font-semibold text-slate-900">{profile?.full_name}</div>
          <div className="truncate text-sm text-slate-500">{email}</div>
        </div>
        <span className="text-slate-300">›</span>
      </Link>

      <Section title="Account">
        <Row icon={IconEdit} label="Edit profile" to="/resident/settings/profile" />
        <Row icon={IconLock} label="Change password" to="/resident/settings/password" />
      </Section>

      <Section title="Notifications">
        <Row
          icon={IconBell}
          label="Push notifications"
          sub="Report status changes and alerts"
          right={<Toggle on={prefs.push} onChange={set('push')} />}
        />
        <Row
          icon={IconMail}
          label="Email alerts"
          sub="Weekly summaries and receipts"
          right={<Toggle on={prefs.email} onChange={set('email')} />}
        />
        <Row
          icon={IconChat}
          label="SMS updates"
          sub="Text alerts for urgent changes"
          right={<Toggle on={prefs.sms} onChange={set('sms')} />}
        />
      </Section>

      <Section title="Privacy & Location">
        <Row
          icon={IconMapPin}
          label="Location access"
          sub="Used to tag your reports"
          right={<Toggle on={prefs.location} onChange={set('location')} />}
        />
      </Section>

      <Section title="Support">
        <Row icon={IconHelp} label="Help center" to="/help" />
        <Row icon={IconMail} label="Contact us" />
        <Row icon={IconDocument} label="Terms & privacy" to="/terms" />
        <Row icon={IconShield} label="Privacy policy" to="/privacy" />
      </Section>

      <button
        onClick={handleSignOut}
        className="w-full rounded-2xl bg-red-600 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
      >
        Log out
      </button>
    </div>
  );
}