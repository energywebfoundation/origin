/* eslint-disable @typescript-eslint/naming-convention */
import moment from 'moment';
import { Theme } from '@material-ui/core';

import variables from '../config/variables';
import createSliderStyleForOrigin from './createSliderStyleForOrigin';
import createMaterialThemeForOrigin from '../config/themeConfig';

export interface IOriginStyleConfig {
  PRIMARY_COLOR: string;
  PRIMARY_COLOR_DARK: string;
  PRIMARY_COLOR_DIM: string;
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

export interface IOriginThemeConfiguration {
  styleConfig: IOriginStyleConfig;
  customSliderStyle: unknown;
  materialTheme: Theme;
}

interface IOriginUiThemeVariables {
  primaryColor: string;
  primaryColorDark: string;
  primaryColorDim: string;
  textColorDefault: string;
  simpleTextColor: string;
  bodyBackgroundColor: string;
  mainBackgroundColor: string;
  fieldIconColor: string;
  fontFamilyPrimary: string;
  fontFamilySecondary: string;
}

export function createStyleConfigFromSCSSVariables(
  themeVariables: IOriginUiThemeVariables
): IOriginStyleConfig {
  return {
    PRIMARY_COLOR: themeVariables.primaryColor ?? DEFAULT_COLOR,
    PRIMARY_COLOR_DARK: themeVariables.primaryColorDark ?? DEFAULT_COLOR,
    PRIMARY_COLOR_DIM: themeVariables.primaryColorDim ?? DEFAULT_COLOR,
    TEXT_COLOR_DEFAULT: themeVariables.textColorDefault ?? DEFAULT_COLOR,
    SIMPLE_TEXT_COLOR: themeVariables.simpleTextColor ?? DEFAULT_COLOR,
    MAIN_BACKGROUND_COLOR: themeVariables.mainBackgroundColor ?? DEFAULT_COLOR,
    FIELD_ICON_COLOR: themeVariables.fieldIconColor ?? DEFAULT_COLOR,
    WHITE: 'rgb(255,255,255)',
    FONT_FAMILY_PRIMARY: themeVariables.fontFamilyPrimary,
    FONT_FAMILY_SECONDARY: themeVariables.fontFamilySecondary,
  };
}
const makeOriginUiTheme = (
  configuration: Partial<IOriginThemeConfiguration> = {}
) => {
  const DEFAULT_STYLE_CONFIG = createStyleConfigFromSCSSVariables(variables);
  console.log(DEFAULT_STYLE_CONFIG);

  const DEFAULT_ORIGIN_CONFIGURATION: IOriginThemeConfiguration = {
    styleConfig: DEFAULT_STYLE_CONFIG,
    customSliderStyle: createSliderStyleForOrigin(DEFAULT_STYLE_CONFIG),
    materialTheme: createMaterialThemeForOrigin(DEFAULT_STYLE_CONFIG, 'en'),
  };

  const newConfiguration: IOriginThemeConfiguration = {
    ...DEFAULT_ORIGIN_CONFIGURATION,
    ...configuration,
  };

  if (configuration.styleConfig) {
    if (!configuration.materialTheme) {
      newConfiguration.materialTheme = createMaterialThemeForOrigin(
        configuration.styleConfig,
        'en'
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
      doy: 4,
    },
  });

  return newConfiguration;
};

export default makeOriginUiTheme;
