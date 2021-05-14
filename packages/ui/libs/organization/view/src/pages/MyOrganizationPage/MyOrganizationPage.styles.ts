import { LightenColor } from '@energyweb/origin-ui-theme';
import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  paper: {
    padding: 20,
    marginBottom: 20,
    backgroundColor: LightenColor(
      theme.palette.background.paper,
      -5,
      theme.palette.mode
    ),
  },
}));
