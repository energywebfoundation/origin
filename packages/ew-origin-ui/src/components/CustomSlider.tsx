import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Slider from '@material-ui/core/Slider';
import { CUSTOM_SLIDER_STYLE } from '../styles/styleConfig';

export const CustomSlider = withStyles(CUSTOM_SLIDER_STYLE)(Slider);

export function CustomSliderThumbComponent(props) {
    return (
      <span {...props}>
          {props.children}
        <span className="bar" />
        <span className="bar" />
        <span className="bar" />
      </span>
    );
  }