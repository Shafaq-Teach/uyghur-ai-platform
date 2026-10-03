import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://glujfydopxhfhjdvtpxf.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsdWpmeWRvcHhoZmhqZHZ0cHhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwMjI4MTUsImV4cCI6MjEwNjU5ODgxNX0.xSSDzkjfJvuRMrzi6BB5vrxUMBvpkf5B4HRa98bMxPY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
