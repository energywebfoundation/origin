import { LightenColor } from '@energyweb/origin-ui-theme';
import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  wrapper: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
  },
  icon: {
    width: 40,
    fill: LightenColor(theme.palette.text.secondary, -7, theme.palette.mode),
    marginRight: 20,
    [theme.breakpoints.down('sm')]: {
      marginRight: 0,
      width: 20,
    },
  },
  infoBlock: {
    display: 'flex',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      justifyContent: 'center',
    },
  },
  button: {
    height: 30,
    [theme.breakpoints.down('sm')]: {
      marginTop: 10,
    },
  },
}));
