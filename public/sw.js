/**
 * Service Worker for ABR Insights Course Platform
 * Handles offline functionality, caching strategies, and push notifications
 */

const CACHE_VERSION = 'v1.0.0';
const STATIC_CACHE = `abr-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `abr-dynamic-${CACHE_VERSION}`;
const COURSE_CACHE = `abr-courses-${CACHE_VERSION}`;
const API_CACHE = `abr-api-${CACHE_VERSION}`;
const IMAGE_CACHE = `abr-images-${CACHE_VERSION}`;
const VIDEO_CACHE = `abr-videos-${CACHE_VERSION}`;

// Static assets to precache
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Install event - precache static assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[ServiceWorker] Precaching static assets');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      console.log('[ServiceWorker] Skip waiting');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.startsWith('abr-') && cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE && cacheName !== COURSE_CACHE &&
              cacheName !== API_CACHE && cacheName !== IMAGE_CACHE && 
              cacheName !== VIDEO_CACHE) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[ServiceWorker] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // API requests - Network First, then Cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request, API_CACHE));
    return;
  }

  // Course content - Cache First, then Network
  if (url.pathname.includes('/courses/') || url.pathname.includes('/training/')) {
    event.respondWith(cacheFirstStrategy(request, COURSE_CACHE));
    return;
  }

  // Images - Cache First, then Network
  if (request.destination === 'image') {
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE));
    return;
  }

  // Videos - Cache First with streaming support
  if (request.destination === 'video' || url.pathname.includes('/videos/')) {
    event.respondWith(cacheFirstStrategy(request, VIDEO_CACHE));
    return;
  }

  // Static assets - Cache First
  if (STATIC_ASSETS.includes(url.pathname) || 
      url.pathname.startsWith('/icons/') ||
      url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
    return;
  }

  // Dynamic content - Network First, then Cache
  event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE));
});

// Network First Strategy
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[ServiceWorker] Network request failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlineCache = await caches.match('/offline');
      if (offlineCache) return offlineCache;
    }
    
    throw error;
  }
}

// Cache First Strategy
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Update cache in background
    fetch(request).then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        caches.open(cacheName).then((cache) => {
          cache.put(request, networkResponse);
        });
      }
    }).catch(() => {
      // Ignore network errors when updating cache
    });
    
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[ServiceWorker] Failed to fetch:', request.url);
    throw error;
  }
}

// Background Sync - Sync offline quiz attempts
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Background sync:', event.tag);
  
  if (event.tag === 'sync-quiz-attempts') {
    event.waitUntil(syncQuizAttempts());
  } else if (event.tag === 'sync-course-progress') {
    event.waitUntil(syncCourseProgress());
  }
});

async function syncQuizAttempts() {
  try {
    // Get offline quiz attempts from IndexedDB
    const db = await openDB();
    const attempts = await getAllFromStore(db, 'offlineQuizAttempts');
    
    for (const attempt of attempts) {
      try {
        const response = await fetch('/api/quizzes/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(attempt.data),
        });
        
        if (response.ok) {
          // Remove from offline storage
          await deleteFromStore(db, 'offlineQuizAttempts', attempt.id);
          
          // Notify user of successful sync
          self.registration.showNotification('Quiz Synced', {
            body: 'Your offline quiz attempt has been synced successfully!',
            icon: '/icons/icon-192x192.png',
            badge: '/icons/badge-72x72.png',
          });
        }
      } catch (error) {
        console.error('[ServiceWorker] Failed to sync quiz attempt:', error);
      }
    }
  } catch (error) {
    console.error('[ServiceWorker] Sync quiz attempts failed:', error);
  }
}

async function syncCourseProgress() {
  try {
    const db = await openDB();
    const progressUpdates = await getAllFromStore(db, 'offlineProgress');
    
    for (const update of progressUpdates) {
      try {
        const response = await fetch('/api/courses/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(update.data),
        });
        
        if (response.ok) {
          await deleteFromStore(db, 'offlineProgress', update.id);
        }
      } catch (error) {
        console.error('[ServiceWorker] Failed to sync progress:', error);
      }
    }
  } catch (error) {
    console.error('[ServiceWorker] Sync progress failed:', error);
  }
}

// Push Notification
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Push received');
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'ABR Insights';
  const options = {
    body: data.body || 'You have a new notification',
    icon: data.icon || '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    image: data.image,
    vibrate: [200, 100, 200],
    tag: data.tag || 'default',
    data: {
      url: data.url || '/',
      ...data,
    },
    actions: data.actions || [
      { action: 'open', title: 'Open', icon: '/icons/open-24x24.png' },
      { action: 'close', title: 'Close', icon: '/icons/close-24x24.png' },
    ],
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification Click
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Periodic Background Sync (for premium features)
self.addEventListener('periodicsync', (event) => {
  console.log('[ServiceWorker] Periodic sync:', event.tag);
  
  if (event.tag === 'update-courses') {
    event.waitUntil(updateCachedCourses());
  }
});

async function updateCachedCourses() {
  try {
    // Fetch latest course updates
    const response = await fetch('/api/courses/updates');
    if (response.ok) {
      const updates = await response.json();
      
      // Update cache
      const cache = await caches.open(COURSE_CACHE);
      for (const courseUrl of updates.updatedCourses) {
        const courseResponse = await fetch(courseUrl);
        if (courseResponse.ok) {
          await cache.put(courseUrl, courseResponse);
        }
      }
      
      // Notify user of updates
      if (updates.updatedCourses.length > 0) {
        self.registration.showNotification('Course Updates Available', {
          body: `${updates.updatedCourses.length} course(s) have been updated`,
          icon: '/icons/icon-192x192.png',
          tag: 'course-updates',
        });
      }
    }
  } catch (error) {
    console.error('[ServiceWorker] Update cached courses failed:', error);
  }
}

// IndexedDB helpers
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ABRInsightsDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('offlineQuizAttempts')) {
        db.createObjectStore('offlineQuizAttempts', { keyPath: 'id', autoIncrement: true });
      }
      
      if (!db.objectStoreNames.contains('offlineProgress')) {
        db.createObjectStore('offlineProgress', { keyPath: 'id', autoIncrement: true });
      }
      
      if (!db.objectStoreNames.contains('downloadedCourses')) {
        db.createObjectStore('downloadedCourses', { keyPath: 'courseId' });
      }
    };
  });
}

function getAllFromStore(db, storeName) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function deleteFromStore(db, storeName, key) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

// Message handling
self.addEventListener('message', (event) => {
  console.log('[ServiceWorker] Message received:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data.type === 'CACHE_COURSE') {
    event.waitUntil(cacheCourse(event.data.courseId));
  } else if (event.data.type === 'REMOVE_COURSE_CACHE') {
    event.waitUntil(removeCourseCache(event.data.courseId));
  } else if (event.data.type === 'GET_CACHE_SIZE') {
    event.waitUntil(getCacheSize().then(size => {
      event.ports[0].postMessage({ type: 'CACHE_SIZE', size });
    }));
  } else if (event.data.type === 'CLEAR_ALL_CACHES') {
    event.waitUntil(clearAllCaches());
  }
});

async function cacheCourse(courseId) {
  try {
    // Fetch course data
    const courseResponse = await fetch(`/api/courses/${courseId}`);
    if (!courseResponse.ok) throw new Error('Failed to fetch course');
    
    const course = await courseResponse.json();
    const cache = await caches.open(COURSE_CACHE);
    
    // Cache course data
    await cache.put(`/api/courses/${courseId}`, new Response(JSON.stringify(course)));
    
    // Cache course modules and lessons
    for (const module of course.modules || []) {
      const moduleResponse = await fetch(`/api/modules/${module.id}`);
      if (moduleResponse.ok) {
        await cache.put(`/api/modules/${module.id}`, moduleResponse.clone());
      }
      
      // Cache video content if present
      if (module.video_url) {
        const videoResponse = await fetch(module.video_url);
        if (videoResponse.ok) {
          const videoCache = await caches.open(VIDEO_CACHE);
          await videoCache.put(module.video_url, videoResponse);
        }
      }
    }
    
    // Store in IndexedDB
    const db = await openDB();
    const transaction = db.transaction(['downloadedCourses'], 'readwrite');
    const store = transaction.objectStore('downloadedCourses');
    store.put({
      courseId,
      title: course.title,
      downloadedAt: new Date().toISOString(),
      size: await getCourseCacheSize(courseId),
    });
    
    // Notify success
    self.registration.showNotification('Course Downloaded', {
      body: `"${course.title}" is now available offline`,
      icon: '/icons/icon-192x192.png',
      tag: `download-${courseId}`,
    });
  } catch (error) {
    console.error('[ServiceWorker] Cache course failed:', error);
    self.registration.showNotification('Download Failed', {
      body: 'Failed to download course for offline use',
      icon: '/icons/icon-192x192.png',
      tag: `download-error-${courseId}`,
    });
  }
}

async function removeCourseCache(courseId) {
  const cache = await caches.open(COURSE_CACHE);
  const requests = await cache.keys();
  
  for (const request of requests) {
    if (request.url.includes(courseId)) {
      await cache.delete(request);
    }
  }
  
  // Remove from IndexedDB
  const db = await openDB();
  const transaction = db.transaction(['downloadedCourses'], 'readwrite');
  const store = transaction.objectStore('downloadedCourses');
  store.delete(courseId);
}

async function getCacheSize() {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return {
      usage: estimate.usage,
      quota: estimate.quota,
      percentage: ((estimate.usage / estimate.quota) * 100).toFixed(2),
    };
  }
  return { usage: 0, quota: 0, percentage: 0 };
}

async function getCourseCacheSize(courseId) {
  const cache = await caches.open(COURSE_CACHE);
  const requests = await cache.keys();
  let size = 0;
  
  for (const request of requests) {
    if (request.url.includes(courseId)) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        size += blob.size;
      }
    }
  }
  
  return size;
}

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
  
  // Clear IndexedDB
  const db = await openDB();
  const storeNames = ['offlineQuizAttempts', 'offlineProgress', 'downloadedCourses'];
  
  for (const storeName of storeNames) {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    store.clear();
  }
}

console.log('[ServiceWorker] Loaded');
