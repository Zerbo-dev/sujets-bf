import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/**
 * Vérifie côté serveur, à chaque appel, que l'utilisateur connecté a le rôle "admin"
 * en relisant la table `profiles` en base (jamais une donnée envoyée par le client).
 * À appeler en haut de chaque Server Component / Route Handler sous /admin.
 */
export async function requireAdmin() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/connexion?next=/admin');
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error || profile?.role !== 'admin') {
    redirect('/');
  }

  return { user, profile };
}

/** Variante qui renvoie l'utilisateur connecté ou redirige vers /connexion. */
export async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/connexion');
  }

  return user;
}
