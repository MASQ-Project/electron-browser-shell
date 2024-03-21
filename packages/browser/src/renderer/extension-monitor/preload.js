const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('windowControls', {
    minimize: () => ipcRenderer.invoke('window-controls:minimize-window'),
    maximize: () => ipcRenderer.invoke('window-controls:maximize-window'),
    restore: () => ipcRenderer.invoke('window-controls:restore-window'),
    close: () => ipcRenderer.invoke('window-controls:close-window'),
});

contextBridge.exposeInMainWorld('electronApi', {
    getExtensions: () => ipcRenderer.invoke('extensions:get-extensions'),
    onExtensionsFound: (callback) =>
        ipcRenderer.on('extensions:extensions-found', callback),
    activateExtension: (extension) =>
        ipcRenderer.invoke('extensions:activate-extension', extension),
});
