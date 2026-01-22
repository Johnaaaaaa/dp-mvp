// app/page.tsx
// Fő landing: innen éred el a Health V1 flow-t, a Match demót és a sandbox /test oldalt.

import Link from 'next/link';

const LANG = 'de' as const;

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-5xl space-y-10 py-10">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-wide text-emerald-400">
            Definitive Protocol · MVP
          </p>
          <h1 className="text-2xl font-semibold text-slate-50">
            Entscheidungsprofil & ProxyFit – technische Demo
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl">
            Diese MVP-Oberfläche zeigt, wie das Entscheidungsprofil (DecisionProfile)
            und der ProxyFit-Index für unterschiedliche Szenarien berechnet und visualisiert
            werden können. Die Inhalte sind Demo-Storys – der Fokus liegt auf der Logik.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          {/* Health V1 */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 flex flex-col justify-between">
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-slate-100">
                Health · End-of-Life Demo
              </h2>
              <p className="text-xs text-slate-300">
                Self- und Proxy-Flow rund um Entscheidungen am Lebensende.
                Session-basierte Ansicht mit Entscheidungsprofil und ProxyFit.
              </p>
            </div>
            <div className="mt-4 flex flex-col gap-2 text-xs">
              <Link
                href="/health"
                className="inline-flex items-center justify-center rounded-md bg-emerald-500 px-3 py-1.5 font-medium text-slate-950 hover:bg-emerald-400 transition"
              >
                Health Flow öffnen
              </Link>
              <Link
                href="/health/session/demo-1"
                className="text-[11px] text-slate-400 hover:text-slate-200 underline-offset-2 hover:underline"
              >
                Nur Session-View Demo anzeigen
              </Link>
            </div>
          </div>

          {/* Proxy Match */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 flex flex-col justify-between">
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-slate-100">
                Proxy Match · Life Decisions
              </h2>
              <p className="text-xs text-slate-300">
                Kurze Story zu Autonomie, Familie und Risikobereitschaft.
                Vergleich von Self- und Proxy-Profil mit FitIndex.
              </p>
            </div>
            <div className="mt-4 flex flex-col gap-2 text-xs">
              <Link
                href="/match/self"
                className="inline-flex items-center justify-center rounded-md bg-slate-100 px-3 py-1.5 font-medium text-slate-900 hover:bg-slate-200 transition"
              >
                Match-Demo starten
              </Link>
              <Link
                href="/match/session"
                className="text-[11px] text-slate-400 hover:text-slate-200 underline-offset-2 hover:underline"
              >
                Session-Ansicht (Demo) öffnen
              </Link>
            </div>
          </div>

          {/* Sandbox / Test */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 flex flex-col justify-between">
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-slate-100">
                Engine Sandbox / Test
              </h2>
              <p className="text-xs text-slate-300">
                Interne Testoberfläche für das DecisionProfile. Nicht für Enduser –
                nur zum Experimentieren mit der Engine.
              </p>
            </div>
            <div className="mt-4 flex flex-col gap-2 text-xs">
              <Link
                href="/test"
                className="inline-flex items-center justify-center rounded-md border border-slate-600 px-3 py-1.5 font-medium text-slate-100 hover:bg-slate-800 transition"
              >
                Sandbox öffnen
              </Link>
            </div>
          </div>
        </section>

        <footer className="border-t border-slate-800 pt-4">
          <p className="text-[11px] text-slate-500">
            Stand: MVP-Tech-Demo. Daten werden nur im Speicher gehalten (In-Memory),
            kein Login, keine Persistenz. Fokus: Logik & Oberflächenstruktur.
          </p>
        </footer>
      </div>
    </main>
  );
}

