import { CATEGORIES } from '../data/celestialCatalog';
import type { CategoryId } from '../types/cosmos';

interface FooterProps {
  onSelectCategory: (cat: CategoryId) => void;
  onGoHome: () => void;
}

export default function Footer({ onSelectCategory, onGoHome }: FooterProps) {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-[#05070C]/90 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
          <div className="max-w-md">
            <button
              type="button"
              onClick={onGoHome}
              className="text-base font-bold tracking-[0.18em] text-white hover:text-sky-300"
            >
              COSMOS
            </button>
            <p className="mt-3 text-xs leading-relaxed text-slate-400">
              Interactive astronomical exploration platform powered by official NASA Image &amp; Video Library archives, NASA Astronomy Picture of the Day (APOD), and ESA/JPL scientific reference datasets.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs sm:grid-cols-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className="text-left text-slate-400 transition-colors hover:text-sky-300"
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-between gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center">
          <p>COSMOS – Explore the Universe · Educational Astronomy Platform</p>
          <p>Imagery credits belong to NASA, ESA, CSA, STScI, JPL-Caltech, and EHT Collaboration.</p>
        </div>
      </div>
    </footer>
  );
}
