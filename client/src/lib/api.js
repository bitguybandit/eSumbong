import axios from 'axios';
import { supabase } from './supabase';

const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({ baseURL });

// A Supabase access token is a JWT; anything else sitting in storage is corrupt
// and must never be forwarded as a credential.
const JWT_SHAPE = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
// Stop using a token shortly before it expires, so a request cannot land on the
// server already dead (which surfaces to the user as a 401).
const EXPIRY_SKEW_SECONDS = 30;

/**
 * Returns the session's access token only when it looks like a live JWT.
 * Guests (no session at all), corrupt tokens, and expired sessions all yield
 * null, so the request leaves anonymously instead of carrying a header the API
 * will reject.
 */
function liveAccessToken(session) {
  const token = session?.access_token;
  if (!token || !JWT_SHAPE.test(token)) return null;

  const expiresAt = Number(session.expires_at);
  if (Number.isFinite(expiresAt) && expiresAt - EXPIRY_SKEW_SECONDS <= Date.now() / 1000) {
    return null;
  }
  return token;
}

// Attach the current Supabase access token to every request.
// Requests may opt out with `skipAuth: true` (e.g. guest submissions).
// Guests have no session at all, and resolving one can throw when storage is
// unavailable (private mode / blocked cookies) — those cases must fall through
// to an unauthenticated request instead of failing it, since public endpoints
// such as POST /uploads accept guests.
api.interceptors.request.use(async (config) => {
  if (config.skipAuth) return config;
  try {
    const { data } = await supabase.auth.getSession();
    const token = liveAccessToken(data?.session);
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    /* no usable session — continue as a guest */
  }
  return config;
});

// Normalize API errors into a single message string, preserving the HTTP status.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err?.response?.data?.error || err?.message || 'Something went wrong.';
    const normalized = new Error(message);
    normalized.status = err?.response?.status;
    return Promise.reject(normalized);
  }
);

export default api;
