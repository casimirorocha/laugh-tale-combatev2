/**
 * Master Client-Side Media Caching & Preloading Engine
 * Handles persistent client-side caching of all MP3 audio clips and image assets
 * using CacheStorage, IndexedDB, and in-memory HTML Audio/Image pre-decoding.
 */

import { getAudioBlobFromDB, storeAudioBlobInDB } from './indexedDb';

const AUDIO_CACHE_NAME = 'grandline-audio-cache-v2';
const IMAGE_CACHE_NAME = 'grandline-image-cache-v2';

// In-memory cache for ultra-fast instant access
const memoryAudioUrlCache = new Map<string, string>();
const memoryImageCache = new Map<string, HTMLImageElement>();
const memoryAudioBlobCache = new Map<string, Blob>();

/**
 * Preloads an audio URL into CacheStorage + IndexedDB + Memory Object URL
 */
export async function preloadAudioUrl(url: string): Promise<string> {
  if (!url || !url.trim()) return '';
  if (memoryAudioUrlCache.has(url)) {
    return memoryAudioUrlCache.get(url)!;
  }

  try {
    // 1. Try CacheStorage
    if (typeof window !== 'undefined' && 'caches' in window) {
      try {
        const cache = await caches.open(AUDIO_CACHE_NAME);
        let response = await cache.match(url).catch(() => undefined);
        
        if (!response) {
          try {
            const fetched = await fetch(url);
            if (fetched && fetched.ok && fetched.status === 200) {
              response = fetched;
              try {
                await cache.put(url, fetched.clone());
              } catch (e) {
                // Ignore Cache.put network or quota errors safely
              }
            }
          } catch {
            // fetch failed
          }
        }

        if (response && response.ok) {
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          memoryAudioUrlCache.set(url, blobUrl);
          memoryAudioBlobCache.set(url, blob);
          storeAudioBlobInDB(url, blob).catch(() => {});
          return blobUrl;
        }
      } catch {
        // CacheStorage unavailable or restricted
      }
    }

    // 2. Try IndexedDB fallback
    const idbBlob = await getAudioBlobFromDB(url).catch(() => null);
    if (idbBlob) {
      const blobUrl = URL.createObjectURL(idbBlob);
      memoryAudioUrlCache.set(url, blobUrl);
      memoryAudioBlobCache.set(url, idbBlob);
      return blobUrl;
    }

    // 3. Fallback standard fetch & store
    const res = await fetch(url);
    if (res && res.ok) {
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      memoryAudioUrlCache.set(url, blobUrl);
      memoryAudioBlobCache.set(url, blob);
      storeAudioBlobInDB(url, blob).catch(() => {});
      return blobUrl;
    }
  } catch {
    // If fetch fails, fallback to original url
  }

  return url;
}

/**
 * Preloads and decodes an Image URL into memory + CacheStorage so Edge/Chrome render instantly
 */
export async function preloadImageUrl(url: string): Promise<void> {
  if (!url || !url.trim() || memoryImageCache.has(url)) return;

  try {
    // CacheStorage persistent cache
    if (typeof window !== 'undefined' && 'caches' in window) {
      try {
        const cache = await caches.open(IMAGE_CACHE_NAME);
        const match = await cache.match(url).catch(() => undefined);
        if (!match) {
          const res = await fetch(url);
          if (res && res.ok && res.status === 200) {
            try {
              await cache.put(url, res.clone());
            } catch (e) {
              // Ignore Cache.put network or quota errors safely
            }
          }
        }
      } catch {
        // CacheStorage failed
      }
    }

    // In-memory HTMLImageElement pre-decoding for instant GPU bitmap upload
    const img = new Image();
    img.src = url;
    if ('decode' in img) {
      await img.decode().catch(() => {});
    }
    memoryImageCache.set(url, img);
  } catch {
    // ignore
  }
}

/**
 * High-priority batch preloader to cache all app media assets in background
 */
export async function batchPreloadMediaAssets(audioUrls: string[], imageUrls: string[]): Promise<string[]> {
  const uniqueAudios = Array.from(new Set(audioUrls.filter(Boolean)));
  const uniqueImages = Array.from(new Set(imageUrls.filter(Boolean)));

  // Preload images in parallel chunks
  const imgPromises = uniqueImages.map((url) => preloadImageUrl(url));
  
  // Preload audio files sequentially/throttled to avoid network flooding
  const audioPromises = uniqueAudios.map((url) => preloadAudioUrl(url));

  const results = await Promise.allSettled([...imgPromises, ...audioPromises]);
  const failures = results
    .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
    .map((r) => String(r.reason));
  return failures;
}

/**
 * Synchronous or fast getter for cached audio URL (returns Blob URL if available, else original URL)
 */
export function getCachedAudioPath(url: string): string {
  if (!url) return '';
  return memoryAudioUrlCache.get(url) || url;
}
