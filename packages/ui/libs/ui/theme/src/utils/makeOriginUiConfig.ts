import { Theme } from '@material-ui/core/styles';
import {
  OriginUiThemeVariables,
  variables_darkTheme,
  variables_lightTheme,
} from '../config/variables';
import { createMaterialThemeForOrigin } from '../config/themeConfig';
import { ThemeModeEnum } from './ThemeModeEnum';

export interface IOriginStyleConfig {
  PRIMARY_COLOR: string;
  PRIMARY_COLOR_DARK: string;
  PRIMARY_COLOR_DIM: string;
  TEXT_COLOR_DEFAULT: string;
  SIMPLE_TEXT_COLOR: string;
  INPUT_AUTOFILL_COLOR: string;
  MAIN_BACKGROUND_COLOR: string;
  FIELD_ICON_COLOR: string;
  WHITE: string;
  FONT_FAMILY_PRIMARY: string;
  FONT_FAMILY_SECONDARY: string;
  FONT_SIZE: number;
}

const DEFAULT_COLOR = variables_darkTheme.primaryColor;

export interface IOriginThemeConfiguration {
  materialTheme: Theme;
}

export function createStyleConfig(
  themeVariables: OriginUiThemeVariables
): IOriginStyleConfig {
  return {
    PRIMARY_COLOR: themeVariables.primaryColor ?? DEFAULT_COLOR,
    PRIMARY_COLOR_DARK: themeVariables.primaryColorDark ?? DEFAULT_COLOR,
    PRIMARY_COLOR_DIM: themeVariables.primaryColorDim ?? DEFAULT_COLOR,
    TEXT_COLOR_DEFAULT: themeVariables.textColorDefault ?? DEFAULT_COLOR,
    SIMPLE_TEXT_COLOR: themeVariables.simpleTextColor ?? DEFAULT_COLOR,
    INPUT_AUTOFILL_COLOR: themeVariables.inputAutofillColor ?? DEFAULT_COLOR,
    MAIN_BACKGROUND_COLOR: themeVariables.mainBackgroundColor ?? DEFAULT_COLOR,
    FIELD_ICON_COLOR: themeVariables.fieldIconColor ?? DEFAULT_COLOR,
    WHITE: 'rgb(255,255,255)',
    FONT_FAMILY_PRIMARY: themeVariables.fontFamilyPrimary,
    FONT_FAMILY_SECONDARY: themeVariables.fontFamilySecondary,
    FONT_SIZE: themeVariables.fontSize,
  };
}

export const makeOriginUiConfig = (themeMode?: ThemeModeEnum) => {
  const colors =
    themeMode === ThemeModeEnum.Dark
      ? variables_darkTheme
      : variables_lightTheme;
  const DEFAULT_STYLE_CONFIG = createStyleConfig(colors);

  const DEFAULT_ORIGIN_CONFIGURATION: IOriginThemeConfiguration = {
    materialTheme: createMaterialThemeForOrigin(
      DEFAULT_STYLE_CONFIG,
      'en',
      themeMode
    ),
  };

  const newConfiguration: IOriginThemeConfiguration = {
    ...DEFAULT_ORIGIN_CONFIGURATION,
  };

  return newConfiguration;
};
