import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Safety check for build time / prerendering
    if (!url || !key) {
        // Return a proxy or empty object to avoid build errors
        // during static generation if env vars are missing
        return {} as any;
    }

    return createBrowserClient(url, key, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            flowType: 'pkce',
        }
    });
}
