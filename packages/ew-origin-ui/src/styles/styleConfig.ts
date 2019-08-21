import { createMuiTheme } from '@material-ui/core';
import variables from './variables.scss';

export const STYLE_CONFIG = {
    PRIMARY_COLOR: variables.primaryColor,
    PRIMARY_COLOR_DARK: variables.primaryColorDark,
    PRIMARY_COLOR_DARKER: variables.primaryColorDarker,
    TEXT_COLOR_DEFAULT: variables.textColorDefault,
    BACKGROUND_COLOR_DARK: variables.backgroundColorDark,
    WHITE: '#fff'
};

export const DEFAULT_MATERIAL_THEME = () => {
    return createMuiTheme({
        palette: {
            primary: {
                main: STYLE_CONFIG.PRIMARY_COLOR,
                contrastText: STYLE_CONFIG.WHITE
            },
            background: {
                paper: STYLE_CONFIG.BACKGROUND_COLOR_DARK,
                default: '#f44336'
            },
            text: {
                primary: STYLE_CONFIG.WHITE,
                secondary: STYLE_CONFIG.TEXT_COLOR_DEFAULT,
                hint: '#f50057',
                disabled: STYLE_CONFIG.TEXT_COLOR_DEFAULT
            }
        },
        overrides: {
            MuiInput: {
                underline: {
                    '&:before': {
                        borderBottom: '2px solid #474747'
                    }
                }
            },
            MuiChip: {
                root: {
                    marginRight: '10px'
                }
            }
        }
    });
};

export const CUSTOM_SLIDER_STYLE = {
    root: {
        height: 3,
        padding: '13px 0'
    },
    thumb: {
        height: 27,
        width: 27,
        backgroundColor: STYLE_CONFIG.BACKGROUND_COLOR_DARK,
        border: '1px solid currentColor',
        marginTop: -12,
        marginLeft: -13,
        '& .bar': {
            height: 9,
            width: 1,
            backgroundColor: 'currentColor',
            marginLeft: 1,
            marginRight: 1
        }
    },
    active: {},
    valueLabel: {
        left: 'calc(-50% + 9px)',
        top: -22,
        '& *': {
            background: 'transparent',
            color: 'currentColor'
        }
    },
    track: {
        height: 3
    },
    rail: {
        color: '#393939',
        opacity: 1,
        height: 3
    },
    mark: {
        backgroundColor: 'currentColor',
        height: 8,
        width: 1,
        marginTop: -3
    },
    markActive: {
        backgroundColor: 'currentColor'
    }
};
