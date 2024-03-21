import { app, dialog, autoUpdater } from 'electron';
import Events from '../events';
const Store = require('electron-store');
const store = new Store();
const log = require('electron-log');

const testUpdater = process.env.TEST_UPDATER === 'true';

export default class AppUpdater {
    constructor() {
        //this.init();
    }

    init() {
        if (testUpdater) {
            Object.defineProperty(app, 'isPackaged', {
                get() {
                    return true;
                },
            });
        }

        const updaterLogger = log.create('updaterLogger');
        updaterLogger.transports.file.level = 'info';
        autoUpdater.logger = updaterLogger;
        autoUpdater.setFeedURL('');
        autoUpdater.checkForUpdates();
        autoUpdater.autoDownload = false;

        autoUpdater.on('checking-for-update', () => {
            log.info('checking-for-update');
        });

        autoUpdater.on('error', (error) => {
            log.error(error);
            autoUpdater.autoDownload = false;

            Events.postEvent('updater:error', error);
        });

        autoUpdater.on('update-available', (info) => {
            log.info('update-available');
            store.set('update.available', true);

            Events.postEvent('updater:update-available', info);
        });

        autoUpdater.on('update-not-available', (info) => {
            log.info('update-not-available');
            store.set('update.available', false);

            Events.postEvent('updater:update-not-available', info);
        });

        autoUpdater.on('update-downloaded', () => {
            log.info('update-downloaded');
            autoUpdater.autoDownload = false;

            Events.postEvent('updater:update-downloaded');

            dialog
                .showMessageBox({
                    title: 'Install Updates',
                    message:
                        'Updates downloaded, application will be quit for update...',
                })
                .then(() => {
                    store.set('update.time', Date.now());
                    setImmediate(() => autoUpdater.quitAndInstall());
                })
                .catch((error) => log.error(error));
        });

        autoUpdater.on('download-progress', (progressObj) => {
            log.info('download-progress');

            Events.postEvent('updater:download-progress', progressObj);

            let log_message = 'Download speed: ' + progressObj.bytesPerSecond;
            log_message =
                log_message + ' - Downloaded ' + progressObj.percent + '%';
            log_message =
                log_message +
                ' (' +
                progressObj.transferred +
                '/' +
                progressObj.total +
                ')';
            log.info(log_message);
        });
    }

    checkForUpdates() {
        autoUpdater.checkForUpdates();
    }

    downloadUpdate() {
        autoUpdater.downloadUpdate();
    }
}
