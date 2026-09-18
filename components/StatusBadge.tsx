const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: { label: 'En attente', className: 'bg-amber-100 text-amber-800' },
  reviewing: { label: 'En vérification', className: 'bg-blue-100 text-blue-800' },
  needs_correction: { label: 'Correction demandée', className: 'bg-orange-100 text-orange-800' },
  approved: { label: 'Validé', className: 'bg-green-100 text-green-800' },
  rejected: { label: 'Refusé', className: 'bg-red-100 text-red-800' },
  archived: { label: 'Archivé', className: 'bg-slate-100 text-slate-600' },
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: 'bg-slate-100 text-slate-600' };
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
