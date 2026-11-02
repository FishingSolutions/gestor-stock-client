import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase no está configurado. Definí VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY ' +
      'en el archivo .env (podés copiar .env.example) y reiniciá el servidor de Vite.',
  )
}

/**
 * Cliente único de Supabase para todo el frontend.
 *
 * La anon key es pública por diseño: la seguridad de los datos depende de las
 * políticas RLS (Row Level Security) de cada tabla en Supabase.
 * Nunca expongas la service_role key en el frontend.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
