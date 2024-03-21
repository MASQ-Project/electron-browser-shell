import React, { useRef, useEffect, useState } from 'react';

import styles from './tab.module.css';

const Tab = (props) => {
    const webviewRef = useRef();
    const [url, setUrl] = useState('');

    window.electronApi.onDidNavigate((_event, value) => {
        if (props.id !== value.tabId) return;
        console.log('didNavigate', value);
        setUrl(value.url);
    });

    window.electronApi.onDidNavigateInPage((_event, value) => {
        if (props.id !== value.tabId) return;
        console.log('didNavigateInPage', value);
        setUrl(value.url);
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('submit');
        window.electronApi.loadUrl({ id: props.id, url });
    };

    const refresh = () => {
        console.log('refresh');
        window.electronApi.refreshTab({ id: props.id });
    };

    const home = () => {
        console.log('home');
        window.electronApi.goHomeTab({ id: props.id });
    };

    useEffect(() => {
        const width = webviewRef?.current?.clientWidth;
        const height = webviewRef?.current?.clientHeight;

        const x = webviewRef?.current?.offsetLeft;
        const y = webviewRef?.current?.offsetTop;

        console.log('resize', props.id, x, y, width, height);

        props.id &&
            x &&
            y &&
            width &&
            height &&
            window.electronApi.onTabSizeChanged({
                id: props.id,
                x,
                y,
                width,
                height,
            });
    }, [
        webviewRef?.current?.clientWidth,
        webviewRef?.current?.clientHeight,
        webviewRef?.current?.offsetLeft,
        webviewRef?.current?.offsetTop,
    ]);

    let containerStyle = styles.container;
    if (props.selected) {
        containerStyle = styles.container_selected;
    }
    return (
        <div className={containerStyle}>
            <div className={styles.controls}>
                <div className={styles.left}>
                    <button onClick={refresh}>Refresh</button>
                    <button onClick={home}>Home</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                </form>
                <div className={styles.right}></div>
            </div>
            <div className={styles.webview} ref={webviewRef} />
        </div>
    );
};

export default Tab;
