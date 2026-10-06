import { Router } from 'express';
import { supabase } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// GET /api/notifications — current user's notifications (newest first).
router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*, complaint:complaints(tracking_id, status)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  })
);

// PATCH /api/notifications/:id/read — mark a single notification as read.
router.patch(
  '/:id/read',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  })
);

export default router;
