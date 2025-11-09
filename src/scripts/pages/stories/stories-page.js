// src/scripts/pages/stories/stories-page.js
import CONFIG from '../../config.js';
import { showFormattedDate } from '../../utils/index.js';

export default class StoriesPage {
  #presenter = null;

  setPresenter(presenter) {
    this.#presenter = presenter;
  }

  async render() {
    return `
      <section class="container stories-page">
        <h1 tabindex="0">Cerita Pengguna</h1>
        <div id="stories-list" class="grid"></div>
        <div id="map" class="map"></div>
      </section>
    `;
  }

  async afterRender() {
    const listEl = document.getElementById('stories-list');
    const mapEl = document.getElementById('map');

    // PAKSA UKURAN SEBELUM INIT
    mapEl.style.height = '100vh';
    mapEl.style.width = '100%';

    // Import Leaflet
    const L = await import('leaflet');

    // CUSTOM ICON (sesuai tutorial)
    const greenIcon = L.icon({
      iconUrl: '/images/leaf-green.png',
      shadowUrl: '/images/leaf-shadow.png',
      iconSize: [38, 95],
      shadowSize: [50, 64],
      iconAnchor: [22, 94],
      shadowAnchor: [4, 62],
      popupAnchor: [-3, -76]
    });

    // Init map (Indonesia center)
    const indonesiaCoor = [-2.548926, 118.0148634];
    const map = L.map(mapEl, {
      center: indonesiaCoor,
      zoom: 5
    });

    // Base tile OSM
    const rasterTileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
    const baseTile = L.tileLayer(rasterTileUrl, {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });
    baseTile.addTo(map);

    // Stadia layer (opsional)
    const stadia = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
      attribution: '© Stadia Maps'
    });
    L.control.layers({ 'OSM': baseTile, 'Stadia': stadia }).addTo(map);

    // invalidateSize (wajib!)
    requestAnimationFrame(() => map.invalidateSize(true));

    // Fetch stories
    const stories = await this.#presenter.fetchStories(1);
    this.renderList(listEl, stories);
    this.renderMarkers(map, stories, greenIcon);
  }

  renderList(container, stories) {
    container.innerHTML = stories.map(s => `
      <article class="story-card" tabindex="0" data-id="${s.id}">
        <img src="${s.photoUrl}" alt="Foto cerita oleh ${s.name}" loading="lazy">
        <div class="content">
          <h3>${s.name}</h3>
          <p>${s.description.substring(0, 100)}...</p>
          <time datetime="${s.createdAt}">${showFormattedDate(s.createdAt)}</time>
        </div>
      </article>
    `).join('');

    container.querySelectorAll('.story-card').forEach(card => {
      card.addEventListener('click', () => location.hash = `#/detail/${card.dataset.id}`);
      card.addEventListener('keydown', e => e.key === 'Enter' && (location.hash = `#/detail/${card.dataset.id}`));
    });
  }

  renderMarkers(map, stories, icon) {
    const markers = {};
    stories.forEach(s => {
      if (s.lat && s.lon) {
        const marker = L.marker([s.lat, s.lon], { icon }).addTo(map)
          .bindPopup(`<b>${s.name}</b><br>${s.description}<br><img src="${s.photoUrl}" width="150" alt="">`);
        markers[s.id] = marker;
      }
    });

    document.querySelectorAll('.story-card').forEach(card => {
      card.addEventListener('focus', () => {
        const marker = markers[card.dataset.id];
        if (marker) {
          map.setView(marker.getLatLng(), 12);
          marker.openPopup();
        }
      });
    });
  }
}