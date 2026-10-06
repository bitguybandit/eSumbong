import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { initials } from '../../lib/constants';

export default function EditProfile() {
  const { profile, session, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    first_name: profile?.first_name || '',
    middle_name: profile?.middle_name || '',
    last_name: profile?.last_name || '',
    phone: profile?.phone || '',
  });
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const email = session?.user?.email || '';

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleAvatar(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('bucket', 'avatars');
    setUploading(true);
    setError('');
    try {
      const res = await api.post('/uploads', fd);
      setAvatarUrl(res.data.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await api.patch('/auth/me', {
        first_name: form.first_name,
        middle_name: form.middle_name,
        last_name: form.last_name,
        phone: form.phone,
        avatar_url: avatarUrl || null,
      });
      await refreshProfile();
      setSaved(true);
      setTimeout(() => navigate('/resident/settings'), 600);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
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
        <h1 className="text-lg font-bold text-slate-900">Edit profile</h1>
        <span className="w-9" />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      {saved && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Profile saved ✓
        </div>
      )}

      {/* Avatar */}
      <div className="flex flex-col items-center">
        <div className="relative">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="h-24 w-24 rounded-full object-cover" />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
              {initials(profile?.full_name)}
            </div>
          )}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white shadow"
            aria-label="Update photo"
          >
            {uploading ? '…' : '📷'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif"
            className="hidden"
            onChange={handleAvatar}
          />
        </div>
        <p className="mt-2 text-xs text-slate-500">Tap to update your photo</p>
      </div>

      {/* Form */}
      <form onSubmit={save} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="first_name">
              First name
            </label>
            <input
              id="first_name"
              className="input"
              value={form.first_name}
              onChange={update('first_name')}
              placeholder="John Lester"
            />
          </div>
          <div>
            <label className="label" htmlFor="middle_name">
              Middle name
            </label>
            <input
              id="middle_name"
              className="input"
              value={form.middle_name}
              onChange={update('middle_name')}
              placeholder="Rana"
            />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="last_name">
            Last name
          </label>
          <input
            id="last_name"
            className="input"
            value={form.last_name}
            onChange={update('last_name')}
            placeholder="Saido"
          />
        </div>

        <div>
          <label className="label flex items-center gap-2" htmlFor="email">
            Email address
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              ✓ Verified
            </span>
          </label>
          <input id="email" className="input bg-slate-50" value={email} disabled />
        </div>

        <div>
          <label className="label" htmlFor="phone">
            Phone number
          </label>
          <input
            id="phone"
            className="input"
            value={form.phone}
            onChange={update('phone')}
            placeholder="09948206535"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Link to="/resident/settings" className="btn-secondary flex-1">
            Cancel
          </Link>
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
