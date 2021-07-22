import { LightenColor } from '@energyweb/origin-ui-theme';
import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  contentWrapper: {
    display: 'flex',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
    },
    [theme.breakpoints.down('sm')]: {
      paddingBottom: 10,
    },
  },
  iconWrapper: {
    width: '50%',
    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
  deviceIcon: {
    width: 40,
    fill: LightenColor(theme.palette.text.secondary, -7, theme.palette.mode),
  },
}));
