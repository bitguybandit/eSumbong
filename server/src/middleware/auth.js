import { supabase } from '../db.js';

/**
 * Validates the Supabase access token from the `Authorization: Bearer …`
 * header and attaches `req.authUser` (auth.users row) and `req.user`
 * (public.users profile) to the request.
 */
export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) {
      return res.status(401).json({ error: 'Invalid or expired session.' });
    }

    let { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    // Auto-heal: if the profile row is missing (e.g. the account was created
    // before the `on_auth_user_created` trigger was installed), create it now.
    if (!profile) {
      const meta = authData.user.user_metadata || {};
      const roleType = meta.role_type === 'officer' ? 'officer' : 'resident';
      const fullName = meta.full_name || authData.user.email?.split('@')[0] || 'User';
      const { data: created } = await supabase
        .from('users')
        .upsert(
          { id: authData.user.id, full_name: fullName, role_type: roleType },
          { onConflict: 'id' }
        )
        .select()
        .single();
      profile = created;
    }

    if (!profile) {
      return res.status(401).json({ error: 'User profile not found.' });
    }

    req.authUser = authData.user;
    req.user = profile;
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Restricts a route to a specific role (e.g. 'officer'). */
export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (req.user.role_type !== role) {
      return res.status(403).json({ error: `Requires ${role} role.` });
    }
    return next();
  };
}
