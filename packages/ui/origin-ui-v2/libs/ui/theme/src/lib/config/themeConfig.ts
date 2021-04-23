import { createMuiTheme, Theme, ThemeOptions } from '@material-ui/core/styles';
import { LightenColor } from '../utils/colors';
import { variables } from './variables';
import { enUS, plPL } from '@material-ui/core/locale';
import { IOriginStyleConfig } from '../utils/makeOriginUiConfig';

const getThemeConfig = (styleConfig: IOriginStyleConfig): ThemeOptions => ({
  palette: {
    primary: {
      main: styleConfig.PRIMARY_COLOR,
      contrastText: styleConfig.SIMPLE_TEXT_COLOR,
    },
    background: {
      paper: styleConfig.MAIN_BACKGROUND_COLOR,
      default: 'rgb(244,67,54)',
    },
    text: {
      primary: styleConfig.WHITE,
      secondary: styleConfig.TEXT_COLOR_DEFAULT,
      disabled: styleConfig.TEXT_COLOR_DEFAULT,
    },
    mode: 'dark',
  },
  typography: {
    fontFamily: styleConfig.FONT_FAMILY_PRIMARY,
    fontSize: styleConfig.FONT_SIZE,
  },
  components: {
    MuiFilledInput: {
      styleOverrides: {
        root: {
          backgroundColor: LightenColor(
            styleConfig.MAIN_BACKGROUND_COLOR,
            -0.5
          ),
          borderRadius: 5,
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: { fontSize: variables.fontSize },
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
    MuiButton: {
      styleOverrides: {
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
          background: LightenColor(styleConfig.MAIN_BACKGROUND_COLOR, 0.5),
        },
      },
    },
    MuiTableBody: {
      styleOverrides: {
        root: {
          'tr:nth-of-type(1n)': {
            backgroundColor: LightenColor(
              styleConfig.MAIN_BACKGROUND_COLOR,
              3.5
            ),
          },
          'tr:nth-of-type(2n)': {
            backgroundColor: LightenColor(
              styleConfig.MAIN_BACKGROUND_COLOR,
              0.5
            ),
          },
        },
      },
    },
    MuiTableFooter: {
      styleOverrides: {
        root: {
          background: LightenColor(styleConfig.MAIN_BACKGROUND_COLOR, 0.5),
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
});

const createMaterialThemeForOrigin = (
  styleConfig: IOriginStyleConfig,
  language: 'en'
): Theme => {
  const materialLocale =
    {
      pl: plPL,
      en: enUS,
    }[language] ?? enUS;

  return createMuiTheme(getThemeConfig(styleConfig), materialLocale);
};

export default createMaterialThemeForOrigin;
