import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { BARANGAY_NAME, initials } from '../../lib/constants';

const fieldClass =
  'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500';

const readOnlyFieldClass =
  'mt-1 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400';

const darkFieldClass =
  'mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-crimson-500 focus:outline-none focus:ring-2 focus:ring-crimson-500/30';

function Section({ title, description, children }) {
  return (
    <section className="officer-card p-6">
      <h2 className="font-display text-base font-bold tracking-[-0.2px] text-ink">{title}</h2>
      {description && <p className="mt-1 text-[13px] text-ink-500">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function ChangePasswordModal({ open, onClose }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (open) return undefined;
    setNewPassword('');
    setConfirmPassword('');
    setLoading(false);
    setError('');
    setSuccess('');
    return undefined;
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    function onKey(e) {
      if (e.key === 'Escape' && !loading) onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, loading, onClose]);

  if (!open) return null;

  async function handlePasswordChange(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;
      setNewPassword('');
      setConfirmPassword('');
      setSuccess('Password updated successfully.');
      setTimeout(onClose, 2000);
    } catch (err) {
      setError(err?.message || 'Could not update your password. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={() => !loading && onClose()}
      />
      <div
        className="relative z-10 w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-6 text-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-password-title"
      >
        <h2 id="change-password-title" className="font-display text-lg font-bold tracking-[-0.2px]">
          Change Password
        </h2>
        <p className="mt-1 text-[13px] text-slate-400">
          Enter a new password for your officer account.
        </p>

        <form className="mt-5 space-y-4" onSubmit={handlePasswordChange}>
          <div>
            <label htmlFor="new-password" className="text-xs font-medium uppercase tracking-wide text-slate-400">
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              required
              className={darkFieldClass}
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              required
              className={darkFieldClass}
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-900/50 bg-red-600/10 px-3 py-2 text-sm text-red-400" role="alert">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-lg border border-emerald-900/50 bg-emerald-600/10 px-3 py-2 text-sm text-emerald-400" role="status">
              {success}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-700 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="officer-btn-primary flex-1 disabled:opacity-60"
            >
              {loading ? 'Updating…' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Settings() {
  const { profile, session, signOut } = useAuth();
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('');
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [saved, setSaved] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setPhone(profile?.phone || '');
    setDesignation(profile?.position || '');
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

  async function handleLogout() {
    try {
      await signOut();
    } finally {
      navigate('/officer/login');
    }
  }

  return (
    <div className="space-y-7">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-[-0.5px] text-ink">Settings</h1>
        <p className="mt-1 text-[13px] text-ink-500">Account and system information.</p>
      </div>

      <div className="officer-card p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-base font-bold tracking-[-0.2px] text-ink">Account</h2>
          <Link
            to="/officer/settings/profile"
            className="officer-btn-secondary !px-3 !py-1.5 !text-xs"
          >
            Edit Profile
          </Link>
        </div>
        <Link to="/officer/settings/profile" className="flex items-center gap-4 rounded-lg transition hover:opacity-90">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="Profile photo"
              className="h-16 w-16 rounded-full border border-crimson-600/30 object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-crimson-600/30 bg-crimson-600 text-xl font-bold text-white">
              {initials(profile?.full_name)}
            </div>
          )}
          <div>
            <div className="text-lg font-semibold text-ink">{profile?.full_name}</div>
            <div className="text-sm text-ink-500">Barangay Officer</div>
          </div>
        </Link>

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
              placeholder="No email on file"
              className={readOnlyFieldClass}
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
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="officer-btn-secondary shrink-0 !px-3 !py-1.5 !text-xs"
            >
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

      <div className="flex flex-col items-end gap-3">
        {saved && (
          <span className="text-xs font-medium text-emerald-500">Changes saved.</span>
        )}
        <button type="button" className="officer-btn-primary" onClick={() => setSaved(true)}>
          Save Changes
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="m16 17 5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
          Logout
        </button>
      </div>

      <ChangePasswordModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
