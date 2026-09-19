import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

// Layout partagé par toutes les pages publiques (accueil, connexion,
// inscription, contribuer, mes-contributions). /admin a son propre shell
// (sidebar) et n'utilise volontairement pas ce header/footer.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
