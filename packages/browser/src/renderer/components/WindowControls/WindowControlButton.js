import React from 'react';

import styles from './windowcontrols.module.css';

const WindowControlButton = (props) => {
    const { close, maximize, minimize, restore, onClick } = props;

    let buttonClass = styles.window_control_button;
    if (close)
        buttonClass = buttonClass + ' ' + styles.window_control_button__close;

    let iconClass = styles.window_control_icon;
    if (close) iconClass = iconClass + ' ' + styles.window_control_icon__close;
    if (minimize)
        iconClass = iconClass + ' ' + styles.window_control_icon__minimize;
    if (maximize)
        iconClass = iconClass + ' ' + styles.window_control_icon__maximize;
    if (restore)
        iconClass = iconClass + ' ' + styles.window_control_icon__restore;

    return (
        <div className={buttonClass} onClick={onClick}>
            <div className={iconClass} />
        </div>
    );
};

export default WindowControlButton;
