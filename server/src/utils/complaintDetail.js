import { supabase } from '../db.js';

/**
 * Fetches a complaint with all related data: category, referral target,
 * resident profile, and the full action history (with officer names).
 */
export async function getComplaintDetail(id) {
  const { data, error } = await supabase
    .from('complaints')
    .select(
      `*,
       category:categories(*),
       referred_target:referral_targets(*),
       resident:users(full_name),
       action_log_entries(*, officer:users(full_name))`
    )
    .eq('id', id)
    .single();

  if (error) {
    const err = new Error(error.message);
    err.status = 404;
    throw err;
  }

  if (Array.isArray(data.action_log_entries)) {
    data.action_log_entries.sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );
  }

  return data;
}
