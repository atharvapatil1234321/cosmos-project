import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const NASA_API_KEY = process.env.NASA_API_KEY?.trim() || 'DEMO_KEY';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const apodCache = new Map<string, CacheEntry<unknown>>();
const nasaImageCache = new Map<string, CacheEntry<unknown>>();

const APOD_TTL_MS = 30 * 60 * 1000; // 30 minutes
const IMAGES_TTL_MS = 15 * 60 * 1000; // 15 minutes

function isValidHttpUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

function getSafeNasaImageUrl(rawThumb: string): string {
  if (!isValidHttpUrl(rawThumb)) return '';
  return rawThumb;
}

function getLargeVariantUrl(rawThumb: string): string {
  if (!isValidHttpUrl(rawThumb)) return '';
  if (rawThumb.includes('~thumb.jpg')) {
    return rawThumb.replace('~thumb.jpg', '~medium.jpg');
  }
  if (rawThumb.includes('~small.jpg')) {
    return rawThumb.replace('~small.jpg', '~medium.jpg');
  }
  return rawThumb;
}

async function startServer() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  // NASA Astronomy Picture of the Day proxy
  app.get('/api/apod', async (req: Request, res: Response) => {
    try {
      const rawDate = typeof req.query.date === 'string' ? req.query.date.trim() : '';
      let dateParam = '';

      if (rawDate) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
          res.status(400).json({ error: 'Invalid date format. Expected YYYY-MM-DD.' });
          return;
        }
        const parsedDate = new Date(`${rawDate}T00:00:00Z`);
        const minDate = new Date('1995-06-16T00:00:00Z');
        const maxDate = new Date();
        maxDate.setUTCDate(maxDate.getUTCDate() + 1);
        if (Number.isNaN(parsedDate.getTime()) || parsedDate < minDate || parsedDate > maxDate) {
          res.status(400).json({ error: 'Date must be between 1995-06-16 and today.' });
          return;
        }
        dateParam = rawDate;
      }

      const cacheKey = dateParam || 'today';
      const cached = apodCache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        res.json(cached.data);
        return;
      }

      const apiUrl = new URL('https://api.nasa.gov/planetary/apod');
      apiUrl.searchParams.set('api_key', NASA_API_KEY);
      apiUrl.searchParams.set('thumbs', 'true');
      if (dateParam) {
        apiUrl.searchParams.set('date', dateParam);
      }

      const response = await fetch(apiUrl.toString(), {
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        // Fallback to NASA Image Library featured astronomy highlight if APOD rate-limits
        if (response.status === 429 || response.status >= 500) {
          const fallbackRes = await fetch(
            'https://images-api.nasa.gov/search?q=Carina+Nebula+Webb&media_type=image&page_size=1',
            { signal: AbortSignal.timeout(8000) }
          );
          if (fallbackRes.ok) {
            const fallbackJson = (await fallbackRes.json()) as {
              collection?: {
                items?: Array<{
                  data?: Array<{
                    nasa_id?: string;
                    title?: string;
                    description?: string;
                    date_created?: string;
                    secondary_creator?: string;
                    center?: string;
                  }>;
                  links?: Array<{ href?: string }>;
                }>;
              };
            };
            const firstItem = fallbackJson.collection?.items?.[0];
            const meta = firstItem?.data?.[0];
            const href = firstItem?.links?.[0]?.href;
            if (meta && href && isValidHttpUrl(href)) {
              const fallbackPayload = {
                title: meta.title || 'Cosmic Cliffs in the Carina Nebula',
                date: dateParam || new Date().toISOString().slice(0, 10),
                explanation:
                  meta.description ||
                  'Captured by NASA’s James Webb Space Telescope, this landscape of star-forming mountains and valleys lies at the edge of NGC 3324 in the Carina Nebula.',
                url: getLargeVariantUrl(href),
                hdurl: getLargeVariantUrl(href),
                media_type: 'image',
                copyright: meta.secondary_creator || `NASA / ${meta.center || 'STScI'}`,
                source: 'NASA Image and Video Library (APOD rate-limit fallback)',
              };
              apodCache.set(cacheKey, {
                data: fallbackPayload,
                expiresAt: Date.now() + 5 * 60 * 1000,
              });
              res.json(fallbackPayload);
              return;
            }
          }
        }

        res.status(response.status).json({
          error: 'Unable to retrieve Astronomy Picture of the Day from NASA.',
        });
        return;
      }

      const data = (await response.json()) as Record<string, unknown>;
      const payload = {
        title: typeof data.title === 'string' ? data.title : 'Astronomy Picture of the Day',
        date: typeof data.date === 'string' ? data.date : dateParam || new Date().toISOString().slice(0, 10),
        explanation: typeof data.explanation === 'string' ? data.explanation : '',
        url: isValidHttpUrl(data.url) ? data.url : '',
        hdurl: isValidHttpUrl(data.hdurl) ? data.hdurl : isValidHttpUrl(data.url) ? data.url : '',
        thumbnail_url: isValidHttpUrl(data.thumbnail_url) ? data.thumbnail_url : undefined,
        media_type: data.media_type === 'video' ? 'video' : 'image',
        copyright: typeof data.copyright === 'string' ? data.copyright.trim() : 'NASA / Public Domain',
        source: 'NASA Astronomy Picture of the Day (APOD)',
      };

      apodCache.set(cacheKey, {
        data: payload,
        expiresAt: Date.now() + APOD_TTL_MS,
      });

      res.json(payload);
    } catch (err) {
      console.error('APOD route error:', err instanceof Error ? err.message : err);
      res.status(502).json({ error: 'Failed to reach NASA APOD service.' });
    }
  });

  // NASA Image and Video Library search proxy
  app.get('/api/nasa-images', async (req: Request, res: Response) => {
    try {
      const rawQuery = typeof req.query.q === 'string' ? req.query.q.trim() : '';
      if (!rawQuery || rawQuery.length > 100) {
        res.status(400).json({ error: 'Query parameter q must be between 1 and 100 characters.' });
        return;
      }

      const rawPage = typeof req.query.page === 'string' ? Number.parseInt(req.query.page, 10) : 1;
      const page = Number.isFinite(rawPage) && rawPage >= 1 && rawPage <= 10 ? rawPage : 1;

      const rawLimit = typeof req.query.limit === 'string' ? Number.parseInt(req.query.limit, 10) : 12;
      const limit = Number.isFinite(rawLimit) && rawLimit >= 1 && rawLimit <= 24 ? rawLimit : 12;

      const cacheKey = `${rawQuery.toLowerCase()}::${page}::${limit}`;
      const cached = nasaImageCache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        res.json(cached.data);
        return;
      }

      const searchUrl = new URL('https://images-api.nasa.gov/search');
      searchUrl.searchParams.set('q', rawQuery);
      searchUrl.searchParams.set('media_type', 'image');
      searchUrl.searchParams.set('page', String(page));
      searchUrl.searchParams.set('page_size', String(limit));

      const response = await fetch(searchUrl.toString(), {
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        res.status(response.status).json({ error: 'NASA Image Library request failed.' });
        return;
      }

      const json = (await response.json()) as {
        collection?: {
          metadata?: { total_hits?: number };
          items?: Array<{
            data?: Array<{
              nasa_id?: string;
              title?: string;
              description?: string;
              center?: string;
              secondary_creator?: string;
              date_created?: string;
              keywords?: string[];
            }>;
            links?: Array<{ href?: string; rel?: string }>;
          }>;
        };
      };

      const rawItems = json.collection?.items || [];
      const items = rawItems
        .map((item) => {
          const meta = item.data?.[0];
          const previewLink = item.links?.find((l) => l.rel === 'preview' && isValidHttpUrl(l.href))?.href || item.links?.[0]?.href || '';
          if (!meta || !meta.nasa_id || !isValidHttpUrl(previewLink)) {
            return null;
          }
          const thumbUrl = getSafeNasaImageUrl(previewLink);
          const mediumUrl = getLargeVariantUrl(previewLink);
          return {
            nasaId: meta.nasa_id,
            title: meta.title || meta.nasa_id,
            description: meta.description || 'Astronomical photograph archived in the NASA Image and Video Library.',
            thumbUrl,
            imageUrl: mediumUrl,
            credit: meta.secondary_creator || `NASA / ${meta.center || 'Image Library'}`,
            center: meta.center || 'NASA',
            dateCreated: meta.date_created ? meta.date_created.slice(0, 10) : 'Unknown',
            keywords: Array.isArray(meta.keywords) ? meta.keywords.slice(0, 6) : [],
          };
        })
        .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

      const payload = {
        query: rawQuery,
        totalHits: json.collection?.metadata?.total_hits ?? items.length,
        items,
      };

      nasaImageCache.set(cacheKey, {
        data: payload,
        expiresAt: Date.now() + IMAGES_TTL_MS,
      });

      res.json(payload);
    } catch (err) {
      console.error('NASA Images route error:', err instanceof Error ? err.message : err);
      res.status(502).json({ error: 'Failed to reach NASA Image and Video Library.' });
    }
  });

  // Vite middleware in dev, static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('/{*splat}', (_req: Request, res: Response) => {
      const indexHtml = path.join(distPath, 'index.html');
      if (fs.existsSync(indexHtml)) {
        res.sendFile(indexHtml);
      } else {
        res.status(404).send('Build output not found.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`COSMOS server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
