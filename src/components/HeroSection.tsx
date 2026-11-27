import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowDownRight, Compass, Search, Shuffle, X } from 'lucide-react';
import type { CelestialObject } from '../types/cosmos';
import { getCategoryLabel } from '../data/celestialCatalog';
import CosmosImage from './CosmosImage';

interface HeroSectionProps {
  catalog: CelestialObject[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: (q: string) => void;
  onExploreClick: () => void;
  onRandomDiscovery: () => void;
  onSelectObject: (obj: CelestialObject) => void;
}

const FEATURED_SEARCHES = [
  'Earth',
  'Mars',
  'Jupiter',
  'Saturn',
  'Sun',
  'Sirius',
  'Milky Way',
  'Andromeda Galaxy',
  'Orion Nebula',
  'Sagittarius A*',
];

export default function HeroSection({
  catalog,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onExploreClick,
  onRandomDiscovery,
  onSelectObject,
}: HeroSectionProps) {
  const [inputFocused, setInputFocused] = useState(false);

  const suggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return catalog
      .filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.designation.toLowerCase().includes(q) ||
          item.tagline.toLowerCase().includes(q) ||
          getCategoryLabel(item.category).toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [catalog, searchQuery]);

  const featuredHeroObject = useMemo(
    () => catalog.find((o) => o.id === 'carina-nebula') || catalog[0],
    [catalog]
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setInputFocused(false);
    onSearchSubmit(searchQuery);
  };

  return (
    <section className="relative z-10 overflow-hidden pt-10 pb-16 sm:pt-14 sm:pb-20 lg:pt-16 lg:pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left column: Hero copy, search bar, primary CTA */}
          <div className="flex flex-col justify-center lg:col-span-7">
            <p className="mb-4 text-xs font-medium tracking-[0.22em] text-sky-400">
              COSMOS OBSERVATORY ARCHIVE · NASA &amp; ESA DATASETS
            </p>

            <h1 className="max-w-2xl text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-[3.5rem] lg:leading-[1.08]">
              EXPLORE THE UNIVERSE
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Discover the mysteries of space, one celestial object at a time.
            </p>

            {/* Search bar */}
            <div className="relative mt-8 max-w-2xl">
              <form onSubmit={handleSubmit} role="search" aria-label="Search celestial objects">
                <div className="cosmos-glass cosmos-glow-blue flex items-center gap-2 rounded-xl p-1.5 transition-colors focus-within:border-sky-400/50">
                  <Search className="ml-3 h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
                  <input
                    type="search"
                    value={searchQuery}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => {
                      window.setTimeout(() => setInputFocused(false), 180);
                    }}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search planets, stars, galaxies..."
                    aria-label="Search planets, stars, galaxies"
                    className="min-h-[44px] w-full bg-transparent px-2 text-sm text-white placeholder-slate-400 focus:outline-none sm:text-base"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => onSearchChange('')}
                      aria-label="Clear search"
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="min-h-[42px] shrink-0 whitespace-nowrap rounded-lg bg-sky-500 px-5 py-2 text-sm font-semibold text-slate-950 transition-colors duration-150 hover:bg-sky-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Live instant suggestions dropdown */}
              {inputFocused && suggestions.length > 0 && (
                <div className="cosmos-glass absolute right-0 left-0 z-30 mt-2 overflow-hidden rounded-xl shadow-2xl">
                  <div className="border-b border-white/10 px-4 py-2 text-xs text-slate-400">
                    Matching celestial objects
                  </div>
                  <ul className="divide-y divide-white/5">
                    {suggestions.map((obj) => (
                      <li key={obj.id}>
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setInputFocused(false);
                            onSelectObject(obj);
                          }}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5"
                        >
                          <CosmosImage
                            src={obj.imageUrl}
                            alt={obj.name}
                            className="h-10 w-10 shrink-0 rounded-lg border border-white/10"
                            imgClassName="h-full w-full object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-white">{obj.name}</p>
                            <p className="truncate text-xs text-slate-400">
                              {getCategoryLabel(obj.category)} · {obj.distanceFromEarth}
                            </p>
                          </div>
                          <ArrowDownRight className="h-4 w-4 shrink-0 text-slate-500" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Quick search prompts as clean text links */}
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
              <span className="text-slate-500">Quick search:</span>
              {FEATURED_SEARCHES.slice(0, 6).map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    onSearchChange(term);
                    onSearchSubmit(term);
                  }}
                  className="whitespace-nowrap text-slate-300 underline decoration-white/20 underline-offset-4 transition-colors hover:text-sky-300 hover:decoration-sky-400"
                >
                  {term}
                </button>
              ))}
            </div>

            {/* Action buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onExploreClick}
                className="inline-flex min-h-[44px] items-center gap-2.5 whitespace-nowrap rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-slate-950 transition-all duration-150 hover:bg-sky-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <Compass className="h-4 w-4" aria-hidden="true" />
                <span>Explore Universe</span>
              </button>

              <button
                type="button"
                onClick={onRandomDiscovery}
                className="inline-flex min-h-[44px] items-center gap-2.5 whitespace-nowrap rounded-lg border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-slate-100 transition-colors duration-150 hover:border-violet-400/50 hover:bg-violet-500/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400"
              >
                <Shuffle className="h-4 w-4 text-violet-300" aria-hidden="true" />
                <span>Random Space Discovery</span>
              </button>
            </div>
          </div>

          {/* Right column: Full-height NASA showcase panel */}
          <div className="lg:col-span-5">
            {featuredHeroObject && (
              <button
                type="button"
                onClick={() => onSelectObject(featuredHeroObject)}
                className="group cosmos-glass cosmos-glow-violet relative flex h-full min-h-[320px] w-full flex-col overflow-hidden rounded-2xl text-left transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 lg:min-h-[430px]"
              >
                <CosmosImage
                  src={featuredHeroObject.imageUrl}
                  alt={featuredHeroObject.name}
                  title={featuredHeroObject.name}
                  loading="eager"
                  className="h-full w-full flex-1"
                  imgClassName="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#06080E] via-[#06080E]/35 to-transparent" />
                <div className="absolute right-0 bottom-0 left-0 p-6">
                  <div className="flex items-center gap-2 text-xs font-medium text-sky-300">
                    <span>Featured Observation</span>
                    <span aria-hidden="true">·</span>
                    <span>{getCategoryLabel(featuredHeroObject.category)}</span>
                  </div>
                  <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-white">
                    {featuredHeroObject.name}
                  </h2>
                  <p className="mt-1.5 line-clamp-2 text-sm text-slate-300">
                    {featuredHeroObject.tagline}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-4 border-t border-white/10 pt-3 text-xs text-slate-400">
                    <span className="truncate font-mono tabular-nums">
                      {featuredHeroObject.distanceFromEarth}
                    </span>
                    <span className="shrink-0 whitespace-nowrap font-medium text-sky-300 group-hover:text-sky-200">
                      Inspect object →
                    </span>
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
