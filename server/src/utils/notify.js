import { supabase } from '../db.js';

/**
 * Sends a notification to a resident (if the complaint is linked to one).
 */
export async function notifyResident(complaintId, residentId, message) {
  if (!residentId) return null;
  const { data, error } = await supabase
    .from('notifications')
    .insert({ complaint_id: complaintId, user_id: residentId, message })
    .select()
    .single();
  if (error) {
    // Notifications are best-effort; never fail the request because of one.
    console.error('[notify] failed:', error.message);
    return null;
  }
  return data;
}

/**
 * Tells the barangay officer that a newly submitted complaint needs review.
 * Single-barangay pilot: the first officer account receives the notification.
 */
export async function notifyOfficerOfNewComplaint(complaintId, trackingId) {
  try {
    const { data: officer, error: officerError } = await supabase
      .from('users')
      .select('id')
      .eq('role_type', 'officer')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (officerError) throw officerError;
    if (!officer) return null;

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: officer.id,
        complaint_id: complaintId,
        message: `New complaint #${trackingId} requires review.`,
        is_read: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    // Best-effort: a failed notification must never block the submission.
    console.error('[notify] officer notification failed:', err.message);
    return null;
  }
}
