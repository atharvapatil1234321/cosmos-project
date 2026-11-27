import { ArrowRight, Clock, Compass, Heart, Trash2 } from 'lucide-react';
import { getCategoryLabel } from '../data/celestialCatalog';
import type { CelestialObject } from '../types/cosmos';
import CosmosImage from './CosmosImage';

interface FavouritesViewProps {
  favourites: CelestialObject[];
  recentlyViewed: CelestialObject[];
  onSelectObject: (obj: CelestialObject) => void;
  onRemoveFavourite: (id: string) => void;
  onClearRecent: () => void;
  onExploreClick: () => void;
}

export default function FavouritesView({
  favourites,
  recentlyViewed,
  onSelectObject,
  onRemoveFavourite,
  onClearRecent,
  onExploreClick,
}: FavouritesViewProps) {
  return (
    <section className="relative z-10 py-10 pb-20 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-medium tracking-[0.18em] text-sky-400">
              PERSONAL OBSERVATION LOG
            </p>
            <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Favourites &amp; Recently Viewed
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Your saved celestial bookmarks and recent astronomical discoveries stored in this browser.
            </p>
          </div>

          <button
            type="button"
            onClick={onExploreClick}
            className="inline-flex min-h-[40px] shrink-0 items-center gap-2 self-start rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-white/10 sm:self-auto"
          >
            <Compass className="h-3.5 w-3.5 text-sky-300" aria-hidden="true" />
            <span>Browse Catalog</span>
          </button>
        </div>

        {/* Saved Favourites */}
        <div className="mt-8">
          <div className="flex items-center gap-2.5">
            <Heart className="h-4 w-4 text-rose-400" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-white">
              Saved Favourites ({favourites.length})
            </h2>
          </div>

          {favourites.length === 0 ? (
            <div className="cosmos-glass-subtle mt-4 flex flex-col items-center justify-center rounded-2xl p-10 text-center">
              <p className="text-base font-medium text-white">No favourite celestial objects yet</p>
              <p className="mt-2 max-w-md text-sm text-slate-400">
                Click the heart icon on any planet, star, galaxy, nebula, or space mission in the Explore tab to bookmark it here.
              </p>
              <button
                type="button"
                onClick={onExploreClick}
                className="mt-5 inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400"
              >
                <span>Explore Celestial Objects</span>
              </button>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {favourites.map((item) => (
                <article
                  key={item.id}
                  className="cosmos-glass-subtle group flex flex-col overflow-hidden rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-400/35"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden">
                    <button
                      type="button"
                      onClick={() => onSelectObject(item)}
                      className="block h-full w-full text-left"
                      aria-label={`Open ${item.name}`}
                    >
                      <CosmosImage
                        src={item.imageUrl}
                        alt={item.name}
                        title={item.name}
                        className="h-full w-full"
                        imgClassName="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveFavourite(item.id)}
                      aria-label={`Remove ${item.name} from favourites`}
                      className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-[#06080E]/75 text-slate-300 backdrop-blur-md transition-colors hover:border-rose-400/50 hover:text-rose-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectObject(item)}
                    className="flex flex-1 flex-col justify-between p-5 text-left"
                  >
                    <div>
                      <p className="text-xs font-medium text-sky-300">
                        {getCategoryLabel(item.category)} ·{' '}
                        <span className="font-mono text-slate-400">{item.designation}</span>
                      </p>
                      <h3 className="mt-1.5 text-lg font-semibold text-white group-hover:text-sky-300">
                        {item.name}
                      </h3>
                      <p className="mt-1.5 line-clamp-2 text-sm text-slate-300">{item.tagline}</p>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-slate-400">
                      <span className="truncate font-mono tabular-nums">{item.distanceFromEarth}</span>
                      <span className="inline-flex shrink-0 items-center gap-1 font-medium text-sky-300">
                        <span>Details</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Recently Viewed */}
        <div className="mt-12 border-t border-white/10 pt-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 text-violet-400" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-white">
                Recently Viewed ({recentlyViewed.length})
              </h2>
            </div>

            {recentlyViewed.length > 0 && (
              <button
                type="button"
                onClick={onClearRecent}
                className="inline-flex min-h-[36px] items-center gap-1.5 text-xs text-slate-400 transition-colors hover:text-white"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear history</span>
              </button>
            )}
          </div>

          {recentlyViewed.length === 0 ? (
            <div className="cosmos-glass-subtle mt-4 rounded-xl p-8 text-center">
              <p className="text-sm text-slate-300">
                Objects you inspect will appear here for quick access.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {recentlyViewed.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectObject(item)}
                  className="cosmos-glass-subtle group flex items-center gap-3.5 rounded-xl p-3.5 text-left transition-colors hover:border-sky-400/35"
                >
                  <CosmosImage
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-14 w-14 shrink-0 rounded-lg border border-white/10"
                    imgClassName="h-full w-full object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white group-hover:text-sky-300">
                      {item.name}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-400">
                      {getCategoryLabel(item.category)}
                    </p>
                    <p className="mt-0.5 truncate font-mono text-[11px] text-slate-500 tabular-nums">
                      {item.distanceFromEarth}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
