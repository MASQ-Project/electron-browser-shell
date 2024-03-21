const { contextBridge, ipcRenderer } = require('electron');

import { injectBrowserAction } from '../../../../electron-chrome-extensions/dist/browser-action';
injectBrowserAction();

contextBridge.exposeInMainWorld('darkMode', {
    toggle: () => ipcRenderer.invoke('dark-mode:toggle'),
    system: () => ipcRenderer.invoke('dark-mode:system'),
});

contextBridge.exposeInMainWorld('windowControls', {
    minimize: () => ipcRenderer.invoke('window-controls:minimize-window'),
    maximize: () => ipcRenderer.invoke('window-controls:maximize-window'),
    restore: () => ipcRenderer.invoke('window-controls:restore-window'),
    close: () => ipcRenderer.invoke('window-controls:close-window'),
});

contextBridge.exposeInMainWorld('electronApi', {
    loadUrl: (arg) => ipcRenderer.invoke('tab:load-url', arg),
    refreshTab: (arg) => ipcRenderer.invoke('tab:refresh-tab', arg),
    goHomeTab: (arg) => ipcRenderer.invoke('tab:gohome-tab', arg),
    onDidNavigate: (callback) => ipcRenderer.on('tab:did-navigate', callback),
    onDidNavigateInPage: (callback) =>
        ipcRenderer.on('tab:did-navigate-in-page', callback),
    onTabsFound: (callback) => ipcRenderer.on('tabs:tabs-found', callback),
    getCurrentTabs: () => ipcRenderer.invoke('tabs:get-current-tabs'),
    selectTab: (arg) => ipcRenderer.invoke('tab:select-tab', arg),
    onTabSelected: (callback) => ipcRenderer.on('tab:tab-selected', callback),
    onTabSizeChanged: (arg) => ipcRenderer.invoke('tab:tab-size-changed', arg),
});
