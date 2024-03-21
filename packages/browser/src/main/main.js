const { app, BrowserWindow } = require('electron');
import initMain from './handlers';
import initStore from './store';
import { initSession } from './session';
import windowManager from './window';
import tabsManager from './tabs';
import { initExtensions } from './chrome-extensions';

const log = require('electron-log');

const isProduction = process.env.NODE_ENV === 'production';
const debugProd = process.env.DEBUG_PROD === 'true';

if (isProduction) {
    const sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();

    if (!debugProd) {
        log.transports.file.level = 'error';
        log.transports.console.level = 'error';
    }
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

const start = async () => {
    initSession();
    launchApp();
};

const launchApp = async () => {
    // Create the browser window.
    const mainWindow = await windowManager.getMainWindow();

    // and load the index.html of the app.
    // eslint-disable-next-line no-undef
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    const monitorWindow = await windowManager.getExtensionMonitorWindow();
    // eslint-disable-next-line no-undef
    monitorWindow.loadURL(EXTENSION_MONITOR_WEBPACK_ENTRY);

    monitorWindow.once('ready-to-show', async () => {
        monitorWindow.show();
        monitorWindow.webContents.openDevTools();
    });

    initExtensions();

    setTimeout(async () => {
        await tabsManager.loadInTab({
            url: 'https://app.uniswap.org',
        });
    }, 1000);
};

app.whenReady()
    .then(start)
    .catch((error) => log.error(error));

app.on('will-finish-launching', () => {
    initMain();
    initStore();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        launchApp();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

app.on('web-contents-created', async (event, webContents) => {
    const type = webContents.getType();
    const url = webContents.getURL();
    const title = webContents.getTitle();
    console.log(
        `'web-contents-created' event [type:${type}, url:${url}, title:${title}]`
    );
    if (
        ['backgroundPage', 'remote'].includes(type) &&
        !url.startsWith('devtools') &&
        !webContents.isDevToolsOpened()
    ) {
        console.log(`opening devtools for [type:${type}, url:${url}]`);
        webContents.openDevTools({ mode: 'detach' });
    }
});
