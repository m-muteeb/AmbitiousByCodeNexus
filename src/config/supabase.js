
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lqmynriqlokrxhxerqbx.supabase.co'
const supabaseKey = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxbXlucmlxbG9rcnhoeGVycWJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5ODY1NjMsImV4cCI6MjA1NzU2MjU2M30.giGS1DG1cwuKD-PiAOBErsrz3R5W9BuMlnBzJA-Tfy8
const supabase = createClient(supabaseUrl, supabaseKey)