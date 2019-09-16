import { createMuiTheme, Theme, createStyles } from '@material-ui/core';
import variables from './variables.scss';
import { CSSProperties } from 'react';

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
            },
            MuiButton: {
                contained: {
                    '&.Mui-disabled': {
                        color: STYLE_CONFIG.TEXT_COLOR_DEFAULT
                    }
                }
            },
            MuiTable: {
                root: {
                    borderBottom: '2px solid #894ec5'
                }
            },
            MuiTableHead: {
                root: {
                    '& > .MuiTableRow-root': {
                        background: '#2d2d2d'
                    }
                }
            },
            MuiTableRow: {
                root: {
                    background: '#333333',
                    '&:nth-child(even)': {
                        background: '#2d2d2d'
                    }
                },
                footer: {
                    background: '#2d2d2d'
                }
            },
            MuiTableCell: {
                root: {
                    borderBottom: '1px solid rgb(72, 72, 72)'
                },
                body: {
                    color: STYLE_CONFIG.TEXT_COLOR_DEFAULT
                },
                head: {
                    color: STYLE_CONFIG.WHITE,
                    fontWeight: 'bold',
                    borderBottom: '3px solid #252525'
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
        },
        '.MuiSlider-root.Mui-disabled &': {
            left: 'calc(-50% - 9px)'
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

export const createInputAutocompleteStyle = (theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
            minWidth: 290
        },
        input: {
            display: 'flex',
            padding: 0,
            height: 'auto'
        },
        valueContainer: {
            display: 'flex',
            flexWrap: 'wrap',
            flex: 1,
            alignItems: 'center',
            overflow: 'hidden'
        },
        chip: {
            margin: theme.spacing(0.5, 0.25)
        },
        chipFocused: {},
        noOptionsMessage: {
            padding: theme.spacing(1, 2)
        },
        singleValue: {
            fontSize: 16
        },
        placeholder: {
            position: 'absolute',
            left: 2,
            bottom: 6,
            fontSize: 16
        },
        paper: {
            position: 'absolute',
            zIndex: 2,
            marginTop: theme.spacing(1),
            left: 0,
            right: 0
        },
        divider: {
            height: theme.spacing(2)
        }
    });

export const INPUT_AUTOCOMPLETE_SELECT_STYLE = {
    input: (base: CSSProperties) => ({
        ...base,
        color: STYLE_CONFIG.PRIMARY_COLOR,
        '& input': {
            font: 'inherit'
        }
    })
};
