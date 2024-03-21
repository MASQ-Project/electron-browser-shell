import React from 'react';

import styles from './checkbox.module.css';

const CheckBox = (props) => {
    const [checked, setChecked] = React.useState(false);

    const handleChange = () => {
        if (checked) return;
        setChecked(!checked);
        props.handleChange(props.idx);
    };

    return <input type="checkbox" checked={checked} onChange={handleChange} />;
};

export default CheckBox;
