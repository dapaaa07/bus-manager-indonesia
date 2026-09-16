const CACHE_NAME = 'bus-tycoon-cache-v2_patch_realbrands';
const MAP_CACHE_NAME = 'bus-tycoon-map-tiles';

// Daftar domain yang ingin di-cache (Library Eksternal)
const CACHE_DOMAINS = [
  'aistudiocdn.com',
  'unpkg.com',
  'cdn.tailwindcss.com',
  'cdn-icons-png.flaticon.com'
];

// Fungsi matematika untuk mengubah koordinat tile (x, y, z) menjadi kordinasi latitude & longitude
// guna memeriksa apakah letak posisi peta berada di wilayah Indonesia
function isTileInIndonesia(x, y, z) {
  // Jika zoom level sangat rendah (< 6), izinkan untuk overview peta dunia
  if (z < 6) return true;

  const n1 = Math.PI - (2 * Math.PI * y) / Math.pow(2, z);
  const lng1 = (x / Math.pow(2, z)) * 360 - 180;
  const lat1 = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n1) - Math.exp(-n1)));

  const n2 = Math.PI - (2 * Math.PI * (y + 1)) / Math.pow(2, z);
  const lng2 = ((x + 1) / Math.pow(2, z)) * 360 - 180;
  const lat2 = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n2) - Math.exp(-n2)));

  const minLat = Math.min(lat1, lat2);
  const maxLat = Math.max(lat1, lat2);
  const minLng = Math.min(lng1, lng2);
  const maxLng = Math.max(lng1, lng2);

  // Koordinat Bounding Box Indonesia: Latitude [-12.0, 7.0], Longitude [94.0, 142.0]
  const indoMinLat = -12.0;
  const indoMaxLat = 7.0;
  const indoMinLng = 94.0;
  const indoMaxLng = 142.0;

  // Cek perpotongan wilayah (overlapping)
  const overlapLat = Math.max(minLat, indoMinLat) <= Math.min(maxLat, indoMaxLat);
  const overlapLng = Math.max(minLng, indoMinLng) <= Math.min(maxLng, indoMaxLng);

  return overlapLat && overlapLng;
}

// 1x1 Transparent PNG Blank Pixel fallback
const BLANK_TILE = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
  0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08,
  0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00, 0x0b,
  0x49, 0x44, 0x41, 0x54, 0x78, 0xda, 0x62, 0xfc, 0xcf, 0x40, 0x60, 0x00,
  0x00, 0x00, 0x10, 0x00, 0x01, 0xa2, 0xea, 0x81, 0x24, 0x00, 0x00, 0x00,
  0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82
]);

// Install: Paksa service worker baru untuk segera aktif
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate: Hapus cache lama jika ada update versi, tapi pertahankan map tiles cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME && cache !== MAP_CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Intercept request jaringan
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. CEK AKAN KEBUTUHAN TILES MAP (basemaps.cartocdn.com)
  const isTileRequest = url.hostname.includes('basemaps.cartocdn.com') || url.hostname.includes('tile.openstreetmap.org');
  
  if (isTileRequest) {
    // Cari parameter z, x, y di URL path
    const tileMatch = url.pathname.match(/\/(\d+)\/(\d+)\/(\d+)(?:[^0-9]|$)/);
    if (tileMatch) {
      const z = parseInt(tileMatch[1], 10);
      const x = parseInt(tileMatch[2], 10);
      const y = parseInt(tileMatch[3], 10);

      const inIndonesia = isTileInIndonesia(x, y, z);

      if (!inIndonesia && z >= 6) {
        // Blokir load tile di luar Indonesia untuk menghemat kuota internet pengguna secara penuh
        event.respondWith(
          new Response(BLANK_TILE, { headers: { 'Content-Type': 'image/png' } })
        );
        return;
      }

      // Jika berada di Indonesia atau zoom level rendah, gunakan strategi Cache-First
      event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request).then((response) => {
            if (response && response.status === 200) {
              const responseToCache = response.clone();
              caches.open(MAP_CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            return response;
          }).catch(() => {
            // Ketika offline dan tidak ada di cache, berikan blank tile transparan
            return new Response(BLANK_TILE, { headers: { 'Content-Type': 'image/png' } });
          });
        })
      );
      return;
    }
  }

  // Cek apakah request menuju salah satu domain CDN kita
  const isExternalLib = CACHE_DOMAINS.some(domain => url.hostname.includes(domain));

  if (isExternalLib) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        // 1. Jika ada di cache (lokal), pakai itu (Cepat & Offline)
        if (cachedResponse) {
          return cachedResponse;
        }

        // 2. Jika tidak, download dari internet lalu simpan ke cache
        return fetch(event.request).then((response) => {
          // Validasi response
          if (!response || response.status !== 200 || response.type !== 'cors' && response.type !== 'basic') {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        }).catch((err) => {
          // Error handling jika offline dan belum ada di cache
          console.log('Offline dan resource tidak ada di cache:', url.href);
          throw err;
        });
      })
    );
  }
  // Untuk request lain (misal API call), biarkan normal
});
