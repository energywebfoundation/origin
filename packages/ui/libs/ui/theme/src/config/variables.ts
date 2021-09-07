import { LightenColor } from '../utils/colors';

const $primaryColor_darkTheme = '#894ec5';
const $primaryColorDark_darkTheme = LightenColor($primaryColor_darkTheme, -10);
const $primaryColorDim = '#362c45';

const $textColorDefault_darkTheme = '#a8a8a8';
const $simpleTextColor_darkTheme = '#ffffff';
const $inputAutofillColor_darkTheme = '#434343';
const $bodyBackgroundColor_darkTheme = '#2d2d2d';
const $mainBackgroundColor_darkTheme = '#272727';
const $fieldIconColor_darkTheme = LightenColor('#ffffff', -30);

const $primaryColor_lightTheme = '#00D08A';
const $primaryColorDark_lightTheme = LightenColor(
  $primaryColor_lightTheme,
  -10
);
const $textColorDefault_lightTheme = '#2D1155';
const $simpleTextColor_lightTheme = '#000000';
const $inputAutofillColor_lightTheme = '#cecece';
const $bodyBackgroundColor_lightTheme = '#F6F3F9';
const $mainBackgroundColor_lightTheme = '#ffffff';
const $fieldIconColor_lightTheme = LightenColor('#000000', 30);

const $fontFamilyPrimary = 'Rajdhani';
const $fontFamilySecondary = 'Rajdhani';

const $fontSize = 12;

export type OriginUiThemeVariables = {
  primaryColor: string;
  primaryColorDark: string;
  primaryColorDim: string;
  textColorDefault: string;
  inputAutofillColor: string;
  simpleTextColor: string;
  bodyBackgroundColor: string;
  mainBackgroundColor: string;
  fieldIconColor: string;
  fontFamilyPrimary: string;
  fontFamilySecondary: string;
  fontSize: number;
};

export const variables_darkTheme: OriginUiThemeVariables = {
  primaryColor: $primaryColor_darkTheme,
  primaryColorDark: $primaryColorDark_darkTheme,
  primaryColorDim: $primaryColorDim,
  textColorDefault: $textColorDefault_darkTheme,
  simpleTextColor: $simpleTextColor_darkTheme,
  inputAutofillColor: $inputAutofillColor_darkTheme,
  bodyBackgroundColor: $bodyBackgroundColor_darkTheme,
  mainBackgroundColor: $mainBackgroundColor_darkTheme,
  fieldIconColor: $fieldIconColor_darkTheme,
  fontFamilyPrimary: $fontFamilyPrimary,
  fontFamilySecondary: $fontFamilySecondary,
  fontSize: $fontSize,
};

export const variables_lightTheme: OriginUiThemeVariables = {
  primaryColor: $primaryColor_lightTheme,
  primaryColorDark: $primaryColorDark_lightTheme,
  primaryColorDim: $primaryColorDim,
  textColorDefault: $textColorDefault_lightTheme,
  simpleTextColor: $simpleTextColor_lightTheme,
  inputAutofillColor: $inputAutofillColor_lightTheme,
  bodyBackgroundColor: $bodyBackgroundColor_lightTheme,
  mainBackgroundColor: $mainBackgroundColor_lightTheme,
  fieldIconColor: $fieldIconColor_lightTheme,
  fontFamilyPrimary: $fontFamilyPrimary,
  fontFamilySecondary: $fontFamilySecondary,
  fontSize: $fontSize,
};
