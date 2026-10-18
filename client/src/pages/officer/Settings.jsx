import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BARANGAY_NAME, initials } from '../../lib/constants';

const fieldClass =
  'mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-crimson-500 focus:outline-none focus:ring-2 focus:ring-crimson-500/30';

function Section({ title, description, children }) {
  return (
    <section className="officer-card p-6">
      <h2 className="font-display text-base font-bold tracking-[-0.2px] text-ink">{title}</h2>
      {description && <p className="mt-1 text-[13px] text-ink-500">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function Settings() {
  const { profile, session } = useAuth();

  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('');
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setPhone(profile?.phone || '');
  }, [profile]);

  useEffect(() => {
    if (!saved) return undefined;
    const timer = setTimeout(() => setSaved(false), 2500);
    return () => clearTimeout(timer);
  }, [saved]);

  const email = session?.user?.email || profile?.email || '';
  const lastLogin = useMemo(
    () =>
      new Date().toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }),
    []
  );

  return (
    <div className="space-y-7">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-[-0.5px] text-ink">Settings</h1>
        <p className="mt-1 text-[13px] text-ink-500">Account and system information.</p>
      </div>

      <div className="officer-card p-6">
        <h2 className="mb-4 font-display text-base font-bold tracking-[-0.2px] text-ink">Account</h2>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-crimson-600/30 bg-crimson-600 text-xl font-bold text-white">
            {initials(profile?.full_name)}
          </div>
          <div>
            <div className="text-lg font-semibold text-ink">{profile?.full_name}</div>
            <div className="text-sm text-ink-500">Barangay Officer</div>
          </div>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-400">Full name</dt>
            <dd className="mt-1 text-sm text-ink">{profile?.full_name || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-400">Role</dt>
            <dd className="mt-1 text-sm capitalize text-ink">{profile?.role_type || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-400">Barangay</dt>
            <dd className="mt-1 text-sm text-ink">{BARANGAY_NAME}</dd>
          </div>
        </dl>
      </div>

      <Section
        title="Official Contact Information"
        description="How residents and other offices can reach you."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="officer-email" className="text-xs font-medium uppercase tracking-wide text-ink-400">
              Email Address
            </label>
            <input
              id="officer-email"
              type="email"
              value={email}
              readOnly
              disabled
              placeholder="No email on file"
              className="mt-1 w-full cursor-not-allowed rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-400"
            />
          </div>
          <div>
            <label htmlFor="officer-phone" className="text-xs font-medium uppercase tracking-wide text-ink-400">
              Phone Number
            </label>
            <input
              id="officer-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+63 9XX XXX XXXX"
              className={fieldClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="officer-designation" className="text-xs font-medium uppercase tracking-wide text-ink-400">
              Position / Designation
            </label>
            <input
              id="officer-designation"
              type="text"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              placeholder="e.g., Barangay Secretary"
              className={fieldClass}
            />
          </div>
        </div>
      </Section>

      <Section title="Security" description="Keep your account protected.">
        <div className="divide-y divide-slate-700/60">
          <div className="flex items-center justify-between gap-4 pb-4">
            <div>
              <p className="text-sm font-medium text-ink">Password</p>
              <p className="mt-0.5 text-xs text-ink-500">Use a strong, unique password for this account.</p>
            </div>
            <button type="button" className="officer-btn-secondary shrink-0 !px-3 !py-1.5 !text-xs">
              Change Password
            </button>
          </div>
          <div className="flex items-center justify-between gap-4 pt-4">
            <p className="text-sm font-medium text-ink">Last Login</p>
            <p className="text-sm text-ink-500">{lastLogin}</p>
          </div>
        </div>
      </Section>

      <Section title="System Preferences" description="Choose how the dashboard keeps you informed.">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-ink">In-App Notifications</p>
            <p className="mt-0.5 text-xs text-ink-500">
              Show the notification bell badge when new complaints arrive.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={inAppNotifications}
            aria-label="In-App Notifications"
            onClick={() => setInAppNotifications((on) => !on)}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition ${
              inAppNotifications
                ? 'border-crimson-500 bg-crimson-600'
                : 'border-slate-700 bg-slate-800'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white shadow transition ${
                inAppNotifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </Section>

      <div className="flex items-center justify-end gap-3">
        {saved && <span className="text-xs font-medium text-emerald-500">Changes saved.</span>}
        <button type="button" className="officer-btn-primary" onClick={() => setSaved(true)}>
          Save Changes
        </button>
      </div>
    </div>
  );
}
