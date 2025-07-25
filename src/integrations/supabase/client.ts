// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://omijwwvticrqbxqxqwnw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9taWp3d3Z0aWNycWJ4cXhxd253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MDk3MDEsImV4cCI6MjA2ODA4NTcwMX0.9snSmNYWbi3D3uFbpmqqoECIHUfeFbV5UGuJwfmUoM0";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});