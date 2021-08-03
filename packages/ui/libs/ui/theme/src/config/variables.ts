import { LightenColor } from '../utils/colors';

const $primaryColor = '#894ec5';
const $primaryColorDark = LightenColor($primaryColor, -10);
const $primaryColorDim = '#362c45';

const $textColorDefault = '#a8a8a8';
const $simpleTextColor = '#ffffff';

const $inputAutofillColor = '#434343';

const $bodyBackgroundColor = '#2d2d2d';
const $mainBackgroundColor = '#272727';
const $fieldIconColor = LightenColor('#ffffff', -30);

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

export const variables: OriginUiThemeVariables = {
  primaryColor: $primaryColor,
  primaryColorDark: $primaryColorDark,
  primaryColorDim: $primaryColorDim,
  textColorDefault: $textColorDefault,
  simpleTextColor: $simpleTextColor,
  inputAutofillColor: $inputAutofillColor,
  bodyBackgroundColor: $bodyBackgroundColor,
  mainBackgroundColor: $mainBackgroundColor,
  fieldIconColor: $fieldIconColor,
  fontFamilyPrimary: $fontFamilyPrimary,
  fontFamilySecondary: $fontFamilySecondary,
  fontSize: $fontSize,
};
