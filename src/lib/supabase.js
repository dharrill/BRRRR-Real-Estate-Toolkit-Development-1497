import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ayaajqywpubtqbksrtwj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5YWFqcXl3cHVidHFia3NydHdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4NDQ3NDcsImV4cCI6MjA2OTQyMDc0N30.Ob_ji9H3wFfJARQ9qmf7IO6L-n27lo9iXf3R90eeHDM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})