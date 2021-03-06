/* eslint-disable no-unused-vars */
import Dexie from 'dexie';

function createDb() {
  const api = {};

  const db = new Dexie('igit');

  db.version(1).stores({
    profile: '++id, token, name, avatar, login',
    repos: '++id, name, repoId, nameWithOwner, isPrivate, url, selected, owner',
    notifications: '++id, objectId'
  });

  api.getProfile = async function () {
    const res = await db.profile.toArray();

    if (res.length === 0) {
      return null;
    }
    return res.shift();
  };
  api.setProfile = async function (profile) {
    db.profile.add(profile);
  };
  api.getRepos = function () {
    return db.repos.toArray();
  };
  api.toggleRepo = async function (repo) {
    const currentRepos = await db.repos.toArray();
    const repoInDB = currentRepos.find(({ repoId }) => repoId === repo.repoId);

    if (repoInDB) {
      await db.repos.where('repoId').equals(repo.repoId).delete();
    } else {
      const { prs, ...rest } = repo;

      await db.repos.add({ ...rest });
    }
  };
  api.getNotifications = async function () {
    return db.notifications.toArray();
  };
  api.markAsRead = async function (id) {
    await db.notifications.add({ objectId: id });
  };
  api.markAsReadBulk = async function (ids) {
    await db.notifications.bulkAdd(ids.map(id => ({ objectId: id })));
  };
  api.delete = async function (id) {
    const entry = await db.notifications.get({ objectId: id });

    if (entry) {
      await db.notifications.delete(entry.id);
    } else {
      console.warn(`There is no notification with id "${ id }". You are trying to delete it but it is not there.`);
    }
  };
  api.bulkDelete = function (ids) {
    return Promise.all(ids.map(api.delete));
  };

  return api;
}

const db = createDb();

export default db;
