import { createMuiTheme, Theme, ThemeOptions } from '@material-ui/core';
import { LightenColor } from '../utils/colors';
import variables from './variables';
import { enUS, plPL } from '@material-ui/core/locale';
import { IOriginStyleConfig } from '../utils/makeOriginUiTheme';

const getThemeConfig = (styleConfig): ThemeOptions => ({
  palette: {
    primary: {
      main: styleConfig.PRIMARY_COLOR,
      contrastText: styleConfig.WHITE,
    },
    background: {
      paper: styleConfig.MAIN_BACKGROUND_COLOR,
      default: 'rgb(244,67,54)',
    },
    text: {
      primary: styleConfig.WHITE,
      secondary: styleConfig.TEXT_COLOR_DEFAULT,
      // hint: '#f50057',
      disabled: styleConfig.TEXT_COLOR_DEFAULT,
    },
  },
  components: {
    MuiInput: {
      styleOverrides: {
        underline: {
          '&:before': {
            borderBottom: `2px solid ${LightenColor(
              styleConfig.MAIN_BACKGROUND_COLOR,
              13
            )}`,
          },
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: { fontSize: variables.fontSizeMd },
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
          color: styleConfig.TEXT_COLOR_DEFAULT,
          borderBottom: `2px solid ${styleConfig.PRIMARY_COLOR}`,
          backgroundColor: styleConfig.MAIN_BACKGROUND_COLOR,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& > .MuiTableRow-root': {
            background: LightenColor(styleConfig.MAIN_BACKGROUND_COLOR, 0.5),
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          background: LightenColor(styleConfig.MAIN_BACKGROUND_COLOR, 3.5),
          '&:nth-child(even)': {
            background: LightenColor(styleConfig.MAIN_BACKGROUND_COLOR, 0.5),
          },
        },
        footer: {
          background: LightenColor(styleConfig.MAIN_BACKGROUND_COLOR, 0.5),
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${styleConfig.MAIN_BACKGROUND_COLOR}`,
          fontSize: variables.fontSizeMd,
        },
        body: {
          color: styleConfig.TEXT_COLOR_DEFAULT,
        },
        head: {
          color: styleConfig.TEXT_COLOR_DEFAULT,
          borderBottom: 'none',
        },
      },
    },
    MuiTableSortLabel: {
      styleOverrides: {
        root: {
          color: styleConfig.TEXT_COLOR_DEFAULT,
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          color: styleConfig.SIMPLE_TEXT_COLOR,
        },
        icon: {
          color: styleConfig.FIELD_ICON_COLOR,
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
