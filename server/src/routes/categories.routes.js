import { Router } from 'express';
import { supabase } from '../db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// GET /api/categories — categories with their default referral target.
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const { data, error } = await supabase
      .from('categories')
      .select('*, default_referral_target:referral_targets(*)')
      .order('name');

    if (error) throw error;
    res.json(data);
  })
);

export default router;
