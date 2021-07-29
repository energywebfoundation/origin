import { LightenColor } from '@energyweb/origin-ui-theme';
import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  lightBgRounded: {
    backgroundColor: LightenColor(
      theme.palette.background.paper,
      5,
      theme.palette.mode
    ),
    borderRadius: 10,
    margin: '10px auto',
  },
  dialogContent: {
    padding: 0,
  },
}));
