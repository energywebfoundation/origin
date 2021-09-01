import { LightenColor } from './colors';
import { IOriginStyleConfig } from './makeOriginUiConfig';

export const createSliderStyleForOrigin = (
  styleConfig: IOriginStyleConfig
) => ({
  root: {
    height: 3,
    padding: '13px 0',
  },
  thumb: {
    height: 27,
    width: 27,
    backgroundColor: styleConfig.MAIN_BACKGROUND_COLOR,
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
    '.MuiSlider-root.Mui-disabled &': {
      left: 'calc(-50% - 9px)',
    },
  },
  track: {
    height: 3,
  },
  rail: {
    color: LightenColor(styleConfig.MAIN_BACKGROUND_COLOR, 6.5),
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
});
