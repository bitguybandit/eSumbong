import { Router } from 'express';
import multer from 'multer';
import { supabase } from '../db.js';
import { config } from '../config.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const ALLOWED = /^(image\/(jpeg|png|gif|webp|heic|heif)|video\/mp4)$/i;

// POST /api/uploads — upload a photo/video to Supabase Storage.
// Multipart field: "file" (plus optional "bucket": complaint-photos | resolution-photos).
router.post(
  '/',
  requireAuth,
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided. Use the "file" field.' });
    }
    if (!ALLOWED.test(req.file.mimetype)) {
      return res.status(400).json({ error: 'Unsupported file type. Use JPEG, PNG, GIF, WEBP, HEIC, or MP4.' });
    }

    const allowedBuckets = new Set(['complaint-photos', 'resolution-photos', 'avatars']);
    const bucket = allowedBuckets.has(req.body.bucket) ? req.body.bucket : 'complaint-photos';
    const ext = req.file.originalname.split('.').pop() || 'jpg';
    const path = `${req.user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, req.file.buffer, { contentType: req.file.mimetype, upsert: false });

    if (error) throw error;

    const publicUrl = `${config.supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
    res.status(201).json({ path, url: publicUrl, bucket });
  })
);

export default router;
