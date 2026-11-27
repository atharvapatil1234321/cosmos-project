import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Heart, Loader2, Search, X } from 'lucide-react';
import { CATEGORIES, getCategoryLabel } from '../data/celestialCatalog';
import type { CategoryId, CelestialObject, NasaMediaItem } from '../types/cosmos';
import CosmosImage from './CosmosImage';

interface CategoryExplorerProps {
  catalog: CelestialObject[];
  activeCategory: CategoryId | 'all';
  searchQuery: string;
  favouriteIds: string[];
  onCategoryChange: (cat: CategoryId | 'all') => void;
  onSearchChange: (q: string) => void;
  onSelectObject: (obj: CelestialObject) => void;
  onToggleFavourite: (obj: CelestialObject) => void;
}

export default function CategoryExplorer({
  catalog,
  activeCategory,
  searchQuery,
  favouriteIds,
  onCategoryChange,
  onSearchChange,
  onSelectObject,
  onToggleFavourite,
}: CategoryExplorerProps) {
  const [liveNasaResults, setLiveNasaResults] = useState<NasaMediaItem[]>([]);
  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);

  const trimmedQuery = searchQuery.trim();

  const filteredCatalog = useMemo(() => {
    const q = trimmedQuery.toLowerCase();
    return catalog.filter((obj) => {
      const matchesCategory = activeCategory === 'all' || obj.category === activeCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        obj.name.toLowerCase().includes(q) ||
        obj.designation.toLowerCase().includes(q) ||
        obj.tagline.toLowerCase().includes(q) ||
        obj.overview.toLowerCase().includes(q) ||
        getCategoryLabel(obj.category).toLowerCase().includes(q)
      );
    });
  }, [catalog, activeCategory, trimmedQuery]);

  // Query NASA Image Library when user searches
  useEffect(() => {
    if (trimmedQuery.length < 2) {
      setLiveNasaResults([]);
      setLiveError(null);
      setIsLoadingLive(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsLoadingLive(true);
      setLiveError(null);
      try {
        const res = await fetch(
          `/api/nasa-images?q=${encodeURIComponent(trimmedQuery)}&limit=8`,
          { signal: controller.signal }
        );
        if (!res.ok) {
          throw new Error('NASA Image Library search unavailable');
        }
        const json = (await res.json()) as { items?: NasaMediaItem[] };
        const existingNasaIds = new Set(catalog.map((c) => c.nasaId));
        const filtered = (json.items || []).filter((item) => !existingNasaIds.has(item.nasaId));
        setLiveNasaResults(filtered);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setLiveError('Live NASA archive search is temporarily unavailable.');
        }
      } finally {
        setIsLoadingLive(false);
      }
    }, 320);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [trimmedQuery, catalog]);

  const convertNasaMediaToObject = (item: NasaMediaItem): CelestialObject => ({
    id: `nasa-${item.nasaId}`,
    name: item.title,
    designation: `NASA Asset ID: ${item.nasaId}`,
    category: activeCategory === 'all' ? 'space-missions' : activeCategory,
    tagline: item.description.slice(0, 140) + (item.description.length > 140 ? '…' : ''),
    overview: item.description,
    history: `Archived in the official NASA Image and Video Library (${item.center}) on ${item.dateCreated}.`,
    distanceFromEarth: 'Not confirmed',
    sizeOrDiameter: 'Not confirmed',
    temperature: 'Unknown',
    age: item.dateCreated !== 'Unknown' ? `Captured / Archived ${item.dateCreated}` : 'Unknown',
    discovery: `Captured / published by ${item.credit}`,
    composition: 'Unknown',
    facts: [
      `Official NASA catalog identifier: ${item.nasaId}.`,
      `Archived through NASA Center: ${item.center}.`,
      item.keywords.length > 0
        ? `Archive keywords: ${item.keywords.join(', ')}.`
        : 'Indexed directly from the NASA Image and Video Library dataset.',
    ],
    imageUrl: item.imageUrl,
    nasaId: item.nasaId,
    imageCredit: item.credit,
    nasaSearchQuery: item.title,
    isLiveNasaResult: true,
    dateCreated: item.dateCreated,
  });

  return (
    <section id="explorer" className="relative z-10 py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header & Inline Search Filter */}
        <div className="flex flex-col justify-between gap-6 border-b border-white/10 pb-6 lg:flex-row lg:items-end">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Celestial Catalog &amp; Search
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              {trimmedQuery
                ? `Showing results for "${trimmedQuery}"`
                : 'Select any celestial body, star, nebula, or mission to inspect verified scientific data.'}
            </p>
          </div>

          <div className="relative w-full lg:w-80">
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Filter catalog or query NASA..."
              aria-label="Filter catalog or search NASA images"
              className="min-h-[42px] w-full rounded-lg border border-white/15 bg-slate-900/70 py-2 pr-9 pl-10 text-sm text-white placeholder-slate-400 focus:border-sky-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Clear filter"
                className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Segmented Filter Bar */}
        <div
          className="mt-6 flex flex-wrap items-center gap-2"
          role="tablist"
          aria-label="Filter celestial objects by category"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeCategory === 'all'}
            onClick={() => onCategoryChange('all')}
            className={`min-h-[38px] shrink-0 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors duration-150 ${
              activeCategory === 'all'
                ? 'bg-sky-500 text-slate-950'
                : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            All Objects
          </button>
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onCategoryChange(cat.id)}
                className={`min-h-[38px] shrink-0 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors duration-150 ${
                  isActive
                    ? 'bg-sky-500 text-slate-950'
                    : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat.shortLabel}
              </button>
            );
          })}
        </div>

        {/* Curated Scientific Catalog Results */}
        {filteredCatalog.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCatalog.map((obj) => {
              const isFav = favouriteIds.includes(obj.id);
              return (
                <article
                  key={obj.id}
                  className="cosmos-glass-subtle group flex flex-col overflow-hidden rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-400/35"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden">
                    <button
                      type="button"
                      onClick={() => onSelectObject(obj)}
                      className="block h-full w-full text-left focus-visible:outline-2 focus-visible:outline-sky-400"
                      aria-label={`View details for ${obj.name}`}
                    >
                      <CosmosImage
                        src={obj.imageUrl}
                        alt={`${obj.name} — ${obj.imageCredit}`}
                        title={obj.name}
                        className="h-full w-full"
                        imgClassName="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#06080E]/85 via-transparent to-transparent" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggleFavourite(obj)}
                      aria-label={isFav ? `Remove ${obj.name} from favourites` : `Save ${obj.name} to favourites`}
                      aria-pressed={isFav}
                      className={`absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border backdrop-blur-md transition-colors ${
                        isFav
                          ? 'border-rose-400/50 bg-rose-500/20 text-rose-300'
                          : 'border-white/15 bg-[#06080E]/65 text-slate-300 hover:border-white/30 hover:text-white'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectObject(obj)}
                    className="flex flex-1 flex-col justify-between p-5 text-left"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="font-medium text-sky-300">
                          {getCategoryLabel(obj.category)}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="truncate font-mono tabular-nums">{obj.designation}</span>
                      </div>

                      <h3 className="mt-2 text-lg font-semibold text-white transition-colors group-hover:text-sky-300">
                        {obj.name}
                      </h3>

                      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-300">
                        {obj.tagline}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3.5 text-xs">
                      <span className="truncate font-mono text-slate-400 tabular-nums">
                        {obj.distanceFromEarth}
                      </span>
                      <span className="inline-flex shrink-0 items-center gap-1 font-medium text-sky-300">
                        <span>Details</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </button>
                </article>
              );
            })}
          </div>
        ) : (
          !isLoadingLive &&
          liveNasaResults.length === 0 && (
            <div className="cosmos-glass-subtle mt-8 rounded-xl p-10 text-center">
              <p className="text-base font-medium text-white">
                No matching objects found in the catalog for &ldquo;{trimmedQuery}&rdquo;.
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Try searching for Earth, Mars, Jupiter, Saturn, Sun, Sirius, Milky Way, Andromeda Galaxy, Orion Nebula, or Sagittarius A*.
              </p>
              <button
                type="button"
                onClick={() => {
                  onSearchChange('');
                  onCategoryChange('all');
                }}
                className="mt-5 inline-flex min-h-[40px] items-center rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-white hover:bg-white/10"
              >
                Reset filters
              </button>
            </div>
          )
        )}

        {/* Live NASA Image & Video Library Search Results */}
        {trimmedQuery.length >= 2 && (
          <div className="mt-12 border-t border-white/10 pt-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  NASA Image Library Results for &ldquo;{trimmedQuery}&rdquo;
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  Real astronomical imagery queried live from images-api.nasa.gov
                </p>
              </div>
              {isLoadingLive && (
                <div className="flex items-center gap-2 text-xs text-sky-300">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Querying NASA archive...</span>
                </div>
              )}
            </div>

            {liveError && (
              <p className="mt-4 text-sm text-amber-300">{liveError}</p>
            )}

            {liveNasaResults.length > 0 && (
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {liveNasaResults.map((item) => {
                  const adapted = convertNasaMediaToObject(item);
                  return (
                    <button
                      key={item.nasaId}
                      type="button"
                      onClick={() => onSelectObject(adapted)}
                      className="cosmos-glass-subtle group flex flex-col overflow-hidden rounded-xl text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-400/40"
                    >
                      <div className="relative aspect-[4/3] w-full overflow-hidden">
                        <CosmosImage
                          src={item.thumbUrl}
                          alt={item.title}
                          title={item.title}
                          className="h-full w-full"
                          imgClassName="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#06080E]/80 via-transparent to-transparent" />
                      </div>
                      <div className="flex flex-1 flex-col justify-between p-4">
                        <div>
                          <p className="truncate font-mono text-[11px] text-violet-300">
                            {item.center} · {item.nasaId}
                          </p>
                          <h4 className="mt-1 line-clamp-2 text-sm font-semibold text-white group-hover:text-violet-200">
                            {item.title}
                          </h4>
                        </div>
                        <p className="mt-3 truncate text-xs text-slate-400">
                          Credit: {item.credit}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
