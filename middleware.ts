import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Rafraîchit la session Supabase à chaque requête et protège les routes
 * qui nécessitent une connexion (contribuer, mes-contributions, admin/*).
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const protectedPaths = ['/contribuer', '/mes-contributions', '/admin'];
  const isProtected = protectedPaths.some((p) => request.nextUrl.pathname.startsWith(p));

  if (isProtected && !user) {
    // Un cookie Supabase présent mais un utilisateur nul signifie que la
    // session a expiré (refresh token invalide/périmé) plutôt que "jamais
    // connecté" — on distingue les deux pour afficher le bon écran.
    const hadSession = request.cookies.getAll().some((c) => c.name.startsWith('sb-'));

    const url = request.nextUrl.clone();
    url.pathname = hadSession ? '/session-expiree' : '/connexion';
    if (!hadSession) {
      url.searchParams.set('next', request.nextUrl.pathname);
    }
    return NextResponse.redirect(url);
  }

  // Le contrôle du rôle admin est vérifié à nouveau côté serveur dans chaque
  // route /admin (jamais uniquement ici) — voir lib/auth/requireAdmin.ts
  return response;
}

export const config = {
  matcher: ['/contribuer/:path*', '/mes-contributions/:path*', '/admin/:path*'],
};
