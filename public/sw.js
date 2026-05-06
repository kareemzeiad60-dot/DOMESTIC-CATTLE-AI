// Simple Service Worker for Domestic Cattle AI
const CACHE_NAME = 'cattle-ai-v1';

self.addEventListener('install', (event) => {
  console.log('SW Installed');
});

self.addEventListener('fetch', (event) => {
  // Basic bypass
  event.respondWith(fetch(event.request));
});
