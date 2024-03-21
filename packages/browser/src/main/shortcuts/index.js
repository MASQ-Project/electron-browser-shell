import { globalShortcut } from 'electron';
import Events from '../events';

export const addGlobalShortcuts = async () => {
    globalShortcut.register('CmdOrCtrl+R', () => {
        Events.postEvent('tab:refresh');
    });
    globalShortcut.register('F5', () => {
        Events.postEvent('tab:refresh');
    });
};

export const clearGlobalShortcuts = async () => {
    globalShortcut.unregisterAll();
};
