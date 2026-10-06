import { z } from 'zod';

const decimalString = z
  .union([z.number(), z.string()])
  .transform((v) => Number(v))
  .refine((n) => Number.isFinite(n), { message: 'Must be a valid number.' });

export const submitComplaintSchema = z.object({
  description: z.string().trim().min(10, 'Description must be at least 10 characters.'),
  category_id: z.string().uuid().nullable().optional(),
  latitude: decimalString.refine((n) => n >= -90 && n <= 90, 'Invalid latitude.'),
  longitude: decimalString.refine((n) => n >= -180 && n <= 180, 'Invalid longitude.'),
  location_text: z.string().trim().max(255).optional().nullable(),
  photo_path: z.string().trim().max(1000).optional().nullable(),
  anonymous: z.boolean().optional().default(false),
});

export const rejectComplaintSchema = z.object({
  reason: z.string().trim().min(3, 'Please select or enter a rejection reason.'),
  notes: z.string().trim().max(1000).optional().nullable(),
});

export const categorizeComplaintSchema = z.object({
  category_id: z.string().uuid('A category is required.'),
  referred_target_id: z.string().uuid('A referral target is required.'),
  referral_notes: z.string().trim().max(1000).optional().nullable(),
});

export const addActionSchema = z.object({
  action_taken: z.string().trim().min(3, 'Describe the action taken.'),
  contact_made_with: z.string().trim().max(255).optional().nullable(),
});

export const resolveComplaintSchema = z.object({
  resolution_remarks: z.string().trim().min(3, 'Please provide resolution remarks.'),
  resolution_photo_path: z.string().trim().max(1000).optional().nullable(),
});

export const updateProfileSchema = z.object({
  first_name: z.string().trim().max(100).nullable().optional(),
  middle_name: z.string().trim().max(100).nullable().optional(),
  last_name: z.string().trim().max(100).nullable().optional(),
  phone: z.string().trim().max(30).nullable().optional(),
  avatar_url: z.string().trim().max(1000).nullable().optional(),
});
