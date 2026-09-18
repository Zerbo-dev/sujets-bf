'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminActionButtons({ contributionId }: { contributionId: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<'idle' | 'needs_correction' | 'reject'>('idle');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendAction(action: 'approve' | 'needs_correction' | 'reject') {
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/admin/contributions/${contributionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, comment: comment || undefined }),
    });
    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? 'Une erreur est survenue.');
      return;
    }

    setMode('idle');
    setComment('');
    router.refresh();
  }

  if (mode === 'needs_correction' || mode === 'reject') {
    const label = mode === 'needs_correction' ? 'Demander une correction' : 'Refuser le document';
    return (
      <div className="space-y-3 rounded-md border border-slate-200 p-4">
        <p className="text-sm font-medium">{label}</p>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder={
            mode === 'needs_correction'
              ? 'Ex : la matière indiquée ne correspond pas au document…'
              : 'Motif du refus…'
          }
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setMode('idle')}
            disabled={loading}
            className="rounded-md bg-slate-200 px-4 py-2 text-sm font-medium"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={() => sendAction(mode)}
            disabled={loading || !comment.trim()}
            className={`rounded-md px-4 py-2 text-sm font-medium text-white ${
              mode === 'reject' ? 'bg-red-600' : 'bg-orange-500'
            } disabled:opacity-50`}
          >
            {loading ? 'Envoi…' : 'Confirmer'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => sendAction('approve')}
          disabled={loading}
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          ✓ Valider
        </button>
        <button
          type="button"
          onClick={() => setMode('needs_correction')}
          disabled={loading}
          className="rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          ✎ Demander une correction
        </button>
        <button
          type="button"
          onClick={() => setMode('reject')}
          disabled={loading}
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          ✕ Refuser
        </button>
      </div>
    </div>
  );
}
