import { createClient } from "@supabase/supabase-js";

// Platzhalter statt leerem String: verhindert, dass createClient() beim
// Server-Rendering/Build wirft, solange NEXT_PUBLIC_SUPABASE_URL noch nicht
// gesetzt ist. Ohne echte Werte schlagen Requests dann zur Laufzeit fehl
// statt die Seite gar nicht erst zu bauen.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
