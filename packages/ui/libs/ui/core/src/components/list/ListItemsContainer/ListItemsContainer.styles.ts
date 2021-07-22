import { LightenColor } from '@energyweb/origin-ui-theme';
import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  wrapper: {
    margin: 5,
  },
  header: {
    backgroundColor: LightenColor(
      theme.palette.background.paper,
      8,
      theme.palette.mode
    ),
    boxShadow: '0 2px 4px rgba(0,0,0,.2)',
  },
  list: {
    padding: 0,
  },
}));
