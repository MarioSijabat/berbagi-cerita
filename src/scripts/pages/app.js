// src/scripts/pages/app.js
import routes from '../routes/routes';
import { getActiveRouteKey, parseActivePathname } from '../routes/url-parser.js';
import StoryPresenter from '../presenters/story-presenter.js';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #presenter = new StoryPresenter();
  #logoutBtn = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this._setupDrawer();
    this._setupLogoutButton();
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (!this.#navigationDrawer.contains(event.target) && !this.#drawerButton.contains(event.target)) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      });
    });
  }

  _setupLogoutButton() {
    const logoutBtn = document.createElement('button');
    logoutBtn.textContent = 'Logout';
    logoutBtn.className = 'logout-btn';
    logoutBtn.style.marginLeft = '1rem';
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('authToken');
      location.hash = '#/login';
    });

    this.#drawerButton.parentElement.appendChild(logoutBtn);
    this.#logoutBtn = logoutBtn;
    this._updateAuthUI();
  }

  _updateAuthUI() {
    const isLoggedIn = !!localStorage.getItem('authToken');
    if (this.#logoutBtn) {
      this.#logoutBtn.style.display = isLoggedIn ? 'inline-block' : 'none';
    }
    const loginLink = document.querySelector('a[href="#/login"]');
    const registerLink = document.querySelector('a[href="#/register"]');
    if (loginLink) loginLink.style.display = isLoggedIn ? 'none' : 'list-item';
    if (registerLink) registerLink.style.display = isLoggedIn ? 'none' : 'list-item';
  }

  async renderPage() {
    const routeKey = getActiveRouteKey();
    const isAuthPage = routeKey === '/login' || routeKey === '/register';
    const token = localStorage.getItem('authToken');

    // ROUTE GUARD
    if (!isAuthPage && !token) {
      location.hash = '#/login';
      return;
    }

    let pageInstance = routes[routeKey];
    if (!pageInstance) {
      location.hash = '#/';
      return;
    }

    // Injeksi presenter
    pageInstance.setPresenter?.(this.#presenter);

    // Kirim ID ke DetailStoryPage
    if (routeKey === '/detail/:id') {
      const { id } = parseActivePathname();
      pageInstance.setStoryId?.(id);
    }

    // Update UI
    this._updateAuthUI();

    // Render dengan View Transition
    if (document.startViewTransition) {
      await document.startViewTransition(async () => {
        this.#content.innerHTML = await pageInstance.render();
        await pageInstance.afterRender();
      }).finished;
    } else {
      this.#content.innerHTML = await pageInstance.render();
      await pageInstance.afterRender();
    }
  }
}

export default App;