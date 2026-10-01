import { createClient } from '@supabase/supabase-js'
import './boxauth.js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// The session lives in the shared boxofjelly.xyz cookie (see boxauth.js), so
// signing in at accounts.boxofjelly.xyz signs you in here too.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, window.BoxAuth.clientOptions())
