// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://lstuaiflqdgmnqzwtkzy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdHVhaWZscWRnbW5xend0a3p5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1Njc3NzgsImV4cCI6MjA2MTE0Mzc3OH0.qYjfwzcG8Vp8xHbkR3Fcpu8Q6s9Wi8Ui0niSjDwHAVY";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);