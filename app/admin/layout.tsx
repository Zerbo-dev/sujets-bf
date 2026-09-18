import Link from 'next/link';

const NAV = [
  { href: '/admin', label: 'Tableau de bord' },
  { href: '/admin/contributions', label: 'Toutes les contributions' },
  { href: '/admin/categories', label: 'Catégories' },
  { href: '/admin/historique', label: 'Historique' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-slate-800 bg-slate-950 p-4 text-white">
        <div className="mb-6 flex items-center gap-2 px-2">
          <span className="font-semibold">Sujets BF</span>
        </div>
        <nav className="space-y-1 text-sm">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 hover:bg-slate-800"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 bg-slate-50">{children}</div>
    </div>
  );
}
