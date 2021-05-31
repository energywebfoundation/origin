import { makeStyles } from '@material-ui/core';

const drawerWidth = 360;

export const useStyles = makeStyles((theme) => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
  },
  drawerPaper: {
    width: drawerWidth,
    marginTop: 64,
    border: 'none',
    [theme.breakpoints.down('md')]: {
      marginTop: 0,
      width: '100%',
    },
  },
  content: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  contentShift: {
    [theme.breakpoints.up('md')]: {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginRight: drawerWidth,
    },
  },
}));
