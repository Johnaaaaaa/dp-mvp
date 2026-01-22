// app/match/session/page.tsx
// Life Decisions – Match Session View (demo, statikus Self vs Proxy összehasonlítás)

import { matchStoryV1 } from '@/data/matchStory';
import { categoryDefinitionsById } from '@/data/categories';
import { calculateDecisionProfile, calculateProxyFit } from '@/lib/dpEngine';
import type { Answer, Lang } from '@/types/dp';

const LANG: Lang = 'de';

// Demo-válaszok a Life Decisions (matchStoryV1) kérdéseire
// FIGYELEM: Answer = { questionId, optionId } → NINCS questionDomain
const EXAMPLE_SELF_ANSWERS: Answer[] = [
  { questionId: 'match_autonomy', optionId: 'autonomy_high' },
  { questionId: 'match_family', optionId: 'family_medium' },
  { questionId: 'match_risk', optionId: 'risk_medium' },
];

const EXAMPLE_PROXY_ANSWERS: Answer[] = [
  { questionId: 'match_autonomy', optionId: 'autonomy_medium' },
  { questionId: 'match_family', optionId: 'family_high' },
  { questionId: 'match_risk', optionId: 'risk_low' },
];

// Fit-index szint label (csak UI, a dpEngine belül ettől független)
function getFitLevelLabel(fitIndex: number): string {
  if (fitIndex < 50) return 'Low Fit';
  if (fitIndex < 80) return 'Medium Fit';
  return 'High Fit';
}

type MatchSessionPageProps = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default function MatchSessionPage(props: MatchSessionPageProps) {
  const searchParams = props.searchParams ?? {};
  const sessionIdParam = searchParams['sessionId'];
  const sessionId =
    Array.isArray(sessionIdParam) ? sessionIdParam[0] : sessionIdParam ?? null;

  // matchStoryV1 kompatibilis a Story típussal, itt nem szőrözünk TS-sel
  const story: any = matchStoryV1;

  const selfProfile = calculateDecisionProfile(story, EXAMPLE_SELF_ANSWERS);
  const proxyProfile = calculateDecisionProfile(story, EXAMPLE_PROXY_ANSWERS);
  const proxyFit = calculateProxyFit(selfProfile, proxyProfile);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-5xl space-y-8 py-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Match – Session View
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold">
            Vergleich Self / Proxy – Life Decisions
          </h1>
          <p className="text-sm text-slate-300">
            Demo-Ansicht für das Match-Modul: zwei Beispielprofile (Self / Proxy)
            werden anhand der Life Decisions Story verglichen, inklusive ProxyFit.
          </p>
          {sessionId && (
            <p className="text-[11px] text-slate-500">
              Session-ID (nur Anzeige, aktuell kein Live-Backend-Load):{' '}
              <span className="font-mono text-slate-300">{sessionId}</span>
            </p>
          )}
        </header>

        <section className="grid md:grid-cols-3 gap-6">
          {/* Self-Profil */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-slate-200">
              Self-Profil (Demo)
            </h2>
            <p className="text-xs text-slate-400">
              Fiktive Antworten der Person auf die Life Decisions Fragen.
            </p>
            <ul className="space-y-2 text-xs">
              {selfProfile.categoryScores.map((cat) => {
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
                    key={cat.category}
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
          </div>

          {/* Proxy-Profil */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-slate-200">
              Proxy-Profil (Demo)
            </h2>
            <p className="text-xs text-slate-400">
              Fiktive Stellvertreter-Einschätzung der gleichen Person.
            </p>
            <ul className="space-y-2 text-xs">
              {proxyProfile.categoryScores.map((cat) => {
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
                    key={cat.category}
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
          </div>

          {/* ProxyFit */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-slate-200">ProxyFit</h2>
            <p className="text-xs text-slate-400">
              Aggregierter Fit zwischen Self- und Proxy-Profil über alle
              Life-Decision-Kategorien.
            </p>
            <div className="space-y-2 text-xs">
              <p>
                Gesamt-FitIndex:{' '}
                <span className="font-mono text-slate-100">
                  {proxyFit.fitIndex.toFixed(0)}
                </span>{' '}
                ({getFitLevelLabel(proxyFit.fitIndex)})
              </p>
              <ul className="space-y-1">
                {proxyFit.categories.map((diff) => {
                  const def = categoryDefinitionsById[diff.category];
                  const label = def?.label[LANG] ?? diff.category;

                  return (
                    <li
                      key={diff.category}
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
          </div>
        </section>

        <p className="text-[11px] text-slate-500">
          Hinweis: Diese Seite verwendet aktuell{' '}
          <span className="font-semibold">Demo-Daten</span> für die
          Life-Decision-Profile. Das Wiring zu echten Match-Sessions (Self +
          Proxy Flow) ist der nächste Implementierungsschritt.
        </p>
      </div>
    </main>
  );
}
