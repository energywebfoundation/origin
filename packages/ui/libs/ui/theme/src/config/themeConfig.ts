import { createMuiTheme, Theme, ThemeOptions } from '@material-ui/core/styles';
import { enUS, plPL } from '@material-ui/core/locale';
import { LightenColor } from '../utils/colors';
import { IOriginStyleConfig } from '../utils/makeOriginUiConfig';
import { ThemeModeType } from '../providers';
import { variables_darkTheme } from './variables';

const getThemeConfig = (
  styleConfig: IOriginStyleConfig,
  themeMode?: ThemeModeType
): ThemeOptions => {
  const isDarkTheme = themeMode === 'dark';

  return {
    palette: {
      primary: {
        main: styleConfig.PRIMARY_COLOR,
        contrastText: isDarkTheme
          ? styleConfig.SIMPLE_TEXT_COLOR
          : styleConfig.MAIN_BACKGROUND_COLOR,
      },
      background: {
        paper: styleConfig.MAIN_BACKGROUND_COLOR,
      },
      text: {
        primary: styleConfig.SIMPLE_TEXT_COLOR,
        secondary: styleConfig.TEXT_COLOR_DEFAULT,
        disabled: styleConfig.TEXT_COLOR_DEFAULT,
      },
      mode: themeMode || 'dark',
    },
    typography: {
      fontFamily: styleConfig.FONT_FAMILY_PRIMARY,
      fontSize: styleConfig.FONT_SIZE,
    },
    components: {
      MuiInputBase: {
        styleOverrides: {
          input: {
            '&:-webkit-autofill': {
              WebkitBoxShadow: `0 0 0 100px ${styleConfig.INPUT_AUTOFILL_COLOR} inset`,
              WebkitTextFillColor: styleConfig.SIMPLE_TEXT_COLOR,
            },
          },
        },
      },
      MuiFilledInput: {
        styleOverrides: {
          input: {
            '&:-webkit-autofill': {
              WebkitBoxShadow: `0 0 0 100px ${styleConfig.INPUT_AUTOFILL_COLOR} inset`,
            },
          },
          root: {
            backgroundColor: LightenColor(
              styleConfig.MAIN_BACKGROUND_COLOR,
              isDarkTheme ? -0.5 : -10
            ),
            borderRadius: 5,
            '&.Mui-disabled': {
              backgroundColor: LightenColor(
                styleConfig.MAIN_BACKGROUND_COLOR,
                isDarkTheme ? -2 : -12
              ),
            },
            '&.Mui-focused': {
              backgroundColor: LightenColor(
                styleConfig.MAIN_BACKGROUND_COLOR,
                isDarkTheme ? -0.5 : -10
              ),
            },
          },
        },
      },
      MuiFormLabel: {
        styleOverrides: {
          root: { fontSize: variables_darkTheme.fontSize },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            marginRight: '10px',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: styleConfig.MAIN_BACKGROUND_COLOR,
            color: styleConfig.TEXT_COLOR_DEFAULT,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'uppercase',
          },
          contained: {
            '&.Mui-disabled': {
              color: styleConfig.TEXT_COLOR_DEFAULT,
            },
          },
        },
      },
      MuiTable: {
        styleOverrides: {
          root: {
            borderBottom: `2px solid ${styleConfig.PRIMARY_COLOR}`,
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            background: LightenColor(
              styleConfig.MAIN_BACKGROUND_COLOR,
              isDarkTheme ? 0.5 : 0
            ),
          },
        },
      },
      MuiTableBody: {
        styleOverrides: {
          root: {
            'tr:nth-of-type(1n)': {
              backgroundColor: LightenColor(
                styleConfig.MAIN_BACKGROUND_COLOR,
                isDarkTheme ? 3.5 : -7
              ),
            },
            'tr:nth-of-type(2n)': {
              backgroundColor: LightenColor(
                styleConfig.MAIN_BACKGROUND_COLOR,
                isDarkTheme ? 0.5 : -3
              ),
            },
          },
        },
      },
      MuiTableFooter: {
        styleOverrides: {
          root: {
            background: LightenColor(
              styleConfig.MAIN_BACKGROUND_COLOR,
              isDarkTheme ? 0.5 : 0
            ),
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            padding: 16,
            borderBottom: 'none',
          },
          body: {
            color: styleConfig.TEXT_COLOR_DEFAULT,
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            color: styleConfig.SIMPLE_TEXT_COLOR,
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            color: styleConfig.SIMPLE_TEXT_COLOR,
          },
          h5: {
            fontFamily: styleConfig.FONT_FAMILY_SECONDARY,
          },
          body1: {
            fontFamily: styleConfig.FONT_FAMILY_SECONDARY,
          },
          gutterBottom: {
            marginBottom: '1rem',
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: styleConfig.PRIMARY_COLOR,
          },
        },
      },
    },
  };
};

export const createMaterialThemeForOrigin = (
  styleConfig: IOriginStyleConfig,
  language: 'en' | 'pl',
  themeMode?: ThemeModeType
): Theme => {
  const materialLocale =
    {
      pl: plPL,
      en: enUS,
    }[language] ?? enUS;

  return createMuiTheme(getThemeConfig(styleConfig, themeMode), materialLocale);
};
