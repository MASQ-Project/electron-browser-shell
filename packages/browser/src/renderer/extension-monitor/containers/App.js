import React, { useEffect, useState } from 'react';

import WindowControl from '../../components/WindowControls';
import CheckBox from '../../components/CheckBox';

import styles from './app.module.css';
import TitleBar from '../../components/TitleBar';

const App = () => {
    const [extensions, setExtensions] = useState();

    const getExtensions = async () => {
        const availableExtensions = await window.electronApi.getExtensions();
        console.log(availableExtensions);
        setExtensions(availableExtensions);
    };

    useEffect(() => {
        getExtensions();
    }, []);

    const handleChange = (index) => {
        console.log('handleChange', index);
        const extensionPath = extensions.folders[index];
        const launchPage =
            extensions.manifests[index]['browser_action']['default_popup'];
        window.electronApi.activateExtension({ extensionPath, launchPage });
    };

    return (
        <div className={styles.app}>
            <TitleBar />
            <WindowControl />
            <section>
                <div className={styles.header}>
                    <div className={styles.col}>Name</div>
                    <div className={styles.col}>Author</div>
                    <div className={styles.col}>Manifest Version</div>
                    <div className={styles.col}>Active</div>
                </div>
                {extensions &&
                    extensions.manifests.map((manifest, index) => {
                        console.log(manifest.name);
                        return (
                            <div key={index} className={styles.row}>
                                <div className={styles.col}>
                                    {manifest.name}
                                </div>
                                <div className={styles.col}>
                                    {manifest.author}
                                </div>
                                <div className={styles.col}>
                                    {manifest.manifest_version}
                                </div>
                                <CheckBox
                                    idx={index}
                                    handleChange={() => handleChange(index)}
                                />
                            </div>
                        );
                    })}
            </section>
        </div>
    );
};

export default App;
