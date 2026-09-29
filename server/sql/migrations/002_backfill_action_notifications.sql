-- ---------------------------------------------------------------------------
-- 002 — Backfill resident notifications for officer "Action taken" notes.
--
-- POST /api/officer/complaints/:id/actions now notifies the resident with the
-- exact text the officer typed in the "Add Action" modal. Actions logged before
-- that hook existed have no notification, so residents never saw them.
--
-- This inserts the missing rows so those manual notes show up in the resident's
-- "Action Taken" dashboard feed and on the Notifications page.
--
-- Idempotent / safe to re-run: an entry is skipped when a matching
-- "Action taken on your complaint <ticket>: ..." notification that contains the
-- same action text already exists. Anonymous complaints (resident_id is null)
-- are skipped, exactly like the API does.
-- ---------------------------------------------------------------------------

insert into public.notifications (complaint_id, user_id, message, created_at)
select
  c.id,
  c.resident_id,
  'Action taken on your complaint ' || c.tracking_id || ': ' || e.description,
  e.created_at
from public.action_log_entries e
join public.complaints c on c.id = e.complaint_id
where e.entry_type = 'action'
  and c.resident_id is not null
  and not exists (
    select 1
    from public.notifications n
    where n.complaint_id = c.id
      and n.user_id = c.resident_id
      -- Same action note (first line of the log entry, i.e. before "\nContact: ")
      and n.message like 'Action taken on your complaint ' || c.tracking_id || ':%'
      and n.message like '%' || split_part(e.description, E'\n', 1) || '%'
  );
