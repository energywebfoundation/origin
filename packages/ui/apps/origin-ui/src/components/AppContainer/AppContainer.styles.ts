import { LightenColor } from '@energyweb/origin-ui-theme';
import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  menuButton: {
    '&:hover': {
      backgroundColor: LightenColor(theme.palette.text.secondary, 7),
    },
  },
  selectedMenuItem: {
    backgroundColor: LightenColor(theme.palette.text.secondary, -5),
  },
}));
