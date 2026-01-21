'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import type { Answer, Lang } from '@/types/dp';
import { demoStory } from '@/data/stories';
import { categoryDefinitionsById } from '@/data/categories';
import {
  calculateDecisionProfile,
  calculateProxyFit,
} from '@/lib/dpEngine';

const LANG: Lang = 'de';

type LoadedSession = {
  id: string;
  storyId: string;
  selfAnswers?: Answer[];
  proxyAnswers?: Answer[];
  selfLabel?: string;
  proxyLabel?: string;
  createdAt?: string;
};

function t(localized: any): string {
  if (localized == null) return '';
  if (typeof localized === 'string') return localized;

  if (typeof localized === 'object') {
    const byLang = (localized as Record<string, unknown>)[LANG];
    if (typeof byLang === 'string') return byLang;

    const deVal = (localized as Record<string, unknown>)['de'];
    if (typeof deVal === 'string') return deVal;

    const enVal = (localized as Record<string, unknown>)['en'];
    if (typeof enVal === 'string') return enVal;
  }
  return '';
}

export default function HealthSessionPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId'); // string | null

  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [session, setSession] = useState<LoadedSession | null>(null);

  useEffect(() => {
  // Lokális másolat, amin TS tud szűkíteni
  const id = sessionId ?? '';

  if (!sessionId) {
    setErrorMessage('Keine Session-ID angegeben.');
    setLoading(false);
    return;
  }

  let cancelled = false;

  async function loadSession() {
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(
        `/api/health/session?id=${encodeURIComponent(id)}`,
      );

      if (!response.ok) {
        let msg = 'Session konnte nicht geladen werden.';
        try {
          const data = await response.json();
          if (typeof data.error === 'string') {
            msg = data.error;
          }
        } catch {
          // ignore
        }
        if (!cancelled) {
          setErrorMessage(msg);
          setSession(null);
          setLoading(false);
        }
        return;
      }

      const data = (await response.json()) as LoadedSession;
      if (!cancelled) {
        setSession(data);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading health session', error);
      if (!cancelled) {
        setErrorMessage('Interner Fehler beim Laden der Session.');
        setSession(null);
        setLoading(false);
      }
    }
  }

  loadSession();

  return () => {
    cancelled = true;
  };
}, [sessionId]);


  // Story – most egyetlen demo story, de később storyId alapján választhatjuk
  const story = demoStory as any;

  // Self / Proxy válaszok a session-ből
  const selfAnswers: Answer[] = (session?.selfAnswers || []) as Answer[];
  const proxyAnswers: Answer[] = (session?.proxyAnswers || []) as Answer[];

  const selfProfile =
    selfAnswers.length > 0
      ? calculateDecisionProfile(story, selfAnswers)
      : null;

  const proxyProfile =
    proxyAnswers.length > 0
      ? calculateDecisionProfile(story, proxyAnswers)
      : null;

  const proxyFit =
    selfProfile && proxyProfile
      ? calculateProxyFit(selfProfile, proxyProfile)
      : null;

  const selfLabel = session?.selfLabel || 'Patient:in';
  const proxyLabel = session?.proxyLabel || 'nicht benannt';

  if (!sessionId) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
        <div className="max-w-lg space-y-4 text-center">
          <h1 className="text-2xl font-semibold">
            Keine Session-ID angegeben.
          </h1>
          <p className="text-sm text-slate-300">
            Bitte rufe diese Seite mit einem gültigen <code>sessionId</code>{' '}
            Query-Parameter auf.
          </p>
          <Link
            href="/health"
            className="inline-flex items-center justify-center rounded-md border border-slate-700 bg-slate-900 px-4 py-2 text-sm"
          >
            Zurück zur Health-Übersicht
          </Link>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
        <div className="max-w-lg space-y-3 text-center">
          <h1 className="text-2xl font-semibold">Session wird geladen...</h1>
          <p className="text-sm text-slate-300">
            Bitte warten. Self- und Proxy-Profil werden aufgebaut.
          </p>
        </div>
      </main>
    );
  }

  if (errorMessage || !session) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
        <div className="max-w-lg space-y-4 text-center">
          <h1 className="text-2xl font-semibold">Session nicht verfügbar.</h1>
          <p className="text-sm text-red-400">{errorMessage}</p>
          <Link
            href="/health"
            className="inline-flex items-center justify-center rounded-md border border-slate-700 bg-slate-900 px-4 py-2 text-sm"
          >
            Zurück zur Health-Übersicht
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-5xl space-y-8 py-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Health / Doctor View
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold">
            Session-Übersicht
          </h1>
          <p className="text-sm text-slate-300">
            Übersicht über Self- und Proxy-Profil sowie ProxyFit für eine
            konkrete Session.
          </p>
          <div className="text-xs text-slate-400 space-y-1 mt-2">
            <p>
              <span className="font-semibold text-slate-200">Session-ID:</span>{' '}
              <span className="font-mono">{session.id}</span>
            </p>
            <p>
              <span className="font-semibold text-slate-200">
                Fall / Patient:in:
              </span>{' '}
              {selfLabel}
            </p>
            <p>
              <span className="font-semibold text-slate-200">
                Stellvertreter:in:
              </span>{' '}
              {proxyLabel}
            </p>
          </div>
        </header>

        <section className="grid md:grid-cols-3 gap-6">
          {/* Self-Profil */}
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
                {selfProfile.categoryScores.map((cat, index) => {
                  const def = categoryDefinitionsById[cat.category];
                  const label = def?.label[LANG] ?? cat.category;

                  const colorClass =
                    cat.color === 'red'
                      ? 'bg-red-500/20 text-red-300 border-red-500/40'
                      : cat.color === 'yellow'
                      ? 'bg-yellow-500/20 text-yellow-200 border-yellow-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

                  return (
                    <li
                      key={`${cat.category}-${index}`}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="text-slate-200">{label}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full border ${colorClass}`}
                      >
                        {cat.score.toFixed(1)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Proxy-Profil */}
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
                {proxyProfile.categoryScores.map((cat, index) => {
                  const def = categoryDefinitionsById[cat.category];
                  const label = def?.label[LANG] ?? cat.category;

                  const colorClass =
                    cat.color === 'red'
                      ? 'bg-red-500/20 text-red-300 border-red-500/40'
                      : cat.color === 'yellow'
                      ? 'bg-yellow-500/20 text-yellow-200 border-yellow-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

                  return (
                    <li
                      key={`${cat.category}-${index}`}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="text-slate-200">{label}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full border ${colorClass}`}
                      >
                        {cat.score.toFixed(1)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* ProxyFit */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-slate-200">ProxyFit</h2>
            {!proxyFit && (
              <p className="text-xs text-slate-400">
                ProxyFit wird berechnet, sobald sowohl Self- als auch
                Proxy-Profil vorliegen (mit gemeinsamen Kategorien).
              </p>
            )}
            {proxyFit && (
              <div className="space-y-3 text-xs">
                <p>
                  Gesamt-FitIndex:{' '}
                  <span className="font-mono text-slate-100">
                    {proxyFit.fitIndex.toFixed(0)}
                  </span>{' '}
                  ({proxyFit.fitLevel})
                </p>
                <ul className="space-y-1">
                  {proxyFit.categories.map((diff, index) => {
                    const def = categoryDefinitionsById[diff.category];
                    const label = def?.label[LANG] ?? diff.category;
                    return (
                      <li
                        key={`${diff.category}-${index}`}
                        className="flex items-center justify-between gap-2"
                      >
                        <span className="text-slate-200">{label}</span>
                        <span className="text-slate-300">
                          Self {diff.selfScore.toFixed(1)} | Proxy{' '}
                          {diff.proxyScore.toFixed(1)} | Diff{' '}
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

        <div className="flex items-center justify-between text-xs text-slate-500">
          <Link href="/health" className="hover:text-slate-200 underline">
            Zurück zur Health-Übersicht
          </Link>
        </div>
      </div>
    </main>
  );
}
