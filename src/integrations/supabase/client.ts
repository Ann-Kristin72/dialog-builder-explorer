import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://mkybwfqxawbvqcudosdu.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1reWJ3ZnF4YXdidnFjdWRvc2R1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMTgyMDcsImV4cCI6MjA3MDY5NDIwN30.QjGHUW6G3g15-rqLjNDe8Pxat9l7r5qnl0fLOOYtE-o"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)