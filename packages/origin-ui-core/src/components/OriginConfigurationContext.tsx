import React, { createContext, ReactNode } from 'react';
import { createMuiTheme, Theme } from '@material-ui/core';
import i18n from 'i18next';
import ICU from 'i18next-icu';
import { EN, PL } from '@energyweb/localization';
import { initReactI18next } from 'react-i18next';

import variables from '../styles/variables.scss';
import { OriginGenericLogo } from './icons/OriginGenericLogo';
import { OnChainReadingsAdapter } from '../adapters/OnChainReadingsAdapter';
import { ISmartMeterReadingsAdapter } from '../types';

export interface IOriginStyleConfig {
    PRIMARY_COLOR: string;
    PRIMARY_COLOR_DARK: string;
    PRIMARY_COLOR_DARKER: string;
    TEXT_COLOR_DEFAULT: string;
    BACKGROUND_COLOR_DARK: string;
    FIELD_ICON_COLOR: string;
    WHITE: string;
}

export const createMaterialThemeForOrigin = (styleConfig: IOriginStyleConfig) => {
    return createMuiTheme({
        palette: {
            primary: {
                main: styleConfig.PRIMARY_COLOR,
                contrastText: styleConfig.WHITE
            },
            background: {
                paper: styleConfig.BACKGROUND_COLOR_DARK,
                default: '#f44336'
            },
            text: {
                primary: styleConfig.WHITE,
                secondary: styleConfig.TEXT_COLOR_DEFAULT,
                hint: '#f50057',
                disabled: styleConfig.TEXT_COLOR_DEFAULT
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
                        color: styleConfig.TEXT_COLOR_DEFAULT
                    }
                }
            },
            MuiTable: {
                root: {
                    borderBottom: `2px solid ${styleConfig.PRIMARY_COLOR}`
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
                    color: styleConfig.TEXT_COLOR_DEFAULT
                },
                head: {
                    color: styleConfig.WHITE,
                    fontWeight: 'bold',
                    borderBottom: '3px solid #252525',
                    fontSize: '12px'
                }
            },
            MuiSelect: {
                icon: {
                    color: styleConfig.FIELD_ICON_COLOR
                }
            }
        }
    });
};

export const createSliderStyleForOrigin = (styleConfig: IOriginStyleConfig) => ({
    root: {
        height: 3,
        padding: '13px 0'
    },
    thumb: {
        height: 27,
        width: 27,
        backgroundColor: styleConfig.BACKGROUND_COLOR_DARK,
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
});

export interface IOriginConfiguration {
    logo: ReactNode;
    styleConfig: IOriginStyleConfig;
    customSliderStyle: any;
    materialTheme: Theme;
    language: 'en' | 'pl';
    smartMeterReadingsAdapter: ISmartMeterReadingsAdapter;
}

export function createStyleConfigFromSCSSVariables(scssVariables: any): IOriginStyleConfig {
    return {
        PRIMARY_COLOR: scssVariables.primaryColor ?? '#894ec5',
        PRIMARY_COLOR_DARK: scssVariables.primaryColorDark ?? '#894ec5',
        PRIMARY_COLOR_DARKER: scssVariables.primaryColorDarker ?? '#894ec5',
        TEXT_COLOR_DEFAULT: scssVariables.textColorDefault ?? '#894ec5',
        BACKGROUND_COLOR_DARK: scssVariables.backgroundColorDark ?? '#894ec5',
        FIELD_ICON_COLOR: scssVariables.fieldIconColor ?? '#894ec5',
        WHITE: '#fff'
    };
}

export const OriginConfigurationContext = createContext<IOriginConfiguration>(null);

export function createOriginConfiguration(configuration: Partial<IOriginConfiguration> = {}) {
    const DEFAULT_STYLE_CONFIG = createStyleConfigFromSCSSVariables(variables);

    const DEFAULT_ORIGIN_CONFIGURATION: IOriginConfiguration = {
        logo: <OriginGenericLogo />,
        styleConfig: DEFAULT_STYLE_CONFIG,
        customSliderStyle: createSliderStyleForOrigin(DEFAULT_STYLE_CONFIG),
        materialTheme: createMaterialThemeForOrigin(DEFAULT_STYLE_CONFIG),
        language: 'en',
        smartMeterReadingsAdapter: new OnChainReadingsAdapter()
    };

    const newConfiguration: IOriginConfiguration = {
        ...DEFAULT_ORIGIN_CONFIGURATION,
        ...configuration
    };

    if (configuration.styleConfig) {
        if (!configuration.materialTheme) {
            newConfiguration.materialTheme = createMaterialThemeForOrigin(
                configuration.styleConfig
            );
        }

        if (!configuration.customSliderStyle) {
            newConfiguration.customSliderStyle = createSliderStyleForOrigin(
                configuration.styleConfig
            );
        }
    }

    return newConfiguration;
}

interface IProps {
    children: ReactNode;
    value: IOriginConfiguration;
}

export function OriginConfigurationProvider(props: IProps) {
    return (
        <OriginConfigurationContext.Provider value={props.value}>
            {props.children}
        </OriginConfigurationContext.Provider>
    );
}

export function initializeI18N(language: IOriginConfiguration['language']) {
    i18n.use(new ICU())
        .use(initReactI18next)
        .init({
            resources: {
                en: EN,
                pl: PL
            },
            lng: language,
            fallbackLng: 'en',

            interpolation: {
                escapeValue: false
            }
        });
}
