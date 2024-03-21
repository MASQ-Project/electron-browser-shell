import { session as electronSession } from 'electron';

const isDevelopment = process.env.NODE_ENV === 'development';

const sessions = new Map();

export const getTabSession = () => {
    if (sessions.has('tab')) return sessions.get('tab');
    const tabSession = electronSession.fromPartition('persist:tabs6');
    initSession(tabSession);
    sessions.set('tab', tabSession);
    return tabSession;
};

export const getDefaultSession = () => {
    return electronSession.defaultSession;
};

export const initSession = async (s) => {
    let session = s;
    if (!session) {
        session = electronSession.defaultSession;
    }

    const allowedSources = [`'self'`];
    isDevelopment && allowedSources.push(` 'unsafe-eval'`); // react-refresh-webpack-plugin needs this

    // session.webRequest.onHeadersReceived((details, callback) => {
    //     callback({
    //         responseHeaders: {
    //             ...details.responseHeaders,
    //             'Content-Security-Policy': [
    //                 'script-src '.concat(...allowedSources),
    //             ],
    //         },
    //     });
    // });

    session.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Content-Security-Policy': `'*'`,
            },
        });
    });
};
