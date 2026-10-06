import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { initials } from '../../lib/constants';

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

function Row({ icon, label, sub, to, right }) {
  const content = (
    <>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-lg">
        {icon}
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
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Zm4 11a2 2 0 0 0 4 0" />
          </svg>
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
        <Row icon="✏️" label="Edit profile" to="/resident/settings/profile" />
        <Row icon="🔒" label="Change password" to="/resident/settings/password" />
      </Section>

      <Section title="Notifications">
        <Row
          icon="🔔"
          label="Push notifications"
          sub="Report status changes and alerts"
          right={<Toggle on={prefs.push} onChange={set('push')} />}
        />
        <Row
          icon="✉️"
          label="Email alerts"
          sub="Weekly summaries and receipts"
          right={<Toggle on={prefs.email} onChange={set('email')} />}
        />
        <Row
          icon="💬"
          label="SMS updates"
          sub="Text alerts for urgent changes"
          right={<Toggle on={prefs.sms} onChange={set('sms')} />}
        />
      </Section>

      <Section title="Privacy & Location">
        <Row
          icon="📍"
          label="Location access"
          sub="Used to tag your reports"
          right={<Toggle on={prefs.location} onChange={set('location')} />}
        />
      </Section>

      <Section title="Support">
        <Row icon="❓" label="Help center" to="/help" />
        <Row icon="✉️" label="Contact us" />
        <Row icon="📄" label="Terms & privacy" to="/terms" />
        <Row icon="🔏" label="Privacy policy" to="/privacy" />
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
