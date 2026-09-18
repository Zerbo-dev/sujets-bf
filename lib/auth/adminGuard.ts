import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Variante de requireAdmin() pour les Route Handlers API : renvoie une
 * réponse d'erreur JSON au lieu de rediriger. Revérifie toujours le rôle
 * en base (jamais une valeur envoyée par le client).
 */
export async function getAdminOrError() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: 'Non authentifié.' }, { status: 401 }) };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { error: NextResponse.json({ error: 'Accès réservé aux administrateurs.' }, { status: 403 }) };
  }

  return { user, supabase };
}
