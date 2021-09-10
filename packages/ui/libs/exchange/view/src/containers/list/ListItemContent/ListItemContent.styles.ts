import { LightenColor } from '@energyweb/origin-ui-theme';
import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  wrapper: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 0',
  },
  infoBlock: {
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
      width: 25,
    },
  },
  iconAndType: {
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      justifyContent: 'center',
    },
  },
  dateBlock: {
    marginRight: 20,
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      justifyContent: 'center',
      marginRight: 0,
    },
  },
}));
