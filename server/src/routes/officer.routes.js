import { Router } from 'express';
import { supabase } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { parse } from '../utils/validate.js';
import { getComplaintDetail } from '../utils/complaintDetail.js';
import { notifyResident } from '../utils/notify.js';
import {
  rejectComplaintSchema,
  categorizeComplaintSchema,
  addActionSchema,
  resolveComplaintSchema,
} from '../schemas/index.js';

const router = Router();

router.use(requireAuth, requireRole('officer'));

// ---------------------------------------------------------------------------
// Dashboard stats
// ---------------------------------------------------------------------------
// How many days of daily buckets the trend ships. Enough to bucket into
// daily / weekly / monthly on the client without a large payload.
const TREND_WINDOW_DAYS = 180;

/** Local-time YYYY-MM-DD key (must match how the day list below is built). */
function dayKey(value) {
  const d = new Date(value);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

router.get(
  '/dashboard',
  asyncHandler(async (_req, res) => {
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    since.setDate(since.getDate() - (TREND_WINDOW_DAYS - 1));

    const [complaintsRes, actionsRes] = await Promise.all([
      supabase
        .from('complaints')
        .select('id, status, tracking_id, description, created_at, category:categories(name)')
        .order('created_at', { ascending: false }),
      supabase
        .from('action_log_entries')
        .select('complaint_id, entry_type, created_at')
        .gte('created_at', since.toISOString()),
    ]);

    if (complaintsRes.error) throw complaintsRes.error;
    if (actionsRes.error) throw actionsRes.error;

    const complaints = complaintsRes.data ?? [];
    const actions = actionsRes.data ?? [];

    const stats = {
      total: complaints.length,
      pending_review: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0,
      rejected: 0,
    };

    for (const c of complaints) {
      if (c.status === 'submitted') stats.pending_review += 1;
      else if (c.status === 'referred') stats.in_progress += 1;
      else if (c.status === 'resolved') stats.resolved += 1;
      else if (c.status === 'closed') stats.closed += 1;
      else if (c.status === 'rejected') stats.rejected += 1;
    }

    // --- Daily trend, from real rows ---------------------------------------
    const loggedByDay = new Map();
    for (const c of complaints) {
      const key = dayKey(c.created_at);
      loggedByDay.set(key, (loggedByDay.get(key) ?? 0) + 1);
    }

    // A case counts as actioned on the day of its FIRST non-submitted entry,
    // so one complaint is never counted twice.
    const firstActionDay = new Map();
    for (const a of actions) {
      if (a.entry_type === 'submitted') continue;
      const key = dayKey(a.created_at);
      const seen = firstActionDay.get(a.complaint_id);
      if (!seen || key < seen) firstActionDay.set(a.complaint_id, key);
    }
    const actionedByDay = new Map();
    for (const key of firstActionDay.values()) {
      actionedByDay.set(key, (actionedByDay.get(key) ?? 0) + 1);
    }

    const trend = [];
    for (let i = TREND_WINDOW_DAYS - 1; i >= 0; i -= 1) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const key = dayKey(d);
      trend.push({
        date: key,
        logged: loggedByDay.get(key) ?? 0,
        actioned: actionedByDay.get(key) ?? 0,
      });
    }

    res.json({
      stats,
      recent: complaints.slice(0, 5),
      pending: complaints.filter((c) => c.status === 'submitted'),
      trend,
    });
  })
);

