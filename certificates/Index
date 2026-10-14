const V = 'nadrus-v1';
const SHELL = ['./', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if(r.method !== 'GET' || u.origin !== location.origin) return; // Firebase وباقي الخدمات الخارجية تعدّي مباشرة
  if(r.mode === 'navigate'){
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); return res; }).catch(() => caches.match(r).then(m => m || caches.match('./'))));
    return;
  }
  e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { if(res.ok){ const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); } return res; })));
});

/* ---------- Firebase Cloud Messaging (خلفية) ---------- */
try{
  importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');
  firebase.initializeApp({
    apiKey: "AIzaSyDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // انسخ نفس القيم من firebaseConfig في index.html
    authDomain: "studytogether-e8108.firebaseapp.com",
    projectId: "studytogether-e8108",
    storageBucket: "studytogether-e8108.appspot.com",
  });
  const messaging = firebase.messaging();
  messaging.onBackgroundMessage(payload => {
    const n = payload.notification || {};
    self.registration.showNotification(n.title || 'نُدرس معًا', { body: n.body || '', icon: 'icons/icon-192.png', badge: 'icons/icon-192.png' });
  });
}catch(e){ /* المتصفح لسه ما حمّلش السكريبتات أو مفيش دعم */ }
