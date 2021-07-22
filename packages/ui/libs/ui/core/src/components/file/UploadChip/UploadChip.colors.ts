import { LightenColor } from '@energyweb/origin-ui-theme';
import { useTheme } from '@material-ui/core';

export const useColors = () => {
  const theme = useTheme();
  const originBgColor = theme.palette.background.paper;
  const originTextColor = theme.palette.primary.contrastText;

  const lightenBgColor = LightenColor(originBgColor, 3, theme.palette.mode);
  const bgColorLight = LightenColor(originTextColor, -10, theme.palette.mode);

  return { lightenBgColor, bgColorLight };
};
