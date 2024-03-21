import { getTabSession, getDefaultSession } from '../session';
import tabsManager from '../tabs';
import windowManager from '../window';
const { ElectronChromeExtensions } = require('electron-chrome-extensions');
const path = require('path');
const fs = require('fs');

let electronChromeExtensions;

export const getExtensionFoldersAndManifests = (
    directoryPath,
    folders = [],
    manifests = []
) => {
    const files = fs.readdirSync(directoryPath);

    for (const file of files) {
        const filePath = path.join(directoryPath, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
            const manifestPath = path.join(filePath, 'manifest.json');
            if (fs.existsSync(manifestPath)) {
                const data = fs.readFileSync(manifestPath);
                const manifest = JSON.parse(data);
                manifests.push(manifest);
                console.log(data);
                folders.push(filePath);
            } else {
                getExtensionFoldersAndManifests(filePath, folders, manifests);
            }
        }
    }

    return { folders, manifests };
};

export const addTabToExtensions = async (tab) => {
    electronChromeExtensions.addTab(tab.view.webContents, tab.window);
};

export const selectTabInExtensions = async (tab) => {
    electronChromeExtensions.selectTab(tab.view.webContents);
};

export const initExtensions = async () => {
    const tabSession = await getTabSession();

    electronChromeExtensions = new ElectronChromeExtensions({
        session: tabSession,
        modulePath: path.join(
            __dirname,
            '../../../electron-chrome-extensions/'
        ),
        async createTab(details, event) {
            // Optionally implemented for chrome.tabs.create support
            console.log('createTab');
            console.log(details);

            const extensionId = event?.event?.extension?.id;

            const tab = await tabsManager.loadInTab({
                url: details.url,
            });
            return [tab.view.webContents, tab.window];
        },
        async selectTab(tab, browserWindow) {
            // Optionally implemented for chrome.tabs.update support
            console.log('selectTab');
            console.log(tab);
            electronChromeExtensions.selectTab(tab);
        },
        async removeTab(tab, browserWindow) {
            // Optionally implemented for chrome.tabs.remove support
            console.log('removeTab');
            console.log(tab);
            tabsManager.removeTab(tab.id);
        },
        async createWindow(details, event) {
            // Optionally implemented for chrome.windows.create support
            console.log('createWindow');
            console.log(details);
            const window = windowManager.getWindowForExtensionPopup(details);
            electronChromeExtensions.addTab(window.webContents, window);
            return window;
        },
        removeWindow(window) {
            console.log('removeWindow');
            console.log(window);
            window.destroy();
        },
    });
};
