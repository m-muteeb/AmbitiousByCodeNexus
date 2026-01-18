// src/config/portal_supabase/portal_supabase_client.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cjzxfilklerlhyysrgye.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqenhmaWxrbGVybGh5eXNyZ3llIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1OTE4ODgsImV4cCI6MjA4NDE2Nzg4OH0.j0Iq1Lnv6HUg1P-Xvtsvu0sZ0APCGSw17ABdHWu3JGU';

export const portalSupabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
    },
});

export default portalSupabase;
