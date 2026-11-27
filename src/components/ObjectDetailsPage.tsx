import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Compass,
  ExternalLink,
  Heart,
  Loader2,
  Maximize2,
  Ruler,
  Shuffle,
  Thermometer,
  X,
} from 'lucide-react';
import { getCategoryLabel } from '../data/celestialCatalog';
import type { CelestialObject, NasaMediaItem } from '../types/cosmos';
import CosmosImage from './CosmosImage';

interface ObjectDetailsPageProps {
  object: CelestialObject;
  isFavourite: boolean;
  onBack: () => void;
  onToggleFavourite: (obj: CelestialObject) => void;
  onRandomDiscovery: () => void;
}

export default function ObjectDetailsPage({
  object,
  isFavourite,
  onBack,
  onToggleFavourite,
  onRandomDiscovery,
}: ObjectDetailsPageProps) {
  const [gallery, setGallery] = useState<NasaMediaItem[]>([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState(true);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{
    url: string;
    title: string;
    credit: string;
  } | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [object.id]);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoadingGallery(true);
    setGalleryError(null);

    fetch(
      `/api/nasa-images?q=${encodeURIComponent(object.nasaSearchQuery || object.name)}&limit=8`,
      { signal: controller.signal }
    )
      .then(async (res) => {
        if (!res.ok) throw new Error('Unable to load NASA image gallery');
        const json = (await res.json()) as { items?: NasaMediaItem[] };
        const items = (json.items || []).filter((item) => item.nasaId !== object.nasaId);
        setGallery(items.slice(0, 6));
      })
      .catch((err) => {
        if ((err as Error).name !== 'AbortError') {
          setGalleryError('Additional NASA archive imagery could not be loaded right now.');
        }
      })
      .finally(() => {
        setIsLoadingGallery(false);
      });

    return () => controller.abort();
  }, [object.id, object.nasaId, object.nasaSearchQuery, object.name]);

  const nasaDetailsUrl = `https://images.nasa.gov/details/${encodeURIComponent(object.nasaId)}`;

  return (
    <main className="relative z-10 py-8 pb-20 sm:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Top Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-[42px] items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Back to Explorer</span>
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onToggleFavourite(object)}
              aria-pressed={isFavourite}
              className={`inline-flex min-h-[42px] items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                isFavourite
                  ? 'border-rose-400/50 bg-rose-500/15 text-rose-200'
                  : 'border-white/15 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Heart className={`h-4 w-4 ${isFavourite ? 'fill-current text-rose-400' : ''}`} />
              <span>{isFavourite ? 'Saved to Favourites' : 'Save to Favourites'}</span>
            </button>

            <button
              type="button"
              onClick={onRandomDiscovery}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-sky-400"
            >
              <Shuffle className="h-4 w-4" aria-hidden="true" />
              <span>Next Random Discovery</span>
            </button>
          </div>
        </div>

        {/* Hero Image + Primary Identity */}
        <div className="mt-8 grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="cosmos-glass group relative overflow-hidden rounded-2xl">
              <button
                type="button"
                onClick={() =>
                  setLightboxImage({
                    url: object.imageUrl,
                    title: object.name,
                    credit: object.imageCredit,
                  })
                }
                className="relative block aspect-[16/11] w-full overflow-hidden text-left"
                aria-label={`Enlarge photograph of ${object.name}`}
              >
                <CosmosImage
                  src={object.imageUrl}
                  alt={`${object.name} astronomical photograph`}
                  title={object.name}
                  loading="eager"
                  className="h-full w-full"
                  imgClassName="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <span className="absolute right-4 bottom-4 inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-[#06080E]/80 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                  <Maximize2 className="h-3.5 w-3.5 text-sky-300" />
                  <span>Inspect image</span>
                </span>
              </button>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-3 text-xs text-slate-400">
                <span>
                  Credit: <strong className="font-medium text-slate-200">{object.imageCredit}</strong>
                </span>
                <a
                  href={nasaDetailsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-sky-300 hover:text-sky-200 hover:underline"
                >
                  <span>NASA ID: {object.nasaId}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between lg:col-span-5">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span className="font-semibold text-sky-300">
                  {getCategoryLabel(object.category)}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">{object.designation}</span>
              </div>

              <h1 className="mt-3 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {object.name}
              </h1>

              <p className="mt-3 text-base leading-relaxed text-slate-300">
                {object.tagline}
              </p>
            </div>

            {/* Key Quantitative Readouts */}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="cosmos-glass-subtle rounded-xl p-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Compass className="h-3.5 w-3.5 text-sky-400" aria-hidden="true" />
                  <span>Distance from Earth</span>
                </div>
                <p className="mt-1.5 font-mono text-sm font-medium text-white tabular-nums">
                  {object.distanceFromEarth}
                </p>
              </div>

              <div className="cosmos-glass-subtle rounded-xl p-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Ruler className="h-3.5 w-3.5 text-violet-400" aria-hidden="true" />
                  <span>Size or Diameter</span>
                </div>
                <p className="mt-1.5 font-mono text-sm font-medium text-white tabular-nums">
                  {object.sizeOrDiameter}
                </p>
              </div>

              <div className="cosmos-glass-subtle rounded-xl p-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Thermometer className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
                  <span>Temperature</span>
                </div>
                <p className="mt-1.5 font-mono text-sm font-medium text-white tabular-nums">
                  {object.temperature}
                </p>
              </div>

              <div className="cosmos-glass-subtle rounded-xl p-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Calendar className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                  <span>Age</span>
                </div>
                <p className="mt-1.5 font-mono text-sm font-medium text-white tabular-nums">
                  {object.age}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Overview & History */}
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="cosmos-glass-subtle rounded-2xl p-6 sm:p-7">
            <h2 className="text-lg font-semibold text-white">Overview</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300 sm:text-base">
              {object.overview}
            </p>
          </section>

          <section className="cosmos-glass-subtle rounded-2xl p-6 sm:p-7">
            <h2 className="text-lg font-semibold text-white">Observation &amp; History</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300 sm:text-base">
              {object.history}
            </p>
          </section>
        </div>

        {/* Discovery, Composition & Scientific Facts */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="flex flex-col gap-6 lg:col-span-5">
            <section className="cosmos-glass-subtle rounded-2xl p-6">
              <h2 className="text-base font-semibold text-white">Discovery Information</h2>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-300">
                {object.discovery}
              </p>
            </section>

            <section className="cosmos-glass-subtle rounded-2xl p-6">
              <h2 className="text-base font-semibold text-white">Physical Composition</h2>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-300">
                {object.composition}
              </p>
            </section>
          </div>

          <section className="cosmos-glass-subtle rounded-2xl p-6 lg:col-span-7 sm:p-7">
            <h2 className="text-lg font-semibold text-white">Interesting Scientific Facts</h2>
            <ul className="mt-4 divide-y divide-white/10">
              {object.facts.map((fact, idx) => (
                <li key={idx} className="flex items-start gap-4 py-3.5 first:pt-0 last:pb-0">
                  <span className="mt-0.5 font-mono text-xs font-semibold text-sky-400 tabular-nums">
                    0{idx + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-slate-200 sm:text-base">{fact}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Real NASA Archive Image Gallery */}
        <section className="mt-12 border-t border-white/10 pt-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">
                Related NASA Archive Photography
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Fetched directly from the NASA Image and Video Library
              </p>
            </div>
            {isLoadingGallery && (
              <div className="flex items-center gap-2 text-xs text-sky-300">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading NASA imagery...</span>
              </div>
            )}
          </div>

          {galleryError && <p className="mt-4 text-sm text-slate-400">{galleryError}</p>}

          {!isLoadingGallery && gallery.length === 0 && !galleryError && (
            <p className="mt-4 text-sm text-slate-400">
              No additional archival photographs returned for this query.
            </p>
          )}

          {gallery.length > 0 && (
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((item) => (
                <button
                  key={item.nasaId}
                  type="button"
                  onClick={() =>
                    setLightboxImage({
                      url: item.imageUrl,
                      title: item.title,
                      credit: item.credit,
                    })
                  }
                  className="cosmos-glass-subtle group flex flex-col overflow-hidden rounded-xl text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-400/35"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden">
                    <CosmosImage
                      src={item.thumbUrl}
                      alt={item.title}
                      title={item.title}
                      className="h-full w-full"
                      imgClassName="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <p className="font-mono text-[11px] text-sky-300">
                      {item.center} · {item.dateCreated}
                    </p>
                    <h3 className="mt-1 line-clamp-1 text-sm font-semibold text-white">
                      {item.title}
                    </h3>
                    <p className="mt-1 truncate text-xs text-slate-400">
                      Credit: {item.credit}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label={lightboxImage.title}
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="cosmos-glass relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-3.5">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-white">
                  {lightboxImage.title}
                </h3>
                <p className="truncate text-xs text-slate-400">
                  Credit: {lightboxImage.credit}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                aria-label="Close image preview"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex max-h-[76vh] items-center justify-center bg-black p-4">
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                referrerPolicy="no-referrer"
                className="max-h-[70vh] w-auto rounded-lg object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
