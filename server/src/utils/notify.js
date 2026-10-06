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
