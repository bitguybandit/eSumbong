import axios from 'axios';
import { supabase } from './supabase';

const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({ baseURL });

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
    const token = data?.session?.access_token;
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
