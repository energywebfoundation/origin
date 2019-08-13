import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Slider from '@material-ui/core/Slider';
import { STYLE_CONFIG } from '../styles/styleConfig';

export const CustomSlider = withStyles({
    root: {
      height: 3,
      padding: '13px 0',
    },
    thumb: {
      height: 27,
      width: 27,
      backgroundColor: '#2c2c2c',
      border: '1px solid currentColor',
      marginTop: -12,
      marginLeft: -13,
      '& .bar': {
        height: 9,
        width: 1,
        backgroundColor: 'currentColor',
        marginLeft: 1,
        marginRight: 1,
      },
    },
    active: {},
    valueLabel: {
        left: 'calc(-50% + 9px)',
        top: -22,
        '& *': {
          background: 'transparent',
          color: 'currentColor',
        },
      },
    track: {
      height: 3,
    },
    rail: {
      color: '#393939',
      opacity: 1,
      height: 3,
    },
    mark: {
        backgroundColor: 'currentColor',
        height: 8,
        width: 1,
        marginTop: -3,
    },
    markActive: {
        backgroundColor: 'currentColor',
    },
  })(Slider);

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