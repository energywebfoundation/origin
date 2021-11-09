import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  indicatorContainer: {
    position: 'absolute',
    textAlign: 'left',
    maxWidth: 150,
    [theme.breakpoints.up('lg')]: {
      left: 250,
      bottom: 25,
    },
    [theme.breakpoints.down('lg')]: {
      left: 225,
      bottom: 15,
    },
    [theme.breakpoints.down('md')]: {
      left: 200,
      bottom: 10,
    },
    [theme.breakpoints.down('sm')]: {
      maxWidth: 100,
      left: 180,
    },
  },
}));
