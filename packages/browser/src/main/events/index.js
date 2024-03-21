import { scheduleRetry } from '../scheduler';
const log = require('electron-log');

export class Event {
    static UPDATER = [
        'updater:error',
        'updater:update-available',
        'updater:update-not-available',
        'updater:update-downloaded',
        'updater:download-progress',
    ];
    static TAB = [
        'tab:new-window-tab',
        'tab:open-new-tab',
        'tab:close-tab',
        'tab:tab-loaded',
        'tab:did-fail-load',
        'tab:open-link',
        'tab:find-in-page',
        'tab:found-in-page',
        'tab:did-navigate',
        'tab:did-navigate-in-page',
        'tab:page-favicon-updated',
        'tab:page-title-updated',
        'tab:refresh',
        'tab:stop',
        'tab:forward',
        'tab:back',
        'tabs:tabs-found',
        'tab:tab-selected',
    ];
    static EXTENSION = ['extensions:extensions-found'];
}
class Events {
    constructor() {
        this.subscriptions = new Map();
    }

    async subscribeToEvent(subscriber, event) {
        if (!this.subscriptions.get(event)) {
            this.subscriptions.set(event, [subscriber]);
            return;
        }
        if (this.subscriptions.get(event).includes(subscriber)) {
            return;
        }
        this.subscriptions.get(event).push(subscriber);
    }

    async subscribe(subscriber, events) {
        events.forEach((e) => {
            this.subscribeToEvent(subscriber, e);
        });
    }

    postMessageToSubscriber(subscriber, event, message) {
        subscriber.send(event, message);
    }

    async postEvent(event, message) {
        //log.debug('POSTMESSAGE: ', event, message);
        const subscribers = this.subscriptions.get(event);
        if (!subscribers) {
            //log.info('EVENTS: no subscribers for event: ', event);
            return;
        }
        subscribers.forEach((s) => {
            try {
                this.postMessageToSubscriber(s, event, message);
            } catch (error) {
                log.error('EVENTS: error posting message... ', error);
                scheduleRetry(this.postMessageToSubscriber, [
                    s,
                    event,
                    message,
                ]);
            }
        });
    }

    async unsubscribeAll(subscriber) {
        this.subscriptions.forEach((value, key, map) => {
            const index = value.indexOf(subscriber);
            if (index !== -1) {
                value.splice(index, 1);
                if (value.length === 0) {
                    map.delete(key);
                }
            }
        });
    }
}

export default new Events();
