// CSS imports
import '../styles/styles.css';
import 'leaflet/dist/leaflet.css';

import App from './pages/app';
import CONFIG from './config.js';

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });
  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });
});
// src/scripts/index.js (akhir file)
if ('serviceWorker' in navigator && 'PushManager' in window) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(reg => {
      console.log('SW registered');
      subscribePush(reg);
    })
    .catch(err => console.error('SW error', err));
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

// src/scripts/index.js → ganti fungsi subscribePush
async function subscribePush(reg) {
  try {
    // TUNGGU SAMPAI SW AKTIF
    if (!reg.active) {
      console.log('Menunggu SW aktif...');
      await new Promise(resolve => {
        if (reg.installing) {
          reg.installing.addEventListener('statechange', () => {
            if (reg.installing.state === 'activated') resolve();
          });
        } else if (reg.waiting) {
          reg.waiting.addEventListener('statechange', () => {
            if (reg.waiting.state === 'activated') resolve();
          });
        } else {
          resolve();
        }
      });
    }

    // Sekarang reg.active pasti ada
    const vapidPublicKey = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';
    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey
    });

    console.log('Push subscribed:', subscription);

    const token = localStorage.getItem('authToken');
    if (token) {
      await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(subscription)
      });
      console.log('Subscription dikirim ke server');
    }
  } catch (err) {
    console.error('Push subscription gagal:', err);
  }
}

async function unsubscribePush() {
  const reg = await navigator.serviceWorker.ready;
  const subscription = await reg.pushManager.getSubscription();
  if (subscription) {
    await subscription.unsubscribe();
    const token = localStorage.getItem('authToken');
    await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ endpoint: subscription.endpoint })
    });
  }
}

// src/scripts/index.js → bagian register
if ('serviceWorker' in navigator && 'PushManager' in window) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => {
        console.log('SW registered:', reg.scope);

        // Force update
        reg.update();

        // Tunggu sampai active, lalu subscribe
        function waitForActive() {
          if (reg.active) {
            subscribePush(reg);
          } else if (reg.installing || reg.waiting) {
            const worker = reg.installing || reg.waiting;
            worker.addEventListener('statechange', () => {
              if (worker.state === 'activated') {
                subscribePush(reg);
              }
            });
          } else {
            setTimeout(waitForActive, 100);
          }
        }

        waitForActive();

        // Handle update
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        });
      })
      .catch(err => console.error('SW registration failed:', err));
  });
}