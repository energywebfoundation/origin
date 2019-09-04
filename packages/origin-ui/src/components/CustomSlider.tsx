import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Slider from '@material-ui/core/Slider';
import { CUSTOM_SLIDER_STYLE } from '../styles/styleConfig';

export const CustomSlider = withStyles(CUSTOM_SLIDER_STYLE)(Slider);

interface IOwnProps {
    children: React.ReactNode;
}

export function CustomSliderThumbComponent(props: IOwnProps) {
    return (
        <span {...props}>
            {props.children}
            <span className="bar" />
            <span className="bar" />
            <span className="bar" />
        </span>
    );
}
