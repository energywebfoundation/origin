/* eslint-disable @typescript-eslint/naming-convention */
import React, { createContext, ReactNode } from 'react';
import { initReactI18next } from 'react-i18next';
import i18n from 'i18next';
import ICU from 'i18next-icu';
import moment from 'moment';
import { createMuiTheme, Theme } from '@material-ui/core';
import { plPL, enUS } from '@material-ui/core/locale';
import { OriginFeature, allOriginFeatures } from '@energyweb/utils-general';
import {
    ORIGIN_LANGUAGES,
    ORIGIN_LANGUAGE,
    AVAILABLE_ORIGIN_LANGUAGES
} from '@energyweb/localization';
import { setTimeFormatLanguage, LightenColor } from '@energyweb/origin-ui-core';
import variables from '../styles/variables.scss';
import { OriginGenericLogo } from './OriginGenericLogo';
import { LoginPageBackground } from './LoginPageBackground';

export interface IOriginStyleConfig {
    PRIMARY_COLOR: string;
    PRIMARY_COLOR_DARK: string;
    TEXT_COLOR_DEFAULT: string;
    SIMPLE_TEXT_COLOR: string;
    MAIN_BACKGROUND_COLOR: string;
    FIELD_ICON_COLOR: string;
    WHITE: string;
    FONT_FAMILY_PRIMARY: string;
    FONT_FAMILY_SECONDARY: string;
}

const DEFAULT_COLOR = variables.primaryColor;

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
                    paper: styleConfig.MAIN_BACKGROUND_COLOR,
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
                            borderBottom: `2px solid ${LightenColor(
                                styleConfig.MAIN_BACKGROUND_COLOR,
                                13
                            )}`
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
                MuiPaper: {
                    root: {
                        backgroundColor: styleConfig.MAIN_BACKGROUND_COLOR,
                        color: styleConfig.TEXT_COLOR_DEFAULT
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
                        color: styleConfig.TEXT_COLOR_DEFAULT,
                        borderBottom: `2px solid ${styleConfig.PRIMARY_COLOR}`,
                        backgroundColor: styleConfig.MAIN_BACKGROUND_COLOR
                    }
                },
                MuiTableHead: {
                    root: {
                        '& > .MuiTableRow-root': {
                            background: LightenColor(styleConfig.MAIN_BACKGROUND_COLOR, 0.5)
                        }
                    }
                },
                MuiTableRow: {
                    root: {
                        background: LightenColor(styleConfig.MAIN_BACKGROUND_COLOR, 3.5),
                        '&:nth-child(even)': {
                            background: LightenColor(styleConfig.MAIN_BACKGROUND_COLOR, 0.5)
                        }
                    },
                    footer: {
                        background: LightenColor(styleConfig.MAIN_BACKGROUND_COLOR, 0.5)
                    }
                },
                MuiTableCell: {
                    root: {
                        borderBottom: `1px solid ${styleConfig.MAIN_BACKGROUND_COLOR}`,
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
                MuiTableSortLabel: {
                    root: {
                        color: styleConfig.TEXT_COLOR_DEFAULT
                    }
                },
                MuiSelect: {
                    root: {
                        color: styleConfig.SIMPLE_TEXT_COLOR
                    },
                    icon: {
                        color: styleConfig.FIELD_ICON_COLOR
                    }
                },
                MuiMenuItem: {
                    root: {
                        color: styleConfig.SIMPLE_TEXT_COLOR
                    }
                },
                MuiTypography: {
                    root: {
                        color: styleConfig.SIMPLE_TEXT_COLOR
                    },
                    h5: {
                        fontFamily: styleConfig.FONT_FAMILY_SECONDARY
                    },
                    body1: {
                        fontFamily: styleConfig.FONT_FAMILY_SECONDARY
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
        backgroundColor: styleConfig.MAIN_BACKGROUND_COLOR,
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
        color: LightenColor(styleConfig.MAIN_BACKGROUND_COLOR, 6.5),
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
    loginPageBg: ReactNode;
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
        TEXT_COLOR_DEFAULT: scssVariables.textColorDefault ?? DEFAULT_COLOR,
        SIMPLE_TEXT_COLOR: scssVariables.simpleTextColor ?? DEFAULT_COLOR,
        MAIN_BACKGROUND_COLOR: scssVariables.mainBackgroundColor ?? DEFAULT_COLOR,
        FIELD_ICON_COLOR: scssVariables.fieldIconColor ?? DEFAULT_COLOR,
        WHITE: '#fff',
        FONT_FAMILY_PRIMARY: scssVariables.fontFamilyPrimary,
        FONT_FAMILY_SECONDARY: scssVariables.fontFamilySecondary
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
        loginPageBg: <LoginPageBackground />,
        styleConfig: DEFAULT_STYLE_CONFIG,
        customSliderStyle: createSliderStyleForOrigin(DEFAULT_STYLE_CONFIG),
        materialTheme: createMaterialThemeForOrigin(DEFAULT_STYLE_CONFIG, storedLanguage),
        defaultLanguage: 'en',
        language: storedLanguage,
        enabledFeatures: allOriginFeatures.filter((feature) => {
            return ![
                OriginFeature.IRecConnect,
                OriginFeature.DevicesImport,
<<<<<<< HEAD
                OriginFeature.IRecUIApp
=======
                OriginFeature.CertificatesImport
>>>>>>> ec5aa08791af0abfe3b1ee059657518dff68c05e
            ].includes(feature);
        })
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
    moment.updateLocale('en', {
        week: {
            dow: 1,
            doy: 4
        }
    });

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
