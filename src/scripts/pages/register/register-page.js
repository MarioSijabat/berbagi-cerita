// src/scripts/pages/register/register-page.js
export default class RegisterPage {
  #presenter = null;

  setPresenter(presenter) {
    this.#presenter = presenter;
  }

  async render() {
    return `
      <section class="container auth">
        <h1 tabindex="0">Daftar Akun</h1>
        <form id="register-form" aria-label="Form registrasi">
          <label for="name">Nama</label>
          <input type="text" id="name" required minlength="3">

          <label for="email">Email</label>
          <input type="email" id="email" required>

          <label for="password">Password</label>
          <input type="password" id="password" required minlength="8">

          <button type="submit">Daftar</button>
          <p id="msg" role="alert" aria-live="polite"></p>
          <p>Sudah punya akun? <a href="#/login">Masuk</a></p>
        </form>
      </section>
    `;
  }

  async afterRender() {
    const form = document.getElementById('register-form');
    const msg = document.getElementById('msg');

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      msg.textContent = 'Mendaftar...';
      const result = await this.#presenter.register(name, email, password);
      if (result.error) {
        msg.textContent = result.message;
      } else {
        msg.textContent = 'Berhasil! Silakan login.';
        setTimeout(() => location.hash = '#/login', 1500);
      }
    });
  }
}