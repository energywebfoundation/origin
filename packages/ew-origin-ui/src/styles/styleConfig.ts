import { createMuiTheme } from "@material-ui/core";
import variables from './variables.scss';

export const STYLE_CONFIG = {
    PRIMARY_COLOR: variables.primaryColor,
    PRIMARY_COLOR_DARK: variables.primaryColorDark,
    PRIMARY_COLOR_DARKER: variables.primaryColorDarker,
    GRAY_BORDER_COLOR: '#858585',
    WHITE: '#fff'
};

export const DEFAULT_MATERIAL_THEME = () => {
    return createMuiTheme({
        palette: {
        primary: {
            main: STYLE_CONFIG.PRIMARY_COLOR,
            contrastText: STYLE_CONFIG.WHITE,
        },
        background: {
            paper: "#2c2c2c",
            default: "#f44336"
        },
        text: {
            primary: STYLE_CONFIG.WHITE,
            secondary: STYLE_CONFIG.GRAY_BORDER_COLOR,
            hint: '#f50057',
            disabled: '#f50057'
        }
        },
        overrides: {
            MuiInput: {
                underline:{
                    '&:before': {
                        borderBottom: '2px solid #474747'
                    }
                },
            },
            MuiChip: {
                root: {
                    marginRight: '10px'
                }
            }
        }
    });
};