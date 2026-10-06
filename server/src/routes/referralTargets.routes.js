import { Router } from 'express';
import { supabase } from '../db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// GET /api/referral-targets — available referral targets.
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const { data, error } = await supabase
      .from('referral_targets')
      .select('*')
      .order('name');

    if (error) throw error;
    res.json(data);
  })
);

export default router;
