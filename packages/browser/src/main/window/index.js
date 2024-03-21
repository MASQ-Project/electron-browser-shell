import { screen, BrowserWindow, Menu, MenuItem } from 'electron';
import events, { Event } from '../events';
import { addGlobalShortcuts, clearGlobalShortcuts } from '../shortcuts';
import { getTabSession } from '../session';

const path = require('path');
const log = require('electron-log');
const isDevelopment = process.env.NODE_ENV === 'development';
const debugProd = process.env.DEBUG_PROD === 'true';

export class Window {
    static MAIN = 'MAIN';
    static EXTENSION_MONITOR = 'EXTENSION_MONITOR';
    static DEVTOOLS = 'DEVTOOLS';
    static EXTENSION_POPUP = 'EXTENSION_POPUP';
}

export class Options {
    static MAIN = {
        show: false,
        width: 1440,
        height: 900,
        minWidth: 1120,
        minHeight: 800,
        title: 'MAIN',
        frame: true,
        transparent: false,
        backgroundColor: '#455A64',
        titleBarStyle: 'hidden',
        webPreferences: {
            // eslint-disable-next-line no-undef
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
            alwaysOnTop: true,
            devTools: false,
        },
    };
    static EXTENSION_MONITOR = {
        show: false,
        title: 'EXTENSION_MONITOR',
        frame: true,
        transparent: false,
        backgroundColor: '#CFD8DC',
        titleBarStyle: 'hidden',
        webPreferences: {
            // eslint-disable-next-line no-undef
            preload: EXTENSION_MONITOR_PRELOAD_WEBPACK_ENTRY,
            alwaysOnTop: true,
            devTools: true,
        },
    };
    static DEVTOOLS = {};
    static EXTENSION_POPUP = { frame: true, webPreferences: {} };
}

const windows = new Map();
class WindowManager {
    async getMainWindow() {
        if (!windows.has(Window.MAIN)) {
            const mainWindow = await this.createMainWindow();
            windows.set(Window.MAIN, mainWindow);
        }
        return windows.get(Window.MAIN);
    }

    async getExtensionMonitorWindow() {
        const monitorWindow = await this.getWindow(Window.EXTENSION_MONITOR);
        const theEvents = [...Event.EXTENSION];
        events.subscribe(monitorWindow.webContents, theEvents);
        return monitorWindow;
    }

    async getWindow(type) {
        if (!windows.has(Window[type])) {
            const options = Options[type];
            if (type === Window.DEVTOOLS || type == Window.EXTENSION_MONITOR) {
                options.parent = await this.getMainWindow();
            }
            const window = new BrowserWindow(options);
            windows.set(Window[type], window);
        }
        return windows.get(Window[type]);
    }

    getWindowForExtensionPopup(details) {
        const options = Options.EXTENSION_POPUP;
        options.webPreferences.session = getTabSession();
        options.width = details.width;
        options.height = details.height;
        // options.x = details.left;
        // options.y = details.top;
        const window = new BrowserWindow(options);
        window.setMenuBarVisibility(false);
        window.webContents.loadURL(details.url);
        windows.set(window.id, window);
        return window;
    }

