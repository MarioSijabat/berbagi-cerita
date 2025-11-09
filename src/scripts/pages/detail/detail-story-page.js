// src/scripts/pages/detail/detail-story-page.js
export default class DetailStoryPage {
  #presenter = null;
  #storyId = null;

  setPresenter(presenter) { this.#presenter = presenter; }
  setStoryId(id) {
    this.#storyId = id;
  }

  async render() {
    return `<section class="container"><h1>Detail Story</h1><div id="detail-content"></div></section>`;
  }

async afterRender() {
  const story = await this.#presenter.getStoryById(this.#storyId);
  if (!story) { /* error msg */ return; }

  document.getElementById('detail-content').innerHTML = `
    <img src="${story.photoUrl}" alt="Foto ${story.name}">
    <h2>${story.name}</h2>
    <p>${story.description}</p>
    <time>${new Date(story.createdAt).toLocaleString()}</time>
    <button id="delete-btn">Hapus Cerita</button>
  `;

  document.getElementById('delete-btn').addEventListener('click', async () => {
    await db.deleteStory(this.#storyId);
    location.hash = '/';
  });
}
}