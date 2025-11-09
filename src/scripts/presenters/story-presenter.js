// src/scripts/presenters/story-presenter.js
import * as api from '../data/api.js';
import * as db from '../data/db.js';

export default class StoryPresenter {
  async register(name, email, password) {
    return await api.register(name, email, password);
  }

  async login(email, password) {
    return await api.login(email, password);
  }

  async addStory(desc, photo, lat, lon) {
    return await api.addStory(desc, photo, lat, lon);
  }

  // async fetchStories(withLocation = 0) {
  //   const data = await api.getStories(withLocation);
  //   return data.error ? [] : data.listStory;
  // }

  async fetchStories(withLocation = 0) {
    try {
      const data = await api.getStories(withLocation);
      if (!data.error) {
        await db.saveStories(data.listStory);
        return data.listStory;
      }
    } catch (err) {
      console.error('API error, load from IDB');
    }
    return await db.getStories();
  }

  async deleteStory(id) {
    // Jika online, delete dari API jika ada endpoint, tapi Dicoding tidak ada → hanya IDB
    await db.deleteStory(id);
  }

  async getStoryById(id) {
    const data = await api.getStoryById(id);
    return data.error ? null : data.story;
  }
}