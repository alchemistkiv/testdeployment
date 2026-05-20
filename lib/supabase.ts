import { createClient } from "@supabase/supabase-js";

// İstemciyi istek anında kuruyoruz; böylece env değişkenleri eksikken
// build sırasında patlamaz (Vercel'de env'leri girince çalışır).
export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase env değişkenleri eksik. Vercel'de NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY ekle."
    );
  }

  return createClient(url, anonKey);
}
