'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Exam, SeriesRow, Subject } from '@/types/database';
import { MAX_FILE_SIZE_MB, SESSIONS } from '@/lib/validation/contribution';

const SESSION_LABELS: Record<(typeof SESSIONS)[number], string> = {
  normale: 'Session normale',
  remplacement: 'Session de remplacement',
  rattrapage: 'Rattrapage',
  autre: 'Autre',
  non_precisee: 'Non précisée',
};

const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

interface Props {
  exams: Exam[];
  series: SeriesRow[];
  subjects: Subject[];
}

type Step = 1 | 2 | 3;

export default function ContributeForm({ exams, series, subjects }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);

  const [examId, setExamId] = useState('');
  const [seriesId, setSeriesId] = useState<string>(''); // '' => "Non applicable"
  const [subjectId, setSubjectId] = useState('');
  const [year, setYear] = useState('');
  const [session, setSession] = useState<(typeof SESSIONS)[number]>('non_precisee');
  const [title, setTitle] = useState('');
  const [titleTouched, setTitleTouched] = useState(false);
  const [description, setDescription] = useState('');
  const [source, setSource] = useState('');

  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const availableSeries = useMemo(
    () => series.filter((s) => s.exam_id === examId),
    [series, examId]
  );

  const examName = exams.find((e) => e.id === examId)?.name ?? '';
  const seriesName = series.find((s) => s.id === seriesId)?.name ?? '';
  const subjectName = subjects.find((s) => s.id === subjectId)?.name ?? '';

  // Titre auto-suggéré, modifiable par l'utilisateur (§6).
  const suggestedTitle = useMemo(() => {
    if (!examName || !subjectName || !year) return '';
    const parts = [examName, seriesName, subjectName, year].filter(Boolean);
    return parts.join(' — ');
  }, [examName, seriesName, subjectName, year]);

  const effectiveTitle = titleTouched ? title : suggestedTitle;

  function handleFileChange(selected: File | null) {
    setFileError(null);
    if (!selected) {
      setFile(null);
      return;
    }
    const ext = '.' + selected.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setFileError('Formats acceptés : PDF, JPG, JPEG, PNG.');
      setFile(null);
      return;
    }
    if (selected.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setFileError(`Fichier trop volumineux (max ${MAX_FILE_SIZE_MB} Mo).`);
      setFile(null);
      return;
    }
    setFile(selected);
  }

  function canGoToStep2() {
    return Boolean(examId && subjectId && year && session);
  }

  async function handleSubmit() {
    if (!file) return;
    setSubmitting(true);
    setSubmitError(null);

    const formData = new FormData();
    formData.set('examId', examId);
    formData.set('seriesId', seriesId || '');
    formData.set('subjectId', subjectId);
    formData.set('year', year);
    formData.set('session', session);
    formData.set('title', effectiveTitle);
    formData.set('description', description);
    formData.set('source', source);
    formData.set('file', file);

    try {
      const res = await fetch('/api/contributions', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error ?? "Une erreur est survenue.");
        setSubmitting(false);
        return;
      }

      router.push('/mes-contributions');
      router.refresh();
    } catch {
      setSubmitError('Erreur réseau. Vérifiez votre connexion et réessayez.');
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <StepIndicator step={step} />

      {step === 1 && (
        <div className="mt-6 space-y-4">
          <h2 className="font-semibold">Étape 1 sur 3 : Informations</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Examen *">
              <select
                value={examId}
                onChange={(e) => {
                  setExamId(e.target.value);
                  setSeriesId('');
                }}
                className="input"
              >
                <option value="">Sélectionner…</option>
                {exams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Année *">
              <input
                type="number"
                inputMode="numeric"
                min={1960}
                max={new Date().getFullYear()}
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2020"
                className="input"
              />
            </Field>

            <Field label="Série / classe">
              <select
                value={seriesId}
                onChange={(e) => setSeriesId(e.target.value)}
                disabled={availableSeries.length === 0}
                className="input"
              >
                <option value="">Non applicable</option>
                {availableSeries.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Matière *">
              <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="input">
                <option value="">Sélectionner…</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Session *">
              <select
                value={session}
                onChange={(e) => setSession(e.target.value as (typeof SESSIONS)[number])}
                className="input"
              >
                {SESSIONS.map((s) => (
                  <option key={s} value={s}>
                    {SESSION_LABELS[s]}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Titre *">
              <input
                type="text"
                value={effectiveTitle}
                onChange={(e) => {
                  setTitleTouched(true);
                  setTitle(e.target.value);
                }}
                placeholder="Titre généré automatiquement"
                className="input"
              />
            </Field>
          </div>

          <Field label="Description (facultatif)">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="input"
            />
          </Field>

          <Field label="Source (facultatif)">
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Ex : ancien document familial, professeur, établissement…"
              className="input"
            />
          </Field>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              disabled={!canGoToStep2()}
              onClick={() => setStep(2)}
              className="btn-primary"
            >
              Suivant →
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="mt-6 space-y-4">
          <h2 className="font-semibold">Étape 2 sur 3 : Document</h2>

          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-slate-300 px-6 py-10 text-center">
            <span className="font-medium">Sélectionnez un fichier</span>
            <span className="text-sm text-slate-500">
              PDF, JPG, JPEG ou PNG (max. {MAX_FILE_SIZE_MB} Mo)
            </span>
            <span className="btn-primary mt-2">Choisir un fichier</span>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            />
          </label>

          {file && (
            <div className="flex items-center justify-between rounded-md border border-slate-200 px-4 py-2 text-sm">
              <span>
                {file.name} — {(file.size / 1024 / 1024).toFixed(1)} Mo
              </span>
              <button type="button" onClick={() => setFile(null)} className="text-slate-500">
                ✕
              </button>
            </div>
          )}
          {fileError && <p className="text-sm text-red-600">{fileError}</p>}

          <div className="flex justify-between pt-2">
            <button type="button" onClick={() => setStep(1)} className="btn-secondary">
              ← Retour
            </button>
            <button type="button" disabled={!file} onClick={() => setStep(3)} className="btn-primary">
              Suivant →
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="mt-6 space-y-4">
          <h2 className="font-semibold">Étape 3 sur 3 : Vérification</h2>

          <dl className="grid grid-cols-2 gap-y-2 rounded-md bg-slate-50 p-4 text-sm">
            <dt className="text-slate-500">Examen</dt>
            <dd>{examName}</dd>
            <dt className="text-slate-500">Année</dt>
            <dd>{year}</dd>
            <dt className="text-slate-500">Série</dt>
            <dd>{seriesName || 'Non applicable'}</dd>
            <dt className="text-slate-500">Matière</dt>
            <dd>{subjectName}</dd>
            <dt className="text-slate-500">Session</dt>
            <dd>{SESSION_LABELS[session]}</dd>
            <dt className="text-slate-500">Titre</dt>
            <dd>{effectiveTitle}</dd>
            <dt className="text-slate-500">Fichier</dt>
            <dd>{file?.name}</dd>
          </dl>

          <p className="rounded-md bg-blue-50 px-4 py-3 text-sm text-blue-800">
            Votre document sera envoyé dans Google Drive et restera en attente
            de vérification par un administrateur.
          </p>

          {submitError && <p className="text-sm text-red-600">{submitError}</p>}

          <div className="flex justify-between pt-2">
            <button type="button" onClick={() => setStep(2)} className="btn-secondary" disabled={submitting}>
              ← Retour
            </button>
            <button type="button" onClick={handleSubmit} disabled={submitting} className="btn-primary">
              {submitting ? 'Envoi…' : 'Envoyer le document'}
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid #cbd5e1;
          border-radius: 0.375rem;
          padding: 0.5rem 0.75rem;
        }
        .btn-primary {
          background: #2563eb;
          color: white;
          font-weight: 500;
          border-radius: 0.375rem;
          padding: 0.625rem 1.25rem;
        }
        .btn-primary:disabled {
          opacity: 0.5;
        }
        .btn-secondary {
          background: #e2e8f0;
          font-weight: 500;
          border-radius: 0.375rem;
          padding: 0.625rem 1.25rem;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function StepIndicator({ step }: { step: Step }) {
  const steps = [
    { n: 1, label: 'Informations' },
    { n: 2, label: 'Document' },
    { n: 3, label: 'Vérification' },
  ];
  return (
    <div className="flex items-center gap-2 text-xs">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center gap-2">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full ${
              step >= s.n ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
            }`}
          >
            {s.n}
          </span>
          <span className={step >= s.n ? 'font-medium' : 'text-slate-400'}>{s.label}</span>
          {i < steps.length - 1 && <span className="mx-1 h-px w-6 bg-slate-300" />}
        </div>
      ))}
    </div>
  );
}
