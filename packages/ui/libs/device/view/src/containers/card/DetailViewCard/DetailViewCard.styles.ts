import { LightenColor } from '@energyweb/origin-ui-theme';
import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  card: {
    [theme.breakpoints.up('lg')]: {
      position: 'absolute',
      zIndex: 10,
      right: 20,
      top: 55,
      width: 360,
    },
    [theme.breakpoints.down('lg')]: {
      margin: '20px 0',
    },
  },
  heading: {
    backgroundColor: LightenColor(
      theme.palette.background.paper,
      10,
      theme.palette.mode
    ),
  },
  icon: {
    width: 50,
    fill: LightenColor(theme.palette.text.secondary, -7, theme.palette.mode),
  },
  specWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: `${theme.spacing(2)} 0`,
  },
  specValue: {},
}));
