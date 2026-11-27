import { ArrowUpRight } from 'lucide-react';
import { CATEGORIES, CELESTIAL_OBJECTS } from '../data/celestialCatalog';
import type { CategoryId } from '../types/cosmos';
import CosmosImage from './CosmosImage';

interface CategoriesShowcaseProps {
  activeCategory: CategoryId | 'all';
  onSelectCategory: (categoryId: CategoryId) => void;
}

export default function CategoriesShowcase({
  activeCategory,
  onSelectCategory,
}: CategoriesShowcaseProps) {
  return (
    <section id="categories" className="relative z-10 py-10 pb-20 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-medium tracking-[0.18em] text-sky-400">
              ASTRONOMICAL CLASSIFICATION
            </p>
            <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Explore by Cosmic Category
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400 sm:text-base">
              Select any category below to filter and inspect celestial objects curated from NASA, ESA, and Space Telescope archives.
            </p>
          </div>
          <p className="font-mono text-xs text-slate-400 tabular-nums">
            8 categories · {CELESTIAL_OBJECTS.length} cataloged entries
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((cat) => {
            const count = CELESTIAL_OBJECTS.filter((o) => o.category === cat.id).length;
            const isSelected = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`group relative flex h-56 flex-col justify-end overflow-hidden rounded-xl border text-left transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 ${
                  isSelected
                    ? 'border-sky-400/70 ring-1 ring-sky-400/40'
                    : 'border-white/10 hover:border-white/25'
                }`}
              >
                <CosmosImage
                  src={cat.coverImageUrl}
                  alt={cat.label}
                  title={cat.label}
                  className="absolute inset-0 h-full w-full"
                  imgClassName="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#06080E] via-[#06080E]/65 to-[#06080E]/10" />

                <div className="relative z-10 p-5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-sky-300 tabular-nums">
                      {count} objects
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-slate-300 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-sky-300" />
                  </div>
                  <h3 className="mt-1 text-lg font-semibold text-white">{cat.label}</h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-300">
                    {cat.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
