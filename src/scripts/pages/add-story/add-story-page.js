// src/scripts/pages/add-story/add-story-page.js
import CONFIG from '../../config.js';

export default class AddStoryPage {
  #presenter = null;

  setPresenter(presenter) {
    this.#presenter = presenter;
  }

  async render() {
    return `
      <section class="container add-story">
        <h1 tabindex="0">Bagikan Cerita</h1>
        <form id="add-story-form" aria-label="Form tambah cerita">
          <div class="form-group">
            <label for="description">Deskripsi</label>
            <textarea id="description" required minlength="10" placeholder="Ceritakan pengalamanmu..."></textarea>
          </div>

          <div class="form-group">
            <label for="photo">Foto</label>
            <input type="file" id="photo" accept="image/*" required>
            <button type="button" id="camera-btn" class="btn-secondary">Gunakan Kamera</button>
          </div>

          <div class="form-group">
            <label>Lokasi (opsional)</label>
            <button type="button" id="use-gps" class="btn-small">Gunakan GPS</button>
            <div id="map-add" class="map"></div>
          </div>

          <button type="submit" class="btn-primary">Kirim Cerita</button>
          <p id="form-message" role="alert" aria-live="polite"></p>
        </form>

        <video id="camera-stream" hidden autoplay playsinline></video>
        <canvas id="photo-canvas" hidden></canvas>
      </section>
    `;
  }

  async afterRender() {
    const form = document.getElementById('add-story-form');
    const msg = document.getElementById('form-message');
    const photoInput = document.getElementById('photo');
    const cameraBtn = document.getElementById('camera-btn');
    const gpsBtn = document.getElementById('use-gps');
    const mapEl = document.getElementById('map-add');
    const video = document.getElementById('camera-stream');
    const canvas = document.getElementById('photo-canvas');

    let map, marker, lat, lon, stream;

    // PAKSA UKURAN
    mapEl.style.height = '400px';
    mapEl.style.width = '100%';

    const L = await import('leaflet');

    // Custom icon
    const greenIcon = L.icon({
      iconUrl: '/images/leaf-green.png',
      shadowUrl: '/images/leaf-shadow.png',
      iconSize: [38, 95],
      shadowSize: [50, 64],
      iconAnchor: [22, 94],
      shadowAnchor: [4, 62],
      popupAnchor: [-3, -76]
    });

    // Init map
    const indonesiaCoor = [-2.548926, 118.0148634];
    map = L.map(mapEl, {
      center: indonesiaCoor,
      zoom: 5
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    requestAnimationFrame(() => map.invalidateSize(true));

    // Klik peta → marker + popup koordinat
    const popup = L.popup();
    map.on('click', e => {
      lat = e.latlng.lat;
      lon = e.latlng.lng;
      popup
        .setLatLng(e.latlng)
        .setContent(`Lokasi dipilih: ${e.latlng.toString()}`)
        .openOn(map);

      if (marker) marker.setLatLng(e.latlng);
      else marker = L.marker(e.latlng, { icon: greenIcon }).addTo(map);
    });

    // GPS
    gpsBtn.addEventListener('click', () => {
      navigator.geolocation.getCurrentPosition(
        pos => {
          lat = pos.coords.latitude;
          lon = pos.coords.longitude;
          const latlng = [lat, lon];
          map.setView(latlng, 13);
          if (marker) marker.setLatLng(latlng);
          else marker = L.marker(latlng, { icon: greenIcon }).addTo(map);
          map.invalidateSize();
        },
        () => msg.textContent = 'GPS gagal.'
      );
    });

    // Kamera & Submit (tetap)
    cameraBtn.addEventListener('click', async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        video.hidden = false;
        cameraBtn.textContent = 'Ambil Foto';
        cameraBtn.onclick = () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          canvas.getContext('2d').drawImage(video, 0, 0);
          canvas.toBlob(blob => {
            const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
            const dt = new DataTransfer();
            dt.items.add(file);
            photoInput.files = dt.files;
            video.hidden = true;
            stream.getTracks().forEach(t => t.stop());
            cameraBtn.textContent = 'Gunakan Kamera';
            cameraBtn.onclick = null;
          });
        };
      } catch (err) {
        msg.textContent = 'Kamera tidak tersedia.';
      }
    });

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const desc = document.getElementById('description').value;
      const photo = photoInput.files[0];
      if (!photo) return msg.textContent = 'Pilih foto!';

      msg.textContent = 'Mengirim...';
      const result = await this.#presenter.addStory(desc, photo, lat, lon);
      if (result.error) {
        msg.textContent = result.message || 'Gagal kirim.';
      } else {
        msg.textContent = 'Sukses!';
        form.reset();
        if (marker) map.removeLayer(marker);
        marker = null; lat = lon = null;
        setTimeout(() => location.hash = '#/', 1500);
      }
    });
  }
}