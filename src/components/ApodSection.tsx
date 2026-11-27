import { useCallback, useEffect, useState } from 'react';
import { Calendar, Maximize2, RefreshCw, X } from 'lucide-react';
import type { ApodData } from '../types/cosmos';
import CosmosImage from './CosmosImage';

export default function ApodSection() {
  const [apod, setApod] = useState<ApodData | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [zoomOpen, setZoomOpen] = useState(false);

  const todayIso = new Date().toISOString().slice(0, 10);

  const fetchApod = useCallback(async (date?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = date ? `/api/apod?date=${encodeURIComponent(date)}` : '/api/apod';
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not load Astronomy Picture of the Day.');
      }
      setApod(data as ApodData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reach NASA APOD service.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApod();
  }, [fetchApod]);

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    if (newDate) {
      fetchApod(newDate);
    } else {
      fetchApod();
    }
  };

  return (
    <section id="apod" className="relative z-10 py-10 pb-20 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-medium tracking-[0.18em] text-sky-400">
              NASA OPEN APIS · DAILY DISPATCH
            </p>
            <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Astronomy Picture of the Day
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 rounded-lg border border-white/15 bg-slate-900/70 px-3 py-2 text-xs text-slate-300">
              <Calendar className="h-3.5 w-3.5 text-sky-400" aria-hidden="true" />
              <span className="sr-only">Browse APOD by date</span>
              <input
                type="date"
                min="1995-06-16"
                max={todayIso}
                value={selectedDate || apod?.date || ''}
                onChange={(e) => handleDateChange(e.target.value)}
                aria-label="Select Astronomy Picture of the Day date"
                className="bg-transparent font-mono text-xs text-white focus:outline-none"
              />
            </label>

            {selectedDate && (
              <button
                type="button"
                onClick={() => handleDateChange('')}
                className="min-h-[36px] rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/10"
              >
                Today
              </button>
            )}
          </div>
        </div>

        <div className="mt-8">
          {isLoading ? (
            <div className="cosmos-glass grid grid-cols-1 gap-8 rounded-2xl p-6 lg:grid-cols-12">
              <div className="aspect-[16/10] animate-pulse rounded-xl bg-slate-800/70 lg:col-span-7" />
              <div className="flex flex-col justify-center space-y-4 lg:col-span-5">
                <div className="h-4 w-32 animate-pulse rounded bg-slate-800" />
                <div className="h-8 w-3/4 animate-pulse rounded bg-slate-800" />
                <div className="h-28 w-full animate-pulse rounded bg-slate-800/80" />
              </div>
            </div>
          ) : error ? (
            <div className="cosmos-glass-subtle flex flex-col items-center justify-center rounded-2xl p-10 text-center">
              <p className="text-base font-medium text-white">
                NASA Astronomy Picture of the Day could not be loaded
              </p>
              <p className="mt-2 max-w-md text-sm text-slate-400">{error}</p>
              <button
                type="button"
                onClick={() => fetchApod(selectedDate || undefined)}
                className="mt-5 inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retry</span>
              </button>
            </div>
          ) : apod ? (
            <div className="cosmos-glass overflow-hidden rounded-2xl">
              <div className="grid grid-cols-1 items-stretch lg:grid-cols-12">
                <div className="relative min-h-[280px] bg-black lg:col-span-7">
                  {apod.media_type === 'video' ? (
                    <div className="flex h-full min-h-[320px] flex-col items-center justify-center p-4">
                      <iframe
                        src={apod.url}
                        title={apod.title}
                        className="aspect-video w-full rounded-xl border border-white/10"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setZoomOpen(true)}
                      className="group relative block h-full min-h-[320px] w-full overflow-hidden text-left"
                      aria-label={`Inspect ${apod.title} in full resolution`}
                    >
                      <CosmosImage
                        src={apod.url}
                        alt={apod.title}
                        title={apod.title}
                        className="h-full w-full"
                        imgClassName="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                      <span className="absolute right-4 bottom-4 inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-[#06080E]/80 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                        <Maximize2 className="h-3.5 w-3.5 text-sky-300" />
                        <span>View full image</span>
                      </span>
                    </button>
                  )}
                </div>

                <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-5">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-slate-400 tabular-nums">
                      <span className="text-sky-300">{apod.date}</span>
                      <span aria-hidden="true">·</span>
                      <span>{apod.source}</span>
                    </div>

                    <h3 className="mt-3 text-xl font-bold tracking-tight text-white sm:text-2xl">
                      {apod.title}
                    </h3>

                    <p className="mt-4 max-h-64 overflow-y-auto pr-1 text-sm leading-7 text-slate-300">
                      {apod.explanation}
                    </p>
                  </div>

                  <div className="mt-6 border-t border-white/10 pt-4 text-xs text-slate-400">
                    <span>Image Credit &amp; Copyright: </span>
                    <strong className="font-medium text-slate-200">{apod.copyright}</strong>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* APOD Zoom Modal */}
      {zoomOpen && apod && apod.media_type === 'image' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label={apod.title}
          onClick={() => setZoomOpen(false)}
        >
          <div
            className="cosmos-glass max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-3.5">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-white">{apod.title}</h3>
                <p className="truncate text-xs text-slate-400">
                  {apod.date} · Credit: {apod.copyright}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setZoomOpen(false)}
                aria-label="Close APOD preview"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex max-h-[78vh] items-center justify-center bg-black p-4">
              <img
                src={apod.hdurl || apod.url}
                alt={apod.title}
                referrerPolicy="no-referrer"
                className="max-h-[72vh] w-auto rounded-lg object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
