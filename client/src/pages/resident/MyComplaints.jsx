import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import { STATUS_DOT, STATUS_META, categoryIcon, timeAgo } from '../../lib/constants';

export default function MyComplaints() {
  const [complaints, setComplaints] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/complaints/mine')
      .then((res) => setComplaints(res.data))
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <EmptyState title="Couldn't load complaints" message={error} />;
  if (!complaints) return <Spinner label="Loading your complaints…" />;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Complaints</h1>
          <p className="text-sm text-slate-500">Track the status of everything you&apos;ve reported.</p>
        </div>
        <Link to="/resident/report" className="btn-primary shrink-0">
          + New Complaint
        </Link>
      </div>

      {complaints.length === 0 ? (
        <EmptyState title="No complaints yet" message="When you submit a complaint, it will appear here.">
          <Link to="/resident/report" className="btn-primary">
            Report an issue
          </Link>
        </EmptyState>
      ) : (
        <ul className="space-y-2.5">
          {complaints.map((c) => (
            <li key={c.id}>
              <Link
                to={`/resident/complaints/${c.id}`}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card transition hover:border-slate-300"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xl">
                  {categoryIcon(c.category?.name)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-slate-900">{c.description}</span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                    <span className={`h-2 w-2 rounded-full ${STATUS_DOT[c.status] || 'bg-slate-400'}`} />
                    {STATUS_META[c.status]?.label} · {c.tracking_id} · {timeAgo(c.created_at)}
                  </span>
                </span>
                <span className="text-slate-300">›</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
