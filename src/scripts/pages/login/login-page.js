// src/scripts/pages/login/login-page.js
export default class LoginPage {
  #presenter = null;

  setPresenter(presenter) {
    this.#presenter = presenter;
  }

  async render() {
    return `
      <section class="container auth">
        <h1 tabindex="0">Login</h1>
        <form id="login-form" aria-label="Form login">
          <label for="email">Email</label>
          <input type="email" id="email" required placeholder="you@example.com">

          <label for="password">Password</label>
          <input type="password" id="password" required minlength="8">

          <button type="submit">Masuk</button>
          <p id="msg" role="alert" aria-live="polite"></p>
          <p>Belum punya akun? <a href="#/register">Daftar di sini</a></p>
        </form>
      </section>
    `;
  }

  async afterRender() {
    const form = document.getElementById('login-form');
    const msg = document.getElementById('msg');

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      msg.textContent = 'Memproses...';
      const result = await this.#presenter.login(email, password);
      if (result.error) {
        msg.textContent = result.message;
      } else {
        localStorage.setItem('authToken', result.loginResult.token);
        location.hash = '#/';
      }
    });
  }
}