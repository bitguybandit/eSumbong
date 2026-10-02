import { useAuth } from '../../context/AuthContext';
import { BARANGAY_NAME, initials } from '../../lib/constants';

export default function Settings() {
  const { profile } = useAuth();

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
    </div>
  );
}
