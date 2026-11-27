import { useState } from 'react';
import { ChevronLeft, ChevronRight, Shuffle } from 'lucide-react';
import { DAILY_SPACE_FACTS } from '../data/celestialCatalog';

interface DailyFactsViewProps {
  onRandomDiscovery: () => void;
}

export default function DailyFactsView({ onRandomDiscovery }: DailyFactsViewProps) {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  const [factIndex, setFactIndex] = useState<number>(dayOfYear % DAILY_SPACE_FACTS.length);

  const currentFact = DAILY_SPACE_FACTS[factIndex];

  const handlePrevFact = () => {
    setFactIndex((prev) => (prev - 1 + DAILY_SPACE_FACTS.length) % DAILY_SPACE_FACTS.length);
  };

  const handleNextFact = () => {
    setFactIndex((prev) => (prev + 1) % DAILY_SPACE_FACTS.length);
  };

  return (
    <section className="relative z-10 py-10 pb-20 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-medium tracking-[0.18em] text-violet-300">
              VERIFIED ASTRONOMY INSIGHTS
            </p>
            <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Daily Space Facts
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Bite-sized astronomical science sourced from NASA, ESA, JPL, and Space Telescope missions.
            </p>
          </div>

          <button
            type="button"
            onClick={onRandomDiscovery}
            className="inline-flex min-h-[40px] shrink-0 items-center gap-2 self-start rounded-lg bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-sky-400 sm:self-auto"
          >
            <Shuffle className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Random Space Discovery</span>
          </button>
        </div>

        {/* Featured Spotlight Fact */}
        <div className="cosmos-glass cosmos-glow-violet mt-8 rounded-2xl p-6 sm:p-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-semibold tracking-[0.16em] text-sky-300">
              FEATURED FACT · {currentFact.topic.toUpperCase()}
            </span>
            <span className="font-mono text-xs text-slate-400 tabular-nums">
              {String(factIndex + 1).padStart(2, '0')} / {String(DAILY_SPACE_FACTS.length).padStart(2, '0')}
            </span>
          </div>

          <h2 className="mt-4 max-w-4xl text-balance text-2xl font-bold leading-snug text-white sm:text-3xl">
            {currentFact.fact}
          </h2>

          <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-300">
            {currentFact.detail}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
            <p className="text-xs text-slate-400">
              Source: <strong className="font-medium text-slate-200">{currentFact.source}</strong>
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevFact}
                aria-label="Previous space fact"
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>
              <button
                type="button"
                onClick={handleNextFact}
                aria-label="Next space fact"
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* All Verified Facts Index */}
        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
          {DAILY_SPACE_FACTS.map((item, idx) => {
            const isSelected = idx === factIndex;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setFactIndex(idx)}
                className={`cosmos-glass-subtle flex flex-col justify-between rounded-xl p-5 text-left transition-all duration-150 ${
                  isSelected
                    ? 'border-sky-400/60 bg-sky-500/10'
                    : 'hover:border-white/25 hover:bg-white/[0.03]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-medium text-sky-300">{item.topic}</span>
                    <span className="font-mono text-slate-500 tabular-nums">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="mt-2 text-base font-semibold text-white">{item.fact}</h3>
                </div>
                <p className="mt-3 text-xs text-slate-400">{item.source}</p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
