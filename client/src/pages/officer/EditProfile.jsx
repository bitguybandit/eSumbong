import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { initials } from '../../lib/constants';

const inputClass =
  'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-crimson-500 focus:outline-none focus:ring-1 focus:ring-crimson-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500';

const readOnlyClass =
  'mt-1 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400';

// Buckets tried in order. `profile-photos` is the dedicated bucket; `avatars`
// is the long-standing one already provisioned in this project.
const AVATAR_BUCKETS = ['profile-photos', 'avatars'];

export default function EditProfile() {
  const { profile, session, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const redirectTimer = useRef(null);

  const userId = session?.user?.id || profile?.id || '';
  const email = session?.user?.email || '';

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [position, setPosition] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!userId) return undefined;
    let active = true;

    supabase
      .from('users')
      .select('full_name, phone, position, avatar_url')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (!active || !data) return;
        if (data.full_name) setFullName(data.full_name);
        if (data.phone) setPhone(data.phone);
        if (data.position) setPosition(data.position);
        if (data.avatar_url) setAvatarUrl(data.avatar_url);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  useEffect(() => () => clearTimeout(redirectTimer.current), []);

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !userId) return;

    setUploading(true);
    setMessage(null);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${userId}-${Date.now()}.${ext}`;

      let uploadedBucket = null;
      let uploadError = null;

      for (const bucket of AVATAR_BUCKETS) {
        const { error } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, { contentType: file.type, upsert: true });
        if (!error) {
          uploadedBucket = bucket;
          break;
        }
        uploadError = error;
        // Only fall back to the next bucket when this one does not exist.
        if (!/bucket/i.test(error.message || '')) break;
      }

      if (!uploadedBucket) throw uploadError;

      const { data } = supabase.storage.from(uploadedBucket).getPublicUrl(fileName);
      if (!data?.publicUrl) throw new Error('Could not resolve the uploaded photo URL.');
      setAvatarUrl(data.publicUrl);
      setMessage({ type: 'success', text: 'Photo uploaded. Remember to save your changes.' });
    } catch (err) {
      setMessage({ type: 'error', text: err?.message || 'Photo upload failed.' });
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!userId) {
      setMessage({ type: 'error', text: 'Your session expired. Please sign in again.' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: fullName.trim(),
          phone: phone.trim() || null,
          position: position.trim() || null,
          avatar_url: avatarUrl || null,
        })
        .eq('id', userId);

      if (error) throw error;

      await refreshProfile();
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
      redirectTimer.current = setTimeout(() => navigate('/officer/settings'), 2000);
    } catch (err) {
      setMessage({ type: 'error', text: err?.message || 'Could not save your profile.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-7">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-[-0.5px] text-ink">Edit Profile</h1>
        <p className="mt-1 text-[13px] text-ink-500">
          Update your photo and the details shown across the officer portal.
        </p>
      </div>

      {message && (
        <div
          role={message.type === 'error' ? 'alert' : 'status'}
          className={`rounded-lg border px-3 py-2 text-sm ${
            message.type === 'error'
              ? 'border-red-900/50 bg-red-600/10 text-red-500'
              : 'border-emerald-900/50 bg-emerald-600/10 text-emerald-500'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <section className="officer-card p-6">
          <h2 className="font-display text-base font-bold tracking-[-0.2px] text-ink">
            Profile Picture
          </h2>
          <div className="mt-5 flex flex-col items-center gap-4 sm:flex-row">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile photo"
                className="h-24 w-24 shrink-0 rounded-full border border-crimson-600/30 object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-crimson-600/30 bg-crimson-600 text-2xl font-bold text-white">
                {initials(fullName || profile?.full_name)}
              </div>
            )}

            <div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="officer-btn-secondary !px-3 !py-1.5 !text-xs disabled:opacity-60"
              >
                {uploading ? 'Uploading…' : 'Change Photo'}
              </button>
              <p className="mt-1.5 text-xs text-ink-400">JPEG, PNG, GIF, WEBP or HEIC.</p>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
          </div>
        </section>

        <section className="officer-card p-6">
          <h2 className="font-display text-base font-bold tracking-[-0.2px] text-ink">
            Account Details
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="profile-email" className="text-xs font-medium uppercase tracking-wide text-ink-400">
                Email Address
              </label>
              <input
                id="profile-email"
                type="email"
                value={email}
                readOnly
                placeholder="No email on file"
                className={readOnlyClass}
              />
            </div>
            <div>
              <label htmlFor="profile-name" className="text-xs font-medium uppercase tracking-wide text-ink-400">
                Full Name
              </label>
              <input
                id="profile-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Juan Dela Cruz"
                required
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="profile-phone" className="text-xs font-medium uppercase tracking-wide text-ink-400">
                Phone Number
              </label>
              <input
                id="profile-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+63 9XX XXX XXXX"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="profile-position" className="text-xs font-medium uppercase tracking-wide text-ink-400">
                Position / Designation
              </label>
              <input
                id="profile-position"
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="e.g., Barangay Secretary"
                className={inputClass}
              />
            </div>
          </div>
        </section>

        <div className="flex items-center justify-end gap-3">
          <Link to="/officer/settings" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" className="officer-btn-primary" disabled={loading || uploading}>
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
