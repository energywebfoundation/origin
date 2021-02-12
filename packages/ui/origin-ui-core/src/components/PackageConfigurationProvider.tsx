/* eslint-disable @typescript-eslint/naming-convention */
import React, { createContext, ReactNode } from 'react';
import { Theme } from '@material-ui/core';
import { OriginFeature } from '@energyweb/utils-general';
import { ORIGIN_LANGUAGE } from '@energyweb/localization';

export interface IOriginStyleConfig {
    PRIMARY_COLOR: string;
    PRIMARY_COLOR_DARK: string;
    PRIMARY_COLOR_DIM: string;
    TEXT_COLOR_DEFAULT: string;
    SIMPLE_TEXT_COLOR: string;
    MAIN_BACKGROUND_COLOR: string;
    FIELD_ICON_COLOR: string;
    WHITE: string;
}

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
export const OriginConfigurationContext = createContext<IOriginConfiguration>(null);

const ORIGIN_CONFIGURATION_LANGUAGE_STORAGE_KEY = 'OriginConfiguration-language';

export function setOriginLanguage(language: ORIGIN_LANGUAGE) {
    localStorage.setItem(ORIGIN_CONFIGURATION_LANGUAGE_STORAGE_KEY, language);

    location.reload();
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
