console.log('🔥 SUPABASE CLIENT FILE IS LOADING')
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kqylkyofwhiohgttlgqb.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your_supabase_anon_key_here'

// Debug: Check if the environment variable is being read
console.log('Supabase Key:', supabaseKey === 'your_supabase_anon_key_here' ? 'Using fallback' : 'Using env var')
console.log('All env vars:', Object.keys(import.meta.env))

const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase
