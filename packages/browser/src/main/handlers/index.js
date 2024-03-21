import {
    app,
    session,
    ipcMain,
    nativeTheme,
    Notification,
    BrowserWindow,
} from 'electron';

import AppUpdater from '../updater';
import { getTabSession } from '../session';
import tabsManager from '../tabs';
import { getExtensionFoldersAndManifests } from '../chrome-extensions';

const path = require('path');

let appUpdater = new AppUpdater();

const initMain = async () => {
    ipcMain.handle('tab:select-tab', async (event, arg) => {
        tabsManager.selectTab(arg);
    });

    ipcMain.handle('tab:load-url', async (event, arg) => {
        let url = arg.url;

        const protocol = 'https://';
        const unsafeProtocol = 'http://';

        if (url.startsWith(unsafeProtocol)) {
            url = url.split(unsafeProtocol)[1];
        }

        if (!url.startsWith(protocol)) {
            url = protocol.concat(url);
        }

        arg.url = url;

        tabsManager.loadInTab(arg);
    });

    ipcMain.handle('tab:refresh-tab', async (event, arg) => {
        tabsManager.refreshTab(arg);
    });

    ipcMain.handle('tab:gohome-tab', async (event, arg) => {
        tabsManager.goHomeTab(arg);
    });

    ipcMain.handle('tab:tab-size-changed', async (event, arg) => {
        tabsManager.resizeTab(arg);
    });

    ipcMain.handle('tabs:get-current-tabs', async (evt, arg) => {
        const tabIds = [];
        const tabs = await tabsManager.getCurrentTabs();
        tabs.forEach((tab) => tabIds.push(tab.id));
        return tabIds;
    });

    ipcMain.handle('extensions:get-extensions', async (evt, arg) => {
        const extensionsPath = path.join(__dirname, '../../../../extensions');
        const extensions = getExtensionFoldersAndManifests(extensionsPath);
        return extensions;
    });

    ipcMain.handle('extensions:activate-extension', async (evt, arg) => {
        console.log('activate-extension', arg);
        const tabSession = await getTabSession();
        const result = await tabSession.loadExtension(arg.extensionPath);
        console.log('Extension loaded', result);

        // setTimeout(async () => {
        //     let landingPage = arg.launchPage;

        //     if (result.id === 'acmacodkjbdgmoleebolmdjonilkdbch') {
        //         landingPage = 'index.html';
        //     }

        //     if (result.id === 'eajafomhmkipbjmfmhebemolkcicgfmd') {
        //         landingPage = 'popup.html';
        //     }

        //     if (result.id === 'nkbihfbeogaeaoehlefnkodbefgpgknn') {
        //         landingPage = 'home.html';
        //     }

        //     await tabsManager.loadInTab({
        //         extensionId: result.id,
        //         id: result.id,
        //         url: 'chrome-extension://' + result.id + '/' + landingPage,
        //     });
        // }, 1000);

        return;
    });

    ipcMain.handle('close-app', (evt, arg) => {
        app.quit();
    });

    ipcMain.handle('dark-mode:toggle', () => {
        if (nativeTheme.shouldUseDarkColors) {
            nativeTheme.themeSource = 'light';
        } else {
            nativeTheme.themeSource = 'dark';
        }
        return nativeTheme.shouldUseDarkColors;
    });

    ipcMain.handle('dark-mode:system', () => {
        nativeTheme.themeSource = 'system';
    });

    ipcMain.handle('window-controls:minimize-window', async (evt, arg) => {
        const webContents = evt.sender;
        const window = BrowserWindow.fromWebContents(webContents);
        window.minimize();
    });

    ipcMain.handle('window-controls:maximize-window', async (evt, arg) => {
        const webContents = evt.sender;
        const window = BrowserWindow.fromWebContents(webContents);
        window.maximize();
    });

    ipcMain.handle('window-controls:restore-window', async (evt, arg) => {
        const webContents = evt.sender;
        const window = BrowserWindow.fromWebContents(webContents);
        window.restore();
    });

    ipcMain.handle('window-controls:close-window', async (evt, arg) => {
        const webContents = evt.sender;
        const window = BrowserWindow.fromWebContents(webContents);
        console.log('Window', window);
        window.close();
    });

    ipcMain.on('clear-cache', async (evt, arg) => {
        await session.defaultSession.clearCache();
    });

    ipcMain.on('notification', async (evt, arg) => {
        new Notification({ ...arg }).show();
    });

    ipcMain.on('updater:check-update', (event) => {
        appUpdater.checkForUpdates();
    });

    ipcMain.on('updater:download-update', (event) => {
        appUpdater.downloadUpdate();
    });

    ipcMain.handle('updater:get-current-version', (event) => {
        return app.getVersion();
    });
};

export default initMain;
