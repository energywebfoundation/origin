import { LightenColor } from '@energyweb/origin-ui-theme';
import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  listItem: {
    backgroundColor: LightenColor(
      theme.palette.background.paper,
      12,
      theme.palette.mode
    ),
    boxShadow: '0 2px 4px rgba(0,0,0,.2)',
    borderBottom: `1px solid ${LightenColor(
      theme.palette.background.paper,
      20,
      theme.palette.mode
    )}`,
  },
  checkbox: {
    [theme.breakpoints.down('sm')]: {
      padding: 0,
    },
  },
  listItemIcon: {
    [theme.breakpoints.down('sm')]: {
      minWidth: 30,
    },
  },
}));
