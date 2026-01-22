'use client';

import { useEffect, useMemo, useState } from 'react';
import { demoStory } from '@/data/stories';
import { categoryDefinitionsById } from '@/data/categories';
import {
  calculateDecisionProfile,
  calculateProxyFit,
} from '@/lib/dpEngine';
import type {
  Session,
  DecisionProfile,
  ProxyFitResult,
} from '@/types/dp';

const LANG = 'de' as const;

function formatDateTime(value: string | null | undefined): string {
  if (!value) return '–';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('de-CH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusLabel(status: Session['status']): string {
  switch (status) {
    case 'proxy_pending':
      return 'Self ausgefüllt, Proxy ausstehend';
    case 'completed':
      return 'Self & Proxy abgeschlossen';
    case 'open':
      return 'In Bearbeitung';
    case 'closed':
      return 'Abgeschlossen (archiviert)';
    default:
      return status;
  }
}

function getFitLevelLabel(fitIndex: number): string {
  if (fitIndex < 50) return 'Low Fit';
  if (fitIndex < 80) return 'Medium Fit';
  return 'High Fit';
}

export default function HealthSessionPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // URL-ből szedjük ki a sessionId-t, NEM useSearchParams-szel
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get('sessionId');

    if (!id) {
      setErrorMessage('Fehler: Session-ID fehlt in der URL.');
      setLoading(false);
      return;
    }

    setSessionId(id);

    const load = async () => {
      try {
        const res = await fetch(`/api/health/session?id=${encodeURIComponent(id)}`);
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          const msg =
            (data && (data.error as string | undefined)) ||
            'Fehler beim Laden der Session.';
          setErrorMessage(msg);
          setLoading(false);
          return;
        }

        const data = (await res.json()) as Session;
        setSession(data);
        setLoading(false);
      } catch (err) {
        console.error('Error loading health session', err);
        setErrorMessage('Interner Fehler beim Laden der Session.');
        setLoading(false);
      }
    };

    load();
  }, []);

    // demoStory-t "kilazítjuk" az engine számára, hogy ne zavarjon a readonly
  const storyForEngine = demoStory as any;

  const selfProfile: DecisionProfile | null = useMemo(() => {
    if (!session || !session.selfAnswers || !session.selfAnswers.length) {
      return null;
    }
    return calculateDecisionProfile(storyForEngine, session.selfAnswers);
  }, [session]);

  const proxyProfile: DecisionProfile | null = useMemo(() => {
    if (!session || !session.proxyAnswers || !session.proxyAnswers.length) {
      return null;
    }
    return calculateDecisionProfile(storyForEngine, session.proxyAnswers);
  }, [session]);


  const proxyFit: ProxyFitResult | null = useMemo(() => {
    if (!selfProfile || !proxyProfile) return null;
    return calculateProxyFit(selfProfile, proxyProfile);
  }, [selfProfile, proxyProfile]);

  // 0) sessionId még nem resolve-olódott → initial loading
  if (loading && !errorMessage && !sessionId) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-4">
          <h1 className="text-2xl font-semibold">Health – Session</h1>
          <p className="text-sm text-slate-300">
            Session wird geladen...
          </p>
        </div>
      </main>
    );
  }

  // 1) explicit hiba (hiányzó ID vagy fetch error)
  if (errorMessage) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-4">
          <h1 className="text-2xl font-semibold">Health – Session</h1>
          <p className="text-sm text-red-400">{errorMessage}</p>
          {sessionId && (
            <p className="text-xs text-slate-500">
              Session-ID: <span className="font-mono">{sessionId}</span>
            </p>
          )}
        </div>
      </main>
    );
  }

  // 2) nincs session-adat
  if (!session) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-4">
          <h1 className="text-2xl font-semibold">Health – Session</h1>
          <p className="text-sm text-slate-300">
            Keine Session-Daten gefunden.
          </p>
          {sessionId && (
            <p className="text-xs text-slate-500">
              Session-ID: <span className="font-mono">{sessionId}</span>
            </p>
          )}
        </div>
      </main>
    );
  }

  const createdAtLabel = formatDateTime(session.createdAt);
  const updatedAtLabel = formatDateTime(session.updatedAt);
  const statusLabel = getStatusLabel(session.status);
  const selfLabel = session.selfLabel || 'Patient:in';
  const proxyLabel = session.proxyLabel || 'nicht benannt';

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-5xl space-y-8 py-8">
        {/* Header */}
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Health – Doctor View
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold">
            Session-Übersicht
          </h1>
          <div className="grid gap-3 text-xs text-slate-300 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1">
              <p className="text-slate-400">Session-ID</p>
              <p className="font-mono text-[11px] break-all text-slate-100">
                {session.id}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-slate-400">Status</p>
              <p>{statusLabel}</p>
            </div>
            <div className="space-y-1">
              <p className="text-slate-400">Fall / Person</p>
              <p>{selfLabel}</p>
            </div>
            <div className="space-y-1">
              <p className="text-slate-400">Stellvertreter:in</p>
              <p>{proxyLabel}</p>
            </div>
            <div className="space-y-1">
              <p className="text-slate-400">Erstellt</p>
              <p>{createdAtLabel}</p>
            </div>
            <div className="space-y-1">
              <p className="text-slate-400">Zuletzt aktualisiert</p>
              <p>{updatedAtLabel}</p>
            </div>
          </div>
        </header>

        {/* Ha még nincs Self / Proxy / ProxyFit → info blokk */}
        {!selfProfile && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
            Für diese Session wurden noch keine Self-Antworten erfasst.
          </div>
        )}

        {selfProfile && !proxyProfile && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300 space-y-1">
            <p>
              Self-Profil ist vorhanden, Proxy-Antworten fehlen noch.
            </p>
            <p className="text-slate-400">
              Sobald Proxy-Antworten eingetragen sind, werden hier der
              Vergleich und der ProxyFit-Index angezeigt.
            </p>
          </div>
        )}

        {/* Fő 3-oszlopos blokk: Self, Proxy, ProxyFit */}
        <section className="grid md:grid-cols-3 gap-6">
          {/* Self Profil */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-slate-200">
              Self-Profil
            </h2>
            {!selfProfile && (
              <p className="text-xs text-slate-400">
                Noch keine Self-Antworten vorhanden.
              </p>
            )}
            {selfProfile && (
              <ul className="space-y-2 text-xs">
                {selfProfile.categoryScores.map((cat) => {
                  const def = (categoryDefinitionsById as any)[cat.category];
                  const label =
                    def?.label?.[LANG] ?? (cat.category as string);

                  const colorClass =
                    cat.color === 'red'
                      ? 'bg-red-500/20 text-red-300 border-red-500/40'
                      : cat.color === 'yellow'
                      ? 'bg-yellow-500/20 text-yellow-200 border-yellow-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

                  return (
                    <li
                      key={cat.category}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="text-slate-200">{label}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full border ${colorClass}`}
                      >
                        {cat.score}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Proxy Profil */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-slate-200">
              Proxy-Profil
            </h2>
            {!proxyProfile && (
              <p className="text-xs text-slate-400">
                Noch keine Proxy-Antworten vorhanden.
              </p>
            )}
            {proxyProfile && (
              <ul className="space-y-2 text-xs">
                {proxyProfile.categoryScores.map((cat) => {
                  const def = (categoryDefinitionsById as any)[cat.category];
                  const label =
                    def?.label?.[LANG] ?? (cat.category as string);

                  const colorClass =
                    cat.color === 'red'
                      ? 'bg-red-500/20 text-red-300 border-red-500/40'
                      : cat.color === 'yellow'
                      ? 'bg-yellow-500/20 text-yellow-200 border-yellow-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

                  return (
                    <li
                      key={cat.category}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="text-slate-200">{label}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full border ${colorClass}`}
                      >
                        {cat.score}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* ProxyFit */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-slate-200">
              ProxyFit
            </h2>
            {!proxyFit && (
              <p className="text-xs text-slate-400">
                ProxyFit wird berechnet, sobald Self- und Proxy-Profil
                vorhanden sind.
              </p>
            )}
            {proxyFit && (
              <div className="space-y-3 text-xs">
                <p>
                  Gesamt-FitIndex:{' '}
                  <span className="font-mono text-slate-100">
                    {proxyFit.fitIndex.toFixed(0)}
                  </span>{' '}
                  ({getFitLevelLabel(proxyFit.fitIndex)})
                </p>
                <ul className="space-y-1">
                  {proxyFit.categories.map((diff) => {
                    const def = (categoryDefinitionsById as any)[diff.category];
                    const label =
                      def?.label?.[LANG] ?? (diff.category as string);

                    return (
                      <li
                        key={diff.category}
                        className="flex items-center justify-between gap-2 text-xs"
                      >
                        <span className="text-slate-200">{label}</span>
                        <span className="text-slate-300">
                          Self {diff.selfScore} | Proxy {diff.proxyScore} | Diff{' '}
                          {diff.absDifference.toFixed(1)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </section>

        <footer className="pt-4 border-t border-slate-800 mt-4 text-[11px] text-slate-500 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <p>
            Ansicht: <span className="font-medium">Health / Session</span>{' '}
            – Self vs Proxy vs ProxyFit.
          </p>
          <p>
            Story:{' '}
            <span className="font-mono">{demoStory.id}</span>
          </p>
        </footer>
      </div>
    </main>
  );
}
