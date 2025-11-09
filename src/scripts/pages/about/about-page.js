// src/scripts/pages/about/about-page.js
export default class AboutPage {
  async render() {
    return `
      <section class="container about">
        <h1 tabindex="0">Tentang Aplikasi</h1>
        <p>Aplikasi <strong>Berbagi Cerita</strong> memungkinkan pengguna berbagi pengalaman dengan foto dan lokasi.</p>
        <ul>
          <li>Autentikasi aman</li>
          <li>Peta interaktif dengan multiple layer</li>
          <li>Upload foto via kamera atau galeri</li>
          <li>Transisi halaman halus</li>
          <li>Aksesibel & responsif</li>
        </ul>
        <p>Dibuat untuk submission Dicoding.</p>
      </section>
    `;
  }

  async afterRender() {
    // Bisa tambah animasi atau fetch stats
  }
}