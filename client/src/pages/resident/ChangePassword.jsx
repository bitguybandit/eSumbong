import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

function PasswordField({ label, placeholder, value, onChange, show, onToggleShow }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          className="input pr-16"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-blue-600"
        >
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
    </div>
  );
}

export default function ChangePassword() {
  const { session } = useAuth();
  const navigate = useNavigate();

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const hasLength = next.length >= 8;
  const hasNumber = /\d/.test(next);
  const hasSpecial = /[^A-Za-z0-9]/.test(next);
  const matches = next.length > 0 && next === confirm;

  const reqs = [
    { label: 'At least 8 characters', ok: hasLength },
    { label: 'One number', ok: hasNumber },
    { label: 'One special character', ok: hasSpecial },
    { label: 'Passwords match', ok: matches },
  ];

  const toggle = (key) => setShow((s) => ({ ...s, [key]: !s[key] }));

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!reqs.every((r) => r.ok)) {
      setError('Please meet all password requirements.');
      return;
    }
    setBusy(true);
    try {
      const email = session?.user?.email;
      // Verify the current password by re-authenticating.
      const { error: reauthErr } = await supabase.auth.signInWithPassword({ email, password: current });
      if (reauthErr) {
        setError('Current password is incorrect.');
        setBusy(false);
        return;
      }
      const { error: updateErr } = await supabase.auth.updateUser({ password: next });
      if (updateErr) {
        setError(updateErr.message);
        setBusy(false);
        return;
      }
      setSuccess(true);
      setTimeout(() => navigate('/resident/settings'), 1200);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 lg:mx-0 lg:max-w-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/resident/settings')}
          className="rounded-lg px-2 py-1 text-xl text-slate-600 hover:bg-slate-100"
          aria-label="Back"
        >
          ←
        </button>
        <h1 className="text-lg font-bold text-slate-900">Change password</h1>
        <span className="w-9" />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Password changed ✓
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <PasswordField
          label="Current password"
          placeholder="Enter your current password"
          value={current}
          onChange={setCurrent}
          show={show.current}
          onToggleShow={() => toggle('current')}
        />
        <PasswordField
          label="New password"
          placeholder="Enter a new password"
          value={next}
          onChange={setNext}
          show={show.next}
          onToggleShow={() => toggle('next')}
        />
        <PasswordField
          label="Confirm password"
          placeholder="Re-enter your new password"
          value={confirm}
          onChange={setConfirm}
          show={show.confirm}
          onToggleShow={() => toggle('confirm')}
        />

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-2 text-sm font-semibold text-slate-700">Password must include</div>
          <ul className="space-y-1.5">
            {reqs.map((r) => (
              <li key={r.label} className="flex items-center gap-2 text-sm">
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] ${
                    r.ok
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-slate-300 bg-white text-transparent'
                  }`}
                >
                  ✓
                </span>
                <span className={r.ok ? 'text-slate-700' : 'text-slate-500'}>{r.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy ? 'Updating…' : 'Confirm'}
        </button>
      </form>
    </div>
  );
}
