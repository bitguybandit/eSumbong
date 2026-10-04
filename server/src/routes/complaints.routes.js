import { Router } from 'express';
import { supabase } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { parse } from '../utils/validate.js';
import { generateTrackingId } from '../utils/tracking.js';
import { getComplaintDetail } from '../utils/complaintDetail.js';
import { submitComplaintSchema } from '../schemas/index.js';

const router = Router();

/** Attaches req.authUser / req.user when a valid token is present, else continues. */
async function optionalAuth(req, _res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return next();

  const { data } = await supabase.auth.getUser(token);
  if (data?.user) {
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
    req.authUser = data.user;
    req.user = profile || null;
  }
  return next();
}

// POST /api/complaints — submit a complaint (supports anonymous reporting).
router.post(
  '/',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const body = parse(submitComplaintSchema, req.body);

    // Anonymous reports (or guest submissions with no account) are not linked
    // to a resident account. `is_anonymous` records the explicit intent.
    const isAnonymous = Boolean(body.anonymous);
    const residentId = isAnonymous ? null : req.user?.id ?? null;

    const trackingId = await generateTrackingId();

    const { data: complaint, error } = await supabase
      .from('complaints')
      .insert({
        tracking_id: trackingId,
        resident_id: residentId,
        is_anonymous: isAnonymous,
        category_id: body.category_id,
        description: body.description,
        latitude: body.latitude,
        longitude: body.longitude,
        location_text: body.location_text,
        photo_path: body.photo_path,
        status: 'submitted',
      })
      .select()
      .single();

    if (error) throw error;

    // Seed the action history with the initial "submitted" entry.
    await supabase.from('action_log_entries').insert({
      complaint_id: complaint.id,
      officer_id: null,
      entry_type: 'submitted',
      description: 'Complaint submitted by resident',
    });

    res.status(201).json(complaint);
  })
);

// GET /api/complaints/mine — the authenticated resident's complaints.
router.get(
  '/mine',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('complaints')
      .select('*, category:categories(name)')
      .eq('resident_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  })
);

// GET /api/complaints/track/:trackingId — public tracking by ID (no auth
// middleware), so guests/anonymous reporters can check status. Returns a
// strictly limited payload: never resident_id, names, emails, or other PII.
router.get(
  '/track/:trackingId',
  asyncHandler(async (req, res) => {
    const trackingId = (req.params.trackingId || '').trim().toUpperCase();
    if (!trackingId) {
      return res.status(400).json({ error: 'Tracking ID is required.' });
    }

    const { data: complaint, error } = await supabase
      .from('complaints')
      .select('id, tracking_id, status, category_id, description, created_at')
      .ilike('tracking_id', trackingId)
      .maybeSingle();

    if (error) throw error;
    if (!complaint) {
      return res.status(404).json({ error: 'No complaint found with that Tracking ID.' });
    }

    const { data: history } = await supabase
      .from('action_log_entries')
      .select('entry_type, description, created_at')
      .eq('complaint_id', complaint.id)
      .order('created_at', { ascending: true });

    res.json({
      tracking_id: complaint.tracking_id,
      status: complaint.status,
      category_id: complaint.category_id,
      description: complaint.description,
      submitted_at: complaint.created_at,
      action_log_entries: (history || []).map((e) => ({
        type: e.entry_type,
        text: e.description,
        created_at: e.created_at,
      })),
    });
  })
);

// GET /api/complaints/:id — complaint detail (role-aware authorization).
router.get(
  '/:id',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const complaint = await getComplaintDetail(req.params.id);

    const isOfficer = req.user?.role_type === 'officer';
    const isOwner = req.user && complaint.resident_id === req.user.id;

    if (!isOfficer && !isOwner) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    res.json(complaint);
  })
);

export default router;
