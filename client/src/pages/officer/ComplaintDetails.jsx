// Day 6: Print Complaint Button UI
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../lib/api';
import Spinner from '../../components/Spinner';
import OfficerStatusPill from '../../components/OfficerStatusPill';
import Modal from '../../components/Modal';
import MapView from '../../components/MapView';
import { ENTRY_TYPE_META, formatDateTime } from '../../lib/constants';

function Section({ title, children, action }) {
  return (
    <div className="officer-card p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-400">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function Field({ label, value, mono = false }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-ink-400">{label}</dt>
      <dd className={`mt-0.5 text-sm text-ink ${mono ? 'font-mono' : ''}`}>{value || '—'}</dd>
    </div>
  );
}

function Timeline({ entries }) {
  return (
    <ol className="relative space-y-4 border-l border-hairline pl-5">
      {entries.map((entry) => {
        const meta = ENTRY_TYPE_META[entry.entry_type] || { label: entry.entry_type, icon: '•' };
        return (
          <li key={entry.id} className="relative">
            <span className="absolute -left-[27px] top-0 flex h-5 w-5 items-center justify-center rounded-full bg-surface text-[10px] ring-1 ring-hairline">
              {meta.icon}
            </span>
            <div className="text-sm font-semibold text-ink">{meta.label}</div>
            <div className="whitespace-pre-line text-sm text-ink-500">{entry.description}</div>
            <div className="mt-0.5 text-xs text-ink-400">
              {formatDateTime(entry.created_at)}
              {entry.officer ? ` · by ${entry.officer.full_name}` : ''}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default function ComplaintDetails() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [categories, setCategories] = useState([]);
  const [targets, setTargets] = useState([]);

  const [categoryId, setCategoryId] = useState('');
  const [referredTargetId, setReferredTargetId] = useState('');
  const [referralNotes, setReferralNotes] = useState('');

  const [showAction, setShowAction] = useState(false);
  const [actionTaken, setActionTaken] = useState('');
  const [contactWith, setContactWith] = useState('');

  const [showResolve, setShowResolve] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoName, setPhotoName] = useState('');

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function load() {
    api
      .get(`/officer/complaints/${id}`)
      .then((res) => {
        setComplaint(res.data);
        setCategoryId(res.data.category_id || '');
        setReferredTargetId(res.data.referred_target_id || '');
      })
      .catch((err) => setError(err.message));
  }

  useEffect(load, [id]);
  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data)).catch(() => {});
    api.get('/referral-targets').then((res) => setTargets(res.data)).catch(() => {});
  }, []);

  const suggestedTarget = useMemo(() => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat?.default_referral_target || null;
  }, [categories, categoryId]);

  function onCategoryChange(value) {
    setCategoryId(value);
    const cat = categories.find((c) => c.id === value);
    if (cat?.default_referral_target) {
      setReferredTargetId(cat.default_referral_target.id);
    }
  }

  async function recordReferral() {
    if (!categoryId || !referredTargetId) {
      setError('Select a category and a referral target.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await api.post(`/officer/complaints/${id}/categorize`, {
        category_id: categoryId,
        referred_target_id: referredTargetId,
        referral_notes: referralNotes || null,
      });
      setReferralNotes('');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function addAction() {
    if (actionTaken.trim().length < 3) return;
    setBusy(true);
    setError('');
    try {
      await api.post(`/officer/complaints/${id}/actions`, {
        action_taken: actionTaken.trim(),
        contact_made_with: contactWith || null,
      });
      setShowAction(false);
      setActionTaken('');
      setContactWith('');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function resolve() {
    if (remarks.trim().length < 3) return;
    setBusy(true);
    setError('');
    try {
      await api.post(`/officer/complaints/${id}/resolve`, {
        resolution_remarks: remarks.trim(),
        resolution_photo_path: photoUrl || null,
      });
      setShowResolve(false);
      setRemarks('');
      setPhotoUrl('');
      setPhotoName('');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function closeComplaint() {
    setBusy(true);
    setError('');
    try {
      await api.post(`/officer/complaints/${id}/close`);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function uploadPhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('bucket', 'resolution-photos');
    try {
      const res = await api.post('/uploads', fd);
      setPhotoUrl(res.data.url);
      setPhotoName(file.name);
    } catch (err) {
      setError(err.message);
    }
  }

  if (error) {
    return (
      <div className="officer-card p-10 text-center text-ink-500">
        <p className="font-display text-lg font-bold text-ink">Couldn't load complaint</p>
        <p className="mt-1 text-sm">{error}</p>
        <Link to="/officer/action-log" className="officer-btn-secondary mt-4">
          ← Back to Action Log
        </Link>
      </div>
    );
  }
  if (!complaint) return <Spinner label="Loading complaint…" />;

  const status = complaint.status;
  const canCategorize = ['submitted', 'under_review'].includes(status);
  const canAct = status === 'referred';
  const canResolve = status === 'referred';
  const canClose = status === 'resolved';
  const actionEntries = (complaint.action_log_entries || []).filter((e) => e.entry_type === 'action');
  const reviewStatus = status === 'rejected' ? 'Rejected' : status === 'submitted' ? 'Pending' : 'Accepted';

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <Link
          to="/officer/action-log"
          className="text-sm font-medium text-crimson-600 transition hover:underline dark:text-teal-400"
        >
          ← Back to Action Log
        </Link>
      </div>

      {error && (
        <div className="officer-alert officer-alert-danger !mb-0">
          <span>{error}</span>
        </div>
      )}

      {/* Header */}
      <div className="officer-card p-6">
        <div className="officer-tracking">{complaint.tracking_id}</div>
        <div className="mt-1.5 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-xl font-bold tracking-[-0.3px] text-ink">
            {complaint.description}
          </h1>
          <OfficerStatusPill status={status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-3">
          <Section title="Resident Report">
            <dl className="grid gap-4 sm:grid-cols-2">
              <Field label="Complaint Title" value={complaint.description} />
              <Field label="Category" value={complaint.category?.name} />
              <div className="sm:col-span-2">
                <Field label="Description" value={complaint.description} />
              </div>
              <Field label="Location" value={complaint.location_text} />
              <Field label="Date Submitted" value={formatDateTime(complaint.created_at)} />
              <Field label="Submitted By" value={complaint.resident?.full_name || 'Anonymous'} />
              <Field label="Attachments" value={complaint.photo_path ? '1 attachment' : 'No photos attached'} />
            </dl>
            {complaint.photo_path && (
              <img
                src={complaint.photo_path}
                alt="Complaint attachment"
                className="mt-4 max-h-72 rounded-lg border border-hairline object-cover"
              />
            )}
          </Section>

          <Section title="Location">
            {complaint.latitude != null && (
              <>
                <MapView latitude={Number(complaint.latitude)} longitude={Number(complaint.longitude)} />
                <p className="mt-2 font-mono text-xs text-ink-400">
                  {complaint.latitude}, {complaint.longitude}
                </p>
              </>
            )}
          </Section>

          <Section title="Action History">
            <Timeline entries={complaint.action_log_entries || []} />
          </Section>
        </div>

        {/* Right column */}
        <div className="space-y-6 lg:col-span-2">
          <Section title="Barangay Action">
            <dl className="space-y-3">
              <Field label="Review Status" value={reviewStatus} />
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-400">Current Status</dt>
                <dd className="mt-1">
                  <OfficerStatusPill status={status} />
                </dd>
              </div>
              <Field label="Referred To" value={complaint.referred_target?.name} />
              <Field label="Actions Taken" value={`${actionEntries.length} logged`} />
            </dl>
          </Section>

          {status === 'rejected' && (
            <Section title="Rejection Decision">
              <Field label="Reason" value={complaint.rejection_reason} />
              <div className="mt-3">
                <Field label="Decided At" value={formatDateTime(complaint.updated_at)} />
              </div>
            </Section>
          )}

          {canCategorize && (
            <Section title="Step 1: Categorize & Refer">
              <div className="space-y-4">
                <div>
                  <label className="label">Category</label>
                  <select className="input" value={categoryId} onChange={(e) => onCategoryChange(e.target.value)}>
                    <option value="">Select category…</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="rounded-lg border border-teal-100 bg-teal-50 p-3 dark:border-teal-500/25 dark:bg-teal-500/10">
                  <div className="text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-300">
                    Referral suggestion
                  </div>
                  {suggestedTarget ? (
                    <div className="mt-1 text-sm font-medium text-ink">
                      Suggested for “{suggestedTarget.name}” — {suggestedTarget.name}
                    </div>
                  ) : (
                    <div className="mt-1 text-sm text-ink-500">
                      Select a category to see the suggested referral target.
                    </div>
                  )}
                </div>

                <div>
                  <label className="label">Referral target (override if needed)</label>
                  <select
                    className="input"
                    value={referredTargetId}
                    onChange={(e) => setReferredTargetId(e.target.value)}
                  >
                    <option value="">Select referral target…</option>
                    {targets.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Referral notes (optional)</label>
                  <textarea
                    className="input"
                    rows={2}
                    placeholder="e.g. Urgent — pothole is deep and dangerous"
                    value={referralNotes}
                    onChange={(e) => setReferralNotes(e.target.value)}
                  />
                </div>

                <button
                  className="officer-btn-primary w-full"
                  disabled={busy || !categoryId || !referredTargetId}
                  onClick={recordReferral}
                >
                  {busy ? 'Recording…' : 'Record Referral'}
                </button>
              </div>
            </Section>
          )}

          {complaint.referred_target && (
            <Section title="Referral">
              <Field label="Referred To" value={complaint.referred_target.name} />
              <p className="mt-2 text-xs text-ink-400">
                {complaint.referred_target.description || ''}
              </p>
            </Section>
          )}

          <Section
            title="Actions Taken"
            action={
              canAct && (
                <button className="officer-btn-secondary !px-3 !py-1.5 !text-xs" onClick={() => setShowAction(true)}>
                  + Add Action
                </button>
              )
            }
          >
            {actionEntries.length === 0 ? (
              <p className="text-sm text-ink-400">No actions logged yet.</p>
            ) : (
              <ol className="space-y-3">
                {actionEntries.map((entry) => (
                  <li
                    key={entry.id}
                    className="rounded-lg border border-hairline bg-surface-soft p-3"
                  >
                    <p className="whitespace-pre-line text-sm text-ink">{entry.description}</p>
                    <p className="mt-1 text-xs text-ink-400">
                      {formatDateTime(entry.created_at)}
                      {entry.officer ? ` · by ${entry.officer.full_name}` : ''}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </Section>

          {(status === 'resolved' || status === 'closed') && (
            <Section
              title="Resolution"
              action={canClose && (
                <button
                  className="officer-btn-primary !px-3 !py-1.5 !text-xs"
                  disabled={busy}
                  onClick={closeComplaint}
                >
                  Close Complaint
                </button>
              )}
            >
              <Field label="Remarks" value={complaint.resolution_remarks} />
              {complaint.resolution_photo_path && (
                <img
                  src={complaint.resolution_photo_path}
                  alt="Resolution evidence"
                  className="mt-3 max-h-56 rounded-lg border border-hairline object-cover"
                />
              )}
              <div className="mt-3">
                <Field label="Resolved At" value={formatDateTime(complaint.updated_at)} />
              </div>
            </Section>
          )}

          {canResolve && (
            <button className="officer-btn-primary w-full" onClick={() => setShowResolve(true)}>
              Resolve Complaint
            </button>
          )}
          {canClose && (
            <button className="officer-btn-primary w-full" disabled={busy} onClick={closeComplaint}>
              Close Complaint
            </button>
          )}
        </div>
      </div>

      {/* Add Action modal */}
      <Modal
        open={showAction}
        onClose={() => setShowAction(false)}
        title="Add Action"
        subtitle="Log an action taken on this complaint."
      >
        <div className="space-y-4">
          <div>
            <label className="label">Action taken</label>
            <textarea
              className="input"
              rows={3}
              placeholder="e.g. Contacted Engineering / Public Works regarding the reported pothole…"
              value={actionTaken}
              onChange={(e) => setActionTaken(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Contact made with</label>
            <select className="input" value={contactWith} onChange={(e) => setContactWith(e.target.value)}>
              <option value="">Select…</option>
              {targets.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <button className="btn-secondary flex-1" onClick={() => setShowAction(false)}>
              Cancel
            </button>
            <button className="officer-btn-primary flex-1" disabled={busy} onClick={addAction}>
              {busy ? 'Saving…' : 'Save Action'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Resolve modal */}
      <Modal
        open={showResolve}
        onClose={() => setShowResolve(false)}
        title="Resolve Complaint"
        subtitle="Attach resolution remarks and optional photo evidence."
      >
        <div className="space-y-4">
          <div>
            <label className="label">Resolution remarks</label>
            <textarea
              className="input"
              rows={3}
              placeholder="e.g. Road repair completed. Area inspected and verified."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Resolution photo (optional)</label>
            <div className="flex items-center gap-3">
              <label className="btn-secondary cursor-pointer">
                Choose File
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif"
                  className="hidden"
                  onChange={uploadPhoto}
                />
              </label>
              <span className="text-sm text-ink-500">
                {photoUrl ? `✅ ${photoName}` : 'No file chosen — attach evidence of completed work.'}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="btn-secondary flex-1" onClick={() => setShowResolve(false)}>
              Cancel
            </button>
            <button
              className="officer-btn-primary flex-1"
              disabled={busy || remarks.trim().length < 3}
              onClick={resolve}
            >
              {busy ? 'Resolving…' : 'Resolve Complaint'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
