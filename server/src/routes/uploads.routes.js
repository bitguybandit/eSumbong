import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import exifr from 'exifr';
// `supabase` is the server-side client created with SUPABASE_SERVICE_ROLE_KEY
// (see src/db.js) — storage writes bypass RLS and never use the caller's token.
import { supabase } from '../db.js';
import { config } from '../config.js';
import { optionalAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// This route is public so guests can attach a photo while filing a complaint.
// Cap anonymous uploads per IP so the open endpoint cannot be used to fill
// storage; signed-in users are exempt and never throttled here.
const guestUploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 unauthenticated uploads per IP per hour
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => Boolean(req.user),
  message: {
    error: 'Too many uploads from this network. Please try again later or sign in.',
  },
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB — matches the client cap
});

const ALLOWED = /^(image\/(jpeg|png|gif|webp|heic|heif)|video\/mp4)$/i;

// Multer hands its errors (e.g. oversized files) to the error handler, which
// would answer 500. Map them to a 400/413 with a readable message instead.
function uploadSingle(req, res, next) {
  upload.single('file')(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'File is too large. Max size is 15MB.' });
    }
    return res.status(400).json({ error: err.message || 'Upload failed.' });
  });
}

// POST /api/uploads — upload a photo/video to Supabase Storage.
// Multipart field: "file" (plus optional "bucket": complaint-photos | resolution-photos).
// Guests (no JWT) may upload too; their files land under `guest/`.
router.post(
  '/',
  optionalAuth,
  guestUploadLimiter,
  uploadSingle,
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided. Use the "file" field.' });
    }
    if (!ALLOWED.test(req.file.mimetype)) {
      return res.status(400).json({ error: 'Unsupported file type. Use JPEG, PNG, GIF, WEBP, HEIC, or MP4.' });
    }

    const isGuest = !req.user;

    // Guests may only attach photos to complaints; avatars and resolution
    // evidence stay with signed-in residents and officers.
    const allowedBuckets = isGuest
      ? new Set(['complaint-photos'])
      : new Set(['complaint-photos', 'resolution-photos', 'profile-photos']);
    const bucket = allowedBuckets.has(req.body.bucket) ? req.body.bucket : 'complaint-photos';
    const ext = req.file.originalname.split('.').pop() || 'jpg';
    const safeName = req.file.originalname.replace(/[^A-Za-z0-9._-]/g, '_').slice(-80) || 'upload';
    const path = req.user
      ? `${req.user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
      : `guest/${Date.now()}-${safeName}`;

    // Best-effort EXIF read against the untouched multipart bytes. multer uses
    // memoryStorage, so `req.file.buffer` is byte-for-byte what the device sent
    // — nothing re-encodes or compresses it before this point, and the Supabase
    // upload below forwards that same buffer. Screenshots, downloaded images,
    // and AI output typically carry no camera metadata, so a null result is
    // itself the signal the officer UI flags.
    let metadata = null;
    if (req.file.mimetype.startsWith('image/')) {
      try {
        // Parse only the necessary fields to keep it fast
        metadata = await exifr.parse(req.file.buffer, ['DateTimeOriginal', 'Make', 'Model']);
      } catch (err) {
        console.warn('EXIF parsing failed, image may be a screenshot or stripped.');
      }

      // Diagnostic: if a phone photo shows "Unverified Source" in the officer UI,
      // this line tells you whether the file simply had no tags or the buffer
      // reached the server already altered.
      console.log(
        '[uploads] EXIF %s: %s | %s bytes | declared %s',
        req.file.originalname,
        metadata
          ? `Make=${metadata.Make ?? '—'} Model=${metadata.Model ?? '—'} DateTimeOriginal=${
              metadata.DateTimeOriginal instanceof Date
                ? metadata.DateTimeOriginal.toISOString()
                : metadata.DateTimeOriginal ?? '—'
            }`
          : 'null (no camera tags found)',
        req.file.size,
        req.file.mimetype
      );
    }

    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, req.file.buffer, { contentType: req.file.mimetype, upsert: false });

    if (error) throw error;

    const publicUrl = `${config.supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
    res.status(201).json({ path, url: publicUrl, bucket, metadata: metadata ?? null });
  })
);

export default router;
