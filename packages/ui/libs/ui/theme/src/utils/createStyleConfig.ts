import {
  OriginUiThemeVariables,
  variables_darkTheme,
} from '../config/variables';

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
