import { LightenColor } from '@energyweb/origin-ui-theme';
import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  image: {
    width: 250,
    height: 180,
  },
  heading: {
    backgroundColor: LightenColor(
      theme.palette.background.paper,
      10,
      theme.palette.mode
    ),
  },
}));
