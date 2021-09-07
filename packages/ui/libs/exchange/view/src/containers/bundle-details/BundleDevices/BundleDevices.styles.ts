import { LightenColor } from '@energyweb/origin-ui-theme';
import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  container: {
    border: `1px solid ${LightenColor(
      theme.palette.background.paper,
      25,
      theme.palette.mode
    )}`,
    padding: 10,
    marginBottom: 5,
  },
}));
