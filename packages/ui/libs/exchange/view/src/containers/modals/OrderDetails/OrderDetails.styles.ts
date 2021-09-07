import { LightenColor } from '@energyweb/origin-ui-theme';
import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  dialogContent: {
    padding: 0,
  },
  lightBlock: {
    backgroundColor: LightenColor(
      theme.palette.background.paper,
      2,
      theme.palette.mode
    ),
  },
  darkBlock: {
    backgroundColor: LightenColor(
      theme.palette.background.paper,
      -2,
      theme.palette.mode
    ),
  },
  divider: {
    borderColor: LightenColor(
      theme.palette.background.paper,
      -2,
      theme.palette.mode
    ),
  },
}));
