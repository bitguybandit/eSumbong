const STATUS_PILL = {
  submitted: { label: 'Pending Review', cls: 'officer-status--pending' },
  under_review: { label: 'Accepted', cls: 'officer-status--accepted' },
  referred: { label: 'In Progress', cls: 'officer-status--progress' },
  resolved: { label: 'Resolved', cls: 'officer-status--resolved' },
  closed: { label: 'Closed', cls: 'officer-status--closed' },
  rejected: { label: 'Rejected', cls: 'officer-status--rejected' },
};

/** Officer portal status pill — always rendered with the full literal class name. */
export default function OfficerStatusPill({ status, className = '' }) {
  const meta = STATUS_PILL[status] ?? { label: status, cls: 'officer-status--closed' };
  return (
    <span className={`officer-status ${meta.cls} ${className}`}>
      <span className="officer-status-dot" />
      {meta.label}
    </span>
  );
}
