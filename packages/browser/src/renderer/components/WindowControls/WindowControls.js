import React, { useState } from 'react';
import WindowControlButton from './WindowControlButton';
import styles from './windowcontrols.module.css';

const WindowControls = () => {
    const [isMaximized, setIsMaximized] = useState(false);

    const onCloseApp = () => {
        window.windowControls.close();
    };

    const onMinimizeApp = () => {
        window.windowControls.minimize();
    };

    const onMaximizeApp = () => {
        if (!isMaximized) {
            window.windowControls.maximize();
            setIsMaximized(true);
            return;
        }
        window.windowControls.restore();
        setIsMaximized(false);
    };

    return (
        <div
            className={
                styles.window_controller + ' ' + styles.window_controller__right
            }
        >
            <WindowControlButton minimize onClick={onMinimizeApp} />
            <WindowControlButton
                maximize={!isMaximized}
                restore={isMaximized}
                onClick={onMaximizeApp}
            />
            <WindowControlButton close onClick={onCloseApp} />
        </div>
    );
};

export default WindowControls;
