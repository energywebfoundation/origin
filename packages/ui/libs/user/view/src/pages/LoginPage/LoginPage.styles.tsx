import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: '100%',
    top: '50%',
    right: '5%',
    transform: 'translateY(-50%)',
    opacity: 0.9,
    maxWidth: '450px',
    [theme.breakpoints.down('md')]: {
      padding: 15,
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 'calc(100% - 64px)',
    },
    [theme.breakpoints.up('sm')]: {
      padding: 30,
    },
  },
  background: {
    height: '100vh',
    width: '100%',
    position: 'absolute',
    zIndex: 0,
    padding: 0,
  },
}));
