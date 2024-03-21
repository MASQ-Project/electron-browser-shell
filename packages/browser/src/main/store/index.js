const Store = require('electron-store');

const initStore = () => {
    Store.initRenderer();
    const store = new Store();
};

export const setStore = (key, value) => {
    const store = new Store();
    return store.set(key, value);
};

export const getStore = (key) => {
    const store = new Store();
    return store.get(key);
};

export default initStore;
