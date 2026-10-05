import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../lib/api';
import Spinner from '../../components/Spinner';
import StatusBadge from '../../components/StatusBadge';
import MapView from '../../components/MapView';
import { ENTRY_TYPE_META, formatDateTime } from '../../lib/constants';

function Timeline({ entries }) {
  return (
    <ol className="relative space-y-4 border-l border-slate-200 pl-5">
      {entries.map((entry) => {
        const meta = ENTRY_TYPE_META[entry.entry_type] || { label: entry.entry_type, icon: '•' };
        return (
          <li key={entry.id} className="relative">
            <span className="absolute -left-[27px] top-0 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] ring-1 ring-slate-200">
              {meta.icon}
            </span>
            <div className="text-sm font-semibold text-slate-900">{meta.label}</div>
            <div className="text-sm text-slate-600">{entry.description}</div>
            <div className="mt-0.5 text-xs text-slate-400">
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
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/complaints/${id}`)
      .then((res) => setComplaint(res.data))
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) {
    return (
      <div className="card p-10 text-center text-slate-500">
        <p className="text-lg font-semibold text-slate-700">Complaint not found</p>
        <p className="mt-1 text-sm">{error}</p>
        <Link to="/resident/complaints" className="btn-secondary mt-4">
          ← Back to My Complaints
        </Link>
      </div>
    );
  }
  if (!complaint) return <Spinner label="Loading complaint…" />;

  return (
    <div className="space-y-6">
      <Link to="/resident/complaints" className="text-sm font-medium text-blue-600 hover:underline">
        ← Back to My Complaints
      </Link>

      <div className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-mono text-sm text-slate-500">{complaint.tracking_id}</div>
            <h1 className="mt-1 text-xl font-bold text-slate-900">{complaint.description}</h1>
          </div>
          <StatusBadge status={complaint.status} />
        </div>

        <dl className="mt-6 grid gap-x-6 gap-y-4 sm:grid-cols-2">
          <Info label="Category" value={complaint.category?.name || '—'} />
          <Info label="Date Submitted" value={formatDateTime(complaint.created_at)} />
          <Info label="Location" value={complaint.location_text || '—'} />
          <Info
            label="Submitted By"
            value={complaint.resident ? complaint.resident.full_name : 'Anonymous'}
          />
          {complaint.referred_target && (
            <Info label="Referred To" value={complaint.referred_target.name} />
          )}
          {complaint.status === 'rejected' && (
            <Info label="Rejection Reason" value={complaint.rejection_reason || '—'} />
          )}
          {complaint.status === 'resolved' || complaint.status === 'closed' ? (
            <Info label="Resolution" value={complaint.resolution_remarks || '—'} />
          ) : null}
        </dl>

        {complaint.photo_path && (
          <div className="mt-6">
            <div className="label">Photo attachment</div>
            <img
              src={complaint.photo_path}
              alt="Complaint attachment"
              className="max-h-72 rounded-lg border border-slate-200 object-cover"
            />
          </div>
        )}

        {complaint.latitude != null && (
          <div className="mt-6">
            <div className="label">Location</div>
            <MapView latitude={Number(complaint.latitude)} longitude={Number(complaint.longitude)} />
          </div>
        )}
      </div>

      <div className="card p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Status History</h2>
        <Timeline entries={complaint.action_log_entries || []} />
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-sm text-slate-800">{value}</dd>
    </div>
  );
}
