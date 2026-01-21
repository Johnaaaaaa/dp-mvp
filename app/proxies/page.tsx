// app/proxies/page.tsx

import Link from 'next/link';

type ProxySummaryRow = {
  label: string;
  domain: 'health' | 'match';
  fitPercent: number;
  createdAt: string;
};

const demoRows: ProxySummaryRow[] = [
  {
    label: 'Anya',
    domain: 'health',
    fitPercent: 54,
    createdAt: '2026-01-10',
  },
  {
    label: 'Ex',
    domain: 'health',
    fitPercent: 72,
    createdAt: '2026-01-09',
  },
  {
    label: 'Mentor',
    domain: 'match',
    fitPercent: 68,
    createdAt: '2026-01-11',
  },
];

export default function ProxiesPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-4xl space-y-6 py-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-emerald-400">
            DP · Proxies
          </p>
          <h1 className="text-xl font-semibold text-slate-50">
            Telefonbuch – Demo-Übersicht
          </h1>
          <p className="text-xs text-slate-400">
            Einfache Demo-Liste von Sessions (Self + Proxy) mit Fit-Index. Ziel:
            zeigen, dass aus einzelnen Fällen später ein &quot;Decision
            Network&quot; / Kontaktbuch werden kann.
          </p>
        </header>

        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2 pr-4 text-left font-normal">Label</th>
                  <th className="py-2 px-4 text-left font-normal">Domain</th>
                  <th className="py-2 px-4 text-right font-normal">Fit %</th>
                  <th className="py-2 pl-4 text-right font-normal">
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody>
                {demoRows.map((row, index) => (
                  <tr
                    key={`${row.label}-${row.domain}-${index}`}
                    className="border-b border-slate-900/60 last:border-0"
                  >
                    <td className="py-2 pr-4 text-slate-100">{row.label}</td>
                    <td className="py-2 px-4 text-slate-300">
                      {row.domain === 'health' ? 'Health' : 'Match'}
                    </td>
                    <td className="py-2 px-4 text-right">
                      <span className="font-mono text-slate-100">
                        {row.fitPercent}%
                      </span>
                    </td>
                    <td className="py-2 pl-4 text-right text-slate-300">
                      {row.createdAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="flex justify-end">
          <Link
            href="/"
            className="text-xs text-slate-300 hover:text-emerald-300 underline underline-offset-4"
          >
            Zurück zur Übersicht
          </Link>
        </footer>
      </div>
    </main>
  );
}
