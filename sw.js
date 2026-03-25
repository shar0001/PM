/* =============================================================
   Production OS — Service Worker (PWA Offline Cache)
   ============================================================= */
const CACHE_NAME = 'production-os-v10-0';
const ASSETS = [
    '/PM/',
    '/PM/index.html',
    '/PM/style.css',
    '/PM/app.js',
    '/PM/store.js',
    '/PM/utils.js',
    '/PM/data.js',
    '/PM/weather.js',
    '/PM/screens/projects.js',
    '/PM/screens/project-edit.js',
    '/PM/screens/timeline.js',
    '/PM/screens/shots.js',
    '/PM/screens/logistics.js',
    '/PM/screens/budget.js',
    '/PM/screens/kanban.js',
    '/PM/screens/crew.js',
    '/PM/screens/callsheet.js',
    '/PM/screens/live.js',
    '/PM/screens/manage.js',
    '/PM/screens/equipment.js',
    '/PM/icons/icon-192.png',
    '/PM/icons/icon-512.png',
    'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Noto+Sans+JP:wght@300;400;500;700&display=swap',
    'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200'
];

// Install — キャッシュにアセットを保存
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS).catch(err => {
                console.warn('SW: some assets failed to cache', err);
                // 外部リソースが失敗しても続行
                return cache.addAll(ASSETS.filter(a => !a.startsWith('http')));
            });
        })
    );
    self.skipWaiting();
});

// Activate — 古いキャッシュを削除
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Fetch — キャッシュファースト、ネットワークフォールバック
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // APIリクエストはネットワークファースト
    if (url.hostname.includes('api.open-meteo.com') ||
        url.hostname.includes('nominatim.openstreetmap.org') ||
        url.hostname.includes('router.project-osrm.org')) {
        event.respondWith(
            fetch(event.request).catch(() => caches.match(event.request))
        );
        return;
    }

    // 静的アセットはキャッシュファースト
    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request).then(response => {
                // 成功したレスポンスをキャッシュ
                if (response.ok && event.request.method === 'GET') {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                }
                return response;
            }).catch(() => {
                // オフラインフォールバック
                if (event.request.destination === 'document') {
                    return caches.match('/PM/index.html');
                }
            });
        })
    );
});
