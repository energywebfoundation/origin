import React, { ReactNode } from 'react';
import { createStyles, makeStyles, useTheme, Slider, SliderProps } from '@material-ui/core';

import { useOriginConfiguration } from '../../utils/configuration';

interface IProps {
    children: ReactNode;
}

export function CustomSliderThumbComponent(props: IProps) {
    return (
        <span {...props}>
            {props.children}
            <span className="bar" />
            <span className="bar" />
            <span className="bar" />
        </span>
    );
}

export function CustomSlider(props: SliderProps) {
    const { customSliderStyle } = useOriginConfiguration();

    const useStyles = makeStyles(() => createStyles(customSliderStyle));

    const classes = useStyles(useTheme());

    return <Slider {...props} classes={classes} />;
}
