// 1. เปลี่ยนชื่อเวอร์ชันเป็น v2 (ถ้าแก้โค้ดครั้งหน้า ให้เปลี่ยนเป็น v3, v4 ไปเรื่อยๆ)
const CACHE_NAME = 'student-task-v3';

const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manifest.json'
];

// 2. ติดตั้ง Service Worker และ Cache ไฟล์
self.addEventListener('install', (e) => {
  // บังคับให้ Service Worker ตัวใหม่ทำงานทันที ไม่ต้องรอปิดแท็บเดิม
  self.skipWaiting(); 
  
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// 3. [เพิ่มใหม่] ลบ Cache เก่าทิ้งเมื่อมีการอัปเดตเวอร์ชัน
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME) // ถ้าชื่อ Cache ไม่ตรงกับเวอร์ชันปัจจุบัน
            .map((key) => caches.delete(key))    // ลบทิ้งซะ
      );
    })
  );
  // สั่งให้ควบคุมทุกแท็บทันที
  return self.clients.claim();
});

// 4. ดึงข้อมูลจาก Cache (ถ้าไม่มีเน็ต หรือมีไฟล์ในเครื่องแล้ว)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
