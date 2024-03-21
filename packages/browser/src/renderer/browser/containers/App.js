import React, { useEffect, useState } from 'react';
import { Route } from 'react-router-dom';
import {
    createBrowserRouter,
    createRoutesFromElements,
    RouterProvider,
} from 'react-router-dom';

import WindowControl from '../../components/WindowControls';
import Main from './Main';
import TitleBar from '../../components/TitleBar';

import styles from './app.module.css';
import Tab from './Tab/Tab';

const router = createBrowserRouter(
    createRoutesFromElements(<Route path="/main_window" element={<Main />} />)
);

const App = () => {
    const [tabs, setTabs] = useState([]);
    const [selected, setSelected] = useState();

    const getCurrentTabs = async () => {
        const currentTabs = await window.electronApi.getCurrentTabs();
        console.log(currentTabs);
        setTabs(currentTabs);
    };

    const isSelected = (id) => {
        return selected === id;
    };

    const selectTab = (id) => {
        console.log('selectTab');
        window.electronApi.selectTab(id);
    };

    useEffect(() => {
        setTimeout(() => getCurrentTabs(), 500);
    }, []);

    window.electronApi.onTabsFound((_event, value) => {
        console.log('tabsFound', value);
        setTabs(value);
    });

    window.electronApi.onTabSelected((_event, value) => {
        console.log('onTabSelected', value);
        setSelected(value);
    });

    return (
        <div className={styles.app}>
            <RouterProvider router={router} />
            <TitleBar />
            <WindowControl />
            <div className={styles.main_container}>
                <button onClick={getCurrentTabs}>Get Current Tabs</button>
                <div className={styles.browser_actions}>
                    <browser-action-list></browser-action-list>
                </div>
                <div className={styles.tab_buttons}>
                    {tabs.map((id) => (
                        <button key={id} onClick={() => selectTab(id)}>
                            {id}
                        </button>
                    ))}
                </div>
                <div className={styles.tab_container}>
                    {tabs.map((id) => (
                        <Tab key={id} id={id} selected={isSelected(id)} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default App;
