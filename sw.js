/*
 * @license
 * Your First PWA Codelab (https://g.co/codelabs/pwa)
 * Copyright 2019 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License
 */
'use strict';


importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js');

if (workbox) {
    console.log(`Yay! Workbox is loaded 🎉`);
    workbox.precaching.precacheAndRoute([
  {
    "url": "404.html",
    "revision": "0a27a4163254fc8fce870c8cc3a3f94f"
  },
  {
    "url": "firebase.json",
    "revision": "12fa3f4fcba064686cd3a9177276bf86"
  },
  {
    "url": "images/ic_add_white_24px.svg",
    "revision": "b09442e8f4b45894cf21566f0813453c"
  },
  {
    "url": "images/ic_refresh_white_24px.svg",
    "revision": "21e4c77a8b98c7516d6c7a97cdbddc22"
  },
  {
    "url": "images/icons/icono-128.png",
    "revision": "1ac12ad484358df1349d34ec60970776"
  },
  {
    "url": "images/icons/icono-256.png",
    "revision": "d5c83115a3624f2be62061f9dd23d8db"
  },
  {
    "url": "images/icons/icono-32.png",
    "revision": "fd38e20ddcaec904342d88d0758e5898"
  },
  {
    "url": "images/icons/icono-512.png",
    "revision": "97f2a0edb0275c7f685a730ea1bf5e04"
  },
  {
    "url": "images/install.svg",
    "revision": "c5de4912fe021bbefb235b1ff4ebb455"
  },
  {
    "url": "index.html",
    "revision": "266b8e8eb4e9fe8275cb62194cf77a36"
  },
  {
    "url": "manifest.json",
    "revision": "be9c380b847bf729035877992694b818"
  },
  {
    "url": "public/404.html",
    "revision": "0a27a4163254fc8fce870c8cc3a3f94f"
  },
  {
    "url": "public/index.html",
    "revision": "f0abdd69af33d5f192a51c8958a51589"
  },
  {
    "url": "scripts/app.js",
    "revision": "08813a4a24124bbd773cbeff93e2487c"
  },
  {
    "url": "scripts/install.js",
    "revision": "9dc25b6f03d6739289ef422d2913d03e"
  },
  {
    "url": "service-worker.js",
    "revision": "89fa9431f02f09b7f89595c11b932da6"
  },
  {
    "url": "styles/inline.css",
    "revision": "1b9cfb644498e5eb31788bbdbce2bd47"
  },
  {
    "url": "workbox-config.js",
    "revision": "2b870b579622f5956ebeebbbc689acbc"
  }
]);
    workbox.routing.registerRoute(
      /\.js$/,
      new workbox.strategies.CacheFirst(
          {
              cacheName: 'js-cache',
          }
      )
    );

    workbox.routing.registerRoute(
    // Cache CSS files.
    /\.css$/,
    // Use cache but update in the background.
    new workbox.strategies.StaleWhileRevalidate({
      // Use a custom cache name.
      cacheName: 'css-cache',
    })
  );

  workbox.routing.registerRoute(
    // Cache image files.
    /\.(?:png|jpg|jpeg|svg|gif)$/,
    // Use the cache if it's available.
    new workbox.strategies.CacheFirst({
      // Use a custom cache name.
      cacheName: 'image-cache',
      plugins: [
        new workbox.expiration.Plugin({
          // Cache only 20 images.
          maxEntries: 20,
          // Cache for a maximum of a week.
          maxAgeSeconds: 7 * 24 * 60 * 60,
        })
      ],
    })
  );


// CODELAB: Update cache names any time any of the cached files change.
const CACHE_NAME = 'static-cache-v2';
const DATA_CACHE_NAME = 'data-cache-v1';

// CODELAB: Add list of files to cache here.
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/scripts/app.js',
  '/scripts/install.js',
  '/styles/inline.css',
  '/images/ic_add_white_24px.svg',
  '/images/ic_refresh_white_24px.svg',
  '/images/install.svg',

];

self.addEventListener('install', (evt) => {
  console.log('[ServiceWorker] Install');
  // CODELAB: Precache static resources here.
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching offline page');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  console.log('[ServiceWorker] Activate');
  // CODELAB: Remove previous cached data from disk.
  evt.waitUntil(
      caches.keys().then((keyList) => {
        return Promise.all(keyList.map((key) => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache', key);
            return caches.delete(key);
          }
        }));
      })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (evt) => {
  console.log('[ServiceWorker] Fetch', evt.request.url);
    var dataUrl = 'https://api-ratp.pierre-grimaud.fr/v3/schedules';
    // CODELAB: Add fetch event handler here.
    if (evt.request.url.includes(dataUrl)) {
    console.log('[Service Worker] Fetch (data)', evt.request.url);
    evt.respondWith(
        caches.open(DATA_CACHE_NAME).then((cache) => {
          return fetch(evt.request)
              .then((response) => {
                // If the response was good, clone it and store it in the cache.
                if (response.status === 200) {
                  cache.put(evt.request.url, response.clone());
                }
                return response;
              }).catch((err) => {
                // Network request failed, try to get it from the cache.
                return cache.match(evt.request);
              });
        }));
    return;
  }
  evt.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(evt.request)
            .then((response) => {
              return response || fetch(evt.request);
            });
      })
  );
});
}