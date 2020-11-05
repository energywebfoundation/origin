/* eslint-disable @typescript-eslint/naming-convention */
import React, { createContext, ReactNode } from 'react';
import { initReactI18next } from 'react-i18next';
import i18n from 'i18next';
import ICU from 'i18next-icu';
import { createMuiTheme, Theme } from '@material-ui/core';
import { plPL, enUS } from '@material-ui/core/locale';
import { OriginFeature, allOriginFeatures } from '@energyweb/utils-general';
import {
    ORIGIN_LANGUAGES,
    ORIGIN_LANGUAGE,
    AVAILABLE_ORIGIN_LANGUAGES
} from '@energyweb/localization';
import variables from '@energyweb/origin-ui-core/src/styles/variables.scss';
import { OriginGenericLogo, setTimeFormatLanguage } from '@energyweb/origin-ui-core';

export interface IOriginStyleConfig {
    PRIMARY_COLOR: string;
    PRIMARY_COLOR_DARK: string;
    PRIMARY_COLOR_DARKER: string;
    TEXT_COLOR_DEFAULT: string;
    BACKGROUND_COLOR_DARK: string;
    BACKGROUND_COLOR_DARKER: string;
    BACKGROUND_COLOR_LIGHTER: string;
    FIELD_ICON_COLOR: string;
    WHITE: string;
}

const DEFAULT_COLOR = '#894ec5';

declare module '@material-ui/core/styles/createTypography' {
    interface Typography {
        fontSizeSm: number;
        fontSizeLg: number;
        fontSizeMd: number;
    }

    interface TypographyOptions {
        fontSizeSm?: number;
        fontSizeLg?: number;
        fontSizeMd?: number;
    }
}

export const createMaterialThemeForOrigin = (
    styleConfig: IOriginStyleConfig,
    language: ORIGIN_LANGUAGE
): Theme => {
    const materialLocale =
        {
            pl: plPL,
            en: enUS
        }[language] ?? enUS;

    return createMuiTheme(
        {
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
                MuiFormLabel: {
                    root: { fontSize: variables.fontSizeMd }
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
                        borderBottom: `2px solid ${styleConfig.PRIMARY_COLOR}`,
                        backgroundColor: styleConfig.BACKGROUND_COLOR_DARK
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
                        borderBottom: `1px solid ${styleConfig.BACKGROUND_COLOR_DARK}`,
                        fontSize: variables.fontSizeMd
                    },
                    body: {
                        color: styleConfig.TEXT_COLOR_DEFAULT
                    },
                    head: {
                        color: styleConfig.TEXT_COLOR_DEFAULT,
                        borderBottom: 'none'
                    }
                },
                MuiSelect: {
                    icon: {
                        color: styleConfig.FIELD_ICON_COLOR
                    }
                },
                MuiTooltip: {
                    tooltip: {
                        backgroundColor: styleConfig.PRIMARY_COLOR
                    }
                }
            }
        },
        materialLocale,
        {
            typography: {
                fontSizeSm: 10,
                fontSizeMd: 12,
                fontSizeLg: 24
            }
        }
    );
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
    defaultLanguage: ORIGIN_LANGUAGE;
    language: ORIGIN_LANGUAGE;
    enabledFeatures: OriginFeature[];
}

export function createStyleConfigFromSCSSVariables(scssVariables: any): IOriginStyleConfig {
    return {
        PRIMARY_COLOR: scssVariables.primaryColor ?? DEFAULT_COLOR,
        PRIMARY_COLOR_DARK: scssVariables.primaryColorDark ?? DEFAULT_COLOR,
        PRIMARY_COLOR_DARKER: scssVariables.primaryColorDarker ?? DEFAULT_COLOR,
        TEXT_COLOR_DEFAULT: scssVariables.textColorDefault ?? DEFAULT_COLOR,
        BACKGROUND_COLOR_DARK: scssVariables.backgroundColorDark ?? DEFAULT_COLOR,
        BACKGROUND_COLOR_DARKER: scssVariables.backgroundColorDarker ?? DEFAULT_COLOR,
        BACKGROUND_COLOR_LIGHTER: scssVariables.backgroundColorLighter ?? DEFAULT_COLOR,
        FIELD_ICON_COLOR: scssVariables.fieldIconColor ?? DEFAULT_COLOR,
        WHITE: '#fff'
    };
}

export const OriginConfigurationContext = createContext<IOriginConfiguration>(null);

const ORIGIN_CONFIGURATION_LANGUAGE_STORAGE_KEY = 'OriginConfiguration-language';

export function getOriginLanguage(): ORIGIN_LANGUAGE {
    const storedLanguage = localStorage.getItem(ORIGIN_CONFIGURATION_LANGUAGE_STORAGE_KEY);

    if (AVAILABLE_ORIGIN_LANGUAGES.includes(storedLanguage)) {
        return storedLanguage as ORIGIN_LANGUAGE;
    }

    return 'en';
}

export function setOriginLanguage(language: ORIGIN_LANGUAGE) {
    localStorage.setItem(ORIGIN_CONFIGURATION_LANGUAGE_STORAGE_KEY, language);

    location.reload();
}

export function createOriginConfiguration(configuration: Partial<IOriginConfiguration> = {}) {
    const DEFAULT_STYLE_CONFIG = createStyleConfigFromSCSSVariables(variables);

    const storedLanguage = getOriginLanguage();

    const DEFAULT_ORIGIN_CONFIGURATION: IOriginConfiguration = {
        logo: <OriginGenericLogo />,
        styleConfig: DEFAULT_STYLE_CONFIG,
        customSliderStyle: createSliderStyleForOrigin(DEFAULT_STYLE_CONFIG),
        materialTheme: createMaterialThemeForOrigin(DEFAULT_STYLE_CONFIG, storedLanguage),
        defaultLanguage: 'en',
        language: storedLanguage,
        enabledFeatures: allOriginFeatures.filter(
            (feature) => OriginFeature.IRecConnect !== feature
        )
    };

    const newConfiguration: IOriginConfiguration = {
        ...DEFAULT_ORIGIN_CONFIGURATION,
        ...configuration
    };

    setTimeFormatLanguage(newConfiguration.language);

    if (configuration.styleConfig) {
        if (!configuration.materialTheme) {
            newConfiguration.materialTheme = createMaterialThemeForOrigin(
                configuration.styleConfig,
                newConfiguration.language
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

export function initializeI18N(
    language: ORIGIN_LANGUAGE = 'en',
    fallbackLanguage: ORIGIN_LANGUAGE = 'en'
) {
    i18n.use(new ICU())
        .use(initReactI18next)
        .init({
            resources: ORIGIN_LANGUAGES,
            lng: language,
            fallbackLng: fallbackLanguage,

            interpolation: {
                escapeValue: false
            }
        });

    return i18n;
}