    async createMainWindow() {
        const options = Options.MAIN;

        if (isDevelopment) {
            const workAreaSize = screen.getPrimaryDisplay().workAreaSize;
            options.width = Math.floor(workAreaSize.width * (2 / 3));
            options.height = Math.floor(workAreaSize.height);
            options.x = 0;
            options.y = 0;
            options.webPreferences.devTools = true;
        } else if (debugProd) {
            options.webPreferences.devTools = true;
        }

        options.webPreferences.session = getTabSession();

        const mainWindow = new BrowserWindow(options);

        mainWindow.setMenuBarVisibility(false);

        const theEvents = [...Event.TAB, ...Event.UPDATER];

        events.subscribe(mainWindow.webContents, theEvents);

        mainWindow.setMenuBarVisibility(false);

        mainWindow.on('focus', async () => {
            addGlobalShortcuts();
        });

        mainWindow.on('blur', async () => {
            clearGlobalShortcuts();
        });

        mainWindow.once('ready-to-show', async () => {
            mainWindow.show();
            if (isDevelopment || debugProd) {
                log.info('Opening DevTools...');
                const devTools = await this.getWindow(Window.DEVTOOLS);
                const extensionMonitor = await this.getWindow(
                    Window.EXTENSION_MONITOR
                );
                mainWindow.webContents.setDevToolsWebContents(
                    devTools.webContents
                );
                mainWindow.webContents.openDevTools({ mode: 'detach' });
                mainWindow.webContents.once('did-finish-load', function () {
                    const windowBounds = mainWindow.getBounds();
                    devTools.setPosition(
                        windowBounds.x + windowBounds.width,
                        windowBounds.y
                    );
                    devTools.setSize(
                        Math.floor(windowBounds.width / 2),
                        Math.floor(windowBounds.height / 2)
                    );
                    extensionMonitor.setPosition(
                        windowBounds.x + windowBounds.width,
                        windowBounds.y + Math.floor(windowBounds.height / 2)
                    );
                    extensionMonitor.setSize(
                        Math.floor(windowBounds.width / 2),
                        Math.floor(windowBounds.height / 2)
                    );
                });
                mainWindow.on('move', function () {
                    if (!devTools || devTools.isDestroyed()) return;
                    const windowBounds = mainWindow.getBounds();
                    devTools.setPosition(
                        windowBounds.x + windowBounds.width,
                        windowBounds.y
                    );
                    devTools.setSize(
                        Math.floor(windowBounds.width / 2),
                        Math.floor(windowBounds.height / 2)
                    );
                    extensionMonitor.setPosition(
                        windowBounds.x + windowBounds.width,
                        windowBounds.y + Math.floor(windowBounds.height / 2)
                    );
                    extensionMonitor.setSize(
                        Math.floor(windowBounds.width / 2),
                        Math.floor(windowBounds.height / 2)
                    );
                });
                mainWindow.on('resize', function () {
                    if (!devTools || devTools.isDestroyed()) return;
                    const windowBounds = mainWindow.getBounds();
                    devTools.setPosition(
                        windowBounds.x + windowBounds.width,
                        windowBounds.y
                    );
                    devTools.setSize(
                        Math.floor(windowBounds.width / 2),
                        Math.floor(windowBounds.height / 2)
                    );
                    extensionMonitor.setPosition(
                        windowBounds.x + windowBounds.width,
                        windowBounds.y + Math.floor(windowBounds.height / 2)
                    );
                    extensionMonitor.setSize(
                        Math.floor(windowBounds.width / 2),
                        Math.floor(windowBounds.height / 2)
                    );
                });
            }
        });

        mainWindow.webContents.on('context-menu', (e, params) => {
            const ctxMenu = new Menu();
            if (params.isEditable) {
                ctxMenu.append(
                    new MenuItem({
                        label: 'Cut',
                        role: 'cut',
                    })
                );
                ctxMenu.append(
                    new MenuItem({
                        label: 'Copy',
                        role: 'copy',
                    })
                );
                ctxMenu.append(
                    new MenuItem({
                        label: 'Paste',
                        role: 'paste',
                    })
                );
                ctxMenu.popup(mainWindow, params.x, params.y);
            }
        });

        mainWindow.on('close', (event) => {
            events.unsubscribeAll(mainWindow.webContents);
            mainWindow.webContents.send('shutdown-node');
            windows.delete(Window.MAIN);
            if (isDevelopment || debugProd) {
                windows.delete(Window.DEVTOOLS);
            }
        });

        mainWindow.webContents.session.on(
            'select-hid-device',
            (event, details, callback) => {
                log.debug('select-hid-device FIRED', details);
                // Add events to handle devices being added or removed before the callback on
                // `select-hid-device` is called.
                mainWindow.webContents.session.on(
                    'hid-device-added',
                    (event, device) => {
                        log.debug('hid-device-added FIRED WITH', device);
                        // Optionally update details.deviceList
                    }
                );

                mainWindow.webContents.session.on(
                    'hid-device-removed',
                    (event, device) => {
                        log.debug('hid-device-removed FIRED WITH', device);
                        // Optionally update details.deviceList
                    }
                );

                event.preventDefault();
                if (details.deviceList && details.deviceList.length > 0) {
                    callback(details.deviceList[0].deviceId);
                }
            }
        );

        mainWindow.webContents.session.setPermissionCheckHandler(
            (webContents, permission, requestingOrigin, details) => {
                permission === 'hid' &&
                    log.debug(
                        'set-permission-check FIRED',
                        permission,
                        details
                    );
                if (
                    permission === 'hid' &&
                    details.securityOrigin.startsWith('chrome-extension://')
                ) {
                    return true;
                }
            }
        );

        mainWindow.webContents.session.setDevicePermissionHandler((details) => {
            // (details.deviceType === 'hid' || details.deviceType === 'usb') &&
            //     log.debug('set-device-permission FIRED', details);
            if (
                details.deviceType === 'hid' &&
                details.device?.vendorId === 11415 && // Ledger
                details.origin.startsWith('chrome-extension://')
            ) {
                log.debug('set-device-permission FIRED', details);
                return true;
            }
            // if (
            //     details.deviceType === 'usb' &&
            //     details.device?.productName === 'TREZOR' &&
            //     details.origin.startsWith('chrome-extension://')
            // ) {
            //     return true;
            // }
        });

        return mainWindow;
    }

    hasMainWindow() {
        return windows.has(Window.MAIN);
    }
}

export default new WindowManager();
