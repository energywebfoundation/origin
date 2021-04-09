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
  const textColor = (theme as Theme).palette?.text.secondary;
  const themeBgColor = (theme as Theme).palette?.background.paper;

  const buttonColor = LightenColor(textColor, 5, mode);
  const hoverBgColor = LightenColor(themeBgColor, 5, mode);

  const listItemCss = css({
    padding: 0,
  });

  const buttonCss = css({
    justifyContent: 'flex-start',
    textTransform: 'none',
    padding: '10px 8px',
    width: '100%',
    margin: '0',
    color: buttonColor,
    '&:hover': {
      backgroundColor: hoverBgColor,
    },
  });

  return { listItemCss, buttonCss };
};
