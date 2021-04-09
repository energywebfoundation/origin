import { css, SerializedStyles, useTheme } from '@emotion/react';
import { Theme } from '@material-ui/core/styles';
import { LightenColor } from '@energyweb/origin-ui-theme';

type ComponentStyles = () => {
  toolbarCss: SerializedStyles;
  buttonCss: SerializedStyles;
};

export const useComponentStyles: ComponentStyles = () => {
  const theme = useTheme();

  const mode = (theme as Theme).palette?.mode;
  const textColor = (theme as Theme).palette?.text.secondary;
  const themeBgColor = (theme as Theme).palette?.background.paper;

  const btnColor = LightenColor(textColor, 5, mode);
  const btnHoverColor = LightenColor(themeBgColor, 10, mode);
  const toolbarBgColor = LightenColor(themeBgColor, 5, mode);

  const toolbarCss = css({
    backgroundColor: toolbarBgColor,
  });

  const buttonCss = css({
    color: btnColor,
    '&:hover': {
      backgroundColor: btnHoverColor,
    },
  });

  return { toolbarCss, buttonCss };
};
