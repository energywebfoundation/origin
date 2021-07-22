import { LightenColor } from '@energyweb/origin-ui-theme';
import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  toggleButton: {
    textTransform: 'none',
    padding: '4px 20px',
    backgroundColor: theme.palette.background.paper,
    transition: 'all 0.2s linear',
    '&:hover': {
      backgroundColor: LightenColor(
        theme.palette.background.paper,
        5,
        theme.palette.mode
      ),
    },
    '&.Mui-selected': {
      backgroundColor: LightenColor(
        theme.palette.background.paper,
        10,
        theme.palette.mode
      ),
      '&:hover': {
        backgroundColor: LightenColor(
          theme.palette.background.paper,
          10,
          theme.palette.mode
        ),
      },
    },
  },
  toggleGroup: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 2,
  },
  deviceName: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    zIndex: 2,
    [theme.breakpoints.up('lg')]: {
      fontSize: 26,
    },
    [theme.breakpoints.down('lg')]: {
      fontSize: 24,
      left: 10,
      bottom: 10,
    },
    [theme.breakpoints.down('md')]: {
      fontSize: 22,
      left: 10,
      bottom: 5,
    },
    [theme.breakpoints.down('sm')]: {
      fontSize: 20,
    },
  },
}));
