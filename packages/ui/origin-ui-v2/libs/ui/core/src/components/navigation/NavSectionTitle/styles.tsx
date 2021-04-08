import { css, SerializedStyles, useTheme } from '@emotion/react';
import { LightenColor } from '@energyweb/origin-ui-theme';
import { Theme } from '@material-ui/core/styles';

type ComponentStyles = () => {
  listItemCss: SerializedStyles;
  buttonCss: SerializedStyles;
};

export const useComponentStyles: ComponentStyles = () => {
  const theme = useTheme();

  const mode = (theme as Theme).palette?.mode;
  const textColor = (theme as Theme).palette?.text.primary;
  const themeBgColor = (theme as Theme).palette?.background.paper;
  const hoverBgColor = LightenColor(themeBgColor, 5, mode);

  const listItemCss = css({
    padding: 0,
  });

  const buttonCss = css({
    justifyContent: 'flex-start',
    fontWeight: 600,
    letterSpacing: '0.1rem',
    padding: '10px 8px',
    width: '100%',
    color: textColor,
    '&:hover': {
      backgroundColor: hoverBgColor,
    },
  });

  return { listItemCss, buttonCss };
};