// ---------------------------------------------------------------------------
// Complaint Queue — complaints awaiting initial review (status = submitted).
// Supports ?search= and ?category= filters.
// ---------------------------------------------------------------------------
router.get(
  '/complaints',
  asyncHandler(async (req, res) => {
    const search = (req.query.search || '').trim();
    const category = (req.query.category || '').trim();

    let query = supabase
      .from('complaints')
      .select('*, category:categories(name), resident:users(full_name)')
      .eq('status', 'submitted')
      .order('created_at', { ascending: false });

    if (category) query = query.eq('category_id', category);
    if (search) {
      query = query.or(
        `tracking_id.ilike.%${search}%,description.ilike.%${search}%,location_text.ilike.%${search}%`
      );
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  })
);

// ---------------------------------------------------------------------------
// Action Log — complaints already accepted into barangay processing.
// Supports ?status= and ?category= filters.
// ---------------------------------------------------------------------------
router.get(
  '/action-log',
  asyncHandler(async (req, res) => {
    const status = (req.query.status || '').trim();
    const category = (req.query.category || '').trim();

    let query = supabase
      .from('complaints')
      .select('*, category:categories(name), resident:users(full_name)')
      .neq('status', 'submitted')
      .order('updated_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (category) query = query.eq('category_id', category);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  })
);

// ---------------------------------------------------------------------------
// Accept a complaint → under_review ("Accepted")
// ---------------------------------------------------------------------------
router.post(
  '/complaints/:id/accept',
  asyncHandler(async (req, res) => {
    const { data: complaint } = await supabase
      .from('complaints')
      .select('id, tracking_id, status, resident_id')
      .eq('id', req.params.id)
      .single();

    if (!complaint) return res.status(404).json({ error: 'Complaint not found.' });
    if (complaint.status !== 'submitted') {
      return res.status(400).json({ error: 'Only submitted complaints can be accepted.' });
    }

    const { data: updated, error } = await supabase
      .from('complaints')
      .update({ status: 'under_review' })
      .eq('id', complaint.id)
      .select()
      .single();
    if (error) throw error;

    await supabase.from('action_log_entries').insert({
      complaint_id: complaint.id,
      officer_id: req.user.id,
      entry_type: 'accepted',
      description: 'Complaint accepted for barangay action',
    });

    await notifyResident(
      complaint.id,
      complaint.resident_id,
      `Your complaint ${complaint.tracking_id} was accepted and is now being processed by the barangay.`
    );

    res.json(updated);
  })
);

// ---------------------------------------------------------------------------
// Reject a complaint → rejected (with reason)
// ---------------------------------------------------------------------------
router.post(
  '/complaints/:id/reject',
  asyncHandler(async (req, res) => {
    const { reason, notes } = parse(rejectComplaintSchema, req.body);

    const { data: complaint } = await supabase
      .from('complaints')
      .select('id, tracking_id, status, resident_id')
      .eq('id', req.params.id)
      .single();

    if (!complaint) return res.status(404).json({ error: 'Complaint not found.' });
    if (complaint.status !== 'submitted') {
      return res.status(400).json({ error: 'Only submitted complaints can be rejected.' });
    }

    const fullReason = notes ? `${reason} — ${notes}` : reason;

    const { data: updated, error } = await supabase
      .from('complaints')
      .update({ status: 'rejected', rejection_reason: fullReason })
      .eq('id', complaint.id)
      .select()
      .single();
    if (error) throw error;

    await supabase.from('action_log_entries').insert({
      complaint_id: complaint.id,
      officer_id: req.user.id,
      entry_type: 'rejected',
      description: fullReason,
    });

    await notifyResident(
      complaint.id,
      complaint.resident_id,
      `Your complaint ${complaint.tracking_id} was rejected: ${reason}`
    );

    res.json(updated);
  })
);

// ---------------------------------------------------------------------------
// Categorize + record referral → referred ("In Progress")
// ---------------------------------------------------------------------------
router.post(
  '/complaints/:id/categorize',
  asyncHandler(async (req, res) => {
    const { category_id, referred_target_id, referral_notes } = parse(
      categorizeComplaintSchema,
      req.body
    );

    const { data: complaint } = await supabase
      .from('complaints')
      .select('id, tracking_id, status, resident_id')
      .eq('id', req.params.id)
      .single();

    if (!complaint) return res.status(404).json({ error: 'Complaint not found.' });
    if (!['submitted', 'under_review'].includes(complaint.status)) {
      return res.status(400).json({ error: 'This complaint cannot be referred in its current status.' });
    }

    const { data: target } = await supabase
      .from('referral_targets')
      .select('name')
      .eq('id', referred_target_id)
      .single();

    const { data: updated, error } = await supabase
      .from('complaints')
      .update({
        category_id,
        referred_target_id,
        status: 'referred',
      })
      .eq('id', complaint.id)
      .select()
      .single();
    if (error) throw error;

    const description = referral_notes
      ? `Referred to ${target?.name || 'referral target'} — ${referral_notes}`
      : `Referred to ${target?.name || 'referral target'}`;

    await supabase.from('action_log_entries').insert({
      complaint_id: complaint.id,
      officer_id: req.user.id,
      entry_type: 'referred',
      description,
    });

    await notifyResident(
      complaint.id,
      complaint.resident_id,
      `Your complaint ${complaint.tracking_id} was referred to ${target?.name || 'the appropriate office'}.`
    );

    res.json(updated);
  })
);

// ---------------------------------------------------------------------------
// Log an action / contact
// ---------------------------------------------------------------------------
router.post(
  '/complaints/:id/actions',
  asyncHandler(async (req, res) => {
    const { action_taken, contact_made_with } = parse(addActionSchema, req.body);

    const { data: complaint } = await supabase
      .from('complaints')
      .select('id, status, tracking_id, resident_id')
      .eq('id', req.params.id)
      .single();

    if (!complaint) return res.status(404).json({ error: 'Complaint not found.' });
    if (['submitted', 'closed', 'rejected'].includes(complaint.status)) {
      return res.status(400).json({ error: 'Actions can only be logged on active complaints.' });
    }

    const description = contact_made_with
      ? `${action_taken}\nContact: ${contact_made_with}`
      : action_taken;

    const { data: entry, error } = await supabase
      .from('action_log_entries')
      .insert({
        complaint_id: complaint.id,
        officer_id: req.user.id,
        entry_type: 'action',
        description,
      })
      .select()
      .single();
    if (error) throw error;

    // Tell the resident what the officer actually did. Notifications are
    // skipped automatically for anonymous complaints (no resident_id).
    const summary = contact_made_with
      ? `${action_taken} (contact: ${contact_made_with})`
      : action_taken;

    await notifyResident(
      complaint.id,
      complaint.resident_id,
      `Action taken on your complaint ${complaint.tracking_id}: ${summary}`
    );

    res.status(201).json(entry);
  })
);

// ---------------------------------------------------------------------------
// Resolve a complaint → resolved (with remarks and optional photo)
// ---------------------------------------------------------------------------
router.post(
  '/complaints/:id/resolve',
  asyncHandler(async (req, res) => {
    const { resolution_remarks, resolution_photo_path } = parse(
      resolveComplaintSchema,
      req.body
    );

    const { data: complaint } = await supabase
      .from('complaints')
      .select('id, tracking_id, status, resident_id')
      .eq('id', req.params.id)
      .single();

    if (!complaint) return res.status(404).json({ error: 'Complaint not found.' });
    if (complaint.status !== 'referred') {
      return res.status(400).json({ error: 'Only referred (in-progress) complaints can be resolved.' });
    }

    const { data: updated, error } = await supabase
      .from('complaints')
      .update({
        status: 'resolved',
        resolution_remarks,
        resolution_photo_path: resolution_photo_path || null,
      })
      .eq('id', complaint.id)
      .select()
      .single();
    if (error) throw error;

    await supabase.from('action_log_entries').insert({
      complaint_id: complaint.id,
      officer_id: req.user.id,
      entry_type: 'resolved',
      description: 'Marked as resolved',
    });

    await notifyResident(
      complaint.id,
      complaint.resident_id,
      `Good news! Your complaint ${complaint.tracking_id} has been resolved.`
    );

    res.json(updated);
  })
);

// ---------------------------------------------------------------------------
// Close a complaint → closed
// ---------------------------------------------------------------------------
router.post(
  '/complaints/:id/close',
  asyncHandler(async (req, res) => {
    const { data: complaint } = await supabase
      .from('complaints')
      .select('id, tracking_id, status, resident_id')
      .eq('id', req.params.id)
      .single();

    if (!complaint) return res.status(404).json({ error: 'Complaint not found.' });
    if (complaint.status !== 'resolved') {
      return res.status(400).json({ error: 'Only resolved complaints can be closed.' });
    }

    const { data: updated, error } = await supabase
      .from('complaints')
      .update({ status: 'closed' })
      .eq('id', complaint.id)
      .select()
      .single();
    if (error) throw error;

    await supabase.from('action_log_entries').insert({
      complaint_id: complaint.id,
      officer_id: req.user.id,
      entry_type: 'closed',
      description: 'Complaint closed',
    });

    await notifyResident(
      complaint.id,
      complaint.resident_id,
      `Your complaint ${complaint.tracking_id} has been closed.`
    );

    res.json(updated);
  })
);

// GET /api/officer/complaints/:id — full detail for an officer.
router.get(
  '/complaints/:id',
  asyncHandler(async (req, res) => {
    const complaint = await getComplaintDetail(req.params.id);
    res.json(complaint);
  })
);

export default router;
