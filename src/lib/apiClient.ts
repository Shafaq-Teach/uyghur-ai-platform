import { supabase } from './supabase';

/**
 * Enhanced fetch wrapper that automatically injects the current Supabase session's
 * Bearer token into the Authorization header so all server-side API endpoints can
 * securely verify identity and handle atomic coin deductions.
 */
export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers || {});

  // If not already set, default to application/json for non-FormData
  if (!headers.has('Content-Type') && !(init?.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${session.access_token}`);
    }
  } catch (err) {
    console.warn('apiFetch: could not get session token', err);
  }

  return fetch(input, {
    ...init,
    headers,
  });
}
