import { supabase } from '../db.js';

/**
 * Generates a human-friendly tracking ID of the form `ES-YYYY-####`.
 */
export async function generateTrackingId() {
  const year = new Date().getFullYear();
  const { count, error } = await supabase
    .from('complaints')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', `${year}-01-01`)
    .lt('created_at', `${year + 1}-01-01`);

  if (error) throw error;

  const next = (count || 0) + 1;
  return `ES-${year}-${String(next).padStart(4, '0')}`;
}
