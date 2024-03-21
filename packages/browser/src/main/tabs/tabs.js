import { BrowserView } from 'electron';
import events from '../events';
import { getTabSession } from '../session';

import windowManager from '../window';
import {
    addTabToExtensions,
    selectTabInExtensions,
} from '../chrome-extensions';
const log = require('electron-log');

const topOffset = 40;

class Options {
    static BROWSER_TAB = {
        backgroundColor: '#ffffff',
        transparent: false,
        frame: false,
        hasShadow: false,
        minimizable: false,
        maximizable: false,
        closeable: false,
        webPreferences: {
            contextIsolation: true,
            sandbox: true,
            nodeIntegration: false,
            scrollBounce: true,
            navigateOnDragDrop: true,
            safeDialogs: true,
            devTools: true,
        },
    };
}
class Tab {
    constructor(options) {
        this.window = options.window;
        this.init();
    }

    load(url) {
        if (url) {
            log.debug('TAB: ', this.id, ' loading url ', url);
            if (!this.home) this.home = url;
            this.view.webContents.loadURL(url);
            events.postEvent('tab:tab-loaded', { tabId: this.id });
        }
    }

    goHome() {
        this.load(this.home);
    }

    init() {
        const options = Options.BROWSER_TAB;
        options.webPreferences.session = getTabSession();
        this.view = new BrowserView(options);
        this.id = this.view.webContents.id;
        this.view.setBackgroundColor('#ffffff');

        this.view.webContents.on('did-start-loading', () => {
            events.postEvent('tab:did-start-loading', {
                tabId: this.id,
            });
        });
        this.view.webContents.on('did-stop-loading', () => {
            events.postEvent('tab:did-stop-loading', {
                tabId: this.id,
            });
        });
        this.view.webContents.on('found-in-page', (event, result) => {
            events.postEvent('tab:found-in-page', result);
            if (result.finalUpdate) {
                this.view.webContents.stopFindInPage('keepSelection');
            }
        });
        this.view.webContents.on('did-navigate', (event, url) => {
            this.url = url;
            events.postEvent('tab:did-navigate', {
                url,
                tabId: this.id,
            });
        });

        this.view.webContents.on('page-favicon-updated', (event, favicons) => {
            events.postEvent('tab:page-favicon-updated', {
                icons: favicons,
                tabId: this.id,
            });
        });

        this.view.webContents.on('page-title-updated', (event, title) => {
            events.postEvent('tab:page-title-updated', {
                title: title,
                tabId: this.id,
            });
        });

        this.view.webContents.on(
            'did-navigate-in-page',
            (event, url, isMainFrame) => {
                events.postEvent('tab:did-navigate-in-page', {
                    isMainFrame,
                    url,
                    tabId: this.id,
                });
                this.url = url;
                if (isMainFrame) {
                    if (url.endsWith('#')) this.goHome();
                }
            }
        );

        this.view.webContents.on(
            'did-fail-load',
            (event, errorCode, errorDescription, validatedURL) => {
                events.postEvent('tab:did-fail-load', {
                    link: validatedURL,
                    tabId: this.id,
                });
            }
        );

        this.view.webContents.on('render-process-gone', (event, details) => {
            console.log('Render process gone: ', event, details);
        });

        this.view.webContents.on('plugin-crashed', (event, name, version) => {
            console.log('Plugin crashed: ', event, name, version);
        });
    }

    async show() {
        if (this.isShowing) return;
        const window = await windowManager.getMainWindow();
        window.addBrowserView(this.view);
        const [windowWidth, windowHeight] = window.getContentSize();
        const width = Math.floor(windowWidth / 3);
        const height = (windowHeight - topOffset) / 2;
        const beginX = 0;
        const beginY = topOffset + height;
        this.resize(beginX, beginY, width, height);
        this.isShowing = true;

        this.view?.webContents?.openDevTools({ mode: 'bottom' });
    }

    async hide() {
        if (!this.isShowing) return;
        this.isShowing = false;
        const window = await windowManager.getMainWindow();
        if (!window || window.isDestroyed()) return;
        if (this.view !== null) {
            window.removeBrowserView(this.view);
        }
    }

    resize(x, y, width, height) {
        this.view.setBounds({
            x,
            y,
            width,
            height,
        });
        this.view.setAutoResize({ width: true, height: true });
    }

    refresh() {
        this.view?.webContents?.reload();
    }

    stop() {
        this.view?.webContents?.stop();
    }
}

class TabsManager {
    constructor() {
        this.init();
    }

    init() {
        this.tabList = new Map();
    }

    getCurrentTabs() {
        return this.tabList;
    }

    refreshTab(arg) {
        console.log('refreshTab', arg);
        const { id } = arg;
        const tab = this.getTab(id);
        tab.refresh();
    }

    goHomeTab(arg) {
        console.log('goHome', arg);
        const { id } = arg;
        const tab = this.getTab(id);
        tab.goHome();
    }

    resizeTab(arg) {
        console.log('resizeTab', arg);
        const { id, x, y, width, height } = arg;
        const tab = this.getTab(id);
        tab.resize(x, y, width, height);
    }

    getTab(tabId) {
        return this.tabList.get(tabId);
    }

    selectTab(tabId) {
        console.log('selecting tab', tabId);
        const tab = this.getTab(tabId);
        if (tab) {
            this.selected = tabId;
            this.showTab(tabId);
            selectTabInExtensions(tab);
            events.postEvent('tab:tab-selected', tabId);
        }
    }

    async createTab(options) {
        let tab = this.getTab(options.id);
        if (!tab) {
            options.window = await windowManager.getMainWindow();
            tab = new Tab(options);
            log.debug('TABSMANAGER: Creating Tab ', tab.id);
            this.tabList.set(tab.id, tab);
            addTabToExtensions(tab);
        }

        tab.view.webContents.on('destroyed', () => {
            console.log('Tab Destroyed, ', tab.id);
            this.tabList.delete(tab.id);
            events.postEvent(
                'tabs:tabs-found',
                Array.from(this.tabList.keys())
            );
        });

        events.postEvent('tabs:tabs-found', Array.from(this.tabList.keys()));
        if (!options.extensionId) {
            this.selectTab(tab.id);
        }
        return tab;
    }

    async loadInTab(options) {
        let tab = this.getTab(options.id);
        if (!tab) {
            tab = await this.createTab(options);
        }
        log.debug('TABSMANAGER: Loading Tab ', tab.id);
        tab.extensionId = options.extensionId;
        tab.load(options.url);
        this.showTab(tab.id);
        return tab;
    }

    async showTab(tabId) {
        log.debug('TABSMANAGER: Showing Tab ', tabId);
        this.tabList.forEach((tab) => {
            if (tab.id !== tabId) {
                tab.hide();
            } else {
                tab.show();
            }
        });
    }

    async removeTab(tabId) {
        log.debug('TABSMANAGER: Removing Tab ', tabId);
        const tab = this.getTab(tabId);
        if (tab) {
            tab.hide();
            this.tabList.delete(tabId);
        }
    }
}

export default new TabsManager();
