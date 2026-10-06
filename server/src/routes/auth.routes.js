import { Router } from 'express';
import { supabase } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { parse } from '../utils/validate.js';
import { updateProfileSchema } from '../schemas/index.js';

const router = Router();

// GET /api/auth/me — returns the current user and their public profile.
router.get('/me', requireAuth, (req, res) => {
  res.json({
    user: { id: req.authUser.id, email: req.authUser.email },
    profile: req.user,
  });
});

// PATCH /api/auth/me — update the current user's profile fields.
router.patch(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = parse(updateProfileSchema, req.body);

    const first = body.first_name !== undefined ? body.first_name || '' : req.user.first_name || '';
    const middle = body.middle_name !== undefined ? body.middle_name || '' : req.user.middle_name || '';
    const last = body.last_name !== undefined ? body.last_name || '' : req.user.last_name || '';
    const fullName = [first, middle, last].filter(Boolean).join(' ') || req.user.full_name;

    const updates = { full_name: fullName };
    if (body.first_name !== undefined) updates.first_name = body.first_name || null;
    if (body.middle_name !== undefined) updates.middle_name = body.middle_name || null;
    if (body.last_name !== undefined) updates.last_name = body.last_name || null;
    if (body.phone !== undefined) updates.phone = body.phone || null;
    if (body.avatar_url !== undefined) updates.avatar_url = body.avatar_url || null;

    const { data: profile, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ profile });
  })
);

export default router;
